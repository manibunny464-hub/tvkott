import mongoose from 'mongoose';

const ThemeSchema = new mongoose.Schema(
  {
    primary: { type: String, default: '#00d9ff' },
    accent: { type: String, default: '#ff1f8f' },
    warning: { type: String, default: '#ffb21f' },
    background: { type: String, default: '#f7fbfd' },
    surface: { type: String, default: '#ffffff' },
    foreground: { type: String, default: '#071217' },
    muted: { type: String, default: '#607782' },
    radius: { type: Number, default: 8 },
  },
  { _id: false }
);

const AdminSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'master-app-settings',
      unique: true,
    },
    platformName: {
      type: String,
      default: 'TVK OTT Admin',
    },
    tagline: {
      type: String,
      default: 'Small wings, big emotions',
    },
    logoUrl: {
      type: String,
      default: '',
    },
    faviconUrl: {
      type: String,
      default: '',
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    playStoreUrl: {
      type: String,
      default: (process.env.NEXT_PUBLIC_PLAY_STORE_URL || ''),
    },
    theme: {
      type: ThemeSchema,
      default: () => ({}),
    },
    storage: {
      provider: { type: String, default: 'aws-s3' },
      bucket: { type: String, default: '' },
      region: { type: String, default: '' },
      cdnUrl: { type: String, default: '' },
      rawPrefix: { type: String, default: 'raw-videos' },
      hlsPrefix: { type: String, default: 'hls' },
    },
    transcoding: {
      qualities: {
        q360: { type: Boolean, default: true },
        q480: { type: Boolean, default: true },
        q720: { type: Boolean, default: true },
        q1080: { type: Boolean, default: true },
        q4k: { type: Boolean, default: false },
      },
      bitratePreset: { type: String, default: 'balanced' },
      workerMode: { type: String, default: 'ffmpeg-queue' },
    },
    payments: {
      gateway: { type: String, default: 'razorpay' },
      currency: { type: String, default: 'INR' },
      razorpayKeyIdMasked: { type: String, default: '' },
      stripeKeyMasked: { type: String, default: '' },
    },
    email: {
      fromName: { type: String, default: 'TVK OTT' },
      fromEmail: { type: String, default: '' },
      smtpHost: { type: String, default: '' },
      smtpPort: { type: Number, default: 587 },
    },
    player: {
      enableSubtitles: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export default mongoose.models.AdminSetting ||
  mongoose.model('AdminSetting', AdminSettingSchema);
