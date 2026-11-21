import dbConnect from '@/lib/db';
import User from '@/models/User';
import Notification from '@/models/Notification';
import AdminNotification from '@/models/AdminNotification';

export async function dispatchAdminNotification(adminNoti) {
  if (!adminNoti || !adminNoti._id) return 0;

  await dbConnect();
  const now = new Date();
  let userQuery = { status: { $ne: 'suspended' } };

  const audience = adminNoti.audience || 'all';
  if (audience === 'subscribed' || audience === 'premium') {
    userQuery = {
      status: { $ne: 'suspended' },
      isPremium: true,
      premiumExpiry: { $gt: now },
    };
  } else if (audience === 'non-subscribed' || audience === 'free') {
    userQuery = {
      status: { $ne: 'suspended' },
      $or: [
        { isPremium: { $ne: true } },
        { premiumExpiry: { $lte: now } },
        { premiumExpiry: null },
      ],
    };
  }

  const targetUsers = await User.find(userQuery, { _id: 1 }).lean();
  if (!targetUsers.length) {
    await AdminNotification.findByIdAndUpdate(adminNoti._id, {
      status: 'sent',
      sentAt: adminNoti.sentAt || new Date(),
      deliveryCount: 0,
    });
    return 0;
  }

  const existingDelivered = await Notification.find(
    { adminNotificationId: adminNoti._id },
    { userId: 1 }
  ).lean();
  const existingSet = new Set(existingDelivered.map((n) => n.userId.toString()));
  const newUsers = targetUsers.filter((u) => !existingSet.has(u._id.toString()));

  if (newUsers.length > 0) {
    const docs = newUsers.map((u) => ({
      userId: u._id,
      adminNotificationId: adminNoti._id,
      title: adminNoti.title,
      message: adminNoti.message,
      audience: adminNoti.audience,
      type: 'broadcast',
    }));
    await Notification.insertMany(docs);

    // Trigger Push Notification for newly notified users
    const newUserIds = newUsers.map((u) => u._id.toString());
    await import('@/lib/notifications/pushService').then(({ sendPushNotification }) =>
      sendPushNotification({
        userIds: newUserIds,
        title: adminNoti.title,
        body: adminNoti.message,
        data: {
          type: 'broadcast',
          adminNotificationId: adminNoti._id.toString(),
        },
      })
    ).catch((e) => console.error('[Broadcaster] Push send error:', e));
  }

  const totalDelivered = existingSet.size + newUsers.length;
  await AdminNotification.findByIdAndUpdate(adminNoti._id, {
    status: 'sent',
    sentAt: adminNoti.sentAt || new Date(),
    deliveryCount: totalDelivered,
  });

  return totalDelivered;
}
