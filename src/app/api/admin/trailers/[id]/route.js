import { requireAdmin } from '@/lib/admin/auth';
import dbConnect from '@/lib/db';
import SeasonTrailer from '@/models/SeasonTrailer';
import Content from '@/models/Content';
import Season from '@/models/Season';

export async function GET(request, { params }) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { id } = await params;
  await dbConnect();
  const trailer = await SeasonTrailer.findById(id)
    .populate('seriesId', 'title')
    .populate('seasonId', 'seasonNumber title')
    .lean();

  if (!trailer) {
    return Response.json({ success: false, message: 'Trailer not found' }, { status: 404 });
  }

  return Response.json({ success: true, trailer });
}

export async function PUT(request, { params }) {
  const { error } = await requireAdmin(request, 'trailers');
  if (error) return error;

  const { id } = await params;
  await dbConnect();
  const body = await request.json();
  const { videoUrl, videoKey, duration, fileSize, mimeType, isActive } = body;

  if (!videoUrl) {
    return Response.json({ success: false, message: 'Video URL is required' }, { status: 400 });
  }

  const trailer = await SeasonTrailer.findByIdAndUpdate(
    id,
    {
      $set: {
        videoUrl,
        videoKey: videoKey || null,
        duration: duration || 0,
        fileSize: fileSize || null,
        mimeType: mimeType || null,
        isActive: isActive !== false,
      },
    },
    { new: true, runValidators: true }
  );

  if (!trailer) {
    return Response.json({ success: false, message: 'Trailer not found' }, { status: 404 });
  }

  return Response.json({ success: true, trailer });
}

export async function DELETE(request, { params }) {
  const { error } = await requireAdmin(request, 'trailers');
  if (error) return error;

  const { id } = await params;
  await dbConnect();
  await SeasonTrailer.findByIdAndDelete(id);
  return Response.json({ success: true });
}
