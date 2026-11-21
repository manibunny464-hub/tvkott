import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';
import Notification from '@/models/Notification';

export async function PATCH(request) {
  const { success, user, message } = await requireAuth(request);
  if (!success) {
    return Response.json({ success: false, message }, { status: 401 });
  }

  try {
    await dbConnect();
    const result = await Notification.updateMany(
      { userId: user.userId, isRead: false, isCleared: { $ne: true } },
      { $set: { isRead: true, readAt: new Date() } }
    );

    return Response.json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount || 0,
    });
  } catch (err) {
    console.error('[/api/user/notifications/read-all] PATCH error:', err);
    return Response.json(
      { success: false, message: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  return PATCH(request);
}

export async function POST(request) {
  return PATCH(request);
}
