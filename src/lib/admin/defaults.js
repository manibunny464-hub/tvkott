export const ADMIN_COOKIE_NAME = 'tvk_admin_session';

export const defaultAdminSettings = {
  platformName: 'TVK OTT Admin',
  tagline: 'Small wings, big emotions',
  logoUrl: '',
  faviconUrl: '',
  timezone: 'Asia/Kolkata',
  playStoreUrl: (process.env.NEXT_PUBLIC_PLAY_STORE_URL || ''),
  theme: {
    primary: '#00d9ff',
    accent: '#ff1f8f',
    warning: '#ffb21f',
    background: '#f7fbfd',
    surface: '#ffffff',
    foreground: '#071217',
    muted: '#607782',
    radius: 8,
  },
  storage: {
    provider: 'aws-s3',
    bucket: process.env.S3_BUCKET_NAME || '',
    region: process.env.AWS_REGION || '',
    cdnUrl: process.env.CDN_URL || '',
    rawPrefix: 'raw-videos',
    hlsPrefix: 'hls',
  },
  transcoding: {
    qualities: {
      q360: true,
      q480: true,
      q720: true,
      q1080: true,
      q4k: false,
    },
    bitratePreset: 'balanced',
    workerMode: 'ffmpeg-queue',
  },
  payments: {
    gateway: 'razorpay',
    currency: 'INR',
    razorpayKeyIdMasked: process.env.RAZORPAY_KEY_ID
      ? `${process.env.RAZORPAY_KEY_ID.slice(0, 6)}...`
      : '',
    stripeKeyMasked: '',
  },
  email: {
    fromName: 'TVK OTT',
    fromEmail: '',
    smtpHost: '',
    smtpPort: 587,
  },
  player: {
    enableSubtitles: true,
  },
};

export const adminNavItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/videos', label: 'Videos' },
  { href: '/users', label: 'Users' },
  { href: '/plans', label: 'Plans' },
  { href: '/categories', label: 'Categories' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/revenue', label: 'Revenue' },
  { href: '/notifications', label: 'Notifications' },
  { href: '/settings', label: 'Settings' },
  { href: '/master-app-settings', label: 'Master App Settings' },
];
