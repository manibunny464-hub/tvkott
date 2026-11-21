import { requireAdmin } from '@/lib/admin/auth';
import dbConnect from '@/lib/db';
import Content from '@/models/Content';
import TrendingItem from '@/models/TrendingItem';

export async function POST(request, { params }) {
  const { error } = await requireAdmin(request, ['super_admin', 'editor']);
  if (error) return error;

  const { contentId } = await params;
  const body = await request.json().catch(() => ({}));
  await dbConnect();

  const content = await Content.findByIdAndUpdate(
    contentId,
    { $set: { isTrending: true, trendingRank: Number(body.rank || 0) } },
    { returnDocument: 'after' }
  );
  await TrendingItem.findOneAndUpdate(
    { contentId },
    {
      $set: { contentType: content?.type || body.contentType || 'movie', rank: Number(body.rank || 0) },
      $setOnInsert: { addedAt: new Date() },
    },
    { upsert: true }
  );

  return Response.json({ success: true, content });
}

export async function DELETE(request, { params }) {
  const { error } = await requireAdmin(request, ['super_admin', 'editor']);
  if (error) return error;

  const { contentId } = await params;
  await dbConnect();
  await Promise.all([
    Content.findByIdAndUpdate(contentId, { $set: { isTrending: false }, $unset: { trendingRank: '' } }),
    TrendingItem.deleteOne({ contentId }),
  ]);
  return Response.json({ success: true });
}
