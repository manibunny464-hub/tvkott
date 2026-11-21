import { requireAdmin } from '@/lib/admin/auth';
import { paginationMeta, parsePagination } from '@/lib/admin/api';
import dbConnect from '@/lib/db';
import SeasonTrailer from '@/models/SeasonTrailer';
import Content from '@/models/Content';
import Season from '@/models/Season';

export async function GET(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { searchParams, page, limit, skip } = parsePagination(request);
  await dbConnect();

  const query = { isActive: { $ne: false } };

  const seasonId = searchParams.get('seasonId');
  const seriesId = searchParams.get('seriesId');
  if (seasonId) {
    query.seasonId = seasonId;
  }
  if (seriesId) {
    query.seriesId = seriesId;
  }

  const [trailers, total] = await Promise.all([
    SeasonTrailer.find(query)
      .populate({ path: 'seriesId', select: 'title' })
      .populate({ path: 'seasonId', select: 'seasonNumber title' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    SeasonTrailer.countDocuments(query),
  ]);

  return Response.json({ success: true, trailers, pagination: paginationMeta(page, limit, total) });
}

export async function POST(request) {
  const { error } = await requireAdmin(request, 'trailers');
  if (error) return error;

  await dbConnect();
  const body = await request.json();
  const { seriesId, seasonId, videoUrl, videoKey, duration, fileSize, mimeType, isActive } = body;

  if (!seriesId || !seasonId) {
    return Response.json({ success: false, message: 'Series and Season are required' }, { status: 400 });
  }
  if (!videoUrl) {
    return Response.json({ success: false, message: 'Video URL is required' }, { status: 400 });
  }

  // Upsert — 1 trailer per season
  const trailer = await SeasonTrailer.findOneAndUpdate(
    { seasonId },
    {
      seriesId,
      seasonId,
      videoUrl,
      videoKey: videoKey || null,
      duration: duration || 0,
      fileSize: fileSize || null,
      mimeType: mimeType || null,
      isActive: isActive !== false,
    },
    { new: true, upsert: true, runValidators: true }
  );

  return Response.json({ success: true, trailer });
}
