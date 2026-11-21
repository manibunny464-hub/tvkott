import Razorpay from 'razorpay';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';
import Subscription from '@/models/Subscription';
import SubscriptionPlan from '@/models/SubscriptionPlan';
import User from '@/models/User';
import { dispatchPaymentSuccessNotification } from '@/lib/notifications/subscriptionBroadcaster';
import { DEFAULT_PLAN_FEATURES } from '@/lib/subscription/featureValidator';

/**
 * Reconciles stuck pending transactions against Razorpay's API.
 * 
 * When a user completes payment on their phone/bank app, but network drops,
 * app closes, or webhook fails to deliver, the transaction remains 'pending'
 * in the database even though Razorpay has captured the funds.
 * 
 * This cron job detects captured orders on Razorpay, captures the plan's 
 * dynamic features snapshot, activates the subscription, updates the user's
 * premium access, and notifies the user via push and in-app alerts.
 */
export async function reconcilePendingPayments(options = {}) {
  const {
    maxAgeHours = 48,
    minAgeMinutes = 3,
    maxAttempts = 5,
  } = options;

  await dbConnect();
  const now = new Date();
  const minDate = new Date(now.getTime() - maxAgeHours * 60 * 60 * 1000);
  const maxDate = new Date(now.getTime() - minAgeMinutes * 60 * 1000);

  const pendingTxList = await Transaction.find({
    status: 'pending',
    createdAt: { $gte: minDate, $lte: maxDate },
    $or: [
      { reconcileAttempts: { $exists: false } },
      { reconcileAttempts: { $lt: maxAttempts } },
    ],
  }).populate('planId');

  console.log(`[Payment Reconciler Cron] Found ${pendingTxList.length} pending transactions to inspect.`);

  const rzpKeyId = process.env.RAZORPAY_KEY_ID;
  if (!rzpKeyId) throw new Error("RAZORPAY_KEY_ID is required");
  const rzpKeySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!rzpKeySecret) throw new Error("RAZORPAY_KEY_SECRET is required");

  let razorpay;
  try {
    razorpay = new Razorpay({
      key_id: rzpKeyId,
      key_secret: rzpKeySecret,
    });
  } catch (err) {
    console.error('[Payment Reconciler] Razorpay client initialization error:', err);
    return {
      success: false,
      message: 'Razorpay initialization failed',
      error: err.message,
    };
  }

  let reconciledCount = 0;
  let markedFailedCount = 0;
  let skippedCount = 0;
  const auditLog = [];

  for (const tx of pendingTxList) {
    const orderId = tx.razorpayOrderId;
    tx.reconcileAttempts = (tx.reconcileAttempts || 0) + 1;
    tx.lastReconciledAt = new Date();

    if (!orderId || orderId.startsWith('order_mock_') || orderId.startsWith('order_free_')) {
      tx.reconcileNotes = 'Skipped non-Razorpay order';
      await tx.save();
      skippedCount++;
      continue;
    }

    try {
      const order = await razorpay.orders.fetch(orderId);

      if (order.status === 'paid') {
        const payments = await razorpay.orders.fetchPayments(orderId);
        const successfulPayment = payments?.items?.find((p) => p.status === 'captured');

        if (!successfulPayment) {
          tx.reconcileNotes = `Order marked paid but no captured payment found (attempt ${tx.reconcileAttempts})`;
          await tx.save();
          skippedCount++;
          continue;
        }

        const razorpayPaymentId = successfulPayment.id;
        const paymentMethod = successfulPayment.method || 'Razorpay';

        // Fetch plan details & dynamic feature configuration
        const plan = tx.planId || (await SubscriptionPlan.findById(tx.planId));
        const duration = plan?.duration || 30;
        const planFeatures = plan?.features || { ...DEFAULT_PLAN_FEATURES };
        const planVersion = plan?.version || 1;

        // Check if user already has an active subscription
        const activeSub = await Subscription.findOne({
          userId: tx.userId,
          status: 'active',
          endDate: { $gt: new Date() },
        }).sort({ endDate: -1 });

        let startDate = new Date();
        let endDate = new Date();
        let subscription;

        if (activeSub) {
          if (activeSub.planId.toString() === (plan?._id || tx.planId).toString()) {
            // Same plan: extend
            const newEndDate = new Date(activeSub.endDate);
            newEndDate.setDate(newEndDate.getDate() + duration);

            activeSub.endDate = newEndDate;
            activeSub.nextRenewalDate = newEndDate;
            activeSub.featuresSnapshot = planFeatures;
            activeSub.planVersion = planVersion;
            await activeSub.save();
            subscription = activeSub;
          } else {
            // Different plan: queue
            startDate = new Date(activeSub.endDate);
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + duration);

            subscription = await Subscription.create({
              userId: tx.userId,
              planId: plan?._id || tx.planId,
              planVersion,
              featuresSnapshot: planFeatures,
              startDate,
              endDate,
              nextRenewalDate: endDate,
              status: 'active',
              autoRenew: plan?.autoRenew ?? true,
              paymentMethod,
            });

            activeSub.autoRenew = false;
            await activeSub.save();
          }
        } else {
          // New subscription starting now
          endDate.setDate(endDate.getDate() + duration);
          subscription = await Subscription.create({
            userId: tx.userId,
            planId: plan?._id || tx.planId,
            planVersion,
            featuresSnapshot: planFeatures,
            startDate,
            endDate,
            nextRenewalDate: endDate,
            status: 'active',
            autoRenew: plan?.autoRenew ?? true,
            paymentMethod,
          });
        }

        // Update transaction status
        tx.status = 'success';
        tx.razorpayPaymentId = razorpayPaymentId;
        tx.paidAt = new Date();
        tx.subscriptionId = subscription._id;
        tx.reconcileNotes = `Auto-reconciled successfully on attempt ${tx.reconcileAttempts}`;
        await tx.save();

        // Update user profile
        await User.findByIdAndUpdate(tx.userId, {
          isPremium: true,
          premiumExpiry: subscription.endDate,
        });

        // Dispatch in-app & push notification
        dispatchPaymentSuccessNotification(tx.userId, plan?.name, subscription.endDate).catch((e) =>
          console.error('[Payment Reconciler] Notification dispatch error:', e)
        );

        reconciledCount++;
        auditLog.push({
          transactionId: tx._id,
          orderId,
          status: 'reconciled_success',
          userId: tx.userId,
          amount: tx.amount,
        });

        console.log(`[Payment Reconciler] Activated subscription for user ${tx.userId} on transaction ${tx._id}`);
      } else if (order.status === 'expired') {
        tx.status = 'failed';
        tx.reconcileNotes = 'Order marked expired on Razorpay';
        await tx.save();
        markedFailedCount++;

        auditLog.push({
          transactionId: tx._id,
          orderId,
          status: 'marked_failed',
          reason: 'Order expired on Razorpay',
        });
      } else {
        // Still pending/attempted on Razorpay
        tx.reconcileNotes = `Razorpay order status: ${order.status} (attempt ${tx.reconcileAttempts})`;
        await tx.save();
        skippedCount++;
      }
    } catch (err) {
      console.error(`[Payment Reconciler] Error inspecting transaction ${tx._id}:`, err.message);
      tx.reconcileNotes = `Error during reconciliation: ${err.message}`;
      await tx.save();
      skippedCount++;
    }
  }

  return {
    success: true,
    scannedCount: pendingTxList.length,
    reconciledCount,
    markedFailedCount,
    skippedCount,
    auditLog,
  };
}
