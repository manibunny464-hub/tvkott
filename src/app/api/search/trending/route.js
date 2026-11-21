import dbConnect from '@/lib/db';
import TrendingSearch from '@/models/TrendingSearch';
import { getUserPreferredLanguages } from '@/lib/userLanguages';
import { getValidSeriesIds } from '@/lib/seriesFilter';

export async function GET(request) {
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

    const rawTrending = await TrendingSearch.find({ isActive: true })
      .populate({
        path: 'contentId',
        select: '_id language type',
        match: contentMatch
      })
      .sort({ count: -1 })
      .limit(50)
      .lean();

    const trending = [];
    for (const t of rawTrending) {
      if (t.contentId && typeof t.contentId === 'object') {
        if (t.contentId.type === 'series' && !validSeriesSet.has(t.contentId._id.toString())) continue;

        trending.push({ query: t.query });
        if (trending.length >= 10) break;
      }
    }

    return Response.json({ success: true, trending });
  } catch (err) {
    console.error('Failed to fetch trending searches:', err);
    return Response.json(
      { success: false, message: 'Failed to fetch trending searches' },
      { status: 500 }
    );
  }
}
