import dbConnect from '../db.js';
import Subscription from '../../models/Subscription.js';
import SubscriptionPlan from '../../models/SubscriptionPlan.js';
import Device from '../../models/Device.js';
import User from '../../models/User.js';
import Download from '../../models/Download.js';
import {
  DEFAULT_FREE_ENTITLEMENTS,
  DEFAULT_PLAN_FEATURES,
  QUALITY_HIERARCHY,
  validatePlanFeatures,
} from './featureValidator.js';

/**
 * Resolves the real-time entitlements for a user based on their current active subscription.
 * Real-time verification ensures that expired subscriptions are immediately denied,
 * even before cron jobs have executed.
 */
export async function getUserEntitlements(userId) {
  if (!userId) {
    return {
      hasActiveSubscription: false,
      isPremium: false,
      features: { ...DEFAULT_FREE_ENTITLEMENTS },
      planId: null,
      planName: null,
      planVersion: null,
      startDate: null,
      endDate: null,
      subscriptionId: null,
    };
  }

  await dbConnect();
  const now = new Date();

  // Find the active subscription that has not expired
  const activeSub = await Subscription.findOne({
    userId,
    status: 'active',
    endDate: { $gt: now },
  })
    .sort({ endDate: -1 })
    .populate('planId')
    .lean();

  if (!activeSub) {
    return {
      hasActiveSubscription: false,
      isPremium: false,
      features: { ...DEFAULT_FREE_ENTITLEMENTS },
      planId: null,
      planName: null,
      planVersion: null,
      startDate: null,
      endDate: null,
      subscriptionId: null,
    };
  }

  // 1. Resolve features: prioritize purchase-time snapshot (grandfathered)
  // 2. Fall back to live plan features if snapshot is not present
  // 3. Fall back to default plan features
  let rawFeatures = activeSub.featuresSnapshot;
  if (!rawFeatures && activeSub.planId?.features) {
    rawFeatures = activeSub.planId.features;
  }

  let features;
  try {
    features = validatePlanFeatures(rawFeatures || DEFAULT_PLAN_FEATURES);
  } catch {
    features = { ...DEFAULT_PLAN_FEATURES };
  }

  return {
    hasActiveSubscription: true,
    isPremium: true,
    features,
    planId: activeSub.planId?._id || activeSub.planId,
    planName: activeSub.planId?.name || 'Premium Plan',
    planVersion: activeSub.planVersion || activeSub.planId?.version || 1,
    startDate: activeSub.startDate,
    endDate: activeSub.endDate,
    subscriptionId: activeSub._id,
  };
}

/**
 * Checks whether a requested video quality is permitted under the allowed max quality.
 */
export function isQualityAllowed(allowedQuality, requestedQuality) {
  if (!requestedQuality) return true;
  const allowedRank = QUALITY_HIERARCHY[String(allowedQuality)] || QUALITY_HIERARCHY['1080p'];
  const requestedRank = QUALITY_HIERARCHY[String(requestedQuality)] || 1;
  return requestedRank <= allowedRank;
}

/**
 * Filters or marks qualities in a qualities array based on maximum permitted video quality.
 */
export function filterQualitiesForEntitlement(qualitiesList = [], maxAllowedQuality = '1080p') {
  const allowedRank = QUALITY_HIERARCHY[String(maxAllowedQuality)] || QUALITY_HIERARCHY['1080p'];

  return qualitiesList.map((item) => {
    const qRank = QUALITY_HIERARCHY[item.quality] || 1;
    const isPermitted = qRank <= allowedRank;

    return {
      ...item,
      enabled: item.enabled && isPermitted,
      isPermittedByPlan: isPermitted,
      planMaxQuality: maxAllowedQuality,
    };
  });
}

/**
 * Checks if the user has reached their monthly download quota.
 * 0 = unlimited.
 */
export async function checkMonthlyDownloadQuota(userId, monthlyLimit = 0) {
  if (!monthlyLimit || monthlyLimit <= 0) {
    return {
      allowed: true,
      currentDownloads: 0,
      limit: 0,
      remaining: -1, // unlimited
    };
  }

  await dbConnect();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const count = await Download.countDocuments({
    userId,
    downloadedAt: { $gte: startOfMonth },
    status: 'completed',
  });

  const allowed = count < monthlyLimit;
  const remaining = Math.max(0, monthlyLimit - count);

  return {
    allowed,
    currentDownloads: count,
    limit: monthlyLimit,
    remaining,
  };
}

export async function enforceDeviceSession(userId, deviceId, deviceName, maxDevices, sessionId, refresh = {}) {
  await dbConnect();
  const now = new Date();
  const cutoff = new Date(now.getTime() - 30 * 86400000);
  const updated = await User.findOneAndUpdate({ _id: userId }, [
    { $set: { activeDevices: { $filter: {
      input: { $ifNull: ['$activeDevices', []] },
      as: 'device',
      cond: { $gt: ['$$device.lastActiveAt', cutoff] },
    } } } },
    { $set: { activeDevices: { $let: {
      vars: { other: { $filter: {
        input: '$activeDevices', as: 'device',
        cond: { $ne: ['$$device.deviceId', { $literal: deviceId }] },
      } } },
      in: { $concatArrays: [
        { $cond: [{ $gte: [{ $size: '$$other' }, maxDevices] }, [], '$$other'] },
        { $literal: [{ deviceId, deviceName, sessionId, lastActiveAt: now, ...refresh }] },
      ] },
    } }, currentDeviceId: { $literal: deviceId } } },
  ], { updatePipeline: true, new: true, projection: { activeDevices: 1 } }).lean();
  if (updated) {
    await Device.updateMany(
      { userId, deviceId: { $nin: updated.activeDevices.map(device => device.deviceId) }, updatedAt: { $lte: now } },
      { $set: { fcmToken: null, isPushActive: false } },
    ).catch(error => console.error('[Device session] Push registration cleanup failed:', error.code || error.name));
  }
  return { success: Boolean(updated) };
}
