import { requireAdmin } from '@/lib/admin/auth';
import { softDeletePatch } from '@/lib/admin/api';
import { getVideoDetail, normalizeVideo } from '@/lib/admin/data';
import dbConnect from '@/lib/db';
import Content from '@/models/Content';

export async function GET(request, context) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { id } = await context.params;
  const detail = await getVideoDetail(id);

  if (!detail) {
    return Response.json(
      { success: false, message: 'Video not found' },
      { status: 404 }
    );
  }

  return Response.json({ success: true, ...detail });
}

export async function PUT(request, context) {
  const { error } = await requireAdmin(request, ['super_admin', 'editor']);
  if (error) return error;

  try {
    const { id } = await context.params;
    const body = await request.json();
    await dbConnect();

    const video = await Content.findByIdAndUpdate(
      id,
      {
        $set: {
          title: body.title,
          description: body.description,
          genres: body.genres,
          tags: body.tags,
          language: body.language,
          thumbnailUrl: body.thumbnailUrl,
          bannerUrl: body.bannerUrl,
          pricing: body.pricing,
          scheduledPublishAt: body.scheduledPublishAt || null,
          isActive: body.status ? body.status === 'Live' : body.isActive,
          isFeatured: Boolean(body.isFeatured),
          isTrending: Boolean(body.isTrending),
        },
      },
      { returnDocument: 'after', runValidators: true }
    ).lean();

    if (!video) {
      return Response.json(
        { success: false, message: 'Video not found' },
        { status: 404 }
      );
    }

    return Response.json({ success: true, video: normalizeVideo(video) });
  } catch (error) {
    console.error('[admin/videos/[id]:PUT] Error:', error);
    return Response.json(
      { success: false, message: 'Failed to update video' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  const { error } = await requireAdmin(request, ['super_admin']);
  if (error) return error;

  const { id } = await context.params;
  await dbConnect();
  await Content.findByIdAndUpdate(id, { $set: softDeletePatch() });
  return Response.json({ success: true });
}
