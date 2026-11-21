import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';
import User from '@/models/User';
import Content from '@/models/Content';
import Episode from '@/models/Episode';
import Season from '@/models/Season';

export async function GET(request) {
  const { success, user, message } = await requireAuth(request);
  if (!success) {
    return Response.json({ success: false, message }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get('page')) || 1, 1);
    const limit = Math.min(parseInt(searchParams.get('limit')) || 20, 50);
    const skip = (page - 1) * limit;

    await dbConnect();

    const userId = new mongoose.Types.ObjectId(user.userId);

    // Aggregate to sort and paginate the embedded watchHistory array
    const [result] = await User.aggregate([
      { $match: { _id: userId } },
      { $project: { watchHistory: 1 } },
      { $unwind: '$watchHistory' },
      { $sort: { 'watchHistory.watchedAt': -1 } },
      {
        $facet: {
          total: [{ $count: 'count' }],
          entries: [{ $skip: skip }, { $limit: limit }, { $replaceRoot: { newRoot: '$watchHistory' } }],
        },
      },
    ]);

    const total = result?.total?.[0]?.count ?? 0;
    const entries = result?.entries ?? [];
    const totalPages = Math.ceil(total / limit);

    if (entries.length === 0) {
      return Response.json({ success: true, history: [], page, totalPages: 0 });
    }

    // Collect unique IDs for batch lookups
    const contentIds = [...new Set(entries.map((e) => e.contentId).filter(Boolean))];
    const episodeIds = [...new Set(entries.map((e) => e.episodeId).filter(Boolean))];

    const [contents, episodes] = await Promise.all([
      Content.find(
        { _id: { $in: contentIds } },
        { _id: 1, title: 1, thumbnailUrl: 1, type: 1 }
      ).lean(),
      episodeIds.length > 0
        ? Episode.find(
            { _id: { $in: episodeIds } },
            { _id: 1, episodeNumber: 1, season: 1, seasonId: 1, title: 1 }
          ).lean()
        : Promise.resolve([]),
    ]);

    const seasonIds = [...new Set(episodes.map((ep) => ep.seasonId).filter(Boolean))];
    const seasons = seasonIds.length > 0
      ? await Season.find({ _id: { $in: seasonIds } }, { _id: 1, seasonNumber: 1 }).lean()
      : [];
    const seasonMap = Object.fromEntries(
      seasons.map((s) => [s._id.toString(), s.seasonNumber])
    );

    const contentMap = Object.fromEntries(contents.map((c) => [c._id.toString(), c]));
    const episodeMap = Object.fromEntries(
      episodes.map((e) => {
        const seasonNumber = e.season !== undefined && e.season !== null && e.season !== ''
          ? e.season
          : (e.seasonId ? seasonMap[e.seasonId.toString()] : null);
        return [
          e._id.toString(),
          { ...e, season: seasonNumber }
        ];
      })
    );

    const history = entries.map((e) => ({
      contentId: e.contentId,
      episodeId: e.episodeId ?? null,
      watchedSeconds: e.watchedSeconds,
      totalSeconds: e.totalSeconds,
      progress: e.progress,
      watchedAt: e.watchedAt,
      content: contentMap[e.contentId] ?? null,
      episode: e.episodeId ? (episodeMap[e.episodeId] ?? null) : null,
    }));

    return Response.json({ success: true, history, page, totalPages });
  } catch (err) {
    return Response.json(
      { success: false, message: 'Failed to fetch watch history' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const { success, user, message } = await requireAuth(request);
  if (!success) {
    return Response.json({ success: false, message }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');

    await dbConnect();

    if (contentId) {
      await User.updateOne(
        { _id: user.userId },
        { $pull: { watchHistory: { contentId } } }
      );
    } else {
      await User.updateOne(
        { _id: user.userId },
        { $set: { watchHistory: [] } }
      );
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { success: false, message: 'Failed to clear watch history' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const { success, user, message } = await requireAuth(request);
  if (!success) {
    return Response.json({ success: false, message }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { contentId, episodeId, watchedSeconds, totalSeconds } = body;

    if (!contentId || typeof watchedSeconds !== 'number' || typeof totalSeconds !== 'number') {
      return Response.json(
        { success: false, message: 'contentId, watchedSeconds, and totalSeconds are required' },
        { status: 400 }
      );
    }

    if (totalSeconds <= 0) {
      return Response.json(
        { success: false, message: 'totalSeconds must be greater than 0' },
        { status: 400 }
      );
    }

    const progress = Math.min(Math.round((watchedSeconds / totalSeconds) * 100), 100);

    const entry = {
      contentId,
      episodeId: episodeId ?? null,
      watchedSeconds,
      totalSeconds,
      progress,
      watchedAt: new Date(),
    };

    await dbConnect();

    // Remove any existing entry for this content+episode, then insert fresh
    await User.updateOne(
      { _id: user.userId },
      { $pull: { watchHistory: { contentId, episodeId: episodeId ?? null } } }
    );

    await User.updateOne(
      { _id: user.userId },
      { $push: { watchHistory: { $each: [entry], $position: 0 } } }
    );

    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { success: false, message: 'Failed to update watch progress' },
      { status: 500 }
    );
  }
}
