import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';
import User from '@/models/User';
import Content from '@/models/Content';

export async function GET(request) {
  const { success, user, message } = await requireAuth(request);
  if (!success) {
    return Response.json({ success: false, message }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');

    await dbConnect();

    const userId = new mongoose.Types.ObjectId(user.userId);

    if (contentId) {
      const entries = await User.aggregate([
        { $match: { _id: userId } },
        { $unwind: '$watchHistory' },
        { $match: { 'watchHistory.contentId': contentId } },
        { $sort: { 'watchHistory.watchedAt': -1 } },
        { $replaceRoot: { newRoot: '$watchHistory' } },
        { $project: { episodeId: 1, watchedSeconds: 1, progress: 1 } },
      ]);

      return Response.json({ success: true, progress: entries });
    }

    // No contentId — return last 20 across all content
    const entries = await User.aggregate([
      { $match: { _id: userId } },
      { $unwind: '$watchHistory' },
      { $sort: { 'watchHistory.watchedAt': -1 } },
      { $limit: 20 },
      { $replaceRoot: { newRoot: '$watchHistory' } },
    ]);

    const uniqueContentIds = [...new Set(entries.map((e) => e.contentId))];
    const contents = await Content.find(
      { _id: { $in: uniqueContentIds } },
      { title: 1, thumbnailUrl: 1 }
    ).lean();

    const contentMap = Object.fromEntries(contents.map((c) => [c._id.toString(), c]));

    const history = entries.map((e) => ({
      contentId: e.contentId,
      episodeId: e.episodeId ?? null,
      watchedSeconds: e.watchedSeconds,
      totalSeconds: e.totalSeconds,
      progress: e.progress,
      watchedAt: e.watchedAt,
      title: contentMap[e.contentId]?.title ?? null,
      thumbnailUrl: contentMap[e.contentId]?.thumbnailUrl ?? null,
    }));

    return Response.json({ success: true, history });
  } catch (err) {
    return Response.json(
      { success: false, message: 'Failed to fetch watch history' },
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

    if (!contentId || typeof contentId !== 'string' || typeof watchedSeconds !== 'number' || typeof totalSeconds !== 'number') {
      return Response.json(
        { success: false, message: 'Valid contentId, watchedSeconds, and totalSeconds are required' },
        { status: 400 }
      );
    }

    if (episodeId && typeof episodeId !== 'string') {
      return Response.json(
        { success: false, message: 'episodeId must be a valid string' },
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
