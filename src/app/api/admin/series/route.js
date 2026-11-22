import { lookupRecommendationTitles } from '@/lib/more-like-this';
import { applyLanguageDraft, applyPrimaryLanguage, prepareLocalizations } from '@/lib/admin/localizations';
import { requireAdmin, writeAuditLog } from '@/lib/admin/auth';
import { paginationMeta, parsePagination, readBody } from '@/lib/admin/api';
import { buildContentFilters, buildContentPayload } from '@/lib/admin/content-payload';
import { syncContentFlags } from '@/lib/admin/content-flags';
import dbConnect from '@/lib/db';
import Content from '@/models/Content';
import Season from '@/models/Season';
import Episode from '@/models/Episode';

export async function GET(request) {
  const { error } = await requireAdmin(request, 'series.view');
  if (error) return error;

  const { searchParams, page, limit, skip } = parsePagination(request);
  const listAll = ['1', 'true', 'yes'].includes(String(searchParams.get('all') || '').toLowerCase());
  const query = buildContentFilters(searchParams, 'series');
  await dbConnect();
  if (searchParams.get('picker') === '1') {
    return Response.json({ success: true, series: await lookupRecommendationTitles(searchParams, 'series') });
  }

  try {
    const contentsToClean = await Content.find({
      $or: [
        { language: 'en' },
        { languages: 'en' }
      ]
    });
    for (const doc of contentsToClean) {
      let changed = false;
      if (doc.language && doc.language.includes('en')) {
        doc.language = doc.language.map(lang => lang === 'en' ? 'English' : lang);
        doc.language = [...new Set(doc.language)];
        changed = true;
      }
      if (doc.languages && doc.languages.includes('en')) {
        doc.languages = doc.languages.map(lang => lang === 'en' ? 'English' : lang);
        doc.languages = [...new Set(doc.languages)];
        changed = true;
      }
      if (changed) {
        doc.markModified('language');
        doc.markModified('languages');
        await doc.save();
      }
    }
  } catch (err) {
    console.error('Migration error:', err);
  }

  const [series, total] = await Promise.all([
    (listAll
      ? Content.find(query).sort({ title: 1, _id: 1 })
      : Content.find(query).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit)
    ).select("+primaryLanguage +localizations").lean(),
    Content.countDocuments(query),
  ]);
  const seriesIds = series.map((item) => item._id);
  const [seasonCounts, episodeCounts] = seriesIds.length
    ? await Promise.all([
        Season.aggregate([
          { $match: { seriesId: { $in: seriesIds }, isDeleted: { $ne: true } } },
          { $group: { _id: '$seriesId', count: { $sum: 1 } } },
        ]),
        Episode.aggregate([
          { $match: { seriesId: { $in: seriesIds }, isDeleted: { $ne: true } } },
          { $group: { _id: '$seriesId', count: { $sum: 1 } } },
        ]),
      ])
    : [[], []];
  const seasonCountMap = new Map(
    seasonCounts.map((item) => [String(item._id), item.count])
  );
  const episodeCountMap = new Map(
    episodeCounts.map((item) => [String(item._id), item.count])
  );
  const seriesWithCounts = series.map((item) => ({
    ...item,
    totalSeasons: seasonCountMap.get(String(item._id)) ?? 0,
    seasonCount: seasonCountMap.get(String(item._id)) ?? 0,
    totalEpisodes: episodeCountMap.get(String(item._id)) ?? 0,
    episodeCount: episodeCountMap.get(String(item._id)) ?? 0,
  }));

  return Response.json({
    success: true,
    series: seriesWithCounts,
    pagination: listAll ? paginationMeta(1, Math.max(total, 1), total) : paginationMeta(page, limit, total),
  });
}

export async function POST(request) {
  const { admin, error } = await requireAdmin(request, 'series.create');
  if (error) return error;

  try {
    const { data, formData } = await readBody(request);
    const localized = await prepareLocalizations(data, formData);
    if (localized.error) return Response.json({ success: false, message: localized.error }, { status: 400 });
    applyPrimaryLanguage(data, localized);
    const payload = await buildContentPayload({ data, formData, type: 'series' });
    applyLanguageDraft(payload, localized);
    if (localized.selectedLanguageCodes) payload.isComingSoon = false;
    delete payload.videoSource;
    delete payload.videoUrl;
    delete payload.rating;

    if (!payload.title) {
      return Response.json({ success: false, message: 'Series title is required' }, { status: 400 });
    }

    // Languages validation: At least one language required
    if (!payload.language || (Array.isArray(payload.language) && payload.language.length === 0)) {
      return Response.json({ success: false, message: 'At least one language is required' }, { status: 400 });
    }

    await dbConnect();

    // Unique slug validation
    if (payload.slug) {
      const existing = await Content.findOne({ slug: payload.slug, type: 'series', isDeleted: { $ne: true } });
      if (existing) {
        return Response.json({ success: false, message: 'Slug must be unique' }, { status: 400 });
      }
    }

    const series = await Content.create(payload);
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
      action: 'Created Series',
      module: 'series',
      entityId: series._id,
      newData: series.toObject ? series.toObject() : series,
      request,
    });

    return Response.json({ success: true, series });
  } catch (error) {
    console.error('[admin/series:POST] Error:', error);
    return Response.json(
      { success: false, message: error.message || 'Failed to save series' },
      { status: 500 }
    );
  }
}
