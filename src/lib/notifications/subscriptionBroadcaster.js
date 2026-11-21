import dbConnect from '@/lib/db';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { sendPushNotification } from '@/lib/notifications/pushService';

/**
 * Dispatches a notification for successful payment / subscription activation.
 */
export async function dispatchPaymentSuccessNotification(userId, planName, expiryDate) {
  try {
    await dbConnect();
    const formattedExpiry = new Date(expiryDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const title = `🎉 Welcome to ${planName || 'Premium'}!`;
    const message = `Your subscription is active until ${formattedExpiry}. Enjoy ad-free HD streaming!`;
    const deepLink = '/profile/subscription';

    await Notification.create({
      userId,
      title,
      message,
      type: 'subscription',
      deepLink,
      isRead: false,
    });

    await sendPushNotification({
      userIds: [userId.toString()],
      title,
      body: message,
      data: { type: 'subscription', deepLink },
    });
  } catch (err) {
    console.error('[SubscriptionBroadcaster] Payment success error:', err);
  }
}

/**
 * Checks for users whose subscription expires in 3 days or 1 day and dispatches expiry warnings,
 * as well as notifying users whose subscription has expired today.
 */
export async function checkAndDispatchSubscriptionExpiries() {
  try {
    await dbConnect();
    const now = new Date();

    // 1. Check 3-day expiry warning (between 3 days and 2 days 23 hrs)
    const in3DaysStart = new Date(now.getTime() + 71 * 60 * 60 * 1000);
    const in3DaysEnd = new Date(now.getTime() + 73 * 60 * 60 * 1000);

    const expiring3DaysUsers = await User.find(
      {
        status: { $ne: 'suspended' },
        isPremium: true,
        premiumExpiry: { $gte: in3DaysStart, $lte: in3DaysEnd },
      },
      { _id: 1 }
    ).lean();

    for (const u of expiring3DaysUsers) {
      const uId = u._id.toString();
      const existing = await Notification.findOne({
        userId: u._id,
        type: 'subscription',
        title: { $regex: /Expiring Soon/i },
        createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      });

      if (!existing) {
        const title = '⏳ Plan Expiring Soon';
        const message = 'Your premium subscription expires in 3 days. Renew now to keep watching uninterrupted.';
        const deepLink = '/subscription';

        await Notification.create({
          userId: u._id,
          title,
          message,
          type: 'subscription',
          deepLink,
        });

        await sendPushNotification({
          userIds: [uId],
          title,
          body: message,
          data: { type: 'subscription', deepLink },
        });
      }
    }

    // 2. Check 1-day expiry warning
    const in1DayStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const in1DayEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const expiring1DayUsers = await User.find(
      {
        status: { $ne: 'suspended' },
        isPremium: true,
        premiumExpiry: { $gte: in1DayStart, $lte: in1DayEnd },
      },
      { _id: 1 }
    ).lean();

    for (const u of expiring1DayUsers) {
      const uId = u._id.toString();
      const existing = await Notification.findOne({
        userId: u._id,
        type: 'subscription',
        title: { $regex: /Last Chance/i },
        createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      });

      if (!existing) {
        const title = '⚠️ Last Chance to Renew!';
        const message = 'Your premium access expires tomorrow. Renew today to avoid interruption.';
        const deepLink = '/subscription';

        await Notification.create({
          userId: u._id,
          title,
          message,
          type: 'subscription',
          deepLink,
        });

        await sendPushNotification({
          userIds: [uId],
          title,
          body: message,
          data: { type: 'subscription', deepLink },
        });
      }
    }
  } catch (err) {
    console.error('[SubscriptionBroadcaster] Check expiries error:', err);
  }
}

/**
 * Dispatches expired subscription alert for a user whose plan just lapsed.
 */
export async function dispatchSubscriptionExpiredNotification(userId) {
  try {
    await dbConnect();
    const title = '❌ Subscription Expired';
    const message = 'Your plan has expired. Upgrade to Premium to continue unlimited streaming.';
    const deepLink = '/subscription';

    await Notification.create({
      userId,
      title,
      message,
      type: 'subscription',
      deepLink,
    });

    await sendPushNotification({
      userIds: [userId.toString()],
      title,
      body: message,
      data: { type: 'subscription', deepLink },
    });
  } catch (err) {
    console.error('[SubscriptionBroadcaster] Expired notify error:', err);
  }
}
