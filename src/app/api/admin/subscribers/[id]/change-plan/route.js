import { requireAdmin } from '@/lib/admin/auth';
import dbConnect from '@/lib/db';
import Subscription from '@/models/Subscription';
import SubscriptionPlan from '@/models/SubscriptionPlan';
import User from '@/models/User';

export async function POST(request, { params }) {
  const { error } = await requireAdmin(request, ['super_admin', 'editor']);
  if (error) return error;

  const { id } = await params;
  const { planId } = await request.json();

  if (!planId) {
    return Response.json(
      { success: false, message: 'planId is required' },
      { status: 400 }
    );
  }

  await dbConnect();

  try {
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return Response.json(
        { success: false, message: 'Plan not found' },
        { status: 404 }
      );
    }

    const duration = plan.duration || 30;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);

    // Try finding subscription by ID or active subscription for User ID
    let sub = await Subscription.findById(id);
    if (!sub) {
      sub = await Subscription.findOne({
        userId: id,
        status: { $in: ['active', 'paused'] },
      });
    }

    let targetUserId = id;

    if (sub) {
      targetUserId = sub.userId;
      sub.planId = planId;
      sub.startDate = startDate;
      sub.endDate = endDate;
      sub.nextRenewalDate = endDate;
      sub.status = 'active';
      sub.autoRenew = plan.autoRenew ?? true;
      await sub.save();
    } else {
      // If no subscription existed, create a new one for this user
      const user = await User.findById(id);
      if (!user) {
        return Response.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }

      sub = await Subscription.create({
        userId: user._id,
        planId,
        startDate,
        endDate,
        nextRenewalDate: endDate,
        status: 'active',
        autoRenew: plan.autoRenew ?? true,
        paymentMethod: 'Manual Change',
      });
    }

    // Make user premium in User model
    await User.findByIdAndUpdate(targetUserId, {
      isPremium: true,
      premiumExpiry: endDate,
    });

    return Response.json({
      success: true,
      message: 'Plan changed successfully',
      subscription: sub,
    });
  } catch (error) {
    console.error(`[admin/subscribers/${id}/change-plan] error:`, error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
