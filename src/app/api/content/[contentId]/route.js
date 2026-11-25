import { seasonTrailersByLanguage } from '@/lib/season-trailer-selection';
import { publishedMovieLanguages } from '@/lib/admin/movie-media';
import { recommendationCards } from '@/lib/more-like-this';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Content from '@/models/Content';
import Episode from '@/models/Episode';
import Season from '@/models/Season';
import SeasonTrailer from '@/models/SeasonTrailer';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';

function resolveUrl(raw) {
  if (!raw) return null;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const base = (process.env.CDN_URL || process.env.CLOUDFRONT_URL || '').replace(/\/$/, '');
  if (base) return `${base}/${raw}`;
  return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${raw}`;
}

// ─── Resolve episode duration (integer seconds) ───────────────────────────────
// Priority: episode.duration → first video file duration across all languages
function resolveEpisodeDuration(ep) {
  if (ep.duration && ep.duration > 0) return Math.round(ep.duration);
  for (const lang of ep.languages || []) {
    for (const vf of lang.videoFiles || []) {
      if (vf.duration && vf.duration > 0) return Math.round(vf.duration);
    }
  }
  return 0;
}

function serializeEpisodeLanguages(episode, isAccessible = true) {
  if (!Array.isArray(episode.languages) || episode.languages.length === 0) return [];
  return episode.languages
    .map((lang) => ({
      language: lang.language,
      title: lang.title || episode.title || '',
      description: lang.description || episode.description || '',
      thumbnailUrl: resolveUrl(lang.thumbnailUrl) || resolveUrl(episode.thumbnailUrl) || null,
      audioFile: isAccessible ? resolveUrl(lang.audioFile) || null : null,
      videoFiles: (lang.videoFiles || []).map((vf) => ({
        quality: vf.quality,
        videoUrl: isAccessible ? resolveUrl(vf.videoUrl) || null : null,
        duration: Math.round(vf.duration || 0),
        fileSize: vf.fileSize || 0,
      })),
    }))
    .filter((lang) => lang.videoFiles.length > 0);
}

// ─── Strip unwanted fields from raw content document ─────────────────────────
function cleanContent(content) {
  const {
    director,        // eslint-disable-line no-unused-vars
    musicDirector,   // eslint-disable-line no-unused-vars
    producer,        // eslint-disable-line no-unused-vars
    trailerPoster,   // eslint-disable-line no-unused-vars
    trailerUrl,      // eslint-disable-line no-unused-vars
    movieIds,        // eslint-disable-line no-unused-vars
    ...rest
  } = content;
  return rest;
}

// ─── Optional auth ────────────────────────────────────────────────────────────
function resolveUser(request) {
  try {
    let token = null;

    // 1. Check Authorization Header (Bearer token)
    const authHeader = request.headers.get('authorization') || '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }

    // 2. Check Custom Headers
    if (!token) {
      token = request.headers.get('x-auth-token') || request.headers.get('token');
    }

    // 3. Check Cookies
    if (!token) {
      token = request.cookies.get('token')?.value || request.cookies.get('tvk_admin_session')?.value;
    }

    // 4. Check Query Parameter
    if (!token) {
      const { searchParams } = new URL(request.url);
      token = searchParams.get('token');
    }

    if (!token) return null;
    return verifyToken(token) || null;
  } catch {
    return null;
  }
}

export async function GET(request, { params }) {
  try {
    const { contentId } = await params;

    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return Response.json(
        { success: false, message: 'Invalid contentId' },
        { status: 400 }
      );
    }

    await dbConnect();
    const objectId = new mongoose.Types.ObjectId(contentId);

    const content = await Content.findOne({
      _id: objectId,
      isActive: true,
      isDeleted: { $ne: true },
    }).select('+primaryLanguage').lean();

    if (!content) {
      return Response.json(
        { success: false, message: 'Content not found' },
        { status: 404 }
      );
    }

    // Resolve user status
    let isAdded = false;
    let isUserPremium = false;
    const resolvedUser = resolveUser(request);
    if (resolvedUser && resolvedUser.userId) {
      const dbUser = await User.findById(resolvedUser.userId, { myList: 1, isPremium: 1, premiumExpiry: 1 }).lean();
      if (dbUser) {
        if (dbUser.myList) {
          isAdded = dbUser.myList.includes(contentId);
        }
        if (dbUser.isPremium && dbUser.premiumExpiry && new Date(dbUser.premiumExpiry) > new Date()) {
          isUserPremium = true;
        }
      }
    }

    // Serialize cast for frontend
    let cast = [];
    if (content.cast) {
      if (Array.isArray(content.cast)) {
        cast = content.cast.map((member) => ({
          role: member.role || '',
          name: member.name || '',
          imageUrl: resolveUrl(member.imageUrl) || null,
        }));
      } else {
        const actors = (content.cast.actors || []).map((a) => ({
          role: 'Actor',
          name: a.name || '',
          imageUrl: resolveUrl(a.photo) || null,
        }));
        const directors = (content.cast.directors || []).map((d) => ({
          role: 'Director',
          name: d.name || '',
          imageUrl: resolveUrl(d.photo) || null,
        }));
        const writers = (content.cast.writers || []).map((w) => ({
          role: 'Writer',
          name: w.name || '',
          imageUrl: resolveUrl(w.photo) || null,
        }));
        cast = [...actors, ...directors, ...writers];
      }
    }

    if (content.type !== 'series') {
      const playback = content.type === 'movie'
        ? await publishedMovieLanguages(content, content.pricing === 'free' || isUserPremium)
        : null;
      const recommendations = content.type === 'movie'
        ? await recommendationCards([content.movieIds], 'movie', resolveUrl)
        : new Map();
      return Response.json({
        success: true,
        content: {
          ...cleanContent(content),
          ...(playback ? { playback } : {}),
          ...(content.type === 'movie' ? {
            moreLikeThis: (content.movieIds ?? []).map((id) => recommendations.get(String(id))).filter(Boolean),
          } : {}),
          cast,
          isAdded,
          addedtolist: isAdded,
          seasonStatus: {
            hasSeasons: false,
            status: 'not_applicable',
            totalSeasons: 0,
            activeSeasonCount: 0,
            activeEpisodeCount: 0,
          },
          seasons: [],
        },
      }, { headers: { "Cache-Control": "private, no-store" } });
    }

    const [dbSeasons, episodes, trailers] = await Promise.all([
      Season.find({
        seriesId: objectId,
        isDeleted: { $ne: true },
      })
        .sort({ seasonNumber: 1 })
        .lean(),
      Episode.find(
        {
          isActive: true,
          isDeleted: { $ne: true },
          $or: [
            { seriesId: objectId },
            { contentId: objectId },
          ],
        },
        {
          _id: 1,
          contentId: 1,
          seriesId: 1,
          seasonId: 1,
          season: 1,
          episodeNumber: 1,
          title: 1,
          description: 1,
          airDate: 1,
          duration: 1,
          isFree: 1,
          thumbnailUrl: 1,
          isDownloadable: 1,
          isActive: 1,
          languages: 1,
          createdAt: 1,
          updatedAt: 1,
        }
      )
        .sort({ season: 1, episodeNumber: 1 })
        .lean(),
      SeasonTrailer.find({ seriesId: objectId, isActive: { $ne: false } }).lean(),
    ]);

    if (!dbSeasons.length || !episodes.length) {
      return Response.json(
        { success: false, message: 'Series has no available seasons or episodes' },
        { status: 404 }
      );
    }

    // Build trailer lookup by seasonId
    const trailersBySeasonId = seasonTrailersByLanguage(trailers,
      new URL(request.url).searchParams.get('language'), content.primaryLanguage);

    const episodesBySeasonId = new Map();
    const episodesBySeasonNumber = new Map();

    for (const episode of episodes) {
      if (episode.seasonId) {
        const key = episode.seasonId.toString();
        episodesBySeasonId.set(key, [...(episodesBySeasonId.get(key) || []), episode]);
      }

      const seasonNumber = Number(episode.season || 1);
      episodesBySeasonNumber.set(seasonNumber, [
        ...(episodesBySeasonNumber.get(seasonNumber) || []),
        episode,
      ]);
    }

    const recommendations = await recommendationCards(
      dbSeasons.map((season) => season.seriesIds), 'series', resolveUrl
    );
    const activeSeasons = dbSeasons
      .sort((a, b) => Number(a.seasonNumber) - Number(b.seasonNumber))
      .map((season) => {
        const bySeasonId = season._id ? episodesBySeasonId.get(String(season._id)) || [] : [];
        const bySeasonNumber = episodesBySeasonNumber.get(Number(season.seasonNumber)) || [];
        const seasonEpisodes = [...bySeasonId, ...bySeasonNumber]
          .filter(
            (episode, index, allEpisodes) =>
              allEpisodes.findIndex((item) => item._id.toString() === episode._id.toString()) === index
          )
          .sort((a, b) => Number(a.episodeNumber || 0) - Number(b.episodeNumber || 0))
          .map((ep) => {
            const isAccessible = Boolean(ep.isFree) || Boolean(isUserPremium);
            const epObj = {
              id: ep._id.toString(),
              episodeNumber: ep.episodeNumber,
              title: ep.title || '',
              description: ep.description || '',
              thumbnailUrl: resolveUrl(ep.thumbnailUrl) || null,
              duration: resolveEpisodeDuration(ep),
              isFree: Boolean(ep.isFree) || Boolean(isUserPremium),
              isDownloadable: Boolean(ep.isDownloadable),
              languages: serializeEpisodeLanguages(ep, isAccessible),
            };

            return epObj;
          });

        const seasonTrailer = season._id ? trailersBySeasonId.get(season._id.toString()) : null;
        let trailerUrl = null;
        if (seasonTrailer) {
          if (seasonTrailer.videoUrl) {
            trailerUrl = seasonTrailer.videoUrl;
          } else if (Array.isArray(seasonTrailer.languages) && seasonTrailer.languages.length > 0) {
            const firstLang = seasonTrailer.languages[0];
            if (Array.isArray(firstLang.files) && firstLang.files.length > 0) {
              trailerUrl = firstLang.files[0].videoUrl;
            }
          }
        }
        const trailer =
          trailerUrl
            ? {
                videoUrl: resolveUrl(trailerUrl) || null,
                duration: Math.round(seasonTrailer.duration || 0),
                ...(seasonTrailer.language ? { language: seasonTrailer.language } : {}),
              }
            : null;

        return {
          ...season,
          moreLikeThis: (season.seriesIds ?? []).map((id) => recommendations.get(String(id))).filter(Boolean),
          title: season.title || `Season ${season.seasonNumber}`,
          episodeCount: seasonEpisodes.length,
          status: seasonEpisodes.length > 0 ? 'available' : 'empty',
          trailer,
          episodes: seasonEpisodes,
        };
      })
      .filter((s) => s.episodeCount > 0);

    const activeEpisodeCount = activeSeasons.reduce((total, season) => total + season.episodeCount, 0);

    return Response.json({
      success: true,
      content: {
        ...cleanContent(content),
        cast,
        totalSeasons: activeSeasons.length,
        isAdded,
        addedtolist: isAdded,
        seasonStatus: {
          hasSeasons: activeSeasons.length > 0,
          status: activeSeasons.length > 0 ? 'available' : 'empty',
          totalSeasons: activeSeasons.length,
          activeSeasonCount: activeSeasons.length,
          activeEpisodeCount,
        },
        seasons: activeSeasons,
      },
    });
  } catch (error) {
    console.error('[/api/content/[contentId]] GET error:', error);
    return Response.json(
      { success: false, message: error.message || 'Failed to fetch content details' },
      { status: 500 }
    );
  }
}
