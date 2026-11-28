import { getMasterSettings } from '@/lib/admin/data';
import mongoose from 'mongoose';
import { getMovieMedia, getMovieSubtitles, handleMovieMedia } from '@/lib/admin/movie-media';
import { applyLanguageDraft, applyPrimaryLanguage, prepareLocalizations, saveTitleLanguage } from '@/lib/admin/localizations';
import { uploadFormFile, verifiedTrailerUrl } from '@/lib/admin/media';
import { requireAdmin, writeAuditLog } from '@/lib/admin/auth';
import { readBody, softDeletePatch } from '@/lib/admin/api';
import { buildContentPayload } from '@/lib/admin/content-payload';
import { syncContentFlags } from '@/lib/admin/content-flags';
import dbConnect from '@/lib/db';
import Content from '@/models/Content';
import { validateRecommendations } from '@/lib/more-like-this';
import Banner from '@/models/Banner';
import ComingSoon from '@/models/ComingSoon';
import TrendingItem from '@/models/TrendingItem';
import BlockbusterItem from '@/models/BlockbusterItem';

export async function GET(request, { params }) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { id } = await params;
  await dbConnect();
  const movie = await Content.findOne({ _id: id, type: 'movie', isDeleted: { $ne: true } }).select('+localizations +primaryLanguage +selectedLanguageCodes +publishedMovie +inactiveMovieLanguages +movieHiddenByLanguage').lean();
  if (!movie) return Response.json({ success: false, message: 'Movie not found' }, { status: 404 });
  const [media, subtitles] = await Promise.all([getMovieMedia(id), getMovieSubtitles(id)]);
  const { publishedMovie, ...details } = movie;
  const payload = { success: true, movie: { ...details, publishedLanguages: (publishedMovie || []).map((row) => row.language) }, media, subtitles };
  if (new URL(request.url).searchParams.get('preview') === '1') {
    payload.related = await Content.find({ _id: { $in: movie.movieIds || [] }, type: 'movie', isDeleted: { $ne: true } })
      .select('title posterUrl +primaryLanguage +localizations').lean();
  }
  return Response.json(payload);
}

async function saveMovieTrailer(id, data, formData, admin, request) {
  const fail = (message, status) => Response.json({ success: false, message }, { status });
  const { language, trailerAction } = data;
  if (!mongoose.isObjectIdOrHexString(id) || typeof language !== 'string' || !language ||
      !['save', 'remove'].includes(trailerAction)) {
    return fail('Choose a movie, language, and trailer action.', 400);
  }
  const file = formData?.get('trailerFile');
  const removing = trailerAction === 'remove';
  const { videoKey } = data;
  if (!removing && videoKey === undefined && (!file || typeof file === 'string' || !file.size || !['video/mp4', 'video/webm'].includes(file.type))) {
    return fail('Choose an MP4 or WebM trailer.', 400);
  }

  await dbConnect();
  const filter = { _id: id, type: 'movie', isDeleted: { $ne: true }, 'localizations.language': language };
  if (!await Content.exists(filter)) return fail('Save this language in Movie Details first.', 404);

  let trailerUrl = '';
  if (!removing) {
    try {
      if (videoKey !== undefined) {
        trailerUrl = await verifiedTrailerUrl(videoKey, (await getMasterSettings()).storage);
        if (!trailerUrl) return fail('Choose an uploaded MP4 or WebM trailer.', 400);
      } else {
        ({ url: trailerUrl } = await uploadFormFile(file, 'trailers'));
      }
    } catch {
      return fail('Trailer could not be verified in S3. Check bucket access and try again.', 502);
    }
  }

  const result = await Content.updateOne(filter, { $set: { 'localizations.$.trailerUrl': trailerUrl } });
  if (!result.matchedCount) return fail('The movie language changed. Reload and retry.', 409);
  await writeAuditLog({ user: admin.email, role: admin.role, action: removing ? 'Removed Movie Trailer' : 'Saved Movie Trailer',
    module: 'trailers', entityId: id, newData: { language }, request });
  return Response.json({ success: true, trailerUrl });
}

export async function PUT(request, { params }) {
  const authenticated = await requireAdmin(request);
  if (authenticated.error) return authenticated.error;

  const { id } = await params;
  const { data, formData } = await readBody(request);
  const { admin, error } = await requireAdmin(request, data?.trailerAction !== undefined ? 'trailers' : ['super_admin', 'editor']);
  if (error) return error;
  if (data?.trailerAction !== undefined) return saveMovieTrailer(id, data, formData, admin, request);
  if (data?.languageAction === 'save') {
    return saveTitleLanguage({ id, type: 'movie', data, formData });
  }

  await dbConnect();
  if (data?.mediaAction !== undefined) {
    try {
      const result = await handleMovieMedia(id, admin, data);
      if (result.ok && ['publish', 'draft', 'language-availability'].includes(data.mediaAction)) {
        await writeAuditLog({ user: admin.email, role: admin.role,
          action: ({ publish: 'Published Movie Language', draft: 'Moved Movie to Draft',
            'language-availability': 'Changed Movie Language Availability' })[data.mediaAction],
          module: 'movies', entityId: id, newData: { language: data.language, active: data.active }, request });
      }
      return result;
    } catch (error) {
      console.error("Movie media operation failed:", error.name);
      return Response.json({ success: false, message: "Movie media request could not be completed. Try again." }, { status: 502 });
    }
  }
  const recommendations = await validateRecommendations(data.movieIds, 'movie', id);
  if (recommendations.error) {
    return Response.json({ success: false, message: recommendations.error }, { status: 400 });
  }
  const videoFile = formData?.get('videoFile');
  if (videoFile?.size > 0 && (!Number.isSafeInteger(Number(data.duration)) || Number(data.duration) <= 0)) {
    return Response.json({ success: false, message: 'Choose a video with a detectable duration.' }, { status: 400 });
  }
  const trailerFile = formData?.get('trailerFile');
  if (trailerFile && !['video/mp4', 'video/webm'].includes(trailerFile.type)) {
    return Response.json({ success: false, message: 'Choose an MP4 or WebM trailer.' }, { status: 400 });
  }
  if (trailerFile) {
    const { url } = await uploadFormFile(trailerFile, 'trailers');
    data.trailerUrl = url;
  }
  let existingLocalization;
  if (data.localizations !== undefined) {
    await dbConnect();
    existingLocalization = await Content.findOne({ _id: id, type: 'movie', isDeleted: { $ne: true } }).select('+localizations isActive').lean();
    if (!existingLocalization) return Response.json({ success: false, message: 'Title not found.' }, { status: 404 });
  }
  const localized = await prepareLocalizations(data, formData, existingLocalization);
  if (localized.error) return Response.json({ success: false, message: localized.error }, { status: 400 });
  applyPrimaryLanguage(data, localized);
  const payload = await buildContentPayload({ data, formData, type: 'movie' });
  if (data.detailsOnly === 'true') {
    for (const field of ['title', 'slug', 'description', 'language', 'languages']) delete payload[field];
  }
  applyLanguageDraft(payload, localized, existingLocalization);
  delete payload.isActive;
  if (recommendations.ids) payload.movieIds = recommendations.ids;
  for (const field of ['ageRating', 'trailerUrl', 'cast', 'director', 'musicDirector', 'producer', 'freeEpisodeCount']) {
    if (data[field] === undefined) delete payload[field];
  }
  if (data.videoUrl === undefined && !payload.videoSource) {
    delete payload.duration;
    delete payload.videoUrl;
    delete payload.transcodingStatus;
    delete payload.renditions;
  }
  delete payload.isComingSoon;
  delete payload.expectedReleaseDate;
  const movie = await Content.findOneAndUpdate(
    { _id: id, type: 'movie', isDeleted: { $ne: true } },
    { $set: payload },
    { returnDocument: 'after', runValidators: true }
  );
  if (!movie) return Response.json({ success: false, message: 'Movie not found' }, { status: 404 });

  await syncContentFlags(movie, {
    isTrending: payload.isTrending,
    isBlockbuster: payload.isBlockbuster,
    isFeatured: payload.isFeatured,
  });

  await writeAuditLog({ user: admin.email, role: admin.role, action: 'Updated Movie', module: 'movies', entityId: movie._id, request });
  return Response.json({ success: true, movie });
}

export async function DELETE(request, { params }) {
  const { error } = await requireAdmin(request, ['super_admin']);
  if (error) return error;

  const { id } = await params;
  await dbConnect();
  await Content.findOneAndUpdate({ _id: id, type: 'movie' }, { $set: softDeletePatch() });
  await Banner.updateMany({ linkedContentId: id }, { $set: softDeletePatch() });
  await ComingSoon.updateMany({ linkedContentId: id }, { $set: softDeletePatch() });
  await TrendingItem.deleteMany({ contentId: id });
  await BlockbusterItem.deleteMany({ contentId: id });

  return Response.json({ success: true });
}
