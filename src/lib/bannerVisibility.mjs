const id = (value) => value == null ? '' : String(value);
const normalize = (value) => typeof value === 'string' ? value.trim().toLowerCase() : '';
const list = (value) => Array.isArray(value) ? value : value ? [value] : [];
const active = (item) => item.isActive === true && item.isDeleted !== true;
const due = (value, now) => !value || new Date(value).getTime() <= now.getTime();

// Missing preferences, languages, or linked content never mean "all languages".
export function selectVisibleBanners({ banners, contents, seasons, episodes }, preferredLanguages, now = new Date()) {
  const preferred = new Set(list(preferredLanguages).map(normalize).filter(Boolean));
  if (!preferred.size) return [];
  const matches = (values) => list(values).some(value => preferred.has(normalize(value)));
  const availableSeasons = new Map(seasons.filter(active).map(season => [id(season._id), season]));
  const playableSeries = new Set(episodes.filter(episode => {
    const season = availableSeasons.get(id(episode.seasonId));
    return active(episode) && episode.status === 'Published' &&
      due(episode.releaseDate, now) && due(episode.airDate, now) &&
      season && id(season.seriesId) === id(episode.seriesId) &&
      matches(list(episode.languages).map(variant => variant?.language));
  }).map(episode => id(episode.seriesId)));
  const allowed = new Map(contents.filter(content => {
    const languages = list(content.language).length ? content.language : content.languages;
    return active(content) && matches(languages) &&
      due(content.scheduledPublishAt, now) &&
      (content.isComingSoon !== true ||
        (content.expectedReleaseDate && due(content.expectedReleaseDate, now))) &&
      ['movie', 'short', 'series'].includes(content.type) &&
      (content.type !== 'series' || playableSeries.has(id(content._id)));
  }).map(content => [id(content._id), content]));
  return banners.filter(banner => active(banner) &&
    typeof banner.imageUrl === 'string' && banner.imageUrl.trim() &&
    allowed.has(id(banner.linkedContentId)))
    .sort((a, b) => (b.order || 0) - (a.order || 0) ||
      new Date(b.createdAt || 0) - new Date(a.createdAt || 0) || id(a._id).localeCompare(id(b._id)))
    .slice(0, 10)
    .map(banner => {
      const contentId = id(banner.linkedContentId);
      const type = allowed.get(contentId).type;
      return {
        _id: contentId, contentId, title: banner.title, subtitle: banner.subtitle,
        imageUrl: banner.imageUrl, linkedContentId: banner.linkedContentId,
        linkedContentType: type, type, order: banner.order,
      };
    });
}
