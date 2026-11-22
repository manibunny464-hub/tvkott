import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import { requireAuth } from "@/lib/authMiddleware";
import User from "@/models/User";
import Content from "@/models/Content";
import Episode from "@/models/Episode";
import { getUserEntitlements, isQualityAllowed } from "@/lib/subscription/entitlementService";

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
function serializeLanguages(episode, allowedQuality) {
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
      videoFiles: (lang.videoFiles || []).filter((vf) => {
        const quality = String(vf.quality || "").toLowerCase();
        return isQualityAllowed(allowedQuality, ["4k", "2160p"].includes(quality) ? "4K" : quality);
      }).map((vf) => ({
        quality: vf.quality,
        videoUrl: resolveUrl(vf.videoUrl) || null,
        duration: Math.round(vf.duration || 0),
        fileSize: vf.fileSize || 0,
      })),
    }))
    .filter((lang) => lang.videoFiles.length > 0);
}

export async function GET(request) {
  const { user: resolvedUser, error } = await requireAuth(request, { allowLegacyHeaders: true });
  if (error) return error;

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

    const series = await Content.exists({ _id: contentId, type: "series", isActive: true, isDeleted: { $ne: true } });
    if (!series) return Response.json({ success: false, message: "Content not found" }, { status: 404 });

    const dbUser = await User.findById(resolvedUser.userId).select("watchHistory").lean();
    if (!dbUser) return Response.json({ success: false, message: "User not found" }, { status: 401 });

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
    if (!mongoose.isObjectIdOrHexString(episodeId)) {
      return Response.json({ success: false, message: "Invalid episodeId" }, { status: 400 });
    }
    const episode = await Episode.findOne({ _id: episodeId, seriesId: contentId, isActive: true, isDeleted: { $ne: true } }).lean();
    if (!episode) {
      return Response.json(
        { success: false, message: "Episode not found" },
        { status: 404 }
      );
    }

    const entitlements = await getUserEntitlements(resolvedUser.userId);
    if (!episode.isFree && (!entitlements.isPremium || !entitlements.features.premiumContentAccess)) {
      return Response.json({ success: false, message: "Premium subscription required" }, { status: 403 });
    }

    const seriesId = episode.seriesId;
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

    const resolvedLanguages = serializeLanguages(episode, entitlements.features.videoQuality || "480p");

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
