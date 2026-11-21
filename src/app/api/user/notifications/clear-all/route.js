import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';
import Notification from '@/models/Notification';

export async function DELETE(request) {
  const { success, user, message } = await requireAuth(request);
  if (!success) {
    return Response.json({ success: false, message }, { status: 401 });
  }

  try {
    await dbConnect();
    const result = await Notification.updateMany(
      { userId: user.userId, isCleared: { $ne: true } },
      { $set: { isCleared: true, clearedAt: new Date() } }
    );

    return Response.json({
      success: true,
      message: 'All notifications cleared',
      modifiedCount: result.modifiedCount || 0,
    });
  } catch (err) {
    console.error('[/api/user/notifications/clear-all] DELETE error:', err);
    return Response.json(
      { success: false, message: 'Failed to clear notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  return DELETE(request);
}
