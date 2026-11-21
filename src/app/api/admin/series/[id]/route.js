import { requireAdmin, writeAuditLog } from '@/lib/admin/auth';
import { readBody, softDeletePatch } from '@/lib/admin/api';
import { buildContentPayload } from '@/lib/admin/content-payload';
import { syncContentFlags } from '@/lib/admin/content-flags';
import dbConnect from '@/lib/db';
import Content from '@/models/Content';
import Episode from '@/models/Episode';
import Season from '@/models/Season';
import Banner from '@/models/Banner';
import ComingSoon from '@/models/ComingSoon';
import TrendingItem from '@/models/TrendingItem';
import BlockbusterItem from '@/models/BlockbusterItem';

export async function GET(request, { params }) {
  const { error } = await requireAdmin(request, 'series.view');
  if (error) return error;

  const { id } = await params;
  await dbConnect();
  const series = await Content.findOne({ _id: id, type: 'series', isDeleted: { $ne: true } }).lean();
  if (!series) return Response.json({ success: false, message: 'Series not found' }, { status: 404 });

  const seasons = await Season.find({ seriesId: id, isDeleted: { $ne: true } }).sort({ seasonNumber: 1 }).lean();
  const episodes = await Episode.find({ seriesId: id, isDeleted: { $ne: true } }).sort({ season: 1, episodeNumber: 1 }).lean();

  return Response.json({ success: true, series, seasons, episodes });
}

export async function PUT(request, { params }) {
  const { admin, error } = await requireAdmin(request, 'series.edit');
  if (error) return error;

  const { id } = await params;
  const { data, formData } = await readBody(request);
  const payload = await buildContentPayload({ data, formData, type: 'series' });
  delete payload.videoSource;
  delete payload.videoUrl;

  await dbConnect();
  const oldSeries = await Content.findOne({ _id: id, type: 'series', isDeleted: { $ne: true } }).lean();
  if (!oldSeries) return Response.json({ success: false, message: 'Series not found' }, { status: 404 });

  // Validate unique slug if provided
  if (payload.slug) {
    const existingSlug = await Content.findOne({
      _id: { $ne: id },
      slug: payload.slug,
      type: 'series',
      isDeleted: { $ne: true },
    }).lean();
    if (existingSlug) {
      return Response.json({ success: false, message: 'Slug must be unique across all series' }, { status: 400 });
    }
  }

  const series = await Content.findOneAndUpdate(
    { _id: id, type: 'series', isDeleted: { $ne: true } },
    { $set: payload },
    { returnDocument: 'after', runValidators: true }
  );

  // Synchronize season cast if series cast was updated so removed artists don't linger in seasons
  if (payload.cast) {
    try {
      const seriesActorNames = new Set((payload.cast.actors || []).map(a => a.name).filter(Boolean));
      const seriesDirectorNames = new Set((payload.cast.directors || []).map(d => d.name).filter(Boolean));
      const seriesWriterNames = new Set((payload.cast.writers || []).map(w => w.name).filter(Boolean));

      const seasons = await Season.find({ seriesId: id, isDeleted: { $ne: true } });
      for (const season of seasons) {
        if (season.cast) {
          const newActors = (season.cast.actors || []).filter(a => seriesActorNames.has(a.name));
          const newDirectors = (season.cast.directors || []).filter(d => seriesDirectorNames.has(d.name));
          const newWriters = (season.cast.writers || []).filter(w => seriesWriterNames.has(w.name));

          if (
            newActors.length !== (season.cast.actors || []).length ||
            newDirectors.length !== (season.cast.directors || []).length ||
            newWriters.length !== (season.cast.writers || []).length
          ) {
            await Season.updateOne(
              { _id: season._id },
              { $set: { cast: { actors: newActors, directors: newDirectors, writers: newWriters } } }
            );
          }
        }
      }
    } catch (e) {
      console.error('Error synchronizing season cast with series cast:', e);
    }
  }

  await syncContentFlags(series, {
    isTrending: payload.isTrending,
    isBlockbuster: payload.isBlockbuster,
    isFeatured: payload.isFeatured,
    isComingSoon: payload.isComingSoon,
    expectedReleaseDate: payload.expectedReleaseDate,
  });

  // Write audit log
  await writeAuditLog({
    user: admin.email,
    role: admin.role,
    action: 'Updated Series',
    module: 'series',
    entityId: id,
    oldData: oldSeries,
    newData: series.toObject ? series.toObject() : series,
    request,
  });

  return Response.json({ success: true, series });
}

export async function DELETE(request, { params }) {
  const { admin, error } = await requireAdmin(request, 'series.delete');
  if (error) return error;

  const { id } = await params;
  await dbConnect();

  const oldSeries = await Content.findOne({ _id: id, type: 'series' }).lean();
  if (!oldSeries) return Response.json({ success: false, message: 'Series not found' }, { status: 404 });

  // Cascade soft delete / cleanup
  await Content.findOneAndUpdate({ _id: id, type: 'series' }, { $set: softDeletePatch() });
  await Season.updateMany({ seriesId: id }, { $set: softDeletePatch() });
  await Episode.updateMany({ seriesId: id }, { $set: softDeletePatch() });
  await Banner.updateMany({ linkedContentId: id }, { $set: softDeletePatch() });
  await ComingSoon.updateMany({ linkedContentId: id }, { $set: softDeletePatch() });
  await TrendingItem.deleteMany({ contentId: id });
  await BlockbusterItem.deleteMany({ contentId: id });

  // Write audit log
  await writeAuditLog({
    user: admin.email,
    role: admin.role,
    action: 'Deleted Series (Cascaded)',
    module: 'series',
    entityId: id,
    oldData: oldSeries,
    request,
  });

  return Response.json({ success: true });
}
