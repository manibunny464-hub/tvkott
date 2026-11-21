import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import { requireAuth } from "@/lib/authMiddleware";
import User from "@/models/User";
import Content from "@/models/Content";
import Episode from "@/models/Episode";
import { verifyToken } from "@/lib/jwt";

// ─── Optional auth ────────────────────────────────────────────────────────────
function resolveUser(request) {
  try {
    let token = null;

    // 1. Check Authorization Header (Bearer token)
    const authHeader = request.headers.get("authorization") || "";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }

    // 2. Check Custom Headers
    if (!token) {
      token =
        request.headers.get("x-auth-token") || request.headers.get("token");
    }

    // 3. Check Cookies
    if (!token) {
      token =
        request.cookies.get("token")?.value ||
        request.cookies.get("chirpii_admin_session")?.value;
    }

    if (!token) return null;
    return verifyToken(token) || null;
  } catch {
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
function serializeLanguages(episode) {
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
      videoFiles: (lang.videoFiles || []).map((vf) => ({
        quality: vf.quality,
        videoUrl: resolveUrl(vf.videoUrl) || null,
        duration: Math.round(vf.duration || 0),
        fileSize: vf.fileSize || 0,
      })),
    }))
    .filter((lang) => lang.videoFiles.length > 0);
}

export async function GET(request) {
  let resolvedUser = resolveUser(request);
  if (!resolvedUser) {
    const auth = await requireAuth(request).catch(() => null);
    if (auth && auth.success) {
      resolvedUser = auth.user;
    }
  }

  if (!resolvedUser) {
    return Response.json(
      { success: false, message: "Authorization token required" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get("contentId");
    let episodeId = searchParams.get("episodeId");

    if (!contentId || !mongoose.Types.ObjectId.isValid(contentId)) {
      return Response.json(
        { success: false, message: "Valid contentId is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const dbUser = await User.findById(resolvedUser.userId).lean();

    // If episodeId is not provided, try to resolve it from the user's watchHistory or first episode of the series
    if (!episodeId) {
      if (dbUser && dbUser.watchHistory) {
        const match = dbUser.watchHistory.find(
          (h) => h.contentId === contentId && h.episodeId
        );
        if (match) {
          episodeId = match.episodeId;
        }
      }

      // If still not resolved (no watch history for this contentId), get the first active episode of the series
      if (!episodeId) {
        const firstEpisode = await Episode.findOne({
          seriesId: contentId,
          isDeleted: { $ne: true },
          isActive: true,
        })
          .sort({ episodeNumber: 1 })
          .select("_id")
          .lean();
        if (firstEpisode) {
          episodeId = firstEpisode._id.toString();
        }
      }
    }

    if (!episodeId || !mongoose.Types.ObjectId.isValid(episodeId)) {
      return Response.json(
        { success: false, message: "Valid episodeId is required or could not be resolved" },
        { status: 400 }
      );
    }

    // 1. Fetch saved progress (timestamp)
    let watchedSeconds = 0;
    if (dbUser && dbUser.watchHistory) {
      const match = dbUser.watchHistory.find(
        (h) => h.contentId === contentId && h.episodeId === episodeId
      );
      // Resume if not fully completed (under 100% progress)
      if (match && match.progress < 100 && match.watchedSeconds > 0) {
        watchedSeconds = match.watchedSeconds;
      }
    }

    // 2. Resolve series episode details and playback URLs
    const episode = await Episode.findById(episodeId).lean();
    if (!episode) {
      return Response.json(
        { success: false, message: "Episode not found" },
        { status: 404 }
      );
    }

    const seriesId = episode.seriesId || episode.contentId || contentId;
    const seasonId = episode.seasonId;

    // Fetch adjacent episode IDs (previous and next in the same season)
    const [prevEpisode, nextEpisode] = await Promise.all([
      Episode.findOne({
        seriesId,
        seasonId,
        episodeNumber: { $lt: episode.episodeNumber },
        isDeleted: { $ne: true },
        isActive: true,
      })
        .sort({ episodeNumber: -1 })
        .select("_id")
        .lean(),
      Episode.findOne({
        seriesId,
        seasonId,
        episodeNumber: { $gt: episode.episodeNumber },
        isDeleted: { $ne: true },
        isActive: true,
      })
        .sort({ episodeNumber: 1 })
        .select("_id")
        .lean(),
    ]);

    const origin = new URL(request.url).origin;
    const manifestUrl = `${origin}/api/episodes/${episodeId}/manifest`;
    const hasHls = Boolean(episode.hlsMasterUrl || episode.hlsMasterKey);
    const playbackUrl = hasHls ? manifestUrl : (episode.videoUrl || null);

    const resolvedLanguages = serializeLanguages(episode);

    return Response.json({
      success: true,
      kind: "episode",
      watchedSeconds,
      episode: {
        id: episode._id.toString(),
        episodeNumber: episode.episodeNumber,
        title: episode.title,
        description: episode.description,
        thumbnailUrl: resolveUrl(episode.thumbnailUrl),
        playbackUrl: resolveUrl(playbackUrl),
        streamType: hasHls ? "hls" : "direct",
        languages: resolvedLanguages,
      },
      previousEpisodeId: prevEpisode?._id?.toString() || null,
      nextEpisodeId: nextEpisode?._id?.toString() || null,
    });
  } catch (err) {
    console.error("GET /api/home/continue-watching/play error:", err);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
