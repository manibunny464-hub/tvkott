export function isLocalizationReady(row) {
  return Boolean(row?.title?.trim() && row.description?.trim() && row.posterUrl && row.bannerUrl);
}
