import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';
import User from '@/models/User';

export async function POST(request) {
  const { success, user, message } = await requireAuth(request);
  if (!success) {
    return Response.json({ success: false, message }, { status: 401 });
  }

  try {
    const { contentId } = await request.json();

    if (!contentId || !/^[0-9a-fA-F]{24}$/.test(contentId)) {
      return Response.json(
        { success: false, message: 'valid contentId is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if it already exists in the user's watchlist
    const dbUser = await User.findById(user.userId, { myList: 1 });
    if (!dbUser) {
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    if (!Array.isArray(dbUser.myList)) {
      dbUser.myList = [];
    }

    const index = dbUser.myList.findIndex(id => id?.toString() === contentId.toString());
    let isAdded = false;

    if (index > -1) {
      // Remove from watchlist
      dbUser.myList.splice(index, 1);
      isAdded = false;
    } else {
      // Add to watchlist
      dbUser.myList.push(contentId.toString());
      isAdded = true;
    }

    await dbUser.save();

    return Response.json({
      success: true,
      message: isAdded ? 'Added to My List' : 'Removed from My List',
      isAdded,
      addedtolist: isAdded,
    });
  } catch (err) {
    console.error('[/api/user/my-list/toggle] POST error:', err);
    return Response.json(
      { success: false, message: err.message || 'Failed to toggle My List' },
      { status: 500 }
    );
  }
}
