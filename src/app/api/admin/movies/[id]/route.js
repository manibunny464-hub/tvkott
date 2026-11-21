import { requireAdmin } from '@/lib/admin/auth';
import { readBody, softDeletePatch } from '@/lib/admin/api';
import { buildContentPayload } from '@/lib/admin/content-payload';
import { syncContentFlags } from '@/lib/admin/content-flags';
import dbConnect from '@/lib/db';
import Content from '@/models/Content';
import Banner from '@/models/Banner';
import ComingSoon from '@/models/ComingSoon';
import TrendingItem from '@/models/TrendingItem';
import BlockbusterItem from '@/models/BlockbusterItem';

export async function GET(request, { params }) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { id } = await params;
  await dbConnect();
  const movie = await Content.findOne({ _id: id, type: 'movie', isDeleted: { $ne: true } }).lean();
  if (!movie) return Response.json({ success: false, message: 'Movie not found' }, { status: 404 });
  return Response.json({ success: true, movie });
}

export async function PUT(request, { params }) {
  const { error } = await requireAdmin(request, ['super_admin', 'editor']);
  if (error) return error;

  const { id } = await params;
  const { data, formData } = await readBody(request);
  const payload = await buildContentPayload({ data, formData, type: 'movie' });

  await dbConnect();
  const movie = await Content.findOneAndUpdate(
    { _id: id, type: 'movie', isDeleted: { $ne: true } },
    { $set: payload },
    { returnDocument: 'after', runValidators: true }
  );
  if (!movie) return Response.json({ success: false, message: 'Movie not found' }, { status: 404 });

  await syncContentFlags(movie, {
    isTrending: payload.isTrending,
    isBlockbuster: payload.isBlockbuster,
    isFeatured: payload.isFeatured,
  });

  return Response.json({ success: true, movie });
}

export async function DELETE(request, { params }) {
  const { error } = await requireAdmin(request, ['super_admin']);
  if (error) return error;

  const { id } = await params;
  await dbConnect();
  await Content.findOneAndUpdate({ _id: id, type: 'movie' }, { $set: softDeletePatch() });
  await Banner.updateMany({ linkedContentId: id }, { $set: softDeletePatch() });
  await ComingSoon.updateMany({ linkedContentId: id }, { $set: softDeletePatch() });
  await TrendingItem.deleteMany({ contentId: id });
  await BlockbusterItem.deleteMany({ contentId: id });

  return Response.json({ success: true });
}
