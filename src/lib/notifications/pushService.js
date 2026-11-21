import dbConnect from '@/lib/db';
import Device from '@/models/Device';

/**
 * Sends push notifications to a list of user IDs or FCM device tokens.
 * If Firebase credentials are not set in environment variables,
 * it runs in fallback mode and logs push notifications to the server console.
 *
 * @param {Object} options
 * @param {Array<string>} [options.userIds] Array of user ObjectIds
 * @param {Array<string>} [options.tokens] Array of FCM registration tokens
 * @param {string} options.title Notification title
 * @param {string} options.body Notification body text
 * @param {Object} [options.data] Payload metadata (deepLink, type, targetId, image, etc.)
 */
export async function sendPushNotification({ userIds = [], tokens = [], title, body, data = {} }) {
  try {
    await dbConnect();

    let targetTokens = [...tokens];

    // If userIds provided, fetch active fcmTokens for those users
    if (userIds.length > 0) {
      const devices = await Device.find(
        {
          userId: { $in: userIds },
          fcmToken: { $ne: null, $exists: true },
          isPushActive: true,
        },
        { fcmToken: 1, userId: 1 }
      ).lean();

      const userTokens = devices.map((d) => d.fcmToken).filter(Boolean);
      targetTokens = Array.from(new Set([...targetTokens, ...userTokens]));
    }

    if (!targetTokens.length) {
      console.log('[PushService] No active FCM tokens found for target audience.');
      return { success: true, deliveredCount: 0, mode: 'no_tokens' };
    }

    // Check if Firebase Service Account credentials exist in environment
    const hasFirebaseEnv = !!(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
      process.env.FIREBASE_CREDENTIALS ||
      process.env.NEXT_PUBLIC_FIREBASE_FCM_KEY
    );

    if (!hasFirebaseEnv) {
      console.log('---------------------------------------------------------');
      console.log('🔔 [PUSH NOTIFICATION MOCK DISPATCH] (Firebase Pending)');
      console.log(`Title: ${title}`);
      console.log(`Body: ${body}`);
      console.log(`Data:`, JSON.stringify(data, null, 2));
      console.log(`Target Tokens Count: ${targetTokens.length}`);
      console.log(`Tokens Sample:`, targetTokens.slice(0, 3));
      console.log('---------------------------------------------------------');

      return {
        success: true,
        deliveredCount: targetTokens.length,
        mode: 'mock',
        message: 'Dispatched in mock mode. Add FIREBASE_SERVICE_ACCOUNT_KEY to enable live FCM.',
      };
    }

    // If Firebase credentials are present, initialize firebase-admin dynamically
    try {
      const pkgName = 'firebase-admin';
      const firebaseAdmin = await import(/* webpackIgnore: true */ pkgName).catch(() => null);
      const admin = firebaseAdmin?.default || firebaseAdmin;

      if (!admin) {
        console.log('[PushService] firebase-admin is not installed. Running in mock mode.');
        return {
          success: true,
          deliveredCount: targetTokens.length,
          mode: 'mock',
        };
      }

      if (!admin.apps || !admin.apps.length) {
        const serviceAccount = JSON.parse(
          process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_CREDENTIALS || '{}'
        );
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      }

      const payload = {
        notification: {
          title,
          body,
          imageUrl: data.imageUrl || undefined,
        },
        data: Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, String(v ?? '')])
        ),
      };

      const response = await admin.messaging().sendEachForMulticast({
        tokens: targetTokens,
        ...payload,
      });

      // Cleanup invalid tokens if any failed
      if (response.failureCount > 0) {
        const invalidTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const errCode = resp.error?.code;
            if (
              errCode === 'messaging/registration-token-not-registered' ||
              errCode === 'messaging/invalid-registration-token'
            ) {
              invalidTokens.push(targetTokens[idx]);
            }
          }
        });

        if (invalidTokens.length > 0) {
          await Device.updateMany(
            { fcmToken: { $in: invalidTokens } },
            { $set: { fcmToken: null, isPushActive: false } }
          );
        }
      }

      return {
        success: true,
        deliveredCount: response.successCount,
        failedCount: response.failureCount,
        mode: 'fcm',
      };
    } catch (firebaseErr) {
      console.error('[PushService] Firebase FCM Error:', firebaseErr);
      return {
        success: false,
        error: firebaseErr.message,
        mode: 'fcm_error',
      };
    }
  } catch (err) {
    console.error('[PushService] Internal Error:', err);
    return { success: false, error: err.message };
  }
}
