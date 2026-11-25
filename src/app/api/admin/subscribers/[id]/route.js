import { requireAdmin } from '@/lib/admin/auth';
import { serialize } from '@/lib/admin/data';
import dbConnect from '@/lib/db';
import Subscription from '@/models/Subscription';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import SubscriptionPlan from '@/models/SubscriptionPlan';

export async function GET(request, { params }) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { id } = await params;

  await dbConnect();

  try {
    let user = null;
    let activeSub = null;

    // Try finding subscription first
    let sub = await Subscription.findById(id)
      .populate('userId')
      .populate('planId')
      .lean();

    if (sub) {
      user = sub.userId;
      activeSub = sub;
    } else {
      // If subscription not found, check if it's a User ID
      user = await User.findById(id).lean();
      if (user) {
        // Find their active/paused subscription
        activeSub = await Subscription.findOne({
          userId: user._id,
          status: { $in: ['active', 'paused'] },
        })
          .populate('planId')
          .lean();
      }
    }

    if (!user) {
      return Response.json(
        { success: false, message: 'User or subscription not found' },
        { status: 404 }
      );
    }

    const userId = user._id;

    // Fetch plan history (all subscriptions for this user)
    const history = await Subscription.find({ userId })
      .populate('planId')
      .sort({ startDate: -1 })
      .lean();

    // Fetch transaction history for this user
    const transactions = await Transaction.find({ userId })
      .populate('planId')
      .sort({ createdAt: -1 })
      .lean();

    // Fetch list of all plans (useful for the manual plan change selector in frontend)
    const allPlans = await SubscriptionPlan.find({ isActive: true }).lean();

    return Response.json({
      success: true,
      subscriber: {
        userId: user._id,
        name: user.name || 'Viewer',
        email: user.email || `${user.phone || 'viewer'}@phone.tvk`,
        phone: user.phone || '',
        status: user.status,
        joinedAt: user.createdAt,
        isPremium: user.isPremium,
        premiumExpiry: user.premiumExpiry,
      },
      activeSubscription: activeSub ? {
        id: activeSub._id,
        planName: activeSub.planId?.name || 'Subscription Plan',
        planId: activeSub.planId?._id,
        price: activeSub.planId?.price,
        startDate: activeSub.startDate,
        endDate: activeSub.endDate,
        nextRenewalDate: activeSub.nextRenewalDate || activeSub.endDate,
        status: activeSub.status,
        autoRenew: activeSub.autoRenew,
        paymentMethod: activeSub.paymentMethod || 'Razorpay',
        razorpaySubscriptionId: activeSub.razorpaySubscriptionId,
        razorpayCustomerId: activeSub.razorpayCustomerId,
      } : null,
      history: serialize(history).map((h) => ({
        id: h._id,
        planName: h.planId?.name || 'Subscription Plan',
        price: h.planId?.price || 0,
        startDate: h.startDate,
        endDate: h.endDate,
        status: h.status,
        autoRenew: h.autoRenew,
      })),
      transactions: serialize(transactions).map((tx) => ({
        id: tx._id,
        razorpayOrderId: tx.razorpayOrderId || '',
        razorpayPaymentId: tx.razorpayPaymentId || '',
        amount: tx.amount,
        currency: tx.currency || 'INR',
        paymentMethod: tx.paymentMethod || (tx.razorpayPaymentId ? 'Razorpay' : 'UPI / Online'),
        status: tx.status,
        refundId: tx.refundId || '',
        refundedAmount: tx.refundedAmount || 0,
        planName: tx.planId?.name || 'Subscription Plan',
        date: tx.paidAt || tx.createdAt,
      })),
      plansList: serialize(allPlans),
    });
  } catch (error) {
    console.error(`[admin/subscribers/${id}] GET error:`, error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
