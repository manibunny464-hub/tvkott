import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import dbConnect from '@/lib/db';
import Device from '@/models/Device';
import User from '@/models/User';

export async function sendPushNotification({ userIds = [], tokens = [], title, body, data = {} }) {
  try {
    await dbConnect();
    const filter = { isPushActive: true, fcmToken: { $type: 'string', $ne: '' }, platform: { $in: ['android', 'ios'] } };
    if (userIds.length && tokens.length) filter.$or = [{ userId: { $in: userIds } }, { fcmToken: { $in: tokens } }];
    else if (userIds.length) filter.userId = { $in: userIds };
    else if (tokens.length) filter.fcmToken = { $in: tokens };
    else return { success: true, deliveredCount: 0, mode: 'no_tokens' };

    const devices = await Device.find(filter).select('userId deviceId fcmToken').lean();
    const users = await User.find({ _id: { $in: devices.map(device => device.userId) } })
      .select('activeDevices.deviceId').lean();
    const active = new Map(users.map(user => [String(user._id), new Set((user.activeDevices || []).map(device => device.deviceId))]));
    const targets = [...new Set(devices.filter(device => active.get(String(device.userId))?.has(device.deviceId))
      .map(device => device.fcmToken))];
    if (!targets.length) return { success: true, deliveredCount: 0, mode: 'no_tokens' };

    const credentials = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_CREDENTIALS;
    if (!credentials) return { success: true, deliveredCount: 0, mode: 'mock' };

    const app = getApps().find(item => item.name === 'tvk-push') ||
      initializeApp({ credential: cert(JSON.parse(credentials)) }, 'tvk-push');
    const messaging = getMessaging(app);
    let deliveredCount = 0;
    let failedCount = 0;
    for (let offset = 0; offset < targets.length; offset += 500) {
      const batch = targets.slice(offset, offset + 500);
      const result = await messaging.sendEachForMulticast({
        tokens: batch,
        notification: { title, body, imageUrl: data.imageUrl || undefined },
        data: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, String(value ?? '')])),
      });
      deliveredCount += result.successCount;
      failedCount += result.failureCount;
      const invalid = batch.filter((_, index) => [
        'messaging/registration-token-not-registered', 'messaging/invalid-registration-token',
      ].includes(result.responses[index]?.error?.code));
      if (invalid.length) {
        await Device.updateMany({ fcmToken: { $in: invalid } }, { $set: { fcmToken: null, isPushActive: false } });
      }
    }
    return { success: failedCount === 0, deliveredCount, failedCount, mode: 'fcm' };
  } catch (error) {
    console.error('[PushService] Dispatch failed:', error.code || error.name);
    return { success: false, deliveredCount: 0, mode: 'fcm_error' };
  }
}
