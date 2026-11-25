import { requireAdmin } from '@/lib/admin/auth';
import { parsePagination, paginationMeta } from '@/lib/admin/api';
import { serialize } from '@/lib/admin/data';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import SubscriptionPlan from '@/models/SubscriptionPlan';

function toCsv(transactions) {
  const rows = [
    ['Transaction ID', 'Order ID', 'User Name', 'Email', 'Phone', 'Plan', 'Amount', 'Currency', 'Payment Method', 'Date', 'Status'],
    ...transactions.map((tx) => [
      tx.razorpayPaymentId || 'N/A',
      tx.razorpayOrderId || 'N/A',
      tx.userName,
      tx.email,
      tx.phone,
      tx.planName,
      tx.amount,
      tx.currency || 'INR',
      tx.paymentMethod || 'Razorpay',
      tx.date ? new Date(tx.date).toLocaleDateString('en-IN') : 'N/A',
      tx.status,
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
  const minAmount = searchParams.get('minAmount') || '';
  const maxAmount = searchParams.get('maxAmount') || '';
  const isCsv = searchParams.get('export') === 'csv';

  await dbConnect();

  const query = {};

  if (status) {
    query.status = status;
  }

  if (planId) {
    query.planId = planId;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      const start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0);
      query.createdAt.$gte = start;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  if (minAmount || maxAmount) {
    query.amount = {};
    if (minAmount) query.amount.$gte = Number(minAmount);
    if (maxAmount) query.amount.$lte = Number(maxAmount);
  }

function escapeRegex(string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

  if (search) {
    const term = search.trim();
    const safeTerm = escapeRegex(term);
    if (term.startsWith('pay_') || term.startsWith('order_') || term.startsWith('refund_') || term.toLowerCase().includes('mock')) {
      query.$or = [
        { razorpayPaymentId: { $regex: safeTerm, $options: 'i' } },
        { razorpayOrderId: { $regex: safeTerm, $options: 'i' } },
        { refundId: { $regex: safeTerm, $options: 'i' } },
      ];
    } else {
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: safeTerm, $options: 'i' } },
          { email: { $regex: safeTerm, $options: 'i' } },
          { phone: { $regex: safeTerm, $options: 'i' } },
        ],
      }).select('_id').lean();
      query.userId = { $in: matchingUsers.map((u) => u._id) };
    }
  }

  try {
    const txQuery = Transaction.find(query)
      .populate('userId', 'name email phone')
      .populate('planId', 'name')
      .sort({ createdAt: -1 });

    if (!isCsv) {
      txQuery.skip(skip).limit(limit);
    }

    const [transactions, total] = await Promise.all([
      txQuery.lean(),
      Transaction.countDocuments(query),
    ]);

    const formattedTransactions = serialize(transactions).map((tx) => ({
      id: tx._id,
      razorpayPaymentId: tx.razorpayPaymentId || '',
      razorpayOrderId: tx.razorpayOrderId || '',
      userName: tx.userId?.name || 'Viewer',
      email: tx.userId?.email || `${tx.userId?.phone || 'viewer'}@phone.tvk`,
      phone: tx.userId?.phone || '',
      planName: tx.planId?.name || 'Subscription Plan',
      amount: tx.amount,
      currency: tx.currency || 'INR',
      paymentMethod: tx.paymentMethod || (tx.razorpayPaymentId ? 'Razorpay' : 'UPI / Online'),
      date: tx.paidAt || tx.createdAt,
      status: tx.status,
      refundId: tx.refundId || '',
      refundedAmount: tx.refundedAmount || 0,
    }));

    if (isCsv) {
      return new Response(toCsv(formattedTransactions), {
        headers: {
          'content-type': 'text/csv; charset=utf-8',
          'content-disposition': 'attachment; filename="tvk-transactions.csv"',
        },
      });
    }

    const plansList = await SubscriptionPlan.find({ isActive: true }).select('name').lean();

    return Response.json({
      success: true,
      transactions: formattedTransactions,
      pagination: paginationMeta(page, limit, total),
      plansList: serialize(plansList),
    });
  } catch (error) {
    console.error('[admin/transactions] GET error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
