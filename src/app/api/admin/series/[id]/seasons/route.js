import mongoose from 'mongoose';
import { requireAdmin, writeAuditLog } from '@/lib/admin/auth';
import { softDeletePatch } from '@/lib/admin/api';
import dbConnect from '@/lib/db';
import Content from '@/models/Content';
import { validateRecommendations } from '@/lib/more-like-this';
import Season from '@/models/Season';
import Episode from '@/models/Episode';
import SeasonTrailer from '@/models/SeasonTrailer';

export async function GET(request, { params }) {
  const { error } = await requireAdmin(request, 'seasons.view');
  if (error) return error;

  const { id } = await params;
  await dbConnect();
  const seriesObjectId = new mongoose.Types.ObjectId(id);

  const [seasons, episodes] = await Promise.all([
    Season.find({ seriesId: id, isDeleted: { $ne: true } })
      .sort({ seasonNumber: 1 })
      .lean(),
    Episode.find(
      {
        isDeleted: { $ne: true },
        $or: [
          { seriesId: seriesObjectId },
          { contentId: seriesObjectId },
        ],
      },
      { _id: 1, seasonId: 1, season: 1 }
    ).lean(),
  ]);

  const countBySeasonId = new Map();
  const countBySeasonNumber = new Map();

  for (const episode of episodes) {
    if (episode.seasonId) {
      const key = episode.seasonId.toString();
      countBySeasonId.set(key, (countBySeasonId.get(key) || 0) + 1);
      continue;
    }

    const seasonNumber = Number(episode.season || 1);
    countBySeasonNumber.set(seasonNumber, (countBySeasonNumber.get(seasonNumber) || 0) + 1);
  }

  const seasonsWithCount = await Promise.all(seasons.map(async (season) => {
    const trailers = await SeasonTrailer.findOne({ seasonId: season._id, language: null }).lean();
    return {
      ...season,
      trailers: trailers && trailers.videoUrl ? [trailers] : [],
      episodeCount:
        countBySeasonId.get(String(season._id)) ||
        countBySeasonNumber.get(Number(season.seasonNumber)) ||
        0,
    };
  }));

  return Response.json({ success: true, seasons: seasonsWithCount });
}

export async function POST(request, { params }) {
  const { admin, error } = await requireAdmin(request, 'seasons.create');
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  await dbConnect();

  const series = await Content.findOne({ _id: id, type: 'series', isDeleted: { $ne: true } });
  if (!series) return Response.json({ success: false, message: 'Series not found' }, { status: 404 });

  const recommendations = await validateRecommendations(body.seriesIds, 'series', id);
  if (recommendations.error) {
    return Response.json({ success: false, message: recommendations.error }, { status: 400 });
  }

  // Season number validation: unique inside Series
  const existingSeason = await Season.findOne({
    seriesId: id,
    seasonNumber: Number(body.seasonNumber),
    isDeleted: { $ne: true },
  });
  if (existingSeason) {
    return Response.json({ success: false, message: `Season ${body.seasonNumber} already exists in this series.` }, { status: 400 });
  }

  const season = await Season.findOneAndUpdate(
    { seriesId: id, seasonNumber: Number(body.seasonNumber) },
    {
      $set: {
        title: body.title || `Season ${body.seasonNumber}`,
        description: body.description || '',
        poster: body.poster || '',
        isDeleted: false,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
        seriesIds: recommendations.ids ?? [],
        cast: body.cast || { actors: [], directors: [], writers: [] },
      },
    },
    { upsert: true, returnDocument: 'after', runValidators: true }
  );

  const totalSeasons = await Season.countDocuments({ seriesId: id, isDeleted: { $ne: true } });
  await Content.findByIdAndUpdate(id, { $set: { totalSeasons } });

  if (body.trailers && Array.isArray(body.trailers)) {
    await SeasonTrailer.findOneAndUpdate(
      { seasonId: season._id, seriesId: id, language: null },
      {
        $set: {
          languages: body.trailers,
          isActive: true,
        }
      },
      { upsert: true }
    );
  }

  // Write audit log
  await writeAuditLog({
    user: admin.email,
    role: admin.role,
    action: 'Created Season',
    module: 'seasons',
    entityId: season._id,
    newData: season.toObject ? season.toObject() : season,
    request,
  });

  return Response.json({ success: true, season });
}

export async function PUT(request, { params }) {
  const { admin, error } = await requireAdmin(request, 'seasons.edit');
  if (error) return error;

  const { id } = await params;
  const body = await request.json();

  await dbConnect();

  if (body.action === 'reorder') {
    if (!body.seasons || !Array.isArray(body.seasons)) {
      return Response.json({ success: false, message: 'seasons array is required for reordering' }, { status: 400 });
    }
    for (const item of body.seasons) {
      await Season.updateOne(
        { _id: item.seasonId, seriesId: id },
        { $set: { seasonNumber: Number(item.seasonNumber) } }
      );
    }
    const totalSeasons = await Season.countDocuments({ seriesId: id, isDeleted: { $ne: true } });
    await Content.findByIdAndUpdate(id, { $set: { totalSeasons } });

    // Write audit log for reordering
    await writeAuditLog({
      user: admin.email,
      role: admin.role,
      action: 'Reordered Seasons',
      module: 'seasons',
      entityId: id,
      newData: { seasons: body.seasons },
      request,
    });

    return Response.json({ success: true });
  }

  const { seasonId, seasonNumber, title, description, isActive, poster } = body;

  if (!seasonId) {
    return Response.json({ success: false, message: 'Season ID is required' }, { status: 400 });
  }

  const oldSeason = await Season.findOne({ _id: seasonId, seriesId: id }).lean();
  if (!oldSeason) {
    return Response.json({ success: false, message: 'Season not found' }, { status: 404 });
  }

  // Validate that the season number doesn't conflict with another season in the same series
  if (seasonNumber !== undefined) {
    const existing = await Season.findOne({
      seriesId: id,
      seasonNumber: Number(seasonNumber),
      _id: { $ne: seasonId },
      isDeleted: { $ne: true },
    });
    if (existing) {
      return Response.json({ success: false, message: `Season ${seasonNumber} already exists in this series.` }, { status: 400 });
    }
  }

  const recommendations = await validateRecommendations(body.seriesIds, 'series', id);
  if (recommendations.error) {
    return Response.json({ success: false, message: recommendations.error }, { status: 400 });
  }

  const updateFields = {};
  if (recommendations.ids) updateFields.seriesIds = recommendations.ids;
  if (seasonNumber !== undefined) updateFields.seasonNumber = Number(seasonNumber);
  if (title !== undefined) updateFields.title = title;
  if (description !== undefined) updateFields.description = description;
  if (poster !== undefined) updateFields.poster = poster;
  if (isActive !== undefined) updateFields.isActive = Boolean(isActive);
  if (body.cast !== undefined) updateFields.cast = body.cast;

  const season = await Season.findOneAndUpdate(
    { _id: seasonId, seriesId: id },
    { $set: updateFields },
    { returnDocument: 'after', runValidators: true }
  );

  // Update total seasons
  const totalSeasons = await Season.countDocuments({ seriesId: id, isDeleted: { $ne: true } });
  await Content.findByIdAndUpdate(id, { $set: { totalSeasons } });

  if (body.trailers && Array.isArray(body.trailers)) {
    await SeasonTrailer.findOneAndUpdate(
      { seasonId: seasonId, seriesId: id, language: null },
      {
        $set: {
          languages: body.trailers,
          isActive: true,
        }
      },
      { upsert: true }
    );
  }

  // Write audit log
  await writeAuditLog({
    user: admin.email,
    role: admin.role,
    action: 'Updated Season',
    module: 'seasons',
    entityId: seasonId,
    oldData: oldSeason,
    newData: season.toObject ? season.toObject() : season,
    request,
  });

  return Response.json({ success: true, season });
}

export async function DELETE(request, { params }) {
  const { admin, error } = await requireAdmin(request, 'seasons.delete');
  if (error) return error;

  const { id } = await params;
  const { seasonId } = await request.json();
  await dbConnect();

  // Cascade soft delete to Episodes
  await Episode.updateMany({ seasonId }, { $set: softDeletePatch() });

  const oldSeason = await Season.findOne({ _id: seasonId, seriesId: id }).lean();

  await Season.findOneAndUpdate({ _id: seasonId, seriesId: id }, { $set: softDeletePatch() });

  const totalSeasons = await Season.countDocuments({ seriesId: id, isDeleted: { $ne: true } });
  await Content.findByIdAndUpdate(id, { $set: { totalSeasons } });

  // Write audit log
  await writeAuditLog({
    user: admin.email,
    role: admin.role,
    action: 'Deleted Season',
    module: 'seasons',
    entityId: seasonId,
    oldData: oldSeason,
    request,
  });

  return Response.json({ success: true });
}
