import mongoose from 'mongoose';
import Language from '@/models/Language';
import { isLocalizationReady } from '@/lib/localization-readiness';
import { applyLanguageDraft, applyPrimaryLanguage, prepareLocalizations, saveTitleLanguage, studioLanguageOptions } from '@/lib/admin/localizations';
import { requireAdmin, writeAuditLog } from '@/lib/admin/auth';
import { readBody, softDeletePatch } from '@/lib/admin/api';
import { buildContentPayload } from '@/lib/admin/content-payload';
import { syncContentFlags } from '@/lib/admin/content-flags';
import dbConnect from '@/lib/db';
import Content from '@/models/Content';
import Episode from '@/models/Episode';
import Season from '@/models/Season';
import SeasonTrailer from '@/models/SeasonTrailer';
import Banner from '@/models/Banner';
import ComingSoon from '@/models/ComingSoon';
import TrendingItem from '@/models/TrendingItem';
import BlockbusterItem from '@/models/BlockbusterItem';

export async function GET(request, { params }) {
  const { error } = await requireAdmin(request, 'series.view');
  if (error) return error;

  const { id } = await params;
  await dbConnect();
  const series = await Content.findOne({ _id: id, type: 'series', isDeleted: { $ne: true } }).select('+localizations +primaryLanguage +selectedLanguageCodes').lean();
  if (!series) return Response.json({ success: false, message: 'Series not found' }, { status: 404 });

  const seasons = await Season.find({ seriesId: id, isDeleted: { $ne: true } }).sort({ seasonNumber: 1 }).lean();
  const episodes = await Episode.find({ seriesId: id, isDeleted: { $ne: true } }).sort({ season: 1, episodeNumber: 1 }).lean();

  if (new URL(request.url).searchParams.get('preview') === '1') {
    const ids = [...new Set(seasons.flatMap((season) => season.seriesIds || []).map(String))];
    const [trailers, related] = await Promise.all([
      SeasonTrailer.find({ seriesId: id, seasonId: { $in: seasons.map((season) => season._id) }, isActive: { $ne: false } })
        .select('seasonId language videoUrl').lean(),
      Content.find({ _id: { $in: ids }, type: 'series', isDeleted: { $ne: true } })
        .select('title posterUrl +primaryLanguage +localizations').lean(),
    ]);
    return Response.json({ success: true, series, seasons, episodes, trailers, related, ...await studioLanguageOptions(series) });
  }
  return Response.json({ success: true, series, seasons, episodes, ...await studioLanguageOptions(series) });
}

async function setSeriesPublication(id, action, admin, request) {
  const fail = (message, status) => Response.json({ success: false, message }, { status });
  if (!mongoose.isObjectIdOrHexString(id)) return fail('Invalid series.', 400);
  await dbConnect();
  const filter = { _id: id, type: 'series', isDeleted: { $ne: true } };
  const series = await Content.findOne(filter).select('+localizations +primaryLanguage').lean();
  if (!series) return fail('Series not found.', 404);
  const publishing = action === 'publish';
  const update = { isActive: publishing, isComingSoon: false };
  if (publishing) {
    const primary = series.localizations?.find((row) => row.language === series.primaryLanguage);
    if (!isLocalizationReady(primary)) return fail('Save the primary language title, description, poster, and banner first.', 409);
    const readyCodes = series.localizations.filter(isLocalizationReady).map(({ language }) => language);
    const options = await Language.find({ code: { $in: readyCodes } }).select('code englishName').lean();
    const seasonIds = await Season.distinct('_id', { seriesId: id, isActive: { $ne: false }, isDeleted: { $ne: true } });
    const episodes = await Episode.find({
      seriesId: id, seasonId: { $in: seasonIds }, isActive: true, status: { $in: ['Published', null] }, isDeleted: { $ne: true },
      'languages.videoFiles.videoUrl': { $type: 'string', $ne: '' },
    }).select('languages.language languages.videoFiles.videoUrl').lean();
    const playableNames = new Set(episodes.flatMap((episode) =>
      episode.languages.filter((row) => row.videoFiles?.some((video) => video.videoUrl)).map((row) => row.language)));
    const languages = options.filter(({ code, englishName }) => playableNames.has(code) || playableNames.has(englishName));
    if (!languages.some(({ code }) => code === primary.language)) {
      return fail('Publish an episode with a saved video in the primary language first.', 409);
    }
    Object.assign(update, {
      title: primary.title, description: primary.description, posterUrl: primary.posterUrl,
      thumbnailUrl: primary.posterUrl, bannerUrl: primary.bannerUrl,
      language: languages.map(({ englishName }) => englishName),
      languages: languages.map(({ englishName }) => englishName),
    });
  }
  const result = await Content.findOneAndUpdate({ ...filter, updatedAt: series.updatedAt }, { $set: update }, { new: true });
  if (!result) return fail('Series details changed. Reload and retry.', 409);
  await syncContentFlags(result, { isComingSoon: false });
  await writeAuditLog({ user: admin.email, role: admin.role, action: publishing ? 'Published Series' : 'Moved Series to Draft',
    module: 'series', entityId: id, request });
  return Response.json({ success: true, isActive: result.isActive });
}

export async function PUT(request, { params }) {
  const { admin, error } = await requireAdmin(request, 'series.edit');
  if (error) return error;

  const { id } = await params;
  const { data, formData } = await readBody(request);
  if (data?.publicationAction === 'draft' || data?.publicationAction === 'publish') {
    return setSeriesPublication(id, data.publicationAction, admin, request);
  }
  if (data?.languageAction === 'save') {
    return saveTitleLanguage({ id, type: 'series', data, formData });
  }

  let existingLocalization;
  if (data.localizations !== undefined) {
    await dbConnect();
    existingLocalization = await Content.findOne({ _id: id, type: 'series', isDeleted: { $ne: true } }).select('+localizations isActive').lean();
    if (!existingLocalization) return Response.json({ success: false, message: 'Title not found.' }, { status: 404 });
  }
  const localized = await prepareLocalizations(data, formData, existingLocalization);
  if (localized.error) return Response.json({ success: false, message: localized.error }, { status: 400 });
  applyPrimaryLanguage(data, localized);
  const payload = await buildContentPayload({ data, formData, type: 'series' });
  if (data.detailsOnly === 'true') {
    for (const field of ['title', 'slug', 'description', 'language', 'languages']) delete payload[field];
  }
  applyLanguageDraft(payload, localized, existingLocalization);
  delete payload.isActive;
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
