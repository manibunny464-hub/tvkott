import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';
import Notification from '@/models/Notification';

export async function GET(request) {
  const { success, user, message } = await requireAuth(request);
  if (!success) {
    return Response.json({ success: false, message }, { status: 401 });
  }

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10', 10)));
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const type = searchParams.get('type');
    const skip = (page - 1) * limit;

    const baseFilter = { userId: user.userId, isCleared: { $ne: true } };
    if (unreadOnly) {
      baseFilter.isRead = false;
    }
    if (type) {
      baseFilter.type = type;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(baseFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(baseFilter),
      Notification.countDocuments({ userId: user.userId, isRead: false, isCleared: { $ne: true } }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return Response.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error('[/api/user/notifications] GET error:', err);
    return Response.json(
      { success: false, message: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
