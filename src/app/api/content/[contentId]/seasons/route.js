import { seasonTrailersByLanguage } from '@/lib/season-trailer-selection';
import { recommendationCards } from '@/lib/more-like-this';
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Content from "@/models/Content";
import Season from "@/models/Season";
import Episode from "@/models/Episode";
import SeasonTrailer from "@/models/SeasonTrailer";
import User from "@/models/User";
import { verifyToken } from "@/lib/jwt";

// ─── Optional auth ────────────────────────────────────────────────────────────
function resolveUser(request) {
  try {
    let token = null;

    // 1. Check Authorization Header (Bearer token)
    const authHeader = request.headers.get("authorization") || "";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
      console.log("resolveUser [Header - Authorization]: Found Bearer token");
    }

    // 2. Check Custom Headers
    if (!token) {
      token =
        request.headers.get("x-auth-token") || request.headers.get("token");
      if (token) {
        console.log(
          "resolveUser [Header - Custom]: Found token in x-auth-token or token header",
        );
      }
    }

    // 3. Check Cookies
    if (!token) {
      token =
        request.cookies.get("token")?.value ||
        request.cookies.get("tvk_admin_session")?.value;
      if (token) {
        console.log("resolveUser [Cookie]: Found token in cookies");
      }
    }

    // 4. Check Query Parameter
    if (!token) {
      const { searchParams } = new URL(request.url);
      token = searchParams.get("token");
      if (token) {
        console.log("resolveUser [Query]: Found token in query parameters");
      }
    }

    if (!token) {
      console.log(
        "resolveUser: No token found in headers, cookies, or query params.",
      );
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      console.log("resolveUser: Token verification failed.");
    } else {
      console.log("resolveUser: Decoded token payload:", decoded);
    }
    return decoded || null;
  } catch (err) {
    console.error("resolveUser error:", err);
    return null;
  }
}

// ─── CDN / URL resolver ───────────────────────────────────────────────────────
function resolveUrl(raw) {
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  const base = (
    process.env.CDN_URL ||
    process.env.CLOUDFRONT_URL ||
    ""
  ).replace(/\/$/, "");
  if (base) return `${base}/${raw}`;
  return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${raw}`;
}

// ─── Serialize episode language variants ──────────────────────────────────────
function serializeLanguages(episode, isAccessible = true) {
  if (!Array.isArray(episode.languages) || episode.languages.length === 0)
    return [];
  return episode.languages
    .map((lang) => ({
      language: lang.language,
      title: lang.title || episode.title || "",
      description: lang.description || episode.description || "",
      thumbnailUrl:
        resolveUrl(lang.thumbnailUrl) ||
        resolveUrl(episode.thumbnailUrl) ||
        null,
      subtitleFile: resolveUrl(lang.subtitleFile) || null,
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

// ─── Resolve episode duration as integer ─────────────────────────────────────
// Falls back to first videoFile duration if episode.duration is 0 / missing.
function resolveEpisodeDuration(ep) {
  if (ep.duration && ep.duration > 0) return Math.round(ep.duration);
  for (const lang of ep.languages || []) {
    for (const vf of lang.videoFiles || []) {
      if (vf.duration && vf.duration > 0) return Math.round(vf.duration);
    }
  }
  return 0;
}

// ─── Episode serialiser ───────────────────────────────────────────────────────
function serializeEpisode(episode, isUserPremium) {
  const isAccessible = Boolean(episode.isFree) || Boolean(isUserPremium);
  const languages = serializeLanguages(episode, isAccessible);

  const ep = {
    id: episode._id.toString(),
    title: episode.title || "",
    description: episode.description || "",
    episodeNumber: episode.episodeNumber,
    duration: resolveEpisodeDuration(episode),
    thumbnailUrl: resolveUrl(episode.thumbnailUrl) || null,
    isFree: Boolean(episode.isFree) || Boolean(isUserPremium),
    isDownloadable: Boolean(episode.isDownloadable),
    languages,
    meta: {
      isDownloadable: Boolean(episode.isDownloadable),
      isActive: Boolean(episode.isActive),
    },
  };


  return ep;
}

function serializeSeasonCast(seasonCast) {
  if (!seasonCast) return [];
  if (Array.isArray(seasonCast)) {
    return seasonCast.map((member) => ({
      role: member.role || "",
      name: member.name || "",
      imageUrl: resolveUrl(member.imageUrl || member.photo) || null,
    }));
  }

  const actors = (seasonCast.actors || []).map((a) => ({
    role: "Actor",
    name: a.name || "",
    imageUrl: resolveUrl(a.photo || a.imageUrl) || null,
  }));
  const directors = (seasonCast.directors || []).map((d) => ({
    role: "Director",
    name: d.name || "",
    imageUrl: resolveUrl(d.photo || d.imageUrl) || null,
  }));
  const writers = (seasonCast.writers || []).map((w) => ({
    role: "Writer",
    name: w.name || "",
    imageUrl: resolveUrl(w.photo || w.imageUrl) || null,
  }));
  return [...actors, ...directors, ...writers];
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function GET(request, { params }) {
  try {
    const { contentId } = await params;

    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return Response.json(
        { success: false, message: "Invalid contentId" },
        { status: 400 },
      );
    }

    await dbConnect();
    const objectId = new mongoose.Types.ObjectId(contentId);

    let isUserPremium = false;
    const resolvedUser = resolveUser(request);
    if (resolvedUser && resolvedUser.userId) {
      const dbUser = await User.findById(resolvedUser.userId, {
        isPremium: 1,
        premiumExpiry: 1,
      }).lean();
      console.log("GET /seasons: dbUser from DB:", dbUser);
      if (
        dbUser &&
        dbUser.isPremium &&
        dbUser.premiumExpiry &&
        new Date(dbUser.premiumExpiry) > new Date()
      ) {
        isUserPremium = true;
      }
    }
    console.log("GET /seasons: isUserPremium evaluated:", isUserPremium);

    // Verify content exists
    const content = await Content.findOne(
      { _id: objectId, isActive: true, isDeleted: { $ne: true } },
      { _id: 1, languages: 1, primaryLanguage: 1 },
    ).lean();

    if (!content) {
      return Response.json(
        { success: false, message: "Content not found" },
        { status: 404 },
      );
    }

    // Single query: all non-deleted seasons
    const dbSeasons = await Season.find({
      seriesId: objectId,
      isDeleted: { $ne: true },
    })
      .sort({ seasonNumber: 1 })
      .lean();

    if (!dbSeasons.length) {
      return Response.json({
        success: true,
        seriesId: contentId,
        totalSeasons: 0,
        totalEpisodes: 0,
        seasons: [],
      });
    }

    // All active episodes + season trailers in parallel
    const seasonIds = dbSeasons.map((s) => s._id);

    const [episodes, trailers] = await Promise.all([
      Episode.find(
        {
          isActive: true,
          isDeleted: { $ne: true },
          $or: [{ seriesId: objectId }, { contentId: objectId }],
        },
        {
          _id: 1,
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
        },
      )
        .sort({ season: 1, episodeNumber: 1 })
        .lean(),
      SeasonTrailer.find(
        { seasonId: { $in: seasonIds }, isActive: { $ne: false } },
        { seasonId: 1, videoUrl: 1, duration: 1, language: 1, languages: 1 },
      ).lean(),
    ]);

    // Build lookups
    const trailersBySeasonId = seasonTrailersByLanguage(trailers,
      new URL(request.url).searchParams.get('language'), content.primaryLanguage);
    const bySeasonId = new Map();
    const bySeasonNumber = new Map();

    for (const ep of episodes) {
      if (ep.seasonId) {
        const key = ep.seasonId.toString();
        const arr = bySeasonId.get(key) || [];
        arr.push(ep);
        bySeasonId.set(key, arr);
      }
      const num = Number(ep.season || 1);
      const arr2 = bySeasonNumber.get(num) || [];
      arr2.push(ep);
      bySeasonNumber.set(num, arr2);
    }

    let totalEpisodes = 0;

    const recommendations = await recommendationCards(dbSeasons.map((season) => season.seriesIds), 'series', resolveUrl);
    const seasons = dbSeasons.map((season) => {
      const seasonIdKey = season._id ? season._id.toString() : null;
      const epById = seasonIdKey ? bySeasonId.get(seasonIdKey) || [] : [];
      const epByNum = bySeasonNumber.get(Number(season.seasonNumber)) || [];

      // Merge and deduplicate
      const seen = new Set();
      const merged = [];
      for (const ep of [...epById, ...epByNum]) {
        const key = ep._id.toString();
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(ep);
        }
      }
      merged.sort(
        (a, b) => Number(a.episodeNumber || 0) - Number(b.episodeNumber || 0),
      );
      totalEpisodes += merged.length;

      // Trailer for this season
      const trailerDoc = seasonIdKey
        ? trailersBySeasonId.get(seasonIdKey)
        : null;
      let trailerUrl = null;
      if (trailerDoc) {
        if (trailerDoc.videoUrl) {
          trailerUrl = trailerDoc.videoUrl;
        } else if (Array.isArray(trailerDoc.languages) && trailerDoc.languages.length > 0) {
          const firstLang = trailerDoc.languages[0];
          if (Array.isArray(firstLang.files) && firstLang.files.length > 0) {
            trailerUrl = firstLang.files[0].videoUrl;
          }
        }
      }
      const trailer =
        trailerUrl
          ? {
              videoUrl: resolveUrl(trailerUrl) || null,
              duration: Math.round(trailerDoc.duration || 0),
              ...(trailerDoc.language ? { language: trailerDoc.language } : {}),
            }
          : null;

      return {
        id: season._id.toString(),
        seasonNumber: season.seasonNumber,
        moreLikeThis: (season.seriesIds ?? []).map((id) => recommendations.get(String(id))).filter(Boolean),
        title: season.title || `Season ${season.seasonNumber}`,
        description: season.description || "",
        episodeCount: merged.length,
        isActive: season.isActive,
        trailer,
        cast: serializeSeasonCast(season.cast),
        episodes: merged.map((ep) => serializeEpisode(ep, isUserPremium)),
      };
    });

    const activeSeasons = seasons.filter((s) => s.episodeCount > 0);

    return Response.json({
      success: true,
      seriesId: contentId,
      totalSeasons: activeSeasons.length,
      totalEpisodes,
      seasons: activeSeasons,
    });
  } catch (error) {
    console.error("[/api/content/seasons] GET error:", error);
    return Response.json(
      { success: false, message: error.message || "Failed to fetch seasons" },
      { status: 500 },
    );
  }
}
