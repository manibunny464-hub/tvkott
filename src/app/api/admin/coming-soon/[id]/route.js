import { requireAdmin } from '@/lib/admin/auth';
import { readBody, softDeletePatch, toBoolean } from '@/lib/admin/api';
import { uploadFormFile } from '@/lib/admin/media';
import dbConnect from '@/lib/db';
import ComingSoon from '@/models/ComingSoon';

export async function PUT(request, { params }) {
  const { error } = await requireAdmin(request, ['super_admin', 'editor']);
  if (error) return error;

  const { id } = await params;
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

  const updateObj = {
    title: data.title,
    description: data.description || '',
    languages: parseJsonField(data.languages),
    genres: parseJsonField(data.genres),
    ageRating: data.ageRating || '',
    releaseYear: data.releaseYear ? Number(data.releaseYear) : undefined,
    cast: parseJsonField(data.cast),
    expectedReleaseDate: data.expectedReleaseDate || null,
    linkedContentId: data.linkedContentId || undefined,
    isActive: toBoolean(data.isActive, true),
  };

  if (data.rank !== undefined && data.rank !== null) {
    updateObj.rank = Number(data.rank);
  }

  const posterVal = poster.url || data.posterUrl;
  if (posterVal !== undefined) {
    updateObj.posterUrl = posterVal;
  }

  const thumbnailVal = thumbnail.url || data.thumbnailUrl;
  if (thumbnailVal !== undefined) {
    updateObj.thumbnailUrl = thumbnailVal;
  }

  const bannerVal = banner.url || data.bannerUrl;
  if (bannerVal !== undefined) {
    updateObj.bannerUrl = bannerVal;
  }

  await dbConnect();
  const item = await ComingSoon.findByIdAndUpdate(
    id,
    { $set: updateObj },
    { returnDocument: 'after', runValidators: true }
  );

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

export async function DELETE(request, { params }) {
  const { error } = await requireAdmin(request, ['super_admin']);
  if (error) return error;

  const { id } = await params;
  await dbConnect();
  const item = await ComingSoon.findByIdAndUpdate(id, { $set: softDeletePatch() });

  if (item && item.linkedContentId) {
    const Content = (await import('@/models/Content')).default;
    await Content.findByIdAndUpdate(item.linkedContentId, {
      $set: {
        isComingSoon: false,
        expectedReleaseDate: null
      }
    });
  }
  return Response.json({ success: true });
}
