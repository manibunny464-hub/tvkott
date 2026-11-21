import { requireAdmin } from '@/lib/admin/auth';
import { getUsersList } from '@/lib/admin/data';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import ComingSoon from '@/models/ComingSoon';
import Device from '@/models/Device';
import Download from '@/models/Download';
import Subscription from '@/models/Subscription';
import Notification from '@/models/Notification';
import SearchHistory from '@/models/SearchHistory';
import Otp from '@/models/Otp';

export async function GET(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const data = await getUsersList({
    page: Number(searchParams.get('page') || 1),
    limit: Number(searchParams.get('limit') || 10),
    search: searchParams.get('search') || '',
    plan: searchParams.get('plan') || '',
    status: searchParams.get('status') || '',
  });

  return Response.json({ success: true, ...data });
}

export async function PUT(request) {
  const { error } = await requireAdmin(request, ['super_admin', 'editor']);
  if (error) return error;

  try {
    const body = await request.json();
    await dbConnect();

    const update = {};
    if (body.action === 'suspend') update.status = 'suspended';
    if (body.action === 'activate') update.status = 'active';
    if (body.action === 'change-plan') update.isPremium = body.plan === 'Premium';
    if (body.name !== undefined) update.name = body.name;
    if (body.email !== undefined) update.email = body.email;

    const user = await User.findByIdAndUpdate(
      body.id,
      { $set: update },
      { returnDocument: 'after' }
    ).lean();

    if (!user) {
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return Response.json({ success: true, user });
  } catch (error) {
    console.error('[admin/users:PUT] Error:', error);
    return Response.json(
      { success: false, message: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const { error } = await requireAdmin(request, ['super_admin', 'admin', 'editor']);
  if (error) return error;

  try {
    let id;
    try {
      const body = await request.json();
      id = body?.id;
    } catch {
      // Body may be empty, try query parameters
    }

    if (!id) {
      const { searchParams } = new URL(request.url);
      id = searchParams.get('id');
    }

    if (!id) {
      return Response.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();
    const user = await User.findById(id);
    if (!user) {
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Permanently delete user
    await User.findByIdAndDelete(id);

    // Clean up related user records in parallel
    await Promise.allSettled([
      ComingSoon.updateMany({}, { $pull: { notifyUsers: { userId: id } } }),
      Device.deleteMany({ userId: id }),
      Download.deleteMany({ userId: id }),
      Subscription.deleteMany({ userId: id }),
      Notification.deleteMany({ userId: id }),
      SearchHistory.deleteMany({ userId: id }),
      user.phone ? Otp.deleteMany({ phone: user.phone }) : Promise.resolve(),
    ]);

    return Response.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (err) {
    console.error('[admin/users:DELETE] Error:', err);
    return Response.json(
      { success: false, message: err.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}
