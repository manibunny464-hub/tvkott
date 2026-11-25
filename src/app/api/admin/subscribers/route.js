import { requireAdmin } from '@/lib/admin/auth';
import { parsePagination, paginationMeta } from '@/lib/admin/api';
import { serialize } from '@/lib/admin/data';
import dbConnect from '@/lib/db';
import Subscription from '@/models/Subscription';
import User from '@/models/User';
import SubscriptionPlan from '@/models/SubscriptionPlan';
import Transaction from '@/models/Transaction';

function toCsv(subscribers) {
  const rows = [
    ['User Name', 'Email', 'Phone', 'Plan', 'Start Date', 'Next Renewal', 'Status', 'Amount Paid', 'Payment Method'],
    ...subscribers.map((item) => [
      item.userName,
      item.email,
      item.phone,
      item.planName,
      item.startDate ? new Date(item.startDate).toLocaleDateString('en-IN') : 'N/A',
      item.nextRenewalDate ? new Date(item.nextRenewalDate).toLocaleDateString('en-IN') : 'N/A',
      item.status,
      item.amountPaid,
      item.paymentMethod || 'N/A',
    ]),
  ];

  return rows
    .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

export async function GET(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { searchParams, page, limit, skip } = parsePagination(request, 10);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const planId = searchParams.get('planId') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const isCsv = searchParams.get('export') === 'csv';

  await dbConnect();

  const query = {};

  // Status Filter
  if (status) {
    query.status = status;
  }

  // Plan Filter
  if (planId) {
    query.planId = planId;
  }

  // Date Range Filter
  if (startDate || endDate) {
    query.startDate = {};
    if (startDate) query.startDate.$gte = new Date(startDate);
    if (endDate) query.startDate.$lte = new Date(endDate);
  }

function escapeRegex(string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

  // Search by Name, Email, Phone
  if (search) {
    const safeSearch = escapeRegex(search.trim());
    const userSearchQuery = {
      $or: [
        { name: { $regex: safeSearch, $options: 'i' } },
        { email: { $regex: safeSearch, $options: 'i' } },
        { phone: { $regex: safeSearch, $options: 'i' } },
      ],
    };
    const matchingUsers = await User.find(userSearchQuery).select('_id').lean();
    const userIds = matchingUsers.map((u) => u._id);
    query.userId = { $in: userIds };
  }

  try {
    // If exporting CSV, query all without pagination limit
    const subQuery = Subscription.find(query)
      .populate('userId', 'name email phone')
      .populate('planId', 'name price duration')
      .sort({ createdAt: -1 });

    if (!isCsv) {
      subQuery.skip(skip).limit(limit);
    }

    const [subscriptions, total] = await Promise.all([
      subQuery.lean(),
      Subscription.countDocuments(query),
    ]);

    // Aggregate total successful amounts paid by these users per plan or total
    const userIdsInQuery = subscriptions.map((s) => s.userId?._id).filter(Boolean);
    const revenueAggregation = await Transaction.aggregate([
      {
        $match: {
          userId: { $in: userIdsInQuery },
          status: 'success',
        },
      },
      {
        $group: {
          _id: { userId: '$userId', planId: '$planId' },
          totalPaid: { $sum: '$amount' },
        },
      },
    ]);

    const revenueMap = new Map(
      revenueAggregation.map((row) => [
        `${String(row._id.userId)}_${String(row._id.planId)}`,
        row.totalPaid,
      ])
    );

    // Populate data
    const formattedSubscribers = serialize(subscriptions).map((sub) => {
      const uId = sub.userId?._id;
      const pId = sub.planId?._id;
      const revenueKey = `${String(uId)}_${String(pId)}`;
      const amountPaid = revenueMap.get(revenueKey) || 0;

      return {
        id: sub._id,
        userId: uId,
        userName: sub.userId?.name || 'Viewer',
        email: sub.userId?.email || `${sub.userId?.phone || 'viewer'}@phone.tvk`,
        phone: sub.userId?.phone || '',
        planId: pId,
        planName: sub.planId?.name || 'Subscription Plan',
        startDate: sub.startDate,
        endDate: sub.endDate,
        nextRenewalDate: sub.nextRenewalDate || sub.endDate,
        status: sub.status,
        amountPaid,
        paymentMethod: sub.paymentMethod || 'Razorpay',
        autoRenew: sub.autoRenew,
      };
    });

    if (isCsv) {
      return new Response(toCsv(formattedSubscribers), {
        headers: {
          'content-type': 'text/csv; charset=utf-8',
          'content-disposition': 'attachment; filename="tvk-subscribers.csv"',
        },
      });
    }

    // Load active plans lists for filter options
    const activePlans = await SubscriptionPlan.find({ isActive: true }).select('name').lean();

    return Response.json({
      success: true,
      subscribers: formattedSubscribers,
      pagination: paginationMeta(page, limit, total),
      plansList: serialize(activePlans),
    });
  } catch (error) {
    console.error('[admin/subscribers] GET error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
