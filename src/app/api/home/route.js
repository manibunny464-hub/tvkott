import dbConnect from "@/lib/db";
import { requireAuth } from "@/lib/authMiddleware";
import User from "@/models/User";
import Content from "@/models/Content";
import Episode from "@/models/Episode";
import Season from "@/models/Season";
import Genre from "@/models/Genre";
import { getVisibleBanners } from "@/lib/banners";
import { getUserPreferredLanguages } from "@/lib/userLanguages";

// Fetch trending content
async function fetchTrending(preferredLangs = []) {
  const query = {
    isTrending: true,
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
  return Content.find(
    query,
    {
      _id: 1,
      title: 1,
      thumbnailUrl: 1,
      genres: 1,
      type: 1,
      trendingPriority: 1,
      color: 1,
    },
  )
    .sort({ trendingPriority: 1 })
    .limit(10)
    .lean();
}

async function fetchBlockbusters(preferredLangs = []) {
  const query = {
    isBlockbuster: true,
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
  return Content.find(
    query,
    {
      _id: 1,
      title: 1,
      thumbnailUrl: 1,
      posterUrl: 1,
      bannerUrl: 1,
      genres: 1,
      type: 1,
      rating: 1,
      releaseYear: 1,
      blockbusterPriority: 1,
    },
  )
    .sort({ blockbusterPriority: 1, updatedAt: -1 })
    .limit(20)
    .lean();
}

import { getValidSeriesIds } from '@/lib/seriesFilter';

async function fetchSeries(preferredLangs = []) {
  const validSeriesIds = await getValidSeriesIds(preferredLangs);
  if (validSeriesIds.length === 0) return [];

  const query = {
    _id: { $in: validSeriesIds },
    type: "series",
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
  return Content.find(
    query,
    {
      _id: 1,
      title: 1,
      description: 1,
      language: 1,
      genres: 1,
      type: 1,
      releaseYear: 1,
      thumbnailUrl: 1,
      posterUrl: 1,
      bannerUrl: 1,
      pricing: 1,
      totalSeasons: 1,
      isFeatured: 1,
      isTrending: 1,
      color: 1,
    },
  )
    .sort({ isFeatured: -1, isTrending: -1, updatedAt: -1 })
    .limit(20)
    .lean();
}

// Fetch continue watching for a user
async function fetchContinueWatching(userId, preferredLangs = []) {
  if (!userId) return [];

  const dbUser = await User.findById(userId, { watchHistory: 1 }).lean();

  const inProgress = (dbUser?.watchHistory ?? [])
    .filter(
      (h) => h.watchedSeconds > 0 && h.totalSeconds > 0 && h.progress < 100,
    )
    .sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt));

  if (inProgress.length === 0) return [];

  const contentIds = [...new Set(inProgress.map((h) => h.contentId))];
  const episodeIds = inProgress.map((h) => h.episodeId).filter(Boolean);

  const contentQuery = { _id: { $in: contentIds }, isActive: true, isDeleted: { $ne: true } };
  if (preferredLangs.length > 0) {
    contentQuery.language = { $in: preferredLangs };
  }

  const [contents, episodes] = await Promise.all([
    Content.find(
      contentQuery,
      { _id: 1, title: 1, thumbnailUrl: 1 },
    ).lean(),
    Episode.find(
      { _id: { $in: episodeIds }, isActive: true, isDeleted: { $ne: true } },
      { _id: 1, episodeNumber: 1, season: 1, seasonId: 1 },
    ).lean(),
  ]);

  const seasonIds = [...new Set(episodes.map((ep) => ep.seasonId).filter(Boolean))];
  const seasons = seasonIds.length > 0
    ? await Season.find({ _id: { $in: seasonIds } }, { _id: 1, seasonNumber: 1 }).lean()
    : [];

  const seasonMap = Object.fromEntries(
    seasons.map((s) => [s._id.toString(), s.seasonNumber])
  );

  const contentMap = Object.fromEntries(
    contents.map((c) => [c._id.toString(), c]),
  );
  const episodeMap = Object.fromEntries(
    episodes.map((e) => {
      const seasonNumber = e.season !== undefined && e.season !== null && e.season !== ''
        ? e.season
        : (e.seasonId ? seasonMap[e.seasonId.toString()] : null);
      return [
        e._id.toString(),
        { ...e, season: seasonNumber }
      ];
    }),
  );

  const episodeIdsVisible = new Set(episodes.map((episode) => String(episode._id)));
  const filteredHistory = inProgress
    .filter((h) => contentMap[h.contentId.toString()] !== undefined && (!h.episodeId || episodeIdsVisible.has(h.episodeId.toString())))
    .slice(0, 6);

  return filteredHistory.map((h) => {
    const content = contentMap[h.contentId] ?? {};
    const episode = episodeMap[h.episodeId] ?? {};
    return {
      contentId: h.contentId,
      title: content.title ?? null,
      thumbnailUrl: content.thumbnailUrl ?? null,
      episodeId: h.episodeId ?? null,
      episodeNumber: episode.episodeNumber ?? null,
      season: episode.season ?? null,
      watchedSeconds: h.watchedSeconds,
      totalSeconds: h.totalSeconds,
      progress: h.progress,
    };
  });
}

// Fetch personalised content based on language prefs
async function fetchForYou(userId, preferredLangs = []) {
  if (!userId) {
    const query = {
      isTrending: true,
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
    return Content.find(
      query,
      {
        _id: 1,
        title: 1,
        thumbnailUrl: 1,
        type: 1,
        rating: 1,
        releaseYear: 1,
        language: 1,
        genres: 1,
      },
    )
      .sort({ trendingPriority: 1 })
      .limit(20)
      .lean();
  }

  const dbUser = await User.findById(userId, { watchHistory: 1 }).lean();
  const watchedIds = (dbUser?.watchHistory ?? []).map((h) => h.contentId);

  if (preferredLangs.length === 0) {
    return Content.find(
      {
        isTrending: true,
        isActive: true,
        isDeleted: { $ne: true },
        $or: [
          { isComingSoon: { $ne: true } },
          { expectedReleaseDate: { $lte: new Date() } }
        ],
        _id: { $nin: watchedIds },
      },
      {
        _id: 1,
        title: 1,
        thumbnailUrl: 1,
        type: 1,
        rating: 1,
        releaseYear: 1,
        language: 1,
        genres: 1,
      },
    )
      .sort({ trendingPriority: 1 })
      .limit(20)
      .lean();
  }

  return Content.find(
    {
      language: { $in: preferredLangs },
      isActive: true,
      isDeleted: { $ne: true },
      $or: [
        { isComingSoon: { $ne: true } },
        { expectedReleaseDate: { $lte: new Date() } }
      ],
      _id: { $nin: watchedIds },
    },
    {
      _id: 1,
      title: 1,
      thumbnailUrl: 1,
      type: 1,
      rating: 1,
      releaseYear: 1,
      language: 1,
      genres: 1,
      isFeatured: 1,
      isTrending: 1,
    },
  )
    .sort({ isFeatured: -1, isTrending: -1, createdAt: -1 })
    .limit(20)
    .lean();
}

// Fetch all active genres
async function fetchGenres() {
  const genres = await Genre.find(
    { isActive: true },
    {
      _id: 1,
      name: 1,
      slug: 1,
      description: 1,
      imageUrl: 1,
      color: 1,
      isFeatured: 1,
    },
  )
    .sort({ displayOrder: 1 })
    .lean();

  return genres.map((genre) => ({
    ...genre,
    color: genre.color || "0xFFE91E63",
  }));
}

export async function GET(request) {
  const { user } = await requireAuth(request);
  const userId = user?.userId || null;

  const [preferredLangs, bannerLanguages] = await Promise.all([
    getUserPreferredLanguages(request),
    getUserPreferredLanguages(request, { activeOnly: true }),
  ]);

  await dbConnect();
  const validSeriesSet = new Set(await getValidSeriesIds(preferredLangs));
  const filterValidContent = (list) =>
    (list || []).filter((item) => item.type !== 'series' || validSeriesSet.has(item._id?.toString()));

  const settled = await Promise.allSettled([
    getVisibleBanners(bannerLanguages),
    fetchTrending(preferredLangs),
    fetchBlockbusters(preferredLangs),
    fetchSeries(preferredLangs),
    fetchContinueWatching(userId, preferredLangs),
    fetchForYou(userId, preferredLangs),
    fetchGenres(),
  ]);

  const [
    banners,
    trending,
    blockbusters,
    series,
    continueWatching,
    forYou,
    genres,
  ] = settled.map((result) =>
    result.status === "fulfilled" ? result.value : [],
  );

  return Response.json({
    success: true,
    data: {
      banners,
      trending: filterValidContent(trending),
      blockbusters: filterValidContent(blockbusters),
      series: filterValidContent(series),
      continueWatching,
      forYou: filterValidContent(forYou),
      genres,
    },
  }, { headers: { 'Cache-Control': 'private, no-store' } });
}
