import { requireAdmin } from '@/lib/admin/auth';
import { serialize } from '@/lib/admin/data';
import dbConnect from '@/lib/db';
import Subscription from '@/models/Subscription';
import Transaction from '@/models/Transaction';
import SubscriptionPlan from '@/models/SubscriptionPlan';

export async function GET(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  await dbConnect();

  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Last month dates
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // 1. Total Active Subscribers count
    const activeSubscribersCount = await Subscription.countDocuments({ status: 'active' });

    // 2. Revenue calculation (total, this month, last month)
    const [totalRevenueRow, thisMonthRevenueRow, lastMonthRevenueRow] = await Promise.all([
      Transaction.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            status: 'success',
            paidAt: { $gte: startOfThisMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            status: 'success',
            paidAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const totalRevenue = totalRevenueRow[0]?.total || 0;
    const thisMonthRevenue = thisMonthRevenueRow[0]?.total || 0;
    const lastMonthRevenue = lastMonthRevenueRow[0]?.total || 0;

    // 3. New subscribers (today, this week, this month)
    const [newToday, newWeek, newMonth] = await Promise.all([
      Subscription.countDocuments({ status: 'active', startDate: { $gte: startOfToday } }),
      Subscription.countDocuments({ status: 'active', startDate: { $gte: startOfWeek } }),
      Subscription.countDocuments({ status: 'active', startDate: { $gte: startOfThisMonth } }),
    ]);

    // 4. Churn rate (cancellations this month)
    const cancellationsThisMonth = await Subscription.countDocuments({
      status: 'cancelled',
      updatedAt: { $gte: startOfThisMonth },
    });

    const churnRate = activeSubscribersCount > 0 
      ? Math.round((cancellationsThisMonth / (activeSubscribersCount + cancellationsThisMonth)) * 100)
      : 0;

    // 5. Plan-distribution (active subscriptions grouped by plan)
    const planBreakdown = await Subscription.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$planId', count: { $sum: 1 } } },
    ]);

    const activePlans = await SubscriptionPlan.find({}).lean();
    const plansMap = new Map(activePlans.map((p) => [p._id.toString(), p]));

    const planDistribution = planBreakdown.map((row) => {
      const plan = plansMap.get(String(row._id));
      return {
        name: plan?.name || 'Unknown Plan',
        value: row.count,
      };
    }).filter((item) => item.value > 0);

    // 6. Revenue per month (last 6 months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyRevenueRows = await Transaction.aggregate([
      {
        $match: {
          status: 'success',
          paidAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$paidAt' },
            month: { $month: '$paidAt' },
          },
          revenue: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthlyRevenue = monthlyRevenueRows.map((row) => {
      const date = new Date(row._id.year, row._id.month - 1, 1);
      const monthLabel = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
      return {
        month: `${monthLabel} ${row._id.year}`,
        revenue: row.revenue,
      };
    });

    return Response.json({
      success: true,
      data: {
        activeSubscribersCount,
        revenue: {
          total: totalRevenue,
          thisMonth: thisMonthRevenue,
          lastMonth: lastMonthRevenue,
        },
        newSubscribers: {
          today: newToday,
          thisWeek: newWeek,
          thisMonth: newMonth,
        },
        churn: {
          cancellations: cancellationsThisMonth,
          rate: churnRate,
        },
        planDistribution,
        monthlyRevenue,
      },
    });
  } catch (error) {
    console.error('[admin/analytics/subscriptions] GET error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
