import dbConnect from '@/lib/db';
import Content from '@/models/Content';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { sendPushNotification } from '@/lib/notifications/pushService';

/**
 * Dispatches a New Episode Alert notification to users who have this series in their Watch History or My List.
 *
 * @param {string} seriesId ObjectId of the series Content
 * @param {Object} episode Episode document or object
 */
export async function dispatchNewEpisodeNotification(seriesId, episode) {
  try {
    await dbConnect();

    const series = await Content.findById(seriesId, { title: 1, name: 1, posterUrl: 1 }).lean();
    const seriesTitle = series?.title || series?.name || 'Series';

    const epNum = episode.episodeNumber || 1;
    const epTitle = episode.title ? `: ${episode.title}` : '';

    const notificationTitle = `📺 New Episode Alert: ${seriesTitle}`;
    const notificationMessage = `Episode ${epNum}${epTitle} is now streaming! Watch now on TVK OTT.`;
    const deepLink = `/watch/${seriesId}?episodeId=${episode._id}`;
    const imageUrl = episode.thumbnailUrl || series?.posterUrl || '';

    // Find users who watched this series or added it to myList
    const seriesIdStr = seriesId.toString();
    const targetUsers = await User.find(
      {
        status: { $ne: 'suspended' },
        $or: [
          { 'watchHistory.contentId': seriesIdStr },
          { myList: seriesIdStr },
        ],
      },
      { _id: 1 }
    ).lean();

    if (!targetUsers.length) {
      console.log(`[EpisodeBroadcaster] No followers/viewers found for series ${seriesId}`);
      return { success: true, notifiedCount: 0 };
    }

    const userIds = targetUsers.map((u) => u._id.toString());

    // Insert In-App Notifications
    const docs = userIds.map((uId) => ({
      userId: uId,
      title: notificationTitle,
      message: notificationMessage,
      type: 'episode_release',
      targetId: seriesIdStr,
      deepLink,
      imageUrl,
      isRead: false,
      isCleared: false,
    }));

    await Notification.insertMany(docs);

    // Dispatch Push Notification
    const pushResult = await sendPushNotification({
      userIds,
      title: notificationTitle,
      body: notificationMessage,
      data: {
        type: 'episode_release',
        seriesId: seriesIdStr,
        episodeId: episode._id.toString(),
        deepLink,
        imageUrl,
      },
    });

    return {
      success: true,
      notifiedCount: userIds.length,
      pushResult,
    };
  } catch (err) {
    console.error('[EpisodeBroadcaster] Failed to send new episode notification:', err);
    return { success: false, error: err.message };
  }
}
