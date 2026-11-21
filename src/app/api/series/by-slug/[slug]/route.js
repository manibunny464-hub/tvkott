import dbConnect from '@/lib/db';
import Content from '@/models/Content';
import Season from '@/models/Season';
import Episode from '@/models/Episode';

function resolveUrl(raw) {
  if (!raw) return null;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const base = (process.env.CDN_URL || process.env.CLOUDFRONT_URL || '').replace(/\/$/, '');
  if (base) return `${base}/${raw}`;
  return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${raw}`;
}

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    await dbConnect();

    const series = await Content.findOne({
      slug,
      type: 'series',
      isDeleted: { $ne: true },
    }).lean();

    if (!series) {
      return Response.json(
        { success: false, message: 'Series not found' },
        { status: 404 }
      );
    }

    // Resolve URL fields
    series.posterUrl = resolveUrl(series.posterUrl) || null;
    series.thumbnailUrl = resolveUrl(series.thumbnailUrl) || null;
    series.bannerUrl = resolveUrl(series.bannerUrl) || null;

    // Serialize cast for round images
    let cast = [];
    if (series.cast) {
      if (Array.isArray(series.cast)) {
        cast = series.cast.map((member) => ({
          role: member.role || 'Cast',
          name: member.name || '',
          imageUrl: resolveUrl(member.imageUrl || member.photo) || null,
        }));
      } else {
        const actors = (series.cast.actors || []).map((a) => ({
          role: 'Actor',
          name: a.name || '',
          imageUrl: resolveUrl(a.photo) || null,
        }));
        const directors = (series.cast.directors || []).map((d) => ({
          role: 'Director',
          name: d.name || '',
          imageUrl: resolveUrl(d.photo) || null,
        }));
        const writers = (series.cast.writers || []).map((w) => ({
          role: 'Writer',
          name: w.name || '',
          imageUrl: resolveUrl(w.photo) || null,
        }));
        cast = [...directors, ...actors, ...writers];
      }
    }

    cast = cast.filter((member) => member && member.name && member.name.trim());
    // Sort alphabetically by default
    cast.sort((a, b) => a.name.localeCompare(b.name));

    // Fetch seasons and episodes
    const dbSeasons = await Season.find({
      seriesId: series._id,
      isDeleted: { $ne: true },
    })
      .sort({ seasonNumber: 1 })
      .lean();

    const dbEpisodes = await Episode.find({
      seriesId: series._id,
      isActive: true,
      isDeleted: { $ne: true },
    })
      .sort({ season: 1, episodeNumber: 1 })
      .lean();

    if (!dbSeasons.length || !dbEpisodes.length) {
      return Response.json(
        { success: false, message: 'Series not found or has no available episodes' },
        { status: 404 }
      );
    }

    const seasons = dbSeasons.map((season) => {
      const episodes = dbEpisodes
        .filter((ep) => String(ep.seasonId) === String(season._id) || Number(ep.season) === Number(season.seasonNumber))
        .map((ep) => ({
          id: ep._id.toString(),
          episodeNumber: ep.episodeNumber,
          title: ep.title || '',
          description: ep.description || '',
          thumbnailUrl: resolveUrl(ep.thumbnailUrl) || null,
          duration: ep.duration || 0,
          isFree: Boolean(ep.isFree),
        }));

      // Parse and serialize season-specific cast
      let seasonCast = [];
      if (season.cast) {
        if (Array.isArray(season.cast)) {
          seasonCast = season.cast.map((member) => ({
            role: member.role || 'Cast',
            name: member.name || '',
            imageUrl: resolveUrl(member.imageUrl || member.photo) || null,
          }));
        } else {
          const actors = (season.cast.actors || []).map((a) => ({
            role: 'Actor',
            name: a.name || '',
            imageUrl: resolveUrl(a.photo) || null,
          }));
          const directors = (season.cast.directors || []).map((d) => ({
            role: 'Director',
            name: d.name || '',
            imageUrl: resolveUrl(d.photo) || null,
          }));
          const writers = (season.cast.writers || []).map((w) => ({
            role: 'Writer',
            name: w.name || '',
            imageUrl: resolveUrl(w.photo) || null,
          }));
          seasonCast = [...directors, ...actors, ...writers];
        }
      }

      seasonCast = seasonCast
        .filter((member) => member && member.name && member.name.trim());

      // If the series has defined cast, filter season cast so removed artists never appear
      if (cast && cast.length > 0) {
        const seriesCastNames = new Set(cast.map((c) => c.name.toLowerCase().trim()));
        seasonCast = seasonCast.filter((member) => seriesCastNames.has(member.name.toLowerCase().trim()));
      }

      seasonCast.sort((a, b) => a.name.localeCompare(b.name));

      return {
        ...season,
        episodes,
        episodeCount: episodes.length,
        cast: seasonCast,
      };
    }).filter((s) => s.episodeCount > 0);

    if (!seasons.length) {
      return Response.json(
        { success: false, message: 'Series has no available seasons with episodes' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      series: {
        ...series,
        cast,
        seasons,
      },
    });
  } catch (error) {
    console.error('[/api/series/by-slug] GET error:', error);
    return Response.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
