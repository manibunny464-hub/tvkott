import Razorpay from 'razorpay';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';
import Subscription from '@/models/Subscription';
import SubscriptionPlan from '@/models/SubscriptionPlan';
import User from '@/models/User';
import {
  dispatchPaymentSuccessNotification,
  dispatchSubscriptionExpiredNotification,
  checkAndDispatchSubscriptionExpiries,
} from '@/lib/notifications/subscriptionBroadcaster';

export async function GET(request) {
  // 1. Authorize using CRON_SECRET token
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const cronSecret = process.env.CRON_SECRET || 'your_cron_secret_token';

  if (!token || token !== cronSecret) {
    return Response.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    await dbConnect();
    const now = new Date();

    // --- TASK A: Reconcile stuck pending transactions via Payment Reconciler ---
    const { reconcilePendingPayments } = await import('@/lib/subscription/paymentReconciler');
    const reconcileResult = await reconcilePendingPayments({
      maxAgeHours: 48,
      minAgeMinutes: 3,
    });
    const reconciledCount = reconcileResult.reconciledCount || 0;

    // --- TASK B: Razorpay Auto-Renewal Recurring Subscriptions Synchronization ---
    const rzpKeyId = process.env.RAZORPAY_KEY_ID;
  if (!rzpKeyId) throw new Error("RAZORPAY_KEY_ID is required");
    const rzpKeySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!rzpKeySecret) throw new Error("RAZORPAY_KEY_SECRET is required");

    const razorpay = new Razorpay({
      key_id: rzpKeyId,
      key_secret: rzpKeySecret,
    });

    let autoRenewedCount = 0;
    let autoRenewCancelledCount = 0;

    // Fetch active or paused subscriptions with autoRenew enabled and a valid Razorpay subscription ID
    const autoRenewCandidates = await Subscription.find({
      status: { $in: ['active', 'paused'] },
      autoRenew: true,
      razorpaySubscriptionId: { $exists: true, $ne: null, $regex: /^sub_/ },
    }).populate('planId');

    for (const sub of autoRenewCandidates) {
      try {
        const rzpSub = await razorpay.subscriptions.fetch(sub.razorpaySubscriptionId);
        if (!rzpSub) continue;

        if (['active', 'authenticated'].includes(rzpSub.status)) {
          // Razorpay recurring subscription is active
          if (rzpSub.current_end) {
            const rzpEndDate = new Date(rzpSub.current_end * 1000);
            
            // Check if Razorpay renewed and pushed the end date beyond our recorded endDate
            if (rzpEndDate.getTime() > new Date(sub.endDate).getTime()) {
              console.log(`[Auto-Renew Cron] Sub ${sub._id} extended by Razorpay to ${rzpEndDate.toISOString()}`);
              
              sub.endDate = rzpEndDate;
              sub.nextRenewalDate = rzpSub.charge_at ? new Date(rzpSub.charge_at * 1000) : rzpEndDate;
              sub.status = 'active';
              await sub.save();

              // Update user premium status & expiry
              await User.findByIdAndUpdate(sub.userId, {
                isPremium: true,
                premiumExpiry: rzpEndDate,
              });

              // Record renewal transaction if not already created for this cycle
              const renewalCycleKey = `sub_renew_${sub._id}_${rzpSub.current_start || Date.now()}`;
              const existingTx = await Transaction.findOne({ razorpayOrderId: renewalCycleKey });
              if (!existingTx) {
                await Transaction.create({
                  userId: sub.userId,
                  planId: sub.planId?._id || sub.planId,
                  subscriptionId: sub._id,
                  razorpayOrderId: renewalCycleKey,
                  razorpayPaymentId: `pay_rzp_auto_${Date.now()}`,
                  amount: sub.planId?.price || (rzpSub.plan_amount ? rzpSub.plan_amount / 100 : 0),
                  currency: 'INR',
                  paymentMethod: 'Razorpay Auto-Renew',
                  status: 'success',
                  paidAt: rzpSub.current_start ? new Date(rzpSub.current_start * 1000) : new Date(),
                });
              }

              dispatchPaymentSuccessNotification(
                sub.userId,
                sub.planId?.name || 'Subscription',
                rzpEndDate
              ).catch((e) => console.error('[Auto-Renew Cron] Notification error:', e));

              autoRenewedCount++;
            }
          }
        } else if (['cancelled', 'completed', 'halted'].includes(rzpSub.status)) {
          console.log(`[Auto-Renew Cron] Sub ${sub._id} marked ${rzpSub.status} on Razorpay`);
          sub.autoRenew = false;
          if (rzpSub.status === 'cancelled' && new Date(sub.endDate) <= now) {
            sub.status = 'cancelled';
          }
          await sub.save();
          autoRenewCancelledCount++;
        }
      } catch (err) {
        console.error(`[Auto-Renew Cron] Error fetching Razorpay subscription ${sub.razorpaySubscriptionId}:`, err.message);
      }
    }

    // --- TASK C: Expire past subscriptions ---
    const expiredUsers = await User.find({
      isPremium: true,
      premiumExpiry: { $lte: now }
    });

    let expiredCount = 0;
    for (const u of expiredUsers) {
      // Double check if user has an active future subscription
      const hasActiveFutureSub = await Subscription.findOne({
        userId: u._id,
        status: 'active',
        endDate: { $gt: now },
      });

      if (hasActiveFutureSub) {
        u.premiumExpiry = hasActiveFutureSub.endDate;
        await u.save();
        continue;
      }

      u.isPremium = false;
      await u.save();

      // Update active subscriptions to expired
      await Subscription.updateMany(
        { userId: u._id, status: 'active', endDate: { $lte: now } },
        { $set: { status: 'expired' } }
      );

      dispatchSubscriptionExpiredNotification(u._id).catch((e) =>
        console.error('[sync-subscriptions] Expired notify error:', e)
      );

      expiredCount++;
    }

    // --- TASK D: Dispatch 3-day and 1-day subscription expiry warnings ---
    await checkAndDispatchSubscriptionExpiries().catch((e) =>
      console.error('[sync-subscriptions] Expiry warnings error:', e)
    );

    return Response.json({
      success: true,
      reconciledCount,
      autoRenewedCount,
      autoRenewCancelledCount,
      expiredCount,
    });
  } catch (error) {
    console.error('[sync-subscriptions-cron] Error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
