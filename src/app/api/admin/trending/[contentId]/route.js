import mongoose from 'mongoose';
import { requireAdmin } from '@/lib/admin/auth';
import dbConnect from '@/lib/db';
import Content from '@/models/Content';
import TrendingItem from '@/models/TrendingItem';

export async function POST(request, { params }) {
  const { error } = await requireAdmin(request, ['super_admin', 'editor']);
  if (error) return error;

  const { contentId } = await params;
  const body = await request.json().catch(() => ({}));
  const rank = Number(body.rank ?? 0);
  if (!mongoose.isObjectIdOrHexString(contentId) || !Number.isSafeInteger(rank) || rank < 0) {
    return Response.json({ success: false, message: 'Choose a valid title and rank.' }, { status: 400 });
  }
  await dbConnect();

  const content = await Content.findOneAndUpdate(
    { _id: contentId, isDeleted: { $ne: true } },
    { $set: { isTrending: true, trendingRank: rank } },
    { returnDocument: 'after' }
  );
  if (!content) return Response.json({ success: false, message: 'Title not found.' }, { status: 404 });
  await TrendingItem.findOneAndUpdate(
    { contentId },
    {
      $set: { contentType: content.type, rank },
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
