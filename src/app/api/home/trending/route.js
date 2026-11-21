import dbConnect from '@/lib/db';
import Content from '@/models/Content';
import { getUserPreferredLanguages } from '@/lib/userLanguages';

import { getValidSeriesIds } from '@/lib/seriesFilter';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit')) || 10, 20);

    const preferredLangs = await getUserPreferredLanguages(request);

    await dbConnect();

    const query = {
      isTrending: true,
      isActive: true,
      isDeleted: { $ne: true },
      $or: [
        { isComingSoon: { $ne: true } },
        { expectedReleaseDate: { $lte: new Date() } }
      ]
    };
    if (preferredLangs.length > 0) {
      query.language = { $in: preferredLangs };
    }

    const rawTrending = await Content.find(
      query,
      { _id: 1, title: 1, thumbnailUrl: 1, genres: 1, type: 1, trendingRank: 1, color: 1 }
    )
      .sort({ trendingRank: 1 })
      .limit(limit * 2)
      .lean();

    const validSeriesSet = new Set(await getValidSeriesIds());
    const trending = rawTrending
      .filter((item) => item.type !== 'series' || validSeriesSet.has(item._id.toString()))
      .slice(0, limit);

    return Response.json({ success: true, data: trending });
  } catch (error) {
    return Response.json(
      { success: false, message: 'Failed to fetch trending content' },
      { status: 500 }
    );
  }
}
