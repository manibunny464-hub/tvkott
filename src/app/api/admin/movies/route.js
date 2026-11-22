import { applyLanguageDraft, applyPrimaryLanguage, prepareLocalizations } from '@/lib/admin/localizations';
import { uploadFormFile } from '@/lib/admin/media';
import { requireAdmin, writeAuditLog } from '@/lib/admin/auth';
import { paginationMeta, parsePagination, readBody } from '@/lib/admin/api';
import { buildContentFilters, buildContentPayload } from '@/lib/admin/content-payload';
import { syncContentFlags } from '@/lib/admin/content-flags';
import dbConnect from '@/lib/db';
import Content from '@/models/Content';
import { lookupRecommendationTitles, validateRecommendations } from '@/lib/more-like-this';

export async function GET(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { searchParams, page, limit, skip } = parsePagination(request);
  const query = buildContentFilters(searchParams, 'movie');
  const status = searchParams.get('status');
  if (status === 'coming-soon') query.isComingSoon = true;
  if (status === 'draft') Object.assign(query, { isActive: false, isComingSoon: { $ne: true } });
  if (status === 'published') Object.assign(query, { isActive: { $ne: false }, isComingSoon: { $ne: true } });
  if (searchParams.get('hasTrailer') === 'true') query.$and = [...(query.$and || []), { $or: [
    { trailerUrl: { $type: 'string', $ne: '' } }, { localizations: { $elemMatch: { trailerUrl: { $type: 'string', $ne: '' } } } },
  ] }];
  await dbConnect();
  if (searchParams.get('picker') === '1') {
    return Response.json({ success: true, movies: await lookupRecommendationTitles(searchParams, 'movie') });
  }

  const sort = searchParams.get('sort') === 'title' ? { title: 1, _id: 1 } : { updatedAt: -1, _id: -1 };
  const [movies, total, [counts]] = await Promise.all([
    Content.find(query).select("+primaryLanguage +localizations").sort(sort).skip(skip).limit(limit).lean(),
    Content.countDocuments(query),
    Content.aggregate([
      { $match: { type: 'movie', isDeleted: { $ne: true } } },
      { $group: {
        _id: null,
        total: { $sum: 1 },
        comingSoon: { $sum: { $cond: [{ $eq: ['$isComingSoon', true] }, 1, 0] } },
        draft: { $sum: { $cond: [{ $and: [{ $ne: ['$isComingSoon', true] }, { $eq: ['$isActive', false] }] }, 1, 0] } },
      } },
    ]),
  ]);
  const summary = counts
    ? { total: counts.total, draft: counts.draft, comingSoon: counts.comingSoon, published: counts.total - counts.draft - counts.comingSoon }
    : { total: 0, draft: 0, comingSoon: 0, published: 0 };
  return Response.json({ success: true, movies, counts: summary, pagination: paginationMeta(page, limit, total) });
}

export async function POST(request) {
  const { admin, error } = await requireAdmin(request, ['super_admin', 'editor']);
  if (error) return error;

  const { data, formData } = await readBody(request);
  await dbConnect();

  const recommendations = await validateRecommendations(data.movieIds, 'movie', undefined);
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
  const localized = await prepareLocalizations(data, formData);
  if (localized.error) return Response.json({ success: false, message: localized.error }, { status: 400 });
  applyPrimaryLanguage(data, localized);
  const payload = await buildContentPayload({ data, formData, type: 'movie' });
  applyLanguageDraft(payload, localized);
  if (recommendations.ids) payload.movieIds = recommendations.ids;
  if (!payload.title) {
    return Response.json({ success: false, message: 'Title is required' }, { status: 400 });
  }

  const movie = await Content.create(payload);
  await syncContentFlags(movie, {
    isTrending: payload.isTrending,
    isBlockbuster: payload.isBlockbuster,
    isFeatured: payload.isFeatured,
  });

  await writeAuditLog({ user: admin.email, role: admin.role, action: 'Created Movie', module: 'movies', entityId: movie._id, request });
  return Response.json({ success: true, movie });
}
