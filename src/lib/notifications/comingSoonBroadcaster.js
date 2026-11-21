import dbConnect from '@/lib/db';
import ComingSoon from '@/models/ComingSoon';
import Notification from '@/models/Notification';
import { sendPushNotification } from '@/lib/notifications/pushService';

/**
 * Dispatches release notifications to all users who opted in via "Notify Me" for a Coming Soon item.
 * Creates In-App Notification records and dispatches Push Notifications via pushService.
 *
 * @param {string} comingSoonId ID of the ComingSoon document
 * @param {Object} [customPayload] Optional custom title/message overrides
 * @returns {Promise<{ success: boolean, notifiedCount: number, pushResult: Object }>}
 */
export async function dispatchComingSoonReleaseNotification(comingSoonId, customPayload = {}) {
  await dbConnect();

  const item = await ComingSoon.findById(comingSoonId).lean();
  if (!item) {
    throw new Error('Coming Soon item not found');
  }

  const registeredUsers = item.notifyUsers || [];
  if (!registeredUsers.length) {
    return {
      success: true,
      notifiedCount: 0,
      message: 'No users registered for notification on this title',
    };
  }

  const userIds = Array.from(new Set(registeredUsers.map((u) => u.userId.toString())));

  const title = customPayload.title || `🎬 ${item.title} is Now Streaming!`;
  const message =
    customPayload.message ||
    `Great news! ${item.title} is now available on Chiripi. Tap to watch now!`;
  const targetId = item.linkedContentId ? item.linkedContentId.toString() : item._id.toString();
  const deepLink = item.linkedContentId ? `/content/${item.linkedContentId}` : `/coming-soon/${item._id}`;
  const imageUrl = item.bannerUrl || item.posterUrl || item.thumbnailUrl || '';

  // 1. Create In-App Notifications for all registered users (checking duplicates)
  const existingNotifications = await Notification.find(
    {
      userId: { $in: userIds },
      comingSoonId: item._id,
      type: 'coming_soon',
    },
    { userId: 1 }
  ).lean();

  const existingUserSet = new Set(existingNotifications.map((n) => n.userId.toString()));
  const newTargetUserIds = userIds.filter((id) => !existingUserSet.has(id));

  if (newTargetUserIds.length > 0) {
    const notificationDocs = newTargetUserIds.map((uId) => ({
      userId: uId,
      comingSoonId: item._id,
      title,
      message,
      type: 'coming_soon',
      targetId,
      deepLink,
      imageUrl,
      isRead: false,
      isCleared: false,
    }));

    await Notification.insertMany(notificationDocs);
  }

  // 2. Dispatch Push Notification via pushService
  const pushResult = await sendPushNotification({
    userIds,
    title,
    body: message,
    data: {
      type: 'coming_soon',
      comingSoonId: item._id.toString(),
      targetId,
      deepLink,
      imageUrl,
    },
  });

  // 3. Update lastNotifiedAt timestamp on ComingSoon item
  await ComingSoon.findByIdAndUpdate(item._id, {
    $set: { lastNotifiedAt: new Date() },
  });

  return {
    success: true,
    notifiedCount: userIds.length,
    newInAppCount: newTargetUserIds.length,
    pushResult,
  };
}
