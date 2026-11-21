import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';
import User from '@/models/User';
import Content from '@/models/Content';
import { getUserPreferredLanguages } from '@/lib/userLanguages';

export async function GET(request) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    const preferredLangs = await getUserPreferredLanguages(request);

    await dbConnect();

    const dbUser = await User.findById(user.userId, {
      watchHistory: 1,
    }).lean();

    const watchedIds = (dbUser?.watchHistory ?? []).map((h) => h.contentId);

    // Fallback: no language prefs → return trending content
    if (preferredLangs.length === 0) {
      const trending = await Content.find(
        {
          isTrending: true,
          isActive: true,
          isDeleted: { $ne: true },
          $or: [
            { isComingSoon: { $ne: true } },
            { expectedReleaseDate: { $lte: new Date() } }
          ]
        },
        { _id: 1, title: 1, thumbnailUrl: 1, type: 1, rating: 1, releaseYear: 1, language: 1, genres: 1 }
      )
        .sort({ trendingRank: 1 })
        .limit(20)
        .lean();

      return Response.json({ success: true, content: trending });
    }

    const content = await Content.find(
      {
        language: { $in: preferredLangs },
        isActive: true,
        isDeleted: { $ne: true },
        $or: [
          { isComingSoon: { $ne: true } },
          { expectedReleaseDate: { $lte: new Date() } }
        ],
        _id: { $nin: watchedIds },
      },
      { _id: 1, title: 1, thumbnailUrl: 1, type: 1, rating: 1, releaseYear: 1, language: 1, genres: 1, isFeatured: 1, isTrending: 1 }
    )
      .sort({ isFeatured: -1, isTrending: -1, createdAt: -1 })
      .limit(20)
      .lean();

    return Response.json({ success: true, content });
  } catch (error) {
    return Response.json(
      { success: false, message: 'Failed to fetch personalised content' },
      { status: 500 }
    );
  }
}
