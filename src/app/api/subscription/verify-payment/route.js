import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';
import Subscription from '@/models/Subscription';
import SubscriptionPlan from '@/models/SubscriptionPlan';
import User from '@/models/User';
import Coupon from '@/models/Coupon';
import PlanBenefit from '@/models/PlanBenefit';
import { requireAuth } from '@/lib/authMiddleware';
import {
  getRazorpayClient,
  verifyRazorpaySignature,
} from '@/lib/subscription/razorpayService';
import mongoose from 'mongoose';

function formatDate(date) {
  const d = new Date(date);
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strTime = String(hours).padStart(2, '0') + ':' + minutes + ' ' + ampm;
  
  return `${day} ${month} ${year}, ${strTime}`;
}

export async function POST(request) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const loggedInUserId = auth.user.userId;

  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      razorpay_subscription_id,
      transactionId,
    } = body;

    const correlationId = razorpay_order_id || razorpay_subscription_id;

    // Validate body parameters
    if (!correlationId && !transactionId) {
      return Response.json(
        { success: false, message: 'Either razorpay_order_id, razorpay_subscription_id, or transactionId is required' },
        { status: 400 }
      );
    }

    if (!razorpay_payment_id) {
      return Response.json(
        { success: false, message: 'razorpay_payment_id is required' },
        { status: 400 }
      );
    }

    await dbConnect();
    const razorpay = getRazorpayClient();

    // 1. Look up the transaction securely from DB
    let tx;
    if (transactionId && mongoose.Types.ObjectId.isValid(transactionId)) {
      tx = await Transaction.findById(transactionId);
    } else if (razorpay_subscription_id) {
      tx = await Transaction.findOne({
        $or: [
          { razorpaySubscriptionId: razorpay_subscription_id },
          { razorpayOrderId: razorpay_subscription_id },
        ],
      });
    } else if (razorpay_order_id) {
      tx = await Transaction.findOne({
        $or: [
          { razorpayOrderId: razorpay_order_id },
          { razorpaySubscriptionId: razorpay_order_id },
        ],
      });
    }

    if (!tx) {
      return Response.json(
        { success: false, message: 'Transaction not found' },
        { status: 404 }
      );
    }

    // 2. Verify transaction ownership
    if (tx.userId.toString() !== loggedInUserId.toString()) {
      return Response.json(
        { success: false, message: 'Unauthorized transaction access' },
        { status: 403 }
      );
    }

    // 3. Already completed transaction idempotency check
    if (tx.status === 'success') {
      const plan = await SubscriptionPlan.findById(tx.planId).populate('benefits');
      const transactionIdStr = '#CHP' + tx._id.toString().slice(-6).toUpperCase();
      const formattedDate = formatDate(tx.paidAt || tx.updatedAt || new Date());
      
      const responseData = {
        planName: plan ? plan.name : '',
        planLabel: plan ? (plan.label || plan.tagline || 'Best Value') : 'Best Value',
        planBenefits: plan && plan.benefits ? plan.benefits.map(b => ({ name: b.name, icon: b.icon })) : [],
        benefits: plan && plan.benefits ? plan.benefits.map(b => ({ name: b.name, icon: b.icon })) : [],
        amountPaid: tx.amount,
        paymentMethod: tx.paymentMethod || 'UPI',
        transactionId: transactionIdStr,
        dateAndTime: formattedDate,
        rawTransactionId: tx._id.toString(),
        razorpayPaymentId: tx.razorpayPaymentId || razorpay_payment_id || '',
        razorpayOrderId: tx.razorpayOrderId || razorpay_order_id || '',
        razorpaySubscriptionId: tx.razorpaySubscriptionId || razorpay_subscription_id || '',
      };

      return Response.json({
        success: true,
        message: 'Subscription already active',
        ...responseData,
        data: responseData,
      });
    }

    const userId = tx.userId;
    const planId = tx.planId;
    const effectiveSubId = razorpay_subscription_id || tx.razorpaySubscriptionId || (tx.isRecurring ? tx.razorpayOrderId : null);
    const effectiveOrderId = razorpay_order_id || (!tx.isRecurring ? tx.razorpayOrderId : null);

    let verifiedPaymentId = razorpay_payment_id;

    // 4. Cryptographic Signature Verification
    if (effectiveOrderId && effectiveOrderId.startsWith('order_free_')) {
      if (tx.amount > 0) {
        return Response.json(
          { success: false, message: 'Free order ID used for non-free plan' },
          { status: 400 }
        );
      }
    } else if (razorpay_payment_id && razorpay_signature) {
      const isValid = verifyRazorpaySignature({
        orderId: effectiveOrderId,
        subscriptionId: effectiveSubId,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
      });

      if (!isValid) {
        return Response.json(
          { success: false, message: 'Invalid payment signature' },
          { status: 400 }
        );
      }
    } else {
      // Recovery fallback via Razorpay API direct fetch
      try {
        if (effectiveSubId && effectiveSubId.startsWith('sub_')) {
          const rzpSub = await razorpay.subscriptions.fetch(effectiveSubId);
          if (!['active', 'authenticated'].includes(rzpSub.status)) {
            return Response.json(
              { success: false, message: `Subscription not active on Razorpay (status: ${rzpSub.status})` },
              { status: 400 }
            );
          }
        } else if (effectiveOrderId) {
          const order = await razorpay.orders.fetch(effectiveOrderId);
          if (order.status !== 'paid') {
            return Response.json(
              { success: false, message: 'Payment not completed or verified yet.' },
              { status: 400 }
            );
          }
        }
      } catch (err) {
        console.error('[verify-payment] Razorpay direct verification fallback failed:', err);
        return Response.json(
          { success: false, message: `Payment verification failed: ${err.message}` },
          { status: 500 }
        );
      }
    }

    const plan = await SubscriptionPlan.findById(planId).populate('benefits');
    if (!plan) {
      return Response.json(
        { success: false, message: 'Plan not found' },
        { status: 404 }
      );
    }

    const duration = plan.duration || 30;

    // 5. Check if user already has an active/paused subscription (not expired yet)
    const activeSub = await Subscription.findOne({
      userId,
      status: 'active',
      endDate: { $gt: new Date() },
    }).sort({ endDate: -1 });

    const planFeatures = plan.features || {
      adsFree: false,
      premiumContentAccess: true,
      offlineDownloads: false,
      videoQuality: '1080p',
      simultaneousDevices: 1,
      monthlyDownloadLimit: 0,
    };
    const planVersion = plan.version || 1;

    let startDate = new Date();
    let endDate = new Date();
    let subscription;

    if (activeSub) {
      if (activeSub.planId.toString() === planId.toString()) {
        // Same plan: extend the existing one
        const newEndDate = new Date(activeSub.endDate);
        newEndDate.setDate(newEndDate.getDate() + duration);

        activeSub.endDate = newEndDate;
        activeSub.nextRenewalDate = newEndDate;
        activeSub.featuresSnapshot = planFeatures;
        activeSub.planVersion = planVersion;
        if (effectiveSubId) {
          activeSub.razorpaySubscriptionId = effectiveSubId;
          activeSub.autoRenew = true;
        }
        await activeSub.save();
        subscription = activeSub;
      } else {
        // Different plan: queue a new one starting when the current one expires
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
          autoRenew: effectiveSubId ? true : (plan.autoRenew ?? true),
          paymentMethod: 'Razorpay',
          razorpaySubscriptionId: effectiveSubId || undefined,
        });

        // Turn off autoRenew on the old plan
        activeSub.autoRenew = false;
        await activeSub.save();
      }
    } else {
      // No active subscription: start from today
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
        autoRenew: effectiveSubId ? true : (plan.autoRenew ?? true),
        paymentMethod: 'Razorpay',
        razorpaySubscriptionId: effectiveSubId || undefined,
      });
    }

    // 6. Fetch payment method from Razorpay
    let paymentMethod = effectiveSubId ? 'Razorpay AutoPay' : 'UPI';
    if (effectiveOrderId && effectiveOrderId.startsWith('order_free_')) {
      paymentMethod = 'Free';
    } else if (verifiedPaymentId && !verifiedPaymentId.startsWith('captured_') && !verifiedPaymentId.startsWith('pay_rzp_auto_')) {
      try {
        const paymentInfo = await razorpay.payments.fetch(verifiedPaymentId);
        if (paymentInfo && paymentInfo.method) {
          const methodRaw = paymentInfo.method.toLowerCase();
          if (methodRaw === 'upi') paymentMethod = 'UPI';
          else if (methodRaw === 'card') paymentMethod = 'Credit / Debit Card';
          else if (methodRaw === 'netbanking') paymentMethod = 'Net Banking';
          else if (methodRaw === 'wallet') paymentMethod = 'Wallet';
          else paymentMethod = paymentInfo.method.toUpperCase();
        }
      } catch (err) {
        console.error('[verify-payment] Failed to fetch payment method details:', err.message);
      }
    }

    // 7. Update transaction log securely
    await Transaction.findByIdAndUpdate(tx._id, {
      status: 'success',
      razorpayPaymentId: verifiedPaymentId,
      razorpaySubscriptionId: effectiveSubId || tx.razorpaySubscriptionId,
      paidAt: new Date(),
      subscriptionId: subscription._id,
      paymentMethod: paymentMethod,
    });

    // 8. Update user premium access
    await User.findByIdAndUpdate(userId, {
      isPremium: true,
      premiumExpiry: subscription.endDate,
    });

    // 9. Increment coupon usage count if applied
    if (tx.couponCode) {
      await Coupon.updateOne(
        { code: tx.couponCode.toUpperCase() },
        { $inc: { usedCount: 1 } }
      );
    }

    const transactionIdStr = '#CHP' + tx._id.toString().slice(-6).toUpperCase();
    const formattedDate = formatDate(new Date());

    const responseData = {
      planName: plan.name,
      planLabel: plan.label || plan.tagline || 'Best Value',
      planBenefits: plan && plan.benefits ? plan.benefits.map(b => ({ name: b.name, icon: b.icon })) : [],
      benefits: plan && plan.benefits ? plan.benefits.map(b => ({ name: b.name, icon: b.icon })) : [],
      amountPaid: tx.amount,
      paymentMethod: paymentMethod,
      transactionId: transactionIdStr,
      dateAndTime: formattedDate,
      rawTransactionId: tx._id.toString(),
      razorpayPaymentId: verifiedPaymentId || '',
      razorpayOrderId: tx.razorpayOrderId || razorpay_order_id || '',
      razorpaySubscriptionId: effectiveSubId || '',
      isRecurring: Boolean(effectiveSubId),
    };

    return Response.json({
      success: true,
      message: 'Subscription activated',
      ...responseData,
      data: responseData,
    });
  } catch (error) {
    console.error('[verify-payment] Error:', error);
    return Response.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
