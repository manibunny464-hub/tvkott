import { requireAdmin } from '@/lib/admin/auth';
import { softDeletePatch } from '@/lib/admin/api';
import { getVideosList, normalizeVideo } from '@/lib/admin/data';
import dbConnect from '@/lib/db';
import Content from '@/models/Content';

function normalizeBody(body) {
  return {
    title: String(body.title || '').trim(),
    description: String(body.description || '').trim(),
    type: body.type || 'movie',
    language: Array.isArray(body.language) ? body.language : [],
    genres: Array.isArray(body.genres)
      ? body.genres
      : body.category
        ? [body.category]
        : [],
    tags: Array.isArray(body.tags)
      ? body.tags
      : String(body.tags || '')
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
    thumbnailUrl: body.thumbnailUrl || '',
    bannerUrl: body.bannerUrl || '',
    pricing: body.pricing || 'free',
    scheduledPublishAt: body.scheduledPublishAt || null,
    isActive: body.isActive ?? true,
    isFeatured: Boolean(body.isFeatured),
    isTrending: Boolean(body.isTrending),
    duration: Number(body.duration || 0),
  };
}

export async function GET(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const data = await getVideosList({
    page: Number(searchParams.get('page') || 1),
    limit: Number(searchParams.get('limit') || 10),
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    category: searchParams.get('category') || '',
  });

  return Response.json({ success: true, ...data });
}

export async function POST(request) {
  const { error } = await requireAdmin(request, ['super_admin', 'editor']);
  if (error) return error;

  try {
    const body = await request.json();
    const payload = normalizeBody(body);

    if (!payload.title) {
      return Response.json(
        { success: false, message: 'Title is required' },
        { status: 400 }
      );
    }

    await dbConnect();
    const content = await Content.create({
      ...payload,
      transcodingStatus: body.transcodingStatus || 'live',
      renditions: body.renditions || [],
      videoSource: body.videoSource || undefined,
      hlsManifestUrl: body.hlsManifestUrl || '',
    });

    return Response.json({ success: true, video: normalizeVideo(content.toObject()) });
  } catch (error) {
    console.error('[admin/videos:POST] Error:', error);
    return Response.json(
      { success: false, message: 'Failed to create video' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const { error } = await requireAdmin(request, ['super_admin']);
  if (error) return error;

  try {
    const { ids = [] } = await request.json();
    await dbConnect();
    await Content.updateMany({ _id: { $in: ids } }, { $set: softDeletePatch() });
    return Response.json({ success: true });
  } catch (error) {
    console.error('[admin/videos:DELETE] Error:', error);
    return Response.json(
      { success: false, message: 'Failed to delete videos' },
      { status: 500 }
    );
  }
}
