import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';
import Notification from '@/models/Notification';

export async function PATCH(request, { params }) {
  const { success, user, message } = await requireAuth(request);
  if (!success) {
    return Response.json({ success: false, message }, { status: 401 });
  }

  try {
    const { id } = await params;
    await dbConnect();

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: user.userId },
      { $set: { isRead: true, readAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!notification) {
      return Response.json({ success: false, message: 'Notification not found' }, { status: 404 });
    }

    return Response.json({ success: true, message: 'Notification marked as read', notification });
  } catch (err) {
    console.error('[/api/user/notifications/[id]/read] PATCH error:', err);
    return Response.json(
      { success: false, message: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  return PATCH(request, { params });
}

export async function POST(request, { params }) {
  return PATCH(request, { params });
}
