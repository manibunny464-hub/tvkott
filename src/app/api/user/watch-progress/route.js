import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';
import User from '@/models/User';
import Episode from '@/models/Episode';

export async function POST(request) {
  const { success, user, message, error } = await requireAuth(request);
  if (!success) {
    return error || Response.json({ success: false, message }, { status: 401 });
  }

  try {
    const { episodeId, timestamp, percentage } = await request.json();

    if (!episodeId || timestamp === undefined || percentage === undefined) {
      return Response.json(
        { success: false, message: 'episodeId, timestamp, and percentage are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Fetch Episode details to find seriesId and duration
    const episode = await Episode.findById(episodeId).lean();
    if (!episode) {
      return Response.json(
        { success: false, message: 'Episode not found' },
        { status: 404 }
      );
    }

    const contentId = episode.seriesId.toString();

    // Normalize percentage to a 0-100 range
    let progressVal = Number(percentage);
    if (progressVal <= 1 && progressVal > 0) {
      progressVal = Math.round(progressVal * 100);
    } else {
      progressVal = Math.round(progressVal);
    }
    progressVal = Math.min(Math.max(progressVal, 0), 100);

    const watchedSeconds = Math.round(Number(timestamp));
    
    // Estimate total seconds from duration, fallback to estimating from percentage or defaulting to 300
    let totalSeconds = episode.duration;
    if (!totalSeconds || totalSeconds <= 0) {
      if (progressVal > 0) {
        totalSeconds = Math.round((watchedSeconds / progressVal) * 100);
      } else {
        totalSeconds = 300; // default 5 minutes
      }
    }

    const entry = {
      contentId,
      episodeId: episode._id.toString(),
      watchedSeconds,
      totalSeconds,
      progress: progressVal,
      watchedAt: new Date(),
    };

    // Remove any existing entry for this content+episode, then insert fresh
    await User.updateOne(
      { _id: user.userId },
      { $pull: { watchHistory: { contentId, episodeId: episode._id.toString() } } }
    );

    await User.updateOne(
      { _id: user.userId },
      { $push: { watchHistory: { $each: [entry], $position: 0 } } }
    );

    return Response.json({ success: true });
  } catch (err) {
    console.error('[/api/user/watch-progress] Error:', err);
    return Response.json(
      { success: false, message: err.message || 'Failed to update watch progress' },
      { status: 500 }
    );
  }
}
