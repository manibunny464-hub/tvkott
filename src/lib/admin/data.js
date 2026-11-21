import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import AdminSetting from '@/models/AdminSetting';
import Content from '@/models/Content';
import Genre from '@/models/Genre';
import Subscription from '@/models/Subscription';
import SubscriptionPlan from '@/models/SubscriptionPlan';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import Season from '@/models/Season';
import Episode from '@/models/Episode';
import Device from '@/models/Device';
import { defaultAdminSettings } from '@/lib/admin/defaults';

const moneyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function serialize(value) {
  return JSON.parse(JSON.stringify(value));
}

export function formatMoney(value = 0) {
  return moneyFormatter.format(value);
}

export function getVideoStatus(content) {
  if (content.transcodingStatus === 'failed') return 'Failed';
  if (content.transcodingStatus === 'processing') return 'Processing';
  if (content.transcodingStatus === 'thumbnails') return 'Generating Thumbnails';
  if (content.transcodingStatus === 'uploading') return 'Uploading';
  if (content.transcodingStatus === 'queued') return 'Processing';
  return content.isActive ? 'Live' : 'Failed';
}

export function normalizeVideo(content, views = 0) {
  return {
    id: content._id.toString(),
    title: content.title,
    description: content.description || '',
    thumbnailUrl: content.thumbnailUrl || content.bannerUrl || '',
    bannerUrl: content.bannerUrl || '',
    duration: content.duration || 0,
    category: content.genres?.[0] || content.type || 'General',
    genres: content.genres || [],
    language: content.language || [],
    type: content.type,
    pricing: content.pricing || 'free',
    status: getVideoStatus(content),
    uploadDate: content.createdAt,
    updatedAt: content.updatedAt,
    views,
    tags: content.tags || [],
    isFeatured: Boolean(content.isFeatured),
    isTrending: Boolean(content.isTrending),
    scheduledPublishAt: content.scheduledPublishAt || null,
    transcodingStatus: content.transcodingStatus || 'queued',
    hlsManifestUrl: content.hlsManifestUrl || '',
    videoSource: content.videoSource || {},
    renditions: content.renditions || [],
  };
}

function getStartOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getLastNDays(days) {
  const today = getStartOfDay(new Date());
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - index));
    return date;
  });
}

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(key) {
  const [year, month] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('en', { month: 'short' }).format(
    new Date(year, month - 1, 1)
  );
}

async function getViewsByContentIds(contentIds) {
  if (contentIds.length === 0) return new Map();

  const rows = await User.aggregate([
    { $unwind: '$watchHistory' },
    { $match: { 'watchHistory.contentId': { $in: contentIds } } },
    { $group: { _id: '$watchHistory.contentId', views: { $sum: 1 } } },
  ]);

  return new Map(rows.map((row) => [String(row._id), row.views]));
}

let cachedMasterSettings = null;
let cachedMasterSettingsExpiry = 0;
const SETTINGS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function invalidateMasterSettingsCache() {
  cachedMasterSettings = null;
  cachedMasterSettingsExpiry = 0;
}

export async function getMasterSettings() {
  const now = Date.now();
  if (cachedMasterSettings && now < cachedMasterSettingsExpiry) {
    return cachedMasterSettings;
  }

  await dbConnect();
  let settings = await AdminSetting.findOne({ key: 'master-app-settings' }).lean();
  if (!settings) {
    settings = await AdminSetting.findOneAndUpdate(
      { key: 'master-app-settings' },
      {
        $setOnInsert: {
          ...defaultAdminSettings,
          storage: {
            ...defaultAdminSettings.storage,
            bucket: process.env.S3_BUCKET_NAME || '',
            region: process.env.AWS_REGION || '',
            cdnUrl: process.env.CDN_URL || '',
          },
        },
      },
      { upsert: true, returnDocument: 'after' }
    ).lean();
  }

  const serialized = serialize(settings);
  cachedMasterSettings = serialized;
  cachedMasterSettingsExpiry = now + SETTINGS_CACHE_TTL;
  return serialized;
}

export function sanitizeSettingsPayload(payload) {
  const isHex = (value) =>
    typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);
  const theme = payload.theme || {};

  return {
    platformName: String(payload.platformName || 'Chirpii Admin').trim(),
    tagline: String(payload.tagline || '').trim(),
    logoUrl: String(payload.logoUrl || '').trim(),
    faviconUrl: String(payload.faviconUrl || '').trim(),
    timezone: String(payload.timezone || 'Asia/Kolkata').trim(),
    playStoreUrl: String(payload.playStoreUrl || defaultAdminSettings.playStoreUrl || 'https://play.google.com/store/apps/details?id=com.chirpii.app').trim(),
    theme: {
      primary: isHex(theme.primary) ? theme.primary : defaultAdminSettings.theme.primary,
      accent: isHex(theme.accent) ? theme.accent : defaultAdminSettings.theme.accent,
      warning: isHex(theme.warning) ? theme.warning : defaultAdminSettings.theme.warning,
      background: isHex(theme.background)
        ? theme.background
        : defaultAdminSettings.theme.background,
      surface: isHex(theme.surface) ? theme.surface : defaultAdminSettings.theme.surface,
      foreground: isHex(theme.foreground)
        ? theme.foreground
        : defaultAdminSettings.theme.foreground,
      muted: isHex(theme.muted) ? theme.muted : defaultAdminSettings.theme.muted,
      radius: Math.min(16, Math.max(4, Number(theme.radius || 8))),
    },
    storage: {
      provider: payload.storage?.provider || 'aws-s3',
      bucket: payload.storage?.bucket || process.env.S3_BUCKET_NAME || '',
      region: payload.storage?.region || process.env.AWS_REGION || '',
      cdnUrl: payload.storage?.cdnUrl || '',
      rawPrefix: payload.storage?.rawPrefix || 'raw-videos',
      hlsPrefix: payload.storage?.hlsPrefix || 'hls',
    },
    transcoding: {
      qualities: {
        q360: Boolean(payload.transcoding?.qualities?.q360),
        q480: Boolean(payload.transcoding?.qualities?.q480),
        q720: Boolean(payload.transcoding?.qualities?.q720),
        q1080: Boolean(payload.transcoding?.qualities?.q1080),
        q4k: Boolean(payload.transcoding?.qualities?.q4k),
      },
      bitratePreset: payload.transcoding?.bitratePreset || 'balanced',
      workerMode: payload.transcoding?.workerMode || 'ffmpeg-queue',
    },
    payments: {
      gateway: payload.payments?.gateway || 'razorpay',
      currency: payload.payments?.currency || 'INR',
      razorpayKeyIdMasked: payload.payments?.razorpayKeyIdMasked || '',
      stripeKeyMasked: payload.payments?.stripeKeyMasked || '',
    },
    email: {
      fromName: payload.email?.fromName || 'Chirpii',
      fromEmail: payload.email?.fromEmail || '',
      smtpHost: payload.email?.smtpHost || '',
      smtpPort: Number(payload.email?.smtpPort || 587),
    },
    player: {
      enableSubtitles: payload.player?.enableSubtitles !== undefined
        ? Boolean(payload.player.enableSubtitles)
        : (payload.enableSubtitles !== undefined ? Boolean(payload.enableSubtitles) : true),
    },
  };
}

let cachedDashboardData = null;
let cachedDashboardExpiry = 0;
const DASHBOARD_CACHE_TTL = 60 * 1000; // 60 seconds

export function invalidateDashboardCache() {
  cachedDashboardData = null;
  cachedDashboardExpiry = 0;
}

export async function getDashboardData() {
  const currentTime = Date.now();
  if (cachedDashboardData && currentTime < cachedDashboardExpiry) {
    return cachedDashboardData;
  }

  await dbConnect();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const last30Start = getLastNDays(30)[0];

  const [
    totalSeries,
    totalSeasons,
    totalEpisodes,
    totalUsers,
    activeSubscriptions,
    premiumUsers,
    revenueMonthRows,
    recentContent,
    viewsRows,
    episodeRows,
    episodesBySeriesRows,
    revenueRows,
    recentSubscribersDocs,
  ] = await Promise.all([
    Content.countDocuments({ type: 'series', isDeleted: { $ne: true } }),
    Season.countDocuments({ isDeleted: { $ne: true } }),
    Episode.countDocuments({ isDeleted: { $ne: true } }),
    User.countDocuments({}),
    Subscription.countDocuments({
      status: 'active',
      $or: [{ endDate: { $gte: now } }, { endDate: { $exists: false } }],
    }),
    User.countDocuments({ isPremium: true }),
    Transaction.aggregate([
      {
        $match: {
          status: 'success',
          $or: [{ paidAt: { $gte: monthStart } }, { createdAt: { $gte: monthStart } }],
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Content.find({ type: 'series', isDeleted: { $ne: true } }).sort({ createdAt: -1 }).limit(7).lean(),
    User.aggregate([
      { $unwind: '$watchHistory' },
      { $match: { 'watchHistory.watchedAt': { $gte: last30Start } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$watchHistory.watchedAt',
            },
          },
          views: { $sum: 1 },
        },
      },
    ]),
    Episode.aggregate([
      { $match: { isDeleted: { $ne: true }, createdAt: { $gte: last30Start } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
            },
          },
          episodes: { $sum: 1 },
        },
      },
    ]),
    Episode.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      {
        $group: {
          _id: { $ifNull: ['$seriesId', '$contentId'] },
          episodes: { $sum: 1 },
          seasons: { $addToSet: { $ifNull: ['$seasonId', '$season'] } },
        },
      },
      { $sort: { episodes: -1 } },
      { $limit: 8 },
    ]),
    Transaction.aggregate([
      { $match: { status: 'success' } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m',
              date: { $ifNull: ['$paidAt', '$createdAt'] },
            },
          },
          revenue: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]),
    Subscription.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('userId', 'name phone email profileImage')
      .populate('planId', 'name price duration label')
      .lean(),
  ]);

  const recentIds = recentContent.map((item) => item._id.toString());
  const recentViews = await getViewsByContentIds(recentIds);
  const seriesChartIds = episodesBySeriesRows
    .map((row) => row._id)
    .filter((id) => mongoose.Types.ObjectId.isValid(id));
  const chartSeries = await Content.find({ _id: { $in: seriesChartIds } }, { title: 1 }).lean();
  const chartSeriesMap = new Map(chartSeries.map((item) => [item._id.toString(), item.title]));
  const viewsMap = new Map(viewsRows.map((row) => [row._id, row.views]));
  const episodesMap = new Map(episodeRows.map((row) => [row._id, row.episodes]));

  const viewsOverTime = getLastNDays(30).map((date) => {
    const key = date.toISOString().slice(0, 10);
    return {
      date: key.slice(5),
      views: viewsMap.get(key) || 0,
      episodes: episodesMap.get(key) || 0,
    };
  });

  const revenueByMonth = revenueRows.map((row) => ({
    month: getMonthLabel(row._id),
    revenue: row.revenue,
  }));

  const freeUsers = Math.max(totalUsers - premiumUsers, 0);

  const resultPayload = {
    stats: {
      totalSeries,
      totalSeasons,
      totalEpisodes,
      totalUsers,
      activeSubscriptions: Math.max(activeSubscriptions, premiumUsers),
      revenueThisMonth: revenueMonthRows[0]?.total || 0,
    },
    recentSubscribers: (recentSubscribersDocs || []).map((sub) => ({
      id: sub._id.toString(),
      name: sub.userId?.name || sub.userId?.phone || 'Subscriber',
      phone: sub.userId?.phone || '',
      email: sub.userId?.email || '',
      planName: sub.planId?.name || 'Premium Plan',
      planPrice: sub.planId?.price || 0,
      startDate: sub.startDate,
      endDate: sub.endDate,
      status: sub.status,
      autoRenew: sub.autoRenew,
    })),
    recentUploads: recentContent.map((content) =>
      normalizeVideo(content, recentViews.get(content._id.toString()) || 0)
    ),
    viewsOverTime,
    revenueByMonth,
    planDistribution: [
      { name: 'Free', value: freeUsers },
      { name: 'Premium', value: premiumUsers },
      { name: 'Active Subs', value: activeSubscriptions },
    ].filter((item) => item.value > 0),
    catalogDistribution: [
      { name: 'Series', value: totalSeries },
      { name: 'Seasons', value: totalSeasons },
      { name: 'Episodes', value: totalEpisodes },
    ].filter((item) => item.value > 0),
    episodesBySeries: episodesBySeriesRows.map((row) => ({
      title: chartSeriesMap.get(String(row._id)) || 'Unknown series',
      episodes: row.episodes,
      seasons: row.seasons?.filter(Boolean).length || 0,
    })),
    topSeries: await (async () => {
      const rows = await User.aggregate([
        { $unwind: '$watchHistory' },
        { $group: { _id: '$watchHistory.contentId', views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: 5 },
      ]);
      const ids = rows.map((r) => r._id).filter((id) => mongoose.Types.ObjectId.isValid(id));
      const docs = await Content.find({ _id: { $in: ids } }, { title: 1, type: 1 }).lean();
      const docsMap = new Map(docs.map((s) => [s._id.toString(), s]));
      return rows.map((r) => {
        const doc = docsMap.get(String(r._id));
        return {
          title: doc?.title || 'Unknown content',
          type: doc?.type || 'series',
          views: r.views,
        };
      }).filter((item) => item.title !== 'Unknown content');
    })(),
    topEpisodes: await (async () => {
      const rows = await User.aggregate([
        { $unwind: '$watchHistory' },
        { $match: { 'watchHistory.episodeId': { $ne: null } } },
        { $group: { _id: '$watchHistory.episodeId', views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: 5 },
      ]);
      const ids = rows.map((r) => r._id).filter((id) => mongoose.Types.ObjectId.isValid(id));
      const docs = await Episode.find({ _id: { $in: ids } }, { title: 1, episodeNumber: 1, season: 1, seasonId: 1, seriesId: 1 }).lean();
      const parentIds = [...new Set(docs.map((ep) => ep.seriesId).filter(Boolean))];
      const parents = await Content.find({ _id: { $in: parentIds } }, { title: 1 }).lean();
      const parentsMap = new Map(parents.map((p) => [p._id.toString(), p.title]));
      const seasonIds = [...new Set(docs.map((ep) => ep.seasonId).filter(Boolean))];
      const seasons = await Season.find({ _id: { $in: seasonIds } }, { seasonNumber: 1 }).lean();
      const seasonsMap = new Map(seasons.map((s) => [s._id.toString(), s.seasonNumber]));
      const docsMap = new Map(docs.map((e) => [e._id.toString(), e]));
      return rows.map((r) => {
        const doc = docsMap.get(String(r._id));
        const seriesTitle = doc?.seriesId ? parentsMap.get(String(doc.seriesId)) : '';
        const seasonNumber = doc
          ? (doc.season !== undefined && doc.season !== null && doc.season !== ''
              ? doc.season
              : (doc.seasonId ? seasonsMap.get(String(doc.seasonId)) : ''))
          : '';
        const hasSeason = seasonNumber !== undefined && seasonNumber !== null && seasonNumber !== '';
        const seasonPart = hasSeason ? `S${seasonNumber} ` : '';
        const displayTitle = doc
          ? `${seriesTitle ? seriesTitle + ' · ' : ''}${seasonPart}E${doc.episodeNumber}: ${doc.title}`
          : 'Unknown episode';
        return {
          title: displayTitle,
          views: r.views,
        };
      }).filter((item) => item.title !== 'Unknown episode');
    })(),
  };

  cachedDashboardData = resultPayload;
  cachedDashboardExpiry = Date.now() + DASHBOARD_CACHE_TTL;
  return resultPayload;
}

export async function getVideosList({ page = 1, limit = 10, search = '', status = '', category = '' }) {
  await dbConnect();

  const query = { isDeleted: { $ne: true } };
  const conditions = [];

  if (search) {
    conditions.push({
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    });
  }

  if (category) query.genres = category;
  if (status === 'Live') query.isActive = true;
  if (status === 'Failed') {
    conditions.push({
      $or: [{ isActive: false }, { transcodingStatus: 'failed' }]
    });
  }
  if (status === 'Processing') {
    query.transcodingStatus = { $in: ['queued', 'uploading', 'processing', 'thumbnails'] };
  }

  if (conditions.length > 0) {
    query.$and = conditions;
  }

  const skip = (page - 1) * limit;
  const [items, total, genres] = await Promise.all([
    Content.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Content.countDocuments(query),
    Genre.find({ isActive: true }).sort({ displayOrder: 1 }).lean(),
  ]);

  const views = await getViewsByContentIds(items.map((item) => item._id.toString()));

  return {
    videos: items.map((item) => normalizeVideo(item, views.get(item._id.toString()) || 0)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
    filters: {
      categories: genres.map((genre) => genre.name),
      statuses: ['Processing', 'Live', 'Failed'],
    },
  };
}

export async function getVideoDetail(id) {
  await dbConnect();
  if (!mongoose.Types.ObjectId.isValid(id)) return null;

  const content = await Content.findOne({ _id: id, isDeleted: { $ne: true } }).lean();
  if (!content) return null;

  const views = await getViewsByContentIds([id]);
  const video = normalizeVideo(content, views.get(id) || 0);
  const watchers = await User.aggregate([
    { $unwind: '$watchHistory' },
    { $match: { 'watchHistory.contentId': id } },
    {
      $group: {
        _id: null,
        views: { $sum: 1 },
        watchTime: { $sum: '$watchHistory.watchedSeconds' },
        avgCompletion: { $avg: '$watchHistory.progress' },
      },
    },
  ]);

  return {
    video,
    analytics: {
      views: watchers[0]?.views || 0,
      watchTime: watchers[0]?.watchTime || 0,
      completionRate: Math.round(watchers[0]?.avgCompletion || 0),
      likes: Math.floor((watchers[0]?.views || 0) * 0.08),
    },
  };
}

export async function getAnalyticsData(range = '30d') {
  await dbConnect();
  
  let days = 30;
  let start = new Date(0);
  
  if (range === 'today') {
    days = 1;
    start = getLastNDays(1)[0];
  } else if (range === '7d') {
    days = 7;
    start = getLastNDays(7)[0];
  } else if (range === '30d') {
    days = 30;
    start = getLastNDays(30)[0];
  } else if (range === 'lifetime') {
    days = 30; // show last 30 days daily trend on chart
    start = new Date(0); // query all time
  } else {
    days = 30;
    start = getLastNDays(30)[0];
  }

  const [viewsRows, signupRows, revenueRows, topRows, users] = await Promise.all([
    User.aggregate([
      { $unwind: '$watchHistory' },
      { $match: { 'watchHistory.watchedAt': { $gte: start } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$watchHistory.watchedAt' },
          },
          views: { $sum: 1 },
          watchTime: { $sum: '$watchHistory.watchedSeconds' },
        },
      },
    ]),
    User.aggregate([
      { $match: { createdAt: { $gte: start } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          signups: { $sum: 1 },
        },
      },
    ]),
    Transaction.aggregate([
      {
        $match: {
          status: 'success',
          $or: [{ paidAt: { $gte: start } }, { createdAt: { $gte: start } }],
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: { $ifNull: ['$paidAt', '$createdAt'] },
            },
          },
          revenue: { $sum: '$amount' },
        },
      },
    ]),
    User.aggregate([
      { $unwind: '$watchHistory' },
      { $group: { _id: '$watchHistory.contentId', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 8 },
    ]),
    User.countDocuments({}),
  ]);

  const viewMap = new Map(viewsRows.map((row) => [row._id, row]));
  const signupMap = new Map(signupRows.map((row) => [row._id, row.signups]));
  const revenueMap = new Map(revenueRows.map((row) => [row._id, row.revenue]));
  const daily = getLastNDays(days).map((date) => {
    const key = date.toISOString().slice(0, 10);
    return {
      date: key.slice(5),
      views: viewMap.get(key)?.views || 0,
      watchTime: viewMap.get(key)?.watchTime || 0,
      signups: signupMap.get(key) || 0,
      revenue: revenueMap.get(key) || 0,
      dau: Math.max(1, Math.round((viewMap.get(key)?.views || 0) * 0.62)),
    };
  });

  const contentIds = topRows
    .map((row) => row._id)
    .filter((id) => mongoose.Types.ObjectId.isValid(id));
  const content = await Content.find({ _id: { $in: contentIds } }).lean();
  const contentMap = new Map(content.map((item) => [item._id.toString(), item]));

  // ─── Dynamic Geography calculation ─────────────────────────────────────────
  const userPhones = await User.find({}, { phone: 1 }).lean();
  const geoCounts = { India: 0, 'United States': 0, UAE: 0, 'United Kingdom': 0, Other: 0 };
  for (const u of userPhones) {
    const phone = u.phone || '';
    if (phone.startsWith('+91') || /^\d{10}$/.test(phone.trim())) {
      geoCounts.India++;
    } else if (phone.startsWith('+1')) {
      geoCounts['United States']++;
    } else if (phone.startsWith('+971')) {
      geoCounts.UAE++;
    } else if (phone.startsWith('+44')) {
      geoCounts['United Kingdom']++;
    } else {
      geoCounts.Other++;
    }
  }

  let geography = [
    { country: 'India', users: geoCounts.India },
    { country: 'United States', users: geoCounts['United States'] },
    { country: 'UAE', users: geoCounts.UAE },
    { country: 'United Kingdom', users: geoCounts['United Kingdom'] },
    { country: 'Other', users: geoCounts.Other },
  ].filter((g) => g.users > 0);

  if (geography.length === 0) {
    geography = [
      { country: 'India', users: Math.max(1, Math.round(users * 0.78)) },
      { country: 'United States', users: Math.max(1, Math.round(users * 0.08)) },
      { country: 'UAE', users: Math.max(1, Math.round(users * 0.06)) },
      { country: 'United Kingdom', users: Math.max(1, Math.round(users * 0.04)) },
    ];
  }

  // ─── Dynamic Devices calculation ───────────────────────────────────────────
  const dbDevices = await Device.aggregate([
    { $group: { _id: { $toLower: '$os' }, count: { $sum: 1 } } },
  ]);

  let totalDevices = 0;
  const deviceTypes = { Mobile: 0, Desktop: 0, TV: 0, Tablet: 0 };
  for (const row of dbDevices) {
    const os = row._id || '';
    const count = row.count || 0;
    totalDevices += count;

    if (os.includes('tv') || os.includes('fire') || os.includes('tizen') || os.includes('webos')) {
      deviceTypes.TV += count;
    } else if (os.includes('ipad') || os.includes('tablet')) {
      deviceTypes.Tablet += count;
    } else if (os.includes('ios') || os.includes('android') || os.includes('iphone')) {
      deviceTypes.Mobile += count;
    } else if (os.includes('windows') || os.includes('mac') || os.includes('linux') || os.includes('os x')) {
      deviceTypes.Desktop += count;
    } else {
      deviceTypes.Mobile += count;
    }
  }

  let devices = [];
  if (totalDevices > 0) {
    devices = [
      { name: 'Mobile', value: deviceTypes.Mobile },
      { name: 'Desktop', value: deviceTypes.Desktop },
      { name: 'TV', value: deviceTypes.TV },
      { name: 'Tablet', value: deviceTypes.Tablet },
    ].filter((d) => d.value > 0);
  } else {
    devices = [
      { name: 'Mobile', value: Math.max(1, Math.round(users * 0.64)) },
      { name: 'Desktop', value: Math.max(1, Math.round(users * 0.18)) },
      { name: 'TV', value: Math.max(1, Math.round(users * 0.12)) },
      { name: 'Tablet', value: Math.max(1, Math.round(users * 0.06)) },
    ];
  }

  return {
    daily,
    topContent: topRows.map((row) => {
      const item = contentMap.get(String(row._id));
      return {
        title: item?.title || 'Unknown title',
        type: item?.type || 'video',
        views: row.views,
        revenue: Math.round(row.views * 4.7),
      };
    }),
    geography,
    devices,
  };
}

export async function getRevenueData({ page = 1, limit = 10, status = '', method = '' }) {
  await dbConnect();
  const query = {};
  if (status) query.status = status;
  if (method) query.paymentMethod = method;
  const skip = (page - 1) * limit;

  const [summaryRows, transactions, total] = await Promise.all([
    Transaction.aggregate([
      {
        $group: {
          _id: '$status',
          amount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),
    Transaction.find(query)
      .populate('userId', 'name email phone isPremium')
      .populate('planId', 'name price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Transaction.countDocuments(query),
  ]);

  const summaryMap = new Map(summaryRows.map((row) => [row._id, row]));
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonth = await Transaction.aggregate([
    {
      $match: {
        status: 'success',
        $or: [{ paidAt: { $gte: monthStart } }, { createdAt: { $gte: monthStart } }],
      },
    },
    { $group: { _id: null, amount: { $sum: '$amount' } } },
  ]);

  return {
    summary: {
      total: summaryMap.get('success')?.amount || 0,
      thisMonth: thisMonth[0]?.amount || 0,
      pending: summaryMap.get('pending')?.amount || 0,
      refunds: 0,
    },
    transactions: serialize(transactions).map((transaction) => ({
      id: transaction._id,
      user: transaction.userId?.name || transaction.userId?.phone || 'Unknown user',
      plan: transaction.planId?.name || 'Plan',
      amount: transaction.amount,
      paymentMethod: transaction.paymentMethod || (transaction.razorpayPaymentId ? 'Razorpay' : 'UPI / Online'),
      date: transaction.paidAt || transaction.createdAt,
      status: transaction.status,
      currency: transaction.currency || 'INR',
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function getUsersList({ page = 1, limit = 10, search = '', plan = '', status = '' }) {
  await dbConnect();
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  if (plan === 'Premium') query.isPremium = true;
  if (plan === 'Free') query.isPremium = false;
  if (status) query.status = status.toLowerCase();

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(query),
  ]);

  return {
    users: serialize(items).map((user) => {
      const history = user.watchHistory || [];
      const lastWatch = history
        .map((item) => item.watchedAt)
        .filter(Boolean)
        .sort((a, b) => new Date(b) - new Date(a))[0];

      return {
        id: user._id,
        avatarUrl: user.avatarUrl || '',
        name: user.name || 'Chirpii Viewer',
        email: user.email || `${user.phone || 'viewer'}@phone.chirpii`,
        phone: user.phone,
        plan: user.isPremium ? 'Premium' : 'Free',
        status: user.status === 'suspended' ? 'Suspended' : 'Active',
        joinedAt: user.createdAt,
        lastActive: lastWatch || user.updatedAt || user.createdAt,
        watchHistoryCount: history.length,
        myListCount: user.myList?.length || 0,
      };
    }),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}
