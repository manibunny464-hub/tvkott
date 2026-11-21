import dbConnect from '@/lib/db';
import Banner from '@/models/Banner';
import Content from '@/models/Content';
import Season from '@/models/Season';
import Episode from '@/models/Episode';
import { selectVisibleBanners } from './bannerVisibility.mjs';

// Shared by /api/home, /api/home/banner and /api/banners.
export async function getVisibleBanners(preferredLanguages = []) {
  if (!preferredLanguages.some(language => typeof language === 'string' && language.trim())) return [];
  await dbConnect();
  // Apply the display limit only AFTER eligibility checks.
  const banners = await Banner.find({
    isActive: true, isDeleted: { $ne: true }, linkedContentId: { $ne: null },
  }).lean();
  if (!banners.length) return [];
  const contents = await Content.find({
    _id: { $in: banners.map(banner => banner.linkedContentId).filter(Boolean) },
    isActive: true, isDeleted: { $ne: true },
  }, {
    type: 1, language: 1, languages: 1, isActive: 1, isDeleted: 1,
    isComingSoon: 1, expectedReleaseDate: 1, scheduledPublishAt: 1,
  }).lean();
  const seriesIds = contents.filter(content => content.type === 'series').map(content => content._id);
  let seasons = [];
  let episodes = [];
  if (seriesIds.length) {
    seasons = await Season.find({
      seriesId: { $in: seriesIds }, isActive: true, isDeleted: { $ne: true },
    }, { seriesId: 1, isActive: 1, isDeleted: 1 }).lean();
    if (seasons.length) {
      episodes = await Episode.find({
        seriesId: { $in: seriesIds }, seasonId: { $in: seasons.map(season => season._id) },
        isActive: true, isDeleted: { $ne: true }, status: 'Published',
      }, {
        seriesId: 1, seasonId: 1, isActive: 1, isDeleted: 1, status: 1,
        'languages.language': 1, releaseDate: 1, airDate: 1,
      }).lean();
    }
  }
  return selectVisibleBanners({ banners, contents, seasons, episodes }, preferredLanguages);
}
