import { requireAdmin } from '@/lib/admin/auth';
import { activeQuery, optionalObjectId, paginationMeta, parsePagination, readBody, toBoolean } from '@/lib/admin/api';
import { uploadFormFile } from '@/lib/admin/media';
import dbConnect from '@/lib/db';
import Banner from '@/models/Banner';

export async function GET(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { page, limit, skip } = parsePagination(request);
  await dbConnect();

  const query = activeQuery();
  const [banners, total] = await Promise.all([
    Banner.find(query).sort({ order: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    Banner.countDocuments(query),
  ]);

  return Response.json({ success: true, banners, pagination: paginationMeta(page, limit, total) });
}

export async function POST(request) {
  const { error } = await requireAdmin(request, ['super_admin', 'editor']);
  if (error) return error;

  const { formData, data } = await readBody(request);
  await dbConnect();

  const uploaded = await uploadFormFile(formData?.get('image'), 'banners');
  const banner = await Banner.create({
    title: data.title,
    subtitle: data.subtitle || '',
    imageUrl: uploaded.url || data.imageUrl,
    linkedContentId: optionalObjectId(data.linkedContentId),
    linkedContentType: data.linkedContentType || 'movie',
    order: Number(data.order || 0),
    isActive: toBoolean(data.isActive, true),
  });

  return Response.json({ success: true, banner });
}
