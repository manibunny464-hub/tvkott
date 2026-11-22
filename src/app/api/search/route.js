import dbConnect from "@/lib/db";
import { requireAuth } from "@/lib/authMiddleware";
import Content from "@/models/Content";
import Episode from "@/models/Episode";
import SearchHistory from "@/models/SearchHistory";
import TrendingSearch from "@/models/TrendingSearch";
import { getUserPreferredLanguages } from "@/lib/userLanguages";
import { getValidSeriesIds } from '@/lib/seriesFilter';

function escapeRegex(string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

export async function GET(request) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() ?? "";

    const preferredLangs = await getUserPreferredLanguages(request);

    await dbConnect();

    const contentMatch = {
      isActive: true,
      isDeleted: { $ne: true },
      $or: [
        { isComingSoon: { $ne: true } },
        { expectedReleaseDate: { $lte: new Date() } },
      ],
    };
    if (preferredLangs.length > 0) {
      contentMatch.language = { $in: preferredLangs };
    }

    if (!q) {
      const [rawRecent, rawTrending] = await Promise.all([
        SearchHistory.find(
          { userId: user.userId, contentId: { $exists: true, $ne: null } },
          { _id: 0, query: 1, searchedAt: 1, contentId: 1 },
        )
          .populate({
            path: "contentId",
            select: "_id title thumbnailUrl type genres rating language",
            match: contentMatch,
          })
          .sort({ searchedAt: -1 })
          .limit(30)
          .lean(),
        TrendingSearch.find({ isActive: true })
          .populate({
            path: "contentId",
            select: "_id title thumbnailUrl type genres rating language",
            match: contentMatch,
          })
          .sort({ count: -1 })
          .limit(50)
          .lean(),
      ]);

      const recent = [];
      const seenQueries = new Set();
      for (const item of rawRecent) {
        if (!item.contentId) continue;
        const queryText = item.contentId.title;
        const normalizedQuery = queryText.toLowerCase().trim();
        if (!seenQueries.has(normalizedQuery)) {
          seenQueries.add(normalizedQuery);
          recent.push({
            query: queryText,
            searchedAt: item.searchedAt,
            contentId: item.contentId,
          });
        }
      }
      const limitedRecent = recent.slice(0, 10);

      const trending = [];
      const seenContentIds = new Set();
      for (const t of rawTrending) {
        if (t.contentId && typeof t.contentId === "object") {
          const idStr = t.contentId._id.toString();
          if (!seenContentIds.has(idStr)) {
            seenContentIds.add(idStr);
            trending.push({
              _id: t.contentId._id,
              title: t.contentId.title,
              thumbnailUrl: t.contentId.thumbnailUrl,
              type: t.contentId.type,
              genres: t.contentId.genres,
              rating: t.contentId.rating,
              count: t.count || 1,
            });
          }
        }
      }

      // Return maximum of 10 unique trending items for search page empty state
      const limitedTrending = trending.slice(0, 10);

      return Response.json({
        success: true,
        recent: limitedRecent,
        trending: limitedTrending,
      });
    }

    // Regex-based search on Content and Episodes (Case Insensitive)
    const escapedQ = escapeRegex(q);

    // Find episodes matching title or description (Case Insensitive)
    const matchingEpisodes = await Episode.find(
      {
        $or: [
          { title: { $regex: escapedQ, $options: "i" } },
          { description: { $regex: escapedQ, $options: "i" } },
        ],
        isActive: true,
        isDeleted: { $ne: true },
      },
      { seriesId: 1, contentId: 1 },
    ).lean();

    const contentIdsFromEpisodes = matchingEpisodes
      .map((ep) => ep.seriesId || ep.contentId)
      .filter(Boolean);

    const queryObj = {
      $and: [
        {
          $or: [
            { _id: { $in: contentIdsFromEpisodes } },
            { title: { $regex: escapedQ, $options: "i" } },
            { genres: { $regex: escapedQ, $options: "i" } },
            { "cast.actors.name": { $regex: escapedQ, $options: "i" } },
            { "cast.directors.name": { $regex: escapedQ, $options: "i" } },
            { "cast.writers.name": { $regex: escapedQ, $options: "i" } },
          ],
        },
        {
          $or: [
            { isComingSoon: { $ne: true } },
            { expectedReleaseDate: { $lte: new Date() } },
          ],
        },
      ],
      isActive: true,
      isDeleted: { $ne: true },
    };

    if (preferredLangs.length > 0) {
      queryObj.language = { $in: preferredLangs };
    }

    const results = await Content.find(queryObj, {
      _id: 1,
      title: 1,
      thumbnailUrl: 1,
      type: 1,
      genres: 1,
      rating: 1,
    })
      .limit(20)
      .lean();

    // Fire-and-forget: save search query to SearchHistory (skip duplicates within 24 hours)
    (async () => {
      try {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const existingHistory = await SearchHistory.findOne({
          userId: user.userId,
          query: q,
          searchedAt: { $gte: oneDayAgo },
        });
        if (!existingHistory) {
          await SearchHistory.create({
            userId: user.userId,
            query: q,
            searchedAt: new Date(),
          });
        }
      } catch (err) {
        console.error("Failed to save search history:", err);
      }
    })();

    const validSeriesSet = new Set(await getValidSeriesIds());
    const filteredResults = results.filter(
      (item) => item.type !== 'series' || validSeriesSet.has(item._id.toString())
    );

    // Fire-and-forget: upsert TrendingSearch and store contentId of top result
    (async () => {
      try {
        const topResult = filteredResults[0];
        const updateData = { $inc: { count: 1 } };
        if (topResult) {
          updateData.$set = { contentId: topResult._id };
        }
        await TrendingSearch.updateOne({ query: q }, updateData, {
          upsert: true,
        });
      } catch (err) {
        console.error("Failed to update trending search:", err);
      }
    })();

    return Response.json({ success: true, results: filteredResults });
  } catch (err) {
    console.error("Search failed:", err);
    return Response.json(
      { success: false, message: "Search failed" },
      { status: 500 },
    );
  }
}
