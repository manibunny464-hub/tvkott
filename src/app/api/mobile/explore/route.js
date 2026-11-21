import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Content from '@/models/Content';
import Season from '@/models/Season';
import Episode from '@/models/Episode';
import { getValidSeriesIds } from '@/lib/seriesFilter';
import { getUserPreferredLanguages } from '@/lib/userLanguages';

function resolveUrl(raw) {
  if (!raw) return null;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const base = (process.env.CDN_URL || process.env.CLOUDFRONT_URL || '').replace(/\/$/, '');
  if (base) return `${base}/${raw}`;
  const bucket = process.env.S3_BUCKET_NAME || 'chirpii-dev';
  const region = process.env.AWS_REGION || 'ap-south-1';
  return `https://${bucket}.s3.${region}.amazonaws.com/${raw}`;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitVal = searchParams.get('limit');
    const pageVal = searchParams.get('page') || '1';

    const preferredLangs = await getUserPreferredLanguages(request);

    await dbConnect();
    const validSeriesIds = await getValidSeriesIds();

    if (validSeriesIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        series: [],
        items: [],
        pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
      });
    }

    // 1. Filter for active, non-deleted series content
    const query = {
      _id: { $in: validSeriesIds },
      type: 'series',
      isActive: true,
      isDeleted: { $ne: true },
      $or: [
        { isComingSoon: { $ne: true } },
        { expectedReleaseDate: { $lte: new Date() } }
      ]
    };

    if (preferredLangs.length > 0) {
      query.language = { $in: preferredLangs };
    }

    // Determine pagination options
    let limitNum = 20;
    if (limitVal) {
      limitNum = parseInt(limitVal, 10);
      if (isNaN(limitNum) || limitNum <= 0) {
        limitNum = 20;
      }
    }

    const pageNum = parseInt(pageVal, 10);
    const skipNum = (isNaN(pageNum) || pageNum <= 0) ? 0 : (pageNum - 1) * limitNum;

    // 2. Fetch series
    const seriesList = await Content.find(query)
      .sort({ updatedAt: -1 })
      .skip(skipNum)
      .limit(limitNum)
      .lean();

    const totalSeries = await Content.countDocuments(query);

    // 3. Populate hierarchical season and episode details for each series and resolve URLs
    const completeSeriesData = await Promise.all(
      seriesList.map(async (series) => {
        // Fetch seasons for this series
        const seasons = await Season.find({
          seriesId: series._id,
          isDeleted: { $ne: true },
        })
          .sort({ seasonNumber: 1 })
          .lean();

        // Fetch episodes for this series
        const episodes = await Episode.find({
          seriesId: series._id,
          isActive: true,
          isDeleted: { $ne: true },
          status: 'Published', // Only published episodes are visible to users
        })
          .sort({ episodeNumber: 1 })
          .lean();

        // Map episodes to their corresponding seasons
        const seasonsWithEpisodes = seasons.map((season) => {
          const seasonEps = episodes.filter(
            (ep) => ep.seasonId.toString() === season._id.toString()
          );
          return {
            ...season,
            poster: resolveUrl(season.poster),
            episodes: seasonEps.map(ep => ({
              ...ep,
              thumbnailUrl: resolveUrl(ep.thumbnailUrl),
              videoUrl: resolveUrl(ep.videoUrl),
              hlsMasterUrl: resolveUrl(ep.hlsMasterUrl),
              hlsManifestUrl: resolveUrl(ep.hlsManifestUrl),
              languages: (ep.languages || [])
                .map(l => ({
                  ...l,
                  thumbnailUrl: resolveUrl(l.thumbnailUrl),
                  subtitleFile: resolveUrl(l.subtitleFile),
                  audioFile: resolveUrl(l.audioFile),
                  videoFiles: (l.videoFiles || []).map(vf => ({
                    ...vf,
                    videoUrl: resolveUrl(vf.videoUrl),
                  })),
                }))
                .filter(l => l.videoFiles && l.videoFiles.length > 0),
            })),
          };
        });

        return {
          ...series,
          posterUrl: resolveUrl(series.posterUrl),
          thumbnailUrl: resolveUrl(series.thumbnailUrl),
          bannerUrl: resolveUrl(series.bannerUrl),
          seasons: seasonsWithEpisodes,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: completeSeriesData,
      series: completeSeriesData,
      items: completeSeriesData,
      pagination: {
        total: totalSeries,
        page: isNaN(pageNum) || pageNum <= 0 ? 1 : pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalSeries / limitNum),
      },
    });
  } catch (error) {
    console.error('[mobile/explore] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
