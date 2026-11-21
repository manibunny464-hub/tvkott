import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';
import Subscription from '@/models/Subscription';
import SubscriptionPlan from '@/models/SubscriptionPlan';
import User from '@/models/User';
import { dispatchPaymentSuccessNotification } from '@/lib/notifications/subscriptionBroadcaster';

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'your_razorpay_webhook_secret';

    const hmac = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const isProduction = process.env.NODE_ENV === 'production';
    const isMock = !isProduction && (webhookSecret === 'your_razorpay_webhook_secret' || signature === 'mock_signature');

    if (hmac !== signature && !isMock) {
      return Response.json(
        { success: false, message: 'Invalid signature verification' },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);
    await dbConnect();

    const eventType = event.event;
    console.log(`[Razorpay Webhook] Received event: ${eventType}`);

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const payment = event.payload?.payment?.entity;
      const razorpayOrderId = payment?.order_id;
      const razorpayPaymentId = payment?.id;
      const paymentMethod = payment?.method || 'Razorpay';
      const paidAmount = payment ? payment.amount / 100 : 0; // Convert paise to Rupees

      if (razorpayOrderId) {
        // Find transaction
        const transaction = await Transaction.findOne({ razorpayOrderId });
        if (transaction && transaction.status !== 'success') {
          // Update transaction
          transaction.status = 'success';
          transaction.razorpayPaymentId = razorpayPaymentId;
          transaction.paymentMethod = paymentMethod;
          transaction.paidAt = new Date();
          await transaction.save();

          const userId = transaction.userId;
          const planId = transaction.planId;
          const plan = await SubscriptionPlan.findById(planId);
          const duration = plan?.duration || 30;
          const planFeatures = plan?.features || {
            adsFree: false,
            premiumContentAccess: true,
            offlineDownloads: false,
            videoQuality: '1080p',
            simultaneousDevices: 1,
            monthlyDownloadLimit: 0,
          };
          const planVersion = plan?.version || 1;

          // Check if user already has an active/paused subscription (not expired yet)
          const activeSub = await Subscription.findOne({
            userId,
            status: 'active',
            endDate: { $gt: new Date() },
          }).sort({ endDate: -1 });

          let startDate = new Date();
          let endDate = new Date();
          let subscription;

          if (activeSub) {
            if (activeSub.planId.toString() === planId.toString()) {
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
                userId,
                planId,
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
            // New subscription
            endDate.setDate(endDate.getDate() + duration);
            subscription = await Subscription.create({
              userId,
              planId,
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

          transaction.subscriptionId = subscription._id;
          await transaction.save();

          await User.findByIdAndUpdate(userId, {
            isPremium: true,
            premiumExpiry: subscription.endDate,
          });

          dispatchPaymentSuccessNotification(userId, plan?.name, subscription.endDate).catch((e) =>
            console.error('[Razorpay Webhook] Payment notify error:', e)
          );

          console.log(`[Razorpay Webhook] Activated/Extended subscription for user ${userId}`);
        }
      }
    } else if (eventType === 'subscription.charged') {
      const charge = event.payload?.subscription?.entity;
      const payment = event.payload?.payment?.entity;
      const razorpaySubscriptionId = charge?.id;
      const razorpayCustomerId = charge?.customer_id;
      const razorpayPaymentId = payment?.id;
      const amountPaise = payment?.amount || charge?.plan_amount || 0;
      const paidAmount = amountPaise / 100;
      const paymentMethod = payment?.method || 'Razorpay';

      if (razorpaySubscriptionId) {
        // Find existing subscription
        const sub = await Subscription.findOne({ razorpaySubscriptionId });
        if (sub) {
          const plan = await SubscriptionPlan.findById(sub.planId);
          const duration = plan?.duration || 30;

          // Extend end date and renewal date
          const newEndDate = new Date(sub.endDate || new Date());
          newEndDate.setDate(newEndDate.getDate() + duration);
          
          sub.endDate = newEndDate;
          sub.nextRenewalDate = newEndDate;
          sub.status = 'active';
          if (razorpayCustomerId) sub.razorpayCustomerId = razorpayCustomerId;
          await sub.save();

          // Create new transaction for this renewal payment
          await Transaction.create({
            userId: sub.userId,
            planId: sub.planId,
            subscriptionId: sub._id,
            razorpaySubscriptionId,
            razorpayOrderId: razorpaySubscriptionId,
            razorpayPaymentId,
            amount: paidAmount,
            currency: 'INR',
            paymentMethod: paymentMethod || 'Razorpay Auto-Renew',
            status: 'success',
            isRecurring: true,
            paidAt: new Date(),
          });

          // Ensure user premium status is active
          await User.findByIdAndUpdate(sub.userId, {
            isPremium: true,
            premiumExpiry: newEndDate,
          });

          dispatchPaymentSuccessNotification(sub.userId, plan?.name, newEndDate).catch((e) =>
            console.error('[Razorpay Webhook] Auto-renew notification error:', e)
          );

          console.log(`[Razorpay Webhook] Processed subscription renewal charge for sub ${sub._id}`);
        }
      }
    } else if (eventType === 'subscription.cancelled') {
      const charge = event.payload?.subscription?.entity;
      const razorpaySubscriptionId = charge?.id;

      if (razorpaySubscriptionId) {
        const sub = await Subscription.findOne({ razorpaySubscriptionId });
        if (sub) {
          sub.status = 'cancelled';
          sub.autoRenew = false;
          await sub.save();

          console.log(`[Razorpay Webhook] Cancelled subscription ${sub._id}`);
        }
      }
    } else if (eventType === 'payment.failed') {
      const payment = event.payload?.payment?.entity;
      const razorpayOrderId = payment?.order_id;
      const razorpayPaymentId = payment?.id;

      if (razorpayOrderId) {
        const transaction = await Transaction.findOne({ razorpayOrderId });
        if (transaction) {
          transaction.status = 'failed';
          if (razorpayPaymentId) transaction.razorpayPaymentId = razorpayPaymentId;
          await transaction.save();

          console.log(`[Razorpay Webhook] Marked transaction failed for order ${razorpayOrderId}`);
        }
      }
    }

    return Response.json({ success: true, message: 'Event processed' });
  } catch (error) {
    console.error('[Razorpay Webhook] Error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
