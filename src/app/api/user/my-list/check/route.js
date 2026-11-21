import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';
import User from '@/models/User';

export async function GET(request) {
  const { success, user, message } = await requireAuth(request);
  if (!success) {
    return Response.json({ success: false, message }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');

    if (!contentId || !/^[0-9a-fA-F]{24}$/.test(contentId)) {
      return Response.json(
        { success: false, message: 'valid contentId query parameter is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const dbUser = await User.findById(user.userId, { myList: 1 }).lean();
    if (!dbUser) {
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const isAdded = (dbUser.myList || []).some(id => id?.toString() === contentId.toString());

    return Response.json({
      success: true,
      isAdded,
      addedtolist: isAdded,
    });
  } catch (err) {
    console.error('[/api/user/my-list/check] GET error:', err);
    return Response.json(
      { success: false, message: err.message || 'Failed to check My List status' },
      { status: 500 }
    );
  }
}
