import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';
import BlockbusterItem from '@/models/BlockbusterItem';
import Content from '@/models/Content';
import User from '@/models/User';
import { getUserPreferredLanguages } from '@/lib/userLanguages';
import { getValidSeriesIds } from '@/lib/seriesFilter';

const CONTENT_FIELDS = {
  _id: 1,
  title: 1,
  description: 1,
  thumbnailUrl: 1,
  posterUrl: 1,
  bannerUrl: 1,
  genres: 1,
  type: 1,
  rating: 1,
  releaseYear: 1,
  pricing: 1,
  language: 1,
  blockbusterRank: 1,
  isComingSoon: 1,
  expectedReleaseDate: 1,
};

export async function GET(request) {
  const { error, user } = await requireAuth(request);
  if (error) return error;

  const preferredLangs = await getUserPreferredLanguages(request);

  await dbConnect();

  const validSeriesSet = new Set(await getValidSeriesIds());

  let userMyList = [];
  if (user && user.userId) {
    const dbUser = await User.findById(user.userId, { myList: 1 }).lean();
    if (dbUser && dbUser.myList) {
      userMyList = dbUser.myList.map(id => id.toString());
    }
  }

  // Try curated BlockbusterItem list first
  const items = await BlockbusterItem.find({})
    .populate({ path: 'contentId', select: CONTENT_FIELDS })
    .sort({ rank: 1, addedAt: -1 })
    .limit(20)
    .lean();

  const blockbusters = items
    .filter((item) => {
      if (!item.contentId || item.contentId.isDeleted === true || item.contentId.isActive === false) {
        return false;
      }
      if (item.contentId.isComingSoon === true) {
        const releaseDate = item.contentId.expectedReleaseDate ? new Date(item.contentId.expectedReleaseDate) : null;
        if (!releaseDate || releaseDate > new Date()) {
          return false;
        }
      }
      // Filter out series with no episodes
      if (item.contentId.type === 'series' && !validSeriesSet.has(item.contentId._id.toString())) {
        return false;
      }
      if (preferredLangs.length > 0) {
        const itemLangs = item.contentId.language || [];
        return itemLangs.some(l => preferredLangs.includes(l));
      }
      return true;
    })
    .map((item) => {
      const content = item.contentId;
      const contentIdStr = content._id.toString();
      const addedtolist = userMyList.includes(contentIdStr);
      return {
        ...content,
        _id: content._id,
        rank: item.rank,
        contentType: item.contentType,
        addedAt: item.addedAt,
        addedtolist,
      };
    });

  if (blockbusters.length > 0) {
    return Response.json({ success: true, blockbusters });
  }

  // Fallback: Content documents flagged with isBlockbuster
  const query = {
    isBlockbuster: true,
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

  const rawFallback = await Content.find(query, CONTENT_FIELDS)
    .sort({ blockbusterRank: 1, updatedAt: -1 })
    .limit(20)
    .lean();

  // Filter out series with no episodes from fallback too
  const serializedFallback = rawFallback
    .filter((item) => item.type !== 'series' || validSeriesSet.has(item._id.toString()))
    .map((item) => {
      const itemIdStr = item._id.toString();
      const addedtolist = userMyList.includes(itemIdStr);
      return {
        ...item,
        addedtolist,
      };
    });

  return Response.json({ success: true, blockbusters: serializedFallback });
}
