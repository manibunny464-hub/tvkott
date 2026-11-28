export const ALLOWED_VIDEO_QUALITIES = ['480p', '720p', '1080p', '4K'];

export const QUALITY_HIERARCHY = {
  '360p': 1,
  '480p': 2,
  '720p': 3,
  '1080p': 4,
  '4K': 5,
  '4k': 5,
};

export const DEFAULT_PLAN_FEATURES = {
  adsFree: false,
  premiumContentAccess: true,
  offlineDownloads: false,
  videoQuality: '1080p',
  tvAccess: false,
  simultaneousDevices: 1,
  monthlyDownloadLimit: 0, // 0 = unlimited
};

export const DEFAULT_FREE_ENTITLEMENTS = {
  adsFree: false,
  premiumContentAccess: false,
  offlineDownloads: false,
  videoQuality: '480p',
  tvAccess: false,
  simultaneousDevices: 1,
  monthlyDownloadLimit: 0,
};

/**
 * Validates and sanitizes plan feature configurations.
 * Throws an Error if validation fails.
 */
export function validatePlanFeatures(inputFeatures = {}) {
  const features = { ...DEFAULT_PLAN_FEATURES, ...inputFeatures };

  // 1. Boolean validations
  if (typeof features.adsFree !== 'boolean') {
    features.adsFree = Boolean(features.adsFree);
  }
  if (typeof features.premiumContentAccess !== 'boolean') {
    features.premiumContentAccess = Boolean(features.premiumContentAccess);
  }
  if (typeof features.offlineDownloads !== 'boolean') {
    features.offlineDownloads = Boolean(features.offlineDownloads);
  }

  features.tvAccess = features.tvAccess === true;

  // 2. Enum: videoQuality
  const normalizedQuality = String(features.videoQuality || '1080p').toUpperCase() === '4K'
    ? '4K'
    : String(features.videoQuality || '1080p').toLowerCase();

  if (!ALLOWED_VIDEO_QUALITIES.includes(normalizedQuality)) {
    throw new Error(
      `Invalid videoQuality "${features.videoQuality}". Allowed values: ${ALLOWED_VIDEO_QUALITIES.join(', ')}`
    );
  }
  features.videoQuality = normalizedQuality;

  // 3. Number: simultaneousDevices
  const devices = Number(features.simultaneousDevices);
  if (isNaN(devices) || devices < 1 || devices > 10) {
    throw new Error('simultaneousDevices must be a number between 1 and 10');
  }
  features.simultaneousDevices = Math.floor(devices);

  // 4. Number: monthlyDownloadLimit
  const dlLimit = Number(features.monthlyDownloadLimit);
  if (isNaN(dlLimit) || dlLimit < 0) {
    throw new Error('monthlyDownloadLimit must be a non-negative number (0 for unlimited)');
  }
  features.monthlyDownloadLimit = Math.floor(dlLimit);

  return features;
}
