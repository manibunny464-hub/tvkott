import dbConnect from '@/lib/db';
import SeasonTrailer from '@/models/SeasonTrailer';
import Content from '@/models/Content';
import Season from '@/models/Season';
import { getUserPreferredLanguages } from '@/lib/userLanguages';

function resolveUrl(raw) {
  if (!raw) return null;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const base = (process.env.CDN_URL || process.env.CLOUDFRONT_URL || '').replace(/\/$/, '');
  if (base) return `${base}/${raw}`;
  return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${raw}`;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get('page')) || 1, 1);
    const limit = Math.min(parseInt(searchParams.get('limit')) || 10, 50);
    const skip = (page - 1) * limit;

    const preferredLangs = await getUserPreferredLanguages(request);

    await dbConnect();

    let seriesIdsFilter = null;
    if (preferredLangs.length > 0) {
      const matchingSeries = await Content.find({
        type: 'series',
        language: { $in: preferredLangs },
        isActive: true,
        isDeleted: { $ne: true }
      }).select('_id').lean();
      seriesIdsFilter = matchingSeries.map(s => s._id);
    }

    const trailerQuery = {
      isActive: true,
      $or: [
        { videoUrl: { $exists: true, $ne: "", $ne: null } },
        { "languages.0": { $exists: true } }
      ]
    };
    if (seriesIdsFilter !== null) {
      trailerQuery.seriesId = { $in: seriesIdsFilter };
    }

    const [trailers, total] = await Promise.all([
      SeasonTrailer.find(trailerQuery)
        .populate({ path: 'seriesId', select: 'title poster banner thumbnail genres rating releaseYear' })
        .populate({ path: 'seasonId', select: 'seasonNumber title poster' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SeasonTrailer.countDocuments(trailerQuery),
    ]);

    const resolvedTrailers = trailers.map((t) => {
      // Fallback for older documents that stored video in languages array
      let videoUrl = t.videoUrl;
      if (!videoUrl && Array.isArray(t.languages) && t.languages.length > 0) {
        const firstLang = t.languages[0];
        if (Array.isArray(firstLang.files) && firstLang.files.length > 0) {
          videoUrl = firstLang.files[0].videoUrl;
        }
      }

      if (!videoUrl) return null;

      return {
        _id: t._id,
        videoUrl: resolveUrl(videoUrl),
        series: t.seriesId ? {
          _id: t.seriesId._id,
          title: t.seriesId.title,
          poster: resolveUrl(t.seriesId.poster),
          banner: resolveUrl(t.seriesId.banner),
          thumbnail: resolveUrl(t.seriesId.thumbnail),
          genres: t.seriesId.genres,
          rating: t.seriesId.rating,
          releaseYear: t.seriesId.releaseYear
        } : null,
        season: t.seasonId ? {
          _id: t.seasonId._id,
          seasonNumber: t.seasonId.seasonNumber,
          title: t.seasonId.title,
          poster: resolveUrl(t.seasonId.poster)
        } : null
      };
    }).filter(Boolean);

    const totalPages = Math.ceil(total / limit);

    return Response.json({ success: true, trailers: resolvedTrailers, page, totalPages });
  } catch (err) {
    console.error('[public API/trailers] GET error:', err);
    return Response.json(
      { success: false, message: 'Failed to fetch trailers' },
      { status: 500 }
    );
  }
}

