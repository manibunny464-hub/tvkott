import { requireAdmin } from '@/lib/admin/auth';
import { activeQuery, paginationMeta, parsePagination } from '@/lib/admin/api';
import dbConnect from '@/lib/db';
import Content from '@/models/Content';
import TrendingItem from '@/models/TrendingItem';

export async function GET(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { page, limit, skip } = parsePagination(request);
  await dbConnect();

  // Self-heal/sync Content documents marked as isTrending: true
  const trendingContents = await Content.find({ isTrending: true, isDeleted: { $ne: true } }).lean();
  for (const content of trendingContents) {
    const exists = await TrendingItem.findOne({ contentId: content._id });
    if (!exists) {
      await TrendingItem.create({
        contentId: content._id,
        rank: content.trendingRank || 99,
        addedAt: content.updatedAt || new Date(),
      });
    }
  }

  const [items, total] = await Promise.all([
    TrendingItem.find({})
      .populate('contentId')
      .sort({ rank: 1, addedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    TrendingItem.countDocuments({}),
  ]);

  const trending = items
    .filter((item) => item.contentId && item.contentId.isDeleted !== true)
    .map((item) => ({ ...item, content: item.contentId, contentId: item.contentId._id }));

  if (trending.length === 0 && total === 0) {
    const content = await Content.find(activeQuery({ isTrending: true }))
      .sort({ trendingRank: 1, updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    return Response.json({ success: true, trending: content, pagination: paginationMeta(page, limit, content.length) });
  }

  return Response.json({ success: true, trending, pagination: paginationMeta(page, limit, total) });
}
