import Content from '@/models/Content';

export async function validateRecommendations(input, type, sourceId) {
  if (input === undefined) return {};
  const field = type === 'movie' ? 'movieIds' : 'seriesIds';
  let ids;
  try {
    ids = typeof input === 'string' ? JSON.parse(input) : input;
  } catch {
    ids = null;
  }
  if (!Array.isArray(ids) || ids.length > 50 ||
      ids.some((id) => typeof id !== 'string' || !/^[a-f0-9]{24}$/i.test(id))) {
    return { error: `${field} must contain up to 50 valid IDs.` };
  }
  ids = ids.map((id) => id.toLowerCase());
  if (new Set(ids).size !== ids.length || ids.includes(String(sourceId).toLowerCase())) {
    return { error: 'Remove duplicate recommendations and the current title.' };
  }
  if (ids.length && await Content.countDocuments({
    _id: { $in: ids }, type, isDeleted: { $ne: true },
  }) !== ids.length) {
    return { error: `Select existing ${type === 'movie' ? 'movies' : 'series'}.` };
  }
  return { ids };
}

export async function recommendationCards(lists, type, resolveUrl) {
  const ids = [...new Set(lists.flatMap((list) => (list ?? []).map(String)))];
  if (!ids.length) return new Map();
  const titles = await Content.find({
    _id: { $in: ids }, type, isActive: true, isDeleted: { $ne: true },
    isComingSoon: { $ne: true },
  }).select('title posterUrl').lean();
  const idField = type === 'movie' ? 'movieId' : 'seriesId';
  return new Map(titles.map((title) => {
    const id = String(title._id);
    return [id, { [idField]: id, title: title.title, posterUrl: resolveUrl(title.posterUrl) }];
  }));
}

export async function lookupRecommendationTitles(searchParams, type) {
  const ids = searchParams.get('ids');
  const search = searchParams.get('search')?.trim().slice(0, 120);
  const filter = { type, isDeleted: { $ne: true } };
  if (ids !== null) {
    const codes = [...new Set(ids.split(','))];
    if (codes.length > 50 || codes.some((id) => !/^[a-f0-9]{24}$/i.test(id))) return [];
    filter._id = { $in: codes };
  } else if (search) {
    const escaped = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const title = { $regex: escaped, $options: 'i' };
    filter.$or = [{ title }, { 'localizations.title': title }];
  } else {
    return [];
  }
  const rows = await Content.find(filter).select('title posterUrl +primaryLanguage +localizations')
    .sort({ title: 1, _id: 1 }).limit(ids !== null ? 50 : 20).lean();
  return rows.map((row) => {
    const primary = row.localizations?.find((item) => item.language === row.primaryLanguage);
    return { _id: row._id, title: primary?.title || row.title, posterUrl: primary?.posterUrl || row.posterUrl };
  });
}
