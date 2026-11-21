import { requireAdmin } from '@/lib/admin/auth';
import dbConnect from '@/lib/db';
import Subscription from '@/models/Subscription';
import User from '@/models/User';

export async function POST(request, { params }) {
  const { error } = await requireAdmin(request, ['super_admin', 'editor']);
  if (error) return error;

  const { id } = await params;
  const { days } = await request.json();

  if (!days || isNaN(days) || Number(days) <= 0) {
    return Response.json(
      { success: false, message: 'Invalid number of days' },
      { status: 400 }
    );
  }

  const daysToAdd = Number(days);
  await dbConnect();

  try {
    // Find subscription by ID or find active subscription for User ID
    let sub = await Subscription.findById(id);
    if (!sub) {
      sub = await Subscription.findOne({
        userId: id,
        status: { $in: ['active', 'paused'] },
      });
    }

    if (!sub) {
      return Response.json(
        { success: false, message: 'Subscription not found' },
        { status: 404 }
      );
    }

    const currentEndDate = new Date(sub.endDate || new Date());
    // If the subscription is expired, start from today
    const baseDate = currentEndDate < new Date() ? new Date() : currentEndDate;
    const newEndDate = new Date(baseDate);
    newEndDate.setDate(newEndDate.getDate() + daysToAdd);

    sub.endDate = newEndDate;
    sub.nextRenewalDate = newEndDate;
    sub.status = 'active';
    await sub.save();

    // Update User premium expiry
    await User.findByIdAndUpdate(sub.userId, {
      isPremium: true,
      premiumExpiry: newEndDate,
    });

    return Response.json({
      success: true,
      message: `Subscription extended by ${daysToAdd} days successfully`,
      subscription: sub,
    });
  } catch (error) {
    console.error(`[admin/subscribers/${id}/extend] error:`, error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
