import { verifiedTrailerUrl } from '@/lib/admin/media';
import mongoose from 'mongoose';
import { isLocalizationReady } from '@/lib/localization-readiness';
import { getMasterSettings } from '@/lib/admin/data';
import { requireAdmin } from '@/lib/admin/auth';
import { paginationMeta, parsePagination } from '@/lib/admin/api';
import dbConnect from '@/lib/db';
import SeasonTrailer from '@/models/SeasonTrailer';
import Content from '@/models/Content';
import Season from '@/models/Season';

export async function GET(request) {
  const { error } = await requireAdmin(request, 'trailers');
  if (error) return error;

  const { searchParams, page, limit, skip } = parsePagination(request);
  await dbConnect();

  const query = { isActive: { $ne: false } };

  const seasonId = searchParams.get('seasonId');
  const seriesId = searchParams.get('seriesId');
  const language = searchParams.get('language');
  if (language !== null) query.language = language || null;
  if (seasonId) {
    if (!mongoose.isObjectIdOrHexString(seasonId)) return failure('Choose a valid season.', 400);
    query.seasonId = seasonId;
  }
  if (seriesId) {
    if (!mongoose.isObjectIdOrHexString(seriesId)) return failure('Choose a valid series.', 400);
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

function failure(message, status) {
  return Response.json({ success: false, message }, { status });
}

export async function POST(request) {
  const { error } = await requireAdmin(request, 'trailers');
  if (error) return error;

  const body = await request.json().catch(() => null);
  if (!body) return failure('Invalid trailer details.', 400);
  const { seriesId, seasonId, language, videoKey, duration, fileSize, mimeType } = body;
  if (!mongoose.isObjectIdOrHexString(seriesId) || !mongoose.isObjectIdOrHexString(seasonId) || typeof language !== 'string' || !language) {
    return failure('Choose a series, season, and language.', 400);
  }
  if (typeof videoKey !== 'string' || !/^trailers\/[a-zA-Z0-9._-]+$/.test(videoKey) ||
      !['video/mp4', 'video/webm'].includes(mimeType) ||
      !Number.isFinite(duration) || duration <= 0 || !Number.isSafeInteger(fileSize) || fileSize <= 0) {
    return failure('Upload a playable MP4 or WebM trailer.', 400);
  }

  await dbConnect();
  const [season, series] = await Promise.all([
    Season.exists({ _id: seasonId, seriesId, isDeleted: { $ne: true } }),
    Content.findOne({ _id: seriesId, type: 'series', isDeleted: { $ne: true } }).select('+localizations').lean(),
  ]);
  if (!season || !series) return failure('Series or season not found.', 404);
  if (!isLocalizationReady(series.localizations?.find((row) => row.language === language))) {
    return failure('Save the language title, description, poster, and banner in Series Details before uploading.', 409);
  }

  let videoUrl;
  try {
    videoUrl = await verifiedTrailerUrl(videoKey, (await getMasterSettings()).storage);
  } catch {
    return failure('Trailer could not be verified in S3. Check bucket access and try again.', 502);
  }
  if (!videoUrl) return failure('Choose an uploaded MP4 or WebM trailer.', 400);
  try {
    const trailer = await SeasonTrailer.findOneAndUpdate(
      { seasonId, language },
      { $set: { seriesId, videoUrl, videoKey, duration, fileSize, mimeType, isActive: true } },
      { new: true, upsert: true, runValidators: true }
    );
    return Response.json({ success: true, trailer });
  } catch (error) {
    if (error.code === 11000) return failure('The trailer could not be saved. Reload and retry. Check the season trailer indexes if this persists.', 409);
    throw error;
  }
}
