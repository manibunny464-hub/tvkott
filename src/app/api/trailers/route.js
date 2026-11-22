import Language from '@/models/Language';
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

    const seriesIds = await Content.distinct('_id', {
      type: 'series', isActive: true, isDeleted: { $ne: true },
      ...(preferredLangs.length ? { language: { $in: preferredLangs } } : {}),
    });

    const trailerQuery = {
      seriesId: { $in: seriesIds },
      isActive: true,
      $or: [
        { videoUrl: { $type: "string", $ne: "" } },
        { "languages.0": { $exists: true } }
      ]
    };
    if (preferredLangs.length) {
      const languages = await Language.find({ englishName: { $in: preferredLangs } }).select('code').lean();
      trailerQuery.language = { $in: [null, ...languages.map(({ code }) => code)] };
    }

    const [trailers, total] = await Promise.all([
      SeasonTrailer.find(trailerQuery)
        .populate({ path: 'seriesId', select: 'title poster banner thumbnail genres rating releaseYear' })
        .populate({ path: 'seasonId', select: 'seasonNumber title poster' })
        .sort({ createdAt: -1, _id: -1 })
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
        ...(t.language ? { language: t.language } : {}),
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

