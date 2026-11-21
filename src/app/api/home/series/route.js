import dbConnect from '@/lib/db';
import Content from '@/models/Content';
import { getUserPreferredLanguages } from '@/lib/userLanguages';

import { getValidSeriesIds } from '@/lib/seriesFilter';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(Number(searchParams.get('limit') || 20), 1), 50);

    const preferredLangs = await getUserPreferredLanguages(request);

    await dbConnect();
    const validSeriesIds = await getValidSeriesIds(preferredLangs);

    if (validSeriesIds.length === 0) {
      return Response.json({ success: true, data: [] });
    }

    const query = {
      _id: { $in: validSeriesIds },
      type: 'series',
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

    const series = await Content.find(
      query,
      {
        _id: 1,
        title: 1,
        description: 1,
        language: 1,
        genres: 1,
        type: 1,
        releaseYear: 1,
        thumbnailUrl: 1,
        posterUrl: 1,
        bannerUrl: 1,
        pricing: 1,
        totalSeasons: 1,
        isFeatured: 1,
        isTrending: 1,
        color: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    )
      .sort({ isFeatured: -1, isTrending: -1, updatedAt: -1 })
      .limit(limit)
      .lean();

    return Response.json({ success: true, data: series });
  } catch (error) {
    return Response.json(
      { success: false, message: 'Failed to fetch series' },
      { status: 500 }
    );
  }
}
