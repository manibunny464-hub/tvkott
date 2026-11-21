import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import { requireAuth } from "@/lib/authMiddleware";
import User from "@/models/User";
import Content from "@/models/Content";
import Episode from "@/models/Episode";
import Season from "@/models/Season";
import { getUserPreferredLanguages } from "@/lib/userLanguages";

export async function GET(request) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    const preferredLangs = await getUserPreferredLanguages(request);

    await dbConnect();

    const dbUser = await User.findById(user.userId, { watchHistory: 1 }).lean();

    // Filter in-progress entries: started but not completed
    const inProgress = (dbUser?.watchHistory ?? [])
      .filter(
        (h) => h.watchedSeconds > 0 && h.totalSeconds > 0 && h.progress < 100,
      )
      .sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt));

    if (inProgress.length === 0) {
      return Response.json({ success: true, items: [] });
    }

    const contentIds = [...new Set(inProgress.map((h) => h.contentId))];
    const episodeIds = inProgress.map((h) => h.episodeId).filter(Boolean);

    const contentQuery = { _id: { $in: contentIds } };
    if (preferredLangs.length > 0) {
      contentQuery.language = { $in: preferredLangs };
    }

    const [contents, episodes] = await Promise.all([
      Content.find(
        contentQuery,
        { _id: 1, title: 1, thumbnailUrl: 1 },
      ).lean(),
      Episode.find(
        { _id: { $in: episodeIds } },
        { _id: 1, episodeNumber: 1, seasonId: 1 },
      ).lean(),
    ]);

    const contentMap = Object.fromEntries(
      contents.map((c) => [c._id.toString(), c]),
    );

    // Keep only the watch history entries whose content matches the language filters, up to 10 items
    const filteredHistory = inProgress
      .filter((h) => contentMap[h.contentId.toString()] !== undefined)
      .slice(0, 10);

    if (filteredHistory.length === 0) {
      return Response.json({ success: true, items: [] });
    }

    const seasonIds = [...new Set(episodes.map((e) => e.seasonId).filter(Boolean))];
    const seasons = seasonIds.length > 0
      ? await Season.find({ _id: { $in: seasonIds } }, { _id: 1, seasonNumber: 1 }).lean()
      : [];

    const seasonMap = Object.fromEntries(
      seasons.map((s) => [s._id.toString(), s.seasonNumber])
    );

    const episodeMap = Object.fromEntries(
      episodes.map((e) => [e._id.toString(), e]),
    );

    const items = filteredHistory.map((h) => {
      const content = contentMap[h.contentId] ?? {};
      const episode = episodeMap[h.episodeId] ?? {};
      const seasonNumber = episode.seasonId ? (seasonMap[episode.seasonId.toString()] ?? null) : null;
      return {
        contentId: h.contentId,
        title: content.title ?? null,
        thumbnailUrl: content.thumbnailUrl ?? null,
        episodeId: h.episodeId ?? null,
        episodeNumber: episode.episodeNumber ?? null,
        season: seasonNumber,
        watchedSeconds: h.watchedSeconds,
        totalSeconds: h.totalSeconds,
        progress: h.progress,
      };
    });

    return Response.json({ success: true, items });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to fetch continue watching" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    const { contentId, episodeId, watchedSeconds, totalSeconds } =
      await request.json();

    if (
      !contentId ||
      typeof watchedSeconds !== "number" ||
      typeof totalSeconds !== "number"
    ) {
      return Response.json(
        {
          success: false,
          message: "contentId, watchedSeconds, and totalSeconds are required",
        },
        { status: 400 },
      );
    }

    if (totalSeconds <= 0) {
      return Response.json(
        { success: false, message: "totalSeconds must be greater than 0" },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return Response.json(
        { success: false, message: "Invalid contentId" },
        { status: 400 },
      );
    }

    if (episodeId && !mongoose.Types.ObjectId.isValid(episodeId)) {
      return Response.json(
        { success: false, message: "Invalid episodeId" },
        { status: 400 },
      );
    }

    await dbConnect();

    const content = await Content.findById(contentId).lean();
    if (!content) {
      return Response.json(
        { success: false, message: "Content not found" },
        { status: 404 },
      );
    }

    if (content.type === "series" && !episodeId) {
      return Response.json(
        { success: false, message: "episodeId is required for series content" },
        { status: 400 },
      );
    }

    const progress = Math.min(
      Math.round((watchedSeconds / totalSeconds) * 100),
      100,
    );

    const entry = {
      contentId,
      episodeId: episodeId ?? null,
      watchedSeconds,
      totalSeconds,
      progress,
      watchedAt: new Date(),
    };

    // Remove any existing entry for this content+episode, then insert fresh
    await User.updateOne(
      { _id: user.userId },
      { $pull: { watchHistory: { contentId, episodeId: episodeId ?? null } } },
    );

    await User.updateOne(
      { _id: user.userId },
      { $push: { watchHistory: { $each: [entry], $position: 0 } } },
    );

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { success: false, message: "Failed to update watch progress" },
      { status: 500 },
    );
  }
}
