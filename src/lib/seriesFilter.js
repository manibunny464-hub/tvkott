import dbConnect from '@/lib/db';
import Season from '@/models/Season';
import Episode from '@/models/Episode';

/**
 * Returns an array of string ObjectIds for series that have AT LEAST 1 active season AND AT LEAST 1 published episode.
 * Series without any seasons or published episodes are excluded from user-facing app listings.
 *
 * @param {string[]} [preferredLangs] Optional array of preferred languages to filter by
 * @returns {Promise<string[]>} Array of valid series content IDs
 */
export async function getValidSeriesIds(preferredLangs = []) {
  await dbConnect();

  // 1. Find series IDs that have at least 1 non-deleted season
  const seasonSeriesIds = await Season.distinct('seriesId', {
    isDeleted: { $ne: true },
  });

  if (!seasonSeriesIds || seasonSeriesIds.length === 0) return [];

  const episodeQuery = {
    seriesId: { $in: seasonSeriesIds },
    isDeleted: { $ne: true },
    isActive: { $ne: false },
    status: { $ne: 'Draft' },
  };

  if (Array.isArray(preferredLangs) && preferredLangs.length > 0) {
    episodeQuery.$or = [
      { 'languages.language': { $in: preferredLangs } },
      { language: { $in: preferredLangs } },
    ];
  }

  // Find series IDs that have at least 1 non-deleted, active, published episode
  let validSeriesObjectIds = await Episode.distinct('seriesId', episodeQuery);

  // If specific language was requested but episode records don't have language specified,
  // verify whether the parent Content has the requested language and has published episodes
  if (Array.isArray(preferredLangs) && preferredLangs.length > 0 && validSeriesObjectIds.length === 0) {
    const Content = (await import('@/models/Content')).default;
    const seriesWithLang = await Content.distinct('_id', {
      _id: { $in: seasonSeriesIds },
      $or: [
        { language: { $in: preferredLangs } },
        { languages: { $in: preferredLangs } },
      ],
      isActive: true,
      isDeleted: { $ne: true },
    });
    if (seriesWithLang.length > 0) {
      validSeriesObjectIds = await Episode.distinct('seriesId', {
        seriesId: { $in: seriesWithLang },
        isDeleted: { $ne: true },
        isActive: { $ne: false },
        status: { $ne: 'Draft' },
      });
    }
  }

  return validSeriesObjectIds.map((id) => id.toString());
}
