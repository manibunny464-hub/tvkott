import { requireAdmin } from '@/lib/admin/auth';
import { activeQuery, paginationMeta, parsePagination, readBody, toBoolean } from '@/lib/admin/api';
import { uploadFormFile } from '@/lib/admin/media';
import dbConnect from '@/lib/db';
import ComingSoon from '@/models/ComingSoon';

export async function GET(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { page, limit, skip } = parsePagination(request);
  await dbConnect();

  const query = activeQuery();
  const [items, total] = await Promise.all([
    ComingSoon.find(query).sort({ rank: 1, expectedReleaseDate: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    ComingSoon.countDocuments(query),
  ]);

  return Response.json({ success: true, comingSoon: items, pagination: paginationMeta(page, limit, total) });
}

export async function POST(request) {
  const { error } = await requireAdmin(request, ['super_admin', 'editor']);
  if (error) return error;

  const { data, formData } = await readBody(request);
  const poster = await uploadFormFile(formData?.get('posterImage'), 'coming-soon');
  const thumbnail = await uploadFormFile(formData?.get('thumbnailImage'), 'coming-soon');
  const banner = await uploadFormFile(formData?.get('bannerImage'), 'coming-soon');

  const parseJsonField = (val) => {
    if (!val) return [];
    try {
      return typeof val === 'string' ? JSON.parse(val) : val;
    } catch {
      return [];
    }
  };

  await dbConnect();
  const item = await ComingSoon.create({
    title: data.title,
    description: data.description || '',
    posterUrl: poster.url || data.posterUrl || '',
    thumbnailUrl: thumbnail.url || data.thumbnailUrl || '',
    bannerUrl: banner.url || data.bannerUrl || '',
    languages: parseJsonField(data.languages),
    genres: parseJsonField(data.genres),
    ageRating: data.ageRating || '',
    releaseYear: data.releaseYear ? Number(data.releaseYear) : undefined,
    cast: parseJsonField(data.cast),
    expectedReleaseDate: data.expectedReleaseDate || null,
    linkedContentId: data.linkedContentId || undefined,
    isActive: toBoolean(data.isActive, true),
    rank: data.rank ? Number(data.rank) : 0,
  });

  if (item && item.linkedContentId) {
    const Content = (await import('@/models/Content')).default;
    await Content.findByIdAndUpdate(item.linkedContentId, {
      $set: {
        isComingSoon: !!item.isActive,
        expectedReleaseDate: item.isActive ? item.expectedReleaseDate : null
      }
    });
  }

  return Response.json({ success: true, comingSoon: item });
}
