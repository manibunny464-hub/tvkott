import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';
import Download from '@/models/Download';
import Episode from '@/models/Episode';
import Content from '@/models/Content';
import Season from '@/models/Season';
import User from '@/models/User';

// GET /api/user/downloads: Retrieve all downloads for the authenticated user
export async function GET(request) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const userId = auth.user.userId;

  try {
    await dbConnect();

    // Fetch user's downloads, sorting by newest first
    const downloads = await Download.find({ userId })
      .populate({
        path: 'episodeId',
        select: 'title description thumbnailUrl duration episodeNumber seriesId seasonId status isFree isDownloadable languages isActive isDeleted',
        populate: [
          {
            path: 'seriesId',
            select: 'title description thumbnailUrl posterUrl horizontalPoster verticalPoster',
          },
          {
            path: 'seasonId',
            select: 'seasonNumber title description poster',
          },
        ],
      })
      .sort({ downloadedAt: -1, createdAt: -1 })
      .lean();

    const formattedDownloads = [];
    const seriesMap = new Map();

    for (const d of downloads) {
      if (!d.episodeId || d.episodeId.isDeleted) continue;
      const ep = d.episodeId;
      const series = ep.seriesId || null;
      const season = ep.seasonId || null;

      // Find matching language variant if language was specified for the download
      let languageVariant = null;
      if (d.language && Array.isArray(ep.languages)) {
        languageVariant = ep.languages.find(
          l => l.language && l.language.toLowerCase() === d.language.toLowerCase()
        ) || null;
      }

      const flatItem = {
        id: d._id.toString(),
        downloadId: d._id.toString(),
        episodeId: ep._id.toString(),
        language: d.language || null,
        quality: d.quality || '720p',
        status: d.status || 'completed',
        downloadedAt: d.downloadedAt,
        isAvailableForDownload: Boolean(ep.isDownloadable && !ep.isDeleted && ep.isActive !== false),
        requiresRedownloadOnNewDevice: true,
        seasonNumber: season?.seasonNumber ?? (ep.seasonNumber ? 1 : 1),
        seasonTitle: season?.title || (season?.seasonNumber ? `Season ${season.seasonNumber}` : 'Season 1'),
        seasonId: season ? (season._id ? season._id.toString() : season.toString()) : null,
        episode: {
          id: ep._id.toString(),
          title: languageVariant?.title || ep.title,
          description: languageVariant?.description || ep.description || '',
          thumbnailUrl: languageVariant?.thumbnailUrl || ep.thumbnailUrl || '',
          duration: ep.duration || 0,
          episodeNumber: ep.episodeNumber,
          seasonId: season ? (season._id ? season._id.toString() : season.toString()) : null,
          seasonNumber: season?.seasonNumber ?? 1,
          isFree: Boolean(ep.isFree),
          isDownloadable: Boolean(ep.isDownloadable),
          selectedLanguage: d.language || null,
          selectedQuality: d.quality || null,
          languages: (ep.languages || []).map(lang => ({
            language: lang.language,
            title: lang.title,
            thumbnailUrl: lang.thumbnailUrl,
            subtitleFile: lang.subtitleFile,
            videoFilesCount: Array.isArray(lang.videoFiles) ? lang.videoFiles.length : 0,
          })),
          series: series ? {
            id: series._id ? series._id.toString() : series.toString(),
            title: series.title || '',
            thumbnailUrl: series.thumbnailUrl || series.posterUrl || '',
            posterUrl: series.posterUrl || series.verticalPoster || '',
          } : null,
        }
      };

      formattedDownloads.push(flatItem);

      // --- Grouped Hierarchy Construction: Series -> Season -> Episodes ---
      const seriesKey = series ? (series._id ? series._id.toString() : series.toString()) : 'standalone';
      const seriesTitle = series?.title || 'Standalone Series';
      const seriesPoster = series?.posterUrl || series?.verticalPoster || series?.thumbnailUrl || '';

      if (!seriesMap.has(seriesKey)) {
        seriesMap.set(seriesKey, {
          seriesId: seriesKey,
          title: seriesTitle,
          description: series?.description || '',
          thumbnailUrl: series?.thumbnailUrl || seriesPoster,
          posterUrl: seriesPoster,
          totalDownloadedEpisodes: 0,
          seasonsMap: new Map(),
        });
      }

      const seriesEntry = seriesMap.get(seriesKey);
      seriesEntry.totalDownloadedEpisodes += 1;

      const seasonKey = season ? (season._id ? season._id.toString() : season.toString()) : 'season_1';
      const sNumber = season?.seasonNumber ?? 1;
      const sTitle = season?.title || `Season ${sNumber}`;
      const sPoster = season?.poster || seriesPoster;

      if (!seriesEntry.seasonsMap.has(seasonKey)) {
        seriesEntry.seasonsMap.set(seasonKey, {
          seasonId: seasonKey,
          seasonNumber: sNumber,
          title: sTitle,
          poster: sPoster,
          downloadedEpisodesCount: 0,
          episodes: [],
        });
      }

      const seasonEntry = seriesEntry.seasonsMap.get(seasonKey);
      seasonEntry.downloadedEpisodesCount += 1;

      seasonEntry.episodes.push({
        downloadId: d._id.toString(),
        episodeId: ep._id.toString(),
        episodeNumber: ep.episodeNumber,
        title: languageVariant?.title || ep.title,
        description: languageVariant?.description || ep.description || '',
        thumbnailUrl: languageVariant?.thumbnailUrl || ep.thumbnailUrl || '',
        duration: ep.duration || 0,
        quality: d.quality || '720p',
        language: d.language || null,
        status: d.status || 'completed',
        downloadedAt: d.downloadedAt,
        isFree: Boolean(ep.isFree),
        isAvailableForDownload: Boolean(ep.isDownloadable && !ep.isDeleted && ep.isActive !== false),
        requiresRedownloadOnNewDevice: true,
      });
    }

    // Convert map to clean array with sorted seasons and episodes
    const groupedDownloads = Array.from(seriesMap.values()).map(series => {
      const seasons = Array.from(series.seasonsMap.values())
        .map(season => {
          season.episodes.sort((a, b) => (a.episodeNumber || 0) - (b.episodeNumber || 0));
          return season;
        })
        .sort((a, b) => (a.seasonNumber || 0) - (b.seasonNumber || 0));

      const { seasonsMap, ...restOfSeries } = series;
      return {
        ...restOfSeries,
        seasons,
      };
    });

    return Response.json({
      success: true,
      count: formattedDownloads.length,
      seriesCount: groupedDownloads.length,
      groupedDownloads,
      downloads: formattedDownloads,
    });
  } catch (error) {
    console.error('[user/downloads] GET error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/user/downloads: Save or update a download entry after video finishes downloading
export async function POST(request) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const userId = auth.user.userId;

  try {
    const body = await request.json();
    const { episodeId, language, quality } = body || {};

    if (!episodeId || !mongoose.Types.ObjectId.isValid(episodeId)) {
      return Response.json(
        { success: false, message: 'A valid episodeId is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verify episode exists and is active
    const episode = await Episode.findById(episodeId).lean();
    if (!episode || episode.isDeleted) {
      return Response.json(
        { success: false, message: 'Episode not found' },
        { status: 404 }
      );
    }

    // Verify downloads are not disabled for this episode
    if (episode.isDownloadable === false) {
      return Response.json(
        { success: false, message: 'Downloads are disabled for this episode' },
        { status: 403 }
      );
    }

    // Verify user has active subscription (offline download is a subscription feature)
    const user = await User.findById(userId, { isPremium: 1, premiumExpiry: 1 }).lean();
    const now = new Date();
    const isPremium = Boolean(user?.isPremium && (!user?.premiumExpiry || new Date(user.premiumExpiry) > now));
    if (!isPremium && !episode.isFree) {
      return Response.json(
        {
          success: false,
          message: 'Active subscription required to download premium episodes',
          requiresUpgrade: true,
        },
        { status: 403 }
      );
    }

    const normalizedLanguage = language ? String(language).trim() : null;
    const normalizedQuality = quality ? String(quality).trim() : '720p';

    // Prevent duplicate entries for the same episode/language/quality (upsert)
    const query = {
      userId,
      episodeId,
      language: normalizedLanguage,
      quality: normalizedQuality,
    };

    const update = {
      $set: {
        downloadedAt: new Date(),
        status: 'completed',
      },
      $setOnInsert: {
        userId,
        episodeId,
        language: normalizedLanguage,
        quality: normalizedQuality,
      }
    };

    let downloadRecord;
    try {
      downloadRecord = await Download.findOneAndUpdate(
        query,
        update,
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
    } catch (err) {
      // In case a legacy index is still present on older MongoDB instances
      if (err.code === 11000) {
        try {
          await Download.collection.dropIndex('userId_1_episodeId_1');
          downloadRecord = await Download.findOneAndUpdate(
            query,
            update,
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
          );
        } catch {
          downloadRecord = await Download.findOneAndUpdate(
            { userId, episodeId },
            {
              $set: {
                language: normalizedLanguage,
                quality: normalizedQuality,
                downloadedAt: new Date(),
                status: 'completed',
              }
            },
            { returnDocument: 'after' }
          );
        }
      } else {
        throw err;
      }
    }

    return Response.json({
      success: true,
      message: 'Download entry saved successfully',
      download: {
        id: downloadRecord._id.toString(),
        episodeId: downloadRecord.episodeId.toString(),
        language: downloadRecord.language,
        quality: downloadRecord.quality,
        status: downloadRecord.status,
        downloadedAt: downloadRecord.downloadedAt,
      }
    });
  } catch (error) {
    console.error('[user/downloads] POST error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/user/downloads: Remove a download record (via JSON body or query param)
export async function DELETE(request) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const userId = auth.user.userId;

  try {
    let episodeId = null;
    let language = null;
    let quality = null;

    try {
      const body = await request.json();
      episodeId = body?.episodeId;
      language = body?.language;
      quality = body?.quality;
    } catch {
      // Body is optional if params are in search query
    }

    if (!episodeId) {
      const url = new URL(request.url);
      episodeId = url.searchParams.get('episodeId');
      language = language || url.searchParams.get('language');
      quality = quality || url.searchParams.get('quality');
    }

    if (!episodeId || !mongoose.Types.ObjectId.isValid(episodeId)) {
      return Response.json(
        { success: false, message: 'A valid episodeId is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const filter = { userId, episodeId };
    if (language) filter.language = String(language).trim();
    if (quality) filter.quality = String(quality).trim();

    const deleteResult = await Download.deleteMany(filter);

    if (deleteResult.deletedCount === 0) {
      return Response.json(
        { success: false, message: 'Download record not found' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: 'Download record removed successfully',
      deletedCount: deleteResult.deletedCount,
    });
  } catch (error) {
    console.error('[user/downloads] DELETE error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
