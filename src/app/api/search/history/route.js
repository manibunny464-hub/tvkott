import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';
import SearchHistory from '@/models/SearchHistory';
import Content from '@/models/Content';
import TrendingSearch from '@/models/TrendingSearch';

import { getUserPreferredLanguages } from '@/lib/userLanguages';
import { getValidSeriesIds } from '@/lib/seriesFilter';

export async function GET(request) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    const preferredLangs = await getUserPreferredLanguages(request);

    await dbConnect();
    const validSeriesSet = new Set(await getValidSeriesIds());

    const contentMatch = {
      isActive: true,
      isDeleted: { $ne: true },
      $or: [
        { isComingSoon: { $ne: true } },
        { expectedReleaseDate: { $lte: new Date() } }
      ]
    };
    if (preferredLangs.length > 0) {
      contentMatch.language = { $in: preferredLangs };
    }

    const [rawHistory, rawTrending] = await Promise.all([
      SearchHistory.find(
        { userId: user.userId, contentId: { $exists: true, $ne: null } },
        { _id: 1, query: 1, searchedAt: 1, contentId: 1 }
      )
        .populate({
          path: 'contentId',
          select: '_id title thumbnailUrl type genres rating language',
          match: contentMatch
        })
        .sort({ searchedAt: -1 })
        .limit(30)
        .lean(),
      TrendingSearch.find({ isActive: true })
        .populate({
          path: 'contentId',
          select: '_id title thumbnailUrl type genres rating language',
          match: contentMatch
        })
        .sort({ count: -1 })
        .limit(50)
        .lean()
    ]);

    const history = [];
    const seenQueries = new Set();
    for (const item of rawHistory) {
      if (!item.contentId) continue;
      if (item.contentId.type === 'series' && !validSeriesSet.has(item.contentId._id.toString())) continue;

      const queryText = item.contentId.title;
      const normalizedQuery = queryText.toLowerCase().trim();
      if (!seenQueries.has(normalizedQuery)) {
        seenQueries.add(normalizedQuery);
        history.push({
          _id: item._id,
          query: queryText,
          searchedAt: item.searchedAt,
          contentId: item.contentId
        });
      }
    }
    const limitedHistory = history.slice(0, 10);

    const trending = [];
    const seenContentIds = new Set();
    for (const t of rawTrending) {
      if (t.contentId && typeof t.contentId === 'object') {
        if (t.contentId.type === 'series' && !validSeriesSet.has(t.contentId._id.toString())) continue;

        const idStr = t.contentId._id.toString();
        if (!seenContentIds.has(idStr)) {
          seenContentIds.add(idStr);
          trending.push({
            _id: t.contentId._id,
            title: t.contentId.title,
            thumbnailUrl: t.contentId.thumbnailUrl,
            type: t.contentId.type,
            genres: t.contentId.genres,
            rating: t.contentId.rating,
            count: t.count || 1
          });
        }
      }
    }

    // Return maximum of 20 unique trending items
    const limitedTrending = trending.slice(0, 20);

    return Response.json({ success: true, history: limitedHistory, trending: limitedTrending });
  } catch (err) {
    return Response.json(
      { success: false, message: 'Failed to fetch search history' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    await dbConnect();

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return Response.json(
          { success: false, message: 'Invalid id' },
          { status: 400 }
        );
      }

      await SearchHistory.deleteOne({ _id: id, userId: user.userId });
    } else {
      await SearchHistory.deleteMany({ userId: user.userId });
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { success: false, message: 'Failed to delete search history' },
      { status: 500 }
    );
  }
}
