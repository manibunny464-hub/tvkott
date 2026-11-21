import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';
import SubscriptionPlan from '@/models/SubscriptionPlan';
import Coupon from '@/models/Coupon';
import Transaction from '@/models/Transaction';
import {
  getRazorpayClient,
  createRazorpaySubscription,
} from '@/lib/subscription/razorpayService';
import mongoose from 'mongoose';

export async function POST(request) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const rzpKeyId = process.env.RAZORPAY_KEY_ID;
  if (!rzpKeyId) throw new Error("RAZORPAY_KEY_ID is required");

  try {
    const body = await request.json();
    const { planId, couponCode, isRecurring, autoRenew, totalCycles } = body;

    if (!planId || !mongoose.Types.ObjectId.isValid(planId)) {
      return Response.json(
        { success: false, message: 'A valid planId is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan || !plan.isActive) {
      return Response.json(
        { success: false, message: 'Plan not found or inactive' },
        { status: 404 }
      );
    }

    let finalAmount = plan.price;
    let appliedCoupon = null;
    let discountPercent = 0;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

      if (!coupon || !coupon.isActive) {
        return Response.json(
          { success: false, message: 'Invalid coupon' },
          { status: 400 }
        );
      }

      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return Response.json(
          { success: false, message: 'Coupon has expired' },
          { status: 400 }
        );
      }

      if (coupon.usedCount >= coupon.maxUses) {
        return Response.json(
          { success: false, message: 'Coupon usage limit reached' },
          { status: 400 }
        );
      }

      const isApplicable = coupon.applicablePlans.length === 0 ||
                           coupon.applicablePlans.some(p => p.toString() === planId.toString());

      if (!isApplicable) {
        return Response.json(
          { success: false, message: 'This coupon is not applicable to the selected plan' },
          { status: 400 }
        );
      }

      if (coupon.type === 'percentage') {
        discountPercent = coupon.value;
        finalAmount = Math.max(0, Math.round(finalAmount - (finalAmount * discountPercent) / 100));
      } else {
        const discountAmount = coupon.value;
        finalAmount = Math.max(0, finalAmount - discountAmount);
        discountPercent = plan.price > 0 ? Math.round((discountAmount / plan.price) * 100) : 0;
      }
      appliedCoupon = coupon;
    }

    const userId = auth.user.userId;
    const razorpay = getRazorpayClient();

    // Determine if this should be a recurring Razorpay Subscription
    // (Active if plan.autoRenew is true, unless client explicitly requests false, and not a 100% free order)
    const wantsRecurring = (isRecurring !== undefined ? isRecurring : (autoRenew !== undefined ? autoRenew : (plan.autoRenew ?? true))) === true;
    const canDoRecurring = wantsRecurring && finalAmount > 0 && !appliedCoupon;

    let transaction;
    let responsePayload;

    if (finalAmount === 0) {
      // 1. Free plan / 100% discounted order
      const freeOrderId = `order_free_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      transaction = await Transaction.create({
        userId,
        planId,
        razorpayOrderId: freeOrderId,
        amount: 0,
        currency: 'INR',
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        discountPercent,
        status: 'pending',
        isRecurring: false,
      });

      responsePayload = {
        success: true,
        isRecurring: false,
        orderId: freeOrderId,
        amount: 0,
        currency: 'INR',
        keyId: rzpKeyId,
        transactionId: transaction._id,
      };
    } else if (canDoRecurring) {
      // 2. Razorpay Recurring Subscription (UPI Autopay / Cards e-Mandate)
      try {
        const cycles = Number(totalCycles) || 12;
        const rzpSubscription = await createRazorpaySubscription({
          plan,
          userId,
          totalCycles: cycles,
          customerNotify: 1,
          notes: {
            couponCode: appliedCoupon ? appliedCoupon.code : '',
          },
        });

        transaction = await Transaction.create({
          userId,
          planId,
          razorpayOrderId: rzpSubscription.id, // Used as primary correlation ID
          razorpaySubscriptionId: rzpSubscription.id,
          amount: finalAmount,
          currency: 'INR',
          couponCode: appliedCoupon ? appliedCoupon.code : undefined,
          discountPercent,
          status: 'pending',
          isRecurring: true,
        });

        responsePayload = {
          success: true,
          isRecurring: true,
          subscriptionId: rzpSubscription.id,
          orderId: rzpSubscription.id, // Included for backward compatibility
          amount: finalAmount,
          currency: 'INR',
          keyId: rzpKeyId,
          transactionId: transaction._id,
          plan: {
            id: plan._id,
            name: plan.name,
            duration: plan.duration,
            price: plan.price,
          },
        };
      } catch (subErr) {
        console.error('[create-order] Recurring subscription creation failed, falling back to one-time order:', subErr.message);
        // Fallback to one-time order if subscription API is not supported on key
        const receipt = `ch_${userId.slice(-10)}_${Date.now()}`;
        const razorpayOrder = await razorpay.orders.create({
          amount: Math.round(finalAmount * 100),
          currency: 'INR',
          receipt,
        });

        transaction = await Transaction.create({
          userId,
          planId,
          razorpayOrderId: razorpayOrder.id,
          amount: finalAmount,
          currency: 'INR',
          couponCode: appliedCoupon ? appliedCoupon.code : undefined,
          discountPercent,
          status: 'pending',
          isRecurring: false,
        });

        responsePayload = {
          success: true,
          isRecurring: false,
          orderId: razorpayOrder.id,
          amount: finalAmount,
          currency: 'INR',
          keyId: rzpKeyId,
          transactionId: transaction._id,
        };
      }
    } else {
      // 3. One-time standard Razorpay Order
      const receipt = `ch_${userId.slice(-10)}_${Date.now()}`;
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(finalAmount * 100),
        currency: 'INR',
        receipt,
      });

      transaction = await Transaction.create({
        userId,
        planId,
        razorpayOrderId: razorpayOrder.id,
        amount: finalAmount,
        currency: 'INR',
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        discountPercent,
        status: 'pending',
        isRecurring: false,
      });

      responsePayload = {
        success: true,
        isRecurring: false,
        orderId: razorpayOrder.id,
        amount: finalAmount,
        currency: 'INR',
        keyId: rzpKeyId,
        transactionId: transaction._id,
      };
    }

    return Response.json(responsePayload);
  } catch (error) {
    console.error('[create-order] Error:', error);
    return Response.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
