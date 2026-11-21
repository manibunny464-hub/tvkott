import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';
import User from '@/models/User';
import Content from '@/models/Content';
import { getUserPreferredLanguages } from '@/lib/userLanguages';

export async function GET(request) {
  const { success, user, message } = await requireAuth(request);
  if (!success) {
    return Response.json({ success: false, message }, { status: 401 });
  }

  try {
    const preferredLangs = await getUserPreferredLanguages(request);

    await dbConnect();

    const dbUser = await User.findById(user.userId, { myList: 1 }).lean();
    const myList = dbUser?.myList ?? [];

    // Filter out invalid ObjectIds to prevent Mongoose CastErrors
    const validMyList = myList
      .map(id => id?.toString?.())
      .filter(id => id && /^[0-9a-fA-F]{24}$/.test(id));

    if (validMyList.length === 0) {
      return Response.json({ success: true, items: [], total: 0 });
    }

    const queryObj = {
      _id: { $in: validMyList },
      isActive: true,
    };

    if (preferredLangs.length > 0) {
      queryObj.language = { $in: preferredLangs };
    }

    const items = await Content.find(
      queryObj,
      { _id: 1, title: 1, thumbnailUrl: 1, type: 1, genres: 1, rating: 1, totalSeasons: 1 }
    ).lean();

    return Response.json({ success: true, items, total: items.length });
  } catch (err) {
    console.error('[GET /api/user/my-list] Error fetching my list:', err);
    return Response.json(
      { success: false, message: 'Failed to fetch My List' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const { success, user, message } = await requireAuth(request);
  if (!success) {
    return Response.json({ success: false, message }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Accept single contentId (string) or multiple contentIds (array)
    const rawIds = Array.isArray(body.contentIds)
      ? body.contentIds
      : body.contentId
      ? [body.contentId]
      : [];

    // Filter out invalid ObjectIds
    const ids = rawIds.filter(id => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id));

    if (ids.length === 0) {
      return Response.json(
        { success: false, message: 'valid contentId or contentIds array is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    await User.updateOne(
      { _id: user.userId },
      { $addToSet: { myList: { $each: ids } } }
    );

    return Response.json({
      success: true,
      message: ids.length === 1 ? 'Added to My List' : `${ids.length} items added to My List`,
      added: ids,
    });
  } catch (err) {
    console.error('[POST /api/user/my-list] Error updating my list:', err);
    return Response.json(
      { success: false, message: 'Failed to update My List' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const { success, user, message } = await requireAuth(request);
  if (!success) {
    return Response.json({ success: false, message }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');
    const contentIds = searchParams.get('contentIds');

    // Accept query params: ?contentId=abc OR ?contentIds=abc,def OR body: { contentId: '...' } / { contentIds: [...] }
    const allIds = searchParams.getAll('contentIds').flatMap(v => v.split(',').map(s => s.trim()).filter(Boolean));
    let rawIds = allIds.length > 0 ? allIds : contentId ? [contentId] : [];

    if (rawIds.length === 0) {
      try {
        const body = await request.json();
        if (Array.isArray(body?.contentIds)) {
          rawIds = body.contentIds;
        } else if (body?.contentId) {
          rawIds = [body.contentId];
        }
      } catch {
        // Request has no JSON body; continue with query params check
      }
    }

    // Filter to valid ObjectIds
    const ids = rawIds
      .map(id => id?.toString?.())
      .filter(id => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id));

    if (ids.length === 0) {
      return Response.json(
        { success: false, message: 'valid contentId or contentIds is required (via query param or JSON body)' },
        { status: 400 }
      );
    }

    await dbConnect();

    await User.updateOne(
      { _id: user.userId },
      { $pullAll: { myList: ids } }
    );

    return Response.json({
      success: true,
      message: ids.length === 1 ? 'Removed from My List' : `${ids.length} items removed from My List`,
      removed: ids,
    });
  } catch (err) {
    console.error('[DELETE /api/user/my-list] Error updating my list:', err);
    return Response.json(
      { success: false, message: 'Failed to update My List' },
      { status: 500 }
    );
  }
}
