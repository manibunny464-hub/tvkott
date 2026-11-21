import { requireAdmin } from '@/lib/admin/auth';
import { activeQuery, paginationMeta, parsePagination } from '@/lib/admin/api';
import dbConnect from '@/lib/db';
import BlockbusterItem from '@/models/BlockbusterItem';
import Content from '@/models/Content';

export async function GET(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { page, limit, skip } = parsePagination(request);
  await dbConnect();

  // Self-heal/sync Content documents marked as isBlockbuster: true
  const blockbusterContents = await Content.find({ isBlockbuster: true, isDeleted: { $ne: true } }).lean();
  for (const content of blockbusterContents) {
    const exists = await BlockbusterItem.findOne({ contentId: content._id });
    if (!exists) {
      await BlockbusterItem.create({
        contentId: content._id,
        rank: content.blockbusterRank || 99,
        addedAt: content.updatedAt || new Date(),
      });
    }
  }

  const [items, total] = await Promise.all([
    BlockbusterItem.find({})
      .populate('contentId')
      .sort({ rank: 1, addedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    BlockbusterItem.countDocuments({}),
  ]);

  const blockbusters = items
    .filter((item) => item.contentId && item.contentId.isDeleted !== true)
    .map((item) => ({ ...item, content: item.contentId, contentId: item.contentId._id }));

  if (blockbusters.length === 0 && total === 0) {
    const content = await Content.find(activeQuery({ isBlockbuster: true }))
      .sort({ blockbusterRank: 1, updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    return Response.json({ success: true, blockbusters: content, pagination: paginationMeta(page, limit, content.length) });
  }

  return Response.json({ success: true, blockbusters, pagination: paginationMeta(page, limit, total) });
}
