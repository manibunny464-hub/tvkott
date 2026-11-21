import crypto from 'crypto';
import Razorpay from 'razorpay';
import SubscriptionPlan from '../../models/SubscriptionPlan.js';

/**
 * Returns a configured Razorpay client instance.
 */
export function getRazorpayClient() {
  const rzpKeyId = process.env.RAZORPAY_KEY_ID;
  if (!rzpKeyId) throw new Error("RAZORPAY_KEY_ID is required");
  const rzpKeySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!rzpKeySecret) throw new Error("RAZORPAY_KEY_SECRET is required");

  return new Razorpay({
    key_id: rzpKeyId,
    key_secret: rzpKeySecret,
  });
}

/**
 * Maps a plan duration in days to Razorpay subscription period and interval.
 */
export function mapDurationToPeriod(durationDays = 30) {
  if (durationDays >= 360) {
    return { period: 'yearly', interval: 1 };
  }
  if (durationDays === 180) {
    return { period: 'monthly', interval: 6 };
  }
  if (durationDays === 90) {
    return { period: 'monthly', interval: 3 };
  }
  if (durationDays >= 28 && durationDays <= 31) {
    return { period: 'monthly', interval: 1 };
  }
  if (durationDays === 7) {
    return { period: 'weekly', interval: 1 };
  }
  return { period: 'daily', interval: durationDays || 30 };
}

/**
 * Ensures a valid Razorpay Plan ID exists for the given SubscriptionPlan.
 * If one already exists, verifies it; otherwise creates one on Razorpay and persists it.
 */
export async function getOrCreateRazorpayPlan(plan) {
  const razorpay = getRazorpayClient();

  if (plan.razorpayPlanId) {
    try {
      const existing = await razorpay.plans.fetch(plan.razorpayPlanId);
      if (existing && existing.id) {
        return existing.id;
      }
    } catch (err) {
      console.warn(`[Razorpay] Cached plan ID ${plan.razorpayPlanId} not found on Razorpay, creating fresh one:`, err.message);
    }
  }

  const { period, interval } = mapDurationToPeriod(plan.duration || 30);
  const amountInPaise = Math.round(Number(plan.price) * 100);

  const rzpPlan = await razorpay.plans.create({
    period,
    interval,
    item: {
      name: `Chirpii ${plan.name}`,
      amount: amountInPaise,
      currency: 'INR',
      description: plan.tagline || `${plan.name} Auto-Renew Subscription`,
    },
    notes: {
      chirpiiPlanId: plan._id.toString(),
      planDuration: String(plan.duration || 30),
    },
  });

  if (plan.save && typeof plan.save === 'function') {
    plan.razorpayPlanId = rzpPlan.id;
    await plan.save();
  } else if (plan._id) {
    await SubscriptionPlan.findByIdAndUpdate(plan._id, { razorpayPlanId: rzpPlan.id });
  }

  console.log(`[Razorpay] Created Razorpay Plan ${rzpPlan.id} for plan ${plan.name} (₹${plan.price})`);
  return rzpPlan.id;
}

/**
 * Creates a recurring Razorpay Subscription (for UPI Autopay / Cards e-Mandate).
 */
export async function createRazorpaySubscription({
  plan,
  userId,
  totalCycles = 12,
  customerNotify = 1,
  startAt = undefined,
  notes = {},
}) {
  const razorpay = getRazorpayClient();
  const rzpPlanId = await getOrCreateRazorpayPlan(plan);

  const payload = {
    plan_id: rzpPlanId,
    total_count: totalCycles,
    customer_notify: customerNotify,
    notes: {
      userId: userId ? String(userId) : '',
      planId: String(plan._id),
      ...notes,
    },
  };

  if (startAt) {
    payload.start_at = Math.floor(new Date(startAt).getTime() / 1000);
  }

  const rzpSubscription = await razorpay.subscriptions.create(payload);
  return rzpSubscription;
}

/**
 * Verifies Razorpay payment signatures for both One-time Orders and Recurring Subscriptions.
 */
export function verifyRazorpaySignature({
  orderId,
  subscriptionId,
  paymentId,
  signature,
}) {
  const rzpKeySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!rzpKeySecret) return false;

  // Support non-production mock testing bypass
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction && signature === 'mock_signature') {
    return true;
  }

  if (!signature || !paymentId) {
    return false;
  }

  // 1. If it's a recurring Subscription flow: signature is HMAC of (payment_id + '|' + subscription_id)
  if (subscriptionId) {
    const expectedSubHmac = crypto
      .createHmac('sha256', rzpKeySecret)
      .update(`${paymentId}|${subscriptionId}`)
      .digest('hex');

    if (expectedSubHmac === signature) {
      return true;
    }
  }

  // 2. If it's an Order flow: signature is HMAC of (order_id + '|' + payment_id)
  if (orderId) {
    const expectedOrderHmac = crypto
      .createHmac('sha256', rzpKeySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (expectedOrderHmac === signature) {
      return true;
    }
  }

  return false;
}
