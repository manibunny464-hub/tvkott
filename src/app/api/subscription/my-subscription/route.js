import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';
import Subscription from '@/models/Subscription';
import Transaction from '@/models/Transaction';
import SubscriptionPlan from '@/models/SubscriptionPlan';

import { getUserEntitlements } from '@/lib/subscription/entitlementService';

export async function GET(request) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const userId = auth.user.userId;

  try {
    await dbConnect();

    const [subscription, entitlements, transactions, history] = await Promise.all([
      Subscription.findOne({
        userId,
        status: { $in: ['active', 'paused'] },
      })
        .populate({
          path: 'planId',
          select: 'name price duration tagline iconFeatures label features version',
        })
        .lean(),
      getUserEntitlements(userId),
      Transaction.find({ userId })
        .populate('planId', 'name')
        .sort({ createdAt: -1 })
        .lean(),
      Subscription.find({ userId })
        .populate('planId', 'name price')
        .sort({ startDate: -1 })
        .lean(),
    ]);

    return Response.json({
      success: true,
      entitlements: entitlements.features,
      isPremium: entitlements.isPremium,
      subscription: subscription ? {
        id: subscription._id,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        nextRenewalDate: subscription.nextRenewalDate,
        autoRenew: subscription.autoRenew,
        paymentMethod: subscription.paymentMethod,
        razorpaySubscriptionId: subscription.razorpaySubscriptionId,
        planVersion: subscription.planVersion || subscription.planId?.version || 1,
        features: subscription.featuresSnapshot || subscription.planId?.features || entitlements.features,
        plan: subscription.planId ? {
          id: subscription.planId._id,
          name: subscription.planId.name,
          price: subscription.planId.price,
          duration: subscription.planId.duration,
          tagline: subscription.planId.tagline,
          iconFeatures: subscription.planId.iconFeatures,
          label: subscription.planId.label,
          features: subscription.planId.features,
        } : null,
      } : null,
      transactions: transactions.map((tx) => ({
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
      history: history.map((sub) => ({
        id: sub._id,
        planName: sub.planId?.name || 'Subscription Plan',
        startDate: sub.startDate,
        endDate: sub.endDate,
        status: sub.status,
      })),
    });
  } catch (error) {
    console.error('[my-subscription] GET error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
