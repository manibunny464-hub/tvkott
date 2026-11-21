import mongoose from 'mongoose';

const MONGODB_URI = 'REPLACE_WITH_ENVIRONMENT_VALUE';

// ── Schemas ───────────────────────────────────────────────────────────────

const ContentSchema = new mongoose.Schema({
  title: String, description: String, language: [String], genres: [String],
  type: { type: String, enum: ['series', 'movie', 'short'] },
  rating: String, releaseYear: Number, thumbnailUrl: String, bannerUrl: String,
  trailerUrl: String, isFeatured: Boolean, isTrending: Boolean, trendingRank: Number,
  isActive: Boolean, totalSeasons: Number, tags: [String],
}, { timestamps: true });

ContentSchema.index(
  { title: 'text', description: 'text', tags: 'text' },
  { language_override: 'textLang' }
);

const EpisodeSchema = new mongoose.Schema({
  contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content' },
  season: Number, episodeNumber: Number, title: String, description: String,
  duration: Number, isFree: Boolean, videoKey_HD: String, videoKey_SD: String,
  thumbnailUrl: String, isActive: Boolean,
}, { timestamps: true });

EpisodeSchema.index({ contentId: 1, season: 1, episodeNumber: 1 });

const Content = mongoose.models.Content || mongoose.model('Content', ContentSchema);
const Episode = mongoose.models.Episode || mongoose.model('Episode', EpisodeSchema);

// ── Content Data ──────────────────────────────────────────────────────────

const CONTENT_DATA = [
  {
    title: 'Prem Kahaani',
    description: 'A young couple navigates love, family pressure, and modern relationships in Mumbai.',
    language: ['hi'], genres: ['Romance', 'Drama'], type: 'series',
    rating: 'U/A 13+', releaseYear: 2024,
    thumbnailUrl: 'https://picsum.photos/seed/premkahaani/400/600',
    bannerUrl: 'https://picsum.photos/seed/premkahaanibanner/1200/600',
    isFeatured: true, isTrending: true, trendingRank: 1, totalSeasons: 2,
    tags: ['romance', 'hindi', 'drama', 'love story'],
  },
  {
    title: 'Namma Ooru',
    description: 'A village in Andhra Pradesh is turned upside down when a young IAS officer returns home.',
    language: ['te'], genres: ['Drama', 'Family'], type: 'series',
    rating: 'U', releaseYear: 2024,
    thumbnailUrl: 'https://picsum.photos/seed/nammaooru/400/600',
    bannerUrl: 'https://picsum.photos/seed/nammaoorubanner/1200/600',
    isFeatured: true, isTrending: true, trendingRank: 2, totalSeasons: 1,
    tags: ['telugu', 'village', 'drama', 'family'],
  },
  {
    title: 'Kalki',
    description: 'An undercover cop infiltrates a crime syndicate in Chennai, risking everything he loves.',
    language: ['ta'], genres: ['Action', 'Thriller'], type: 'series',
    rating: 'U/A 16+', releaseYear: 2024,
    thumbnailUrl: 'https://picsum.photos/seed/kalki/400/600',
    bannerUrl: 'https://picsum.photos/seed/kalkibanner/1200/600',
    isFeatured: false, isTrending: true, trendingRank: 3, totalSeasons: 1,
    tags: ['tamil', 'action', 'thriller', 'crime', 'cop'],
  },
  {
    title: 'Theeram',
    description: 'A fisherman community in Kerala fights against illegal land acquisition by a powerful corporation.',
    language: ['ml'], genres: ['Drama', 'Social'], type: 'series',
    rating: 'U/A 13+', releaseYear: 2023,
    thumbnailUrl: 'https://picsum.photos/seed/theeram/400/600',
    bannerUrl: 'https://picsum.photos/seed/theerambanner/1200/600',
    isFeatured: true, isTrending: false, totalSeasons: 1,
    tags: ['malayalam', 'drama', 'social', 'kerala'],
  },
  {
    title: 'Hosa Baalina Kathe',
    description: 'A coming-of-age story of a Bengaluru tech worker who rediscovers his roots.',
    language: ['kn'], genres: ['Drama', 'Comedy'], type: 'series',
    rating: 'U', releaseYear: 2024,
    thumbnailUrl: 'https://picsum.photos/seed/hosabaalina/400/600',
    bannerUrl: 'https://picsum.photos/seed/hosabaalinabanner/1200/600',
    isFeatured: false, isTrending: true, trendingRank: 5, totalSeasons: 1,
    tags: ['kannada', 'comedy', 'drama', 'bengaluru'],
  },
  {
    title: 'Raat Ke Raaste',
    description: 'Three strangers on a night train from Delhi share secrets that change their lives forever.',
    language: ['hi'], genres: ['Thriller', 'Mystery'], type: 'series',
    rating: 'U/A 16+', releaseYear: 2024,
    thumbnailUrl: 'https://picsum.photos/seed/raatkeraaste/400/600',
    bannerUrl: 'https://picsum.photos/seed/raatkeraastebanner/1200/600',
    isFeatured: false, isTrending: true, trendingRank: 4, totalSeasons: 1,
    tags: ['hindi', 'thriller', 'mystery', 'night', 'suspense'],
  },
  {
    title: 'Tujhse Zyada',
    description: 'A heart-warming Hindi romantic film about long-distance love in the age of social media.',
    language: ['hi'], genres: ['Romance'], type: 'movie',
    rating: 'U', releaseYear: 2024,
    thumbnailUrl: 'https://picsum.photos/seed/tujhsezyada/400/600',
    bannerUrl: 'https://picsum.photos/seed/tujhsezyadabanner/1200/600',
    isFeatured: true, isTrending: false, totalSeasons: 1,
    tags: ['hindi', 'romance', 'love', 'movie'],
  },
  {
    title: 'Veera',
    description: 'A fearless Tamil warrior fights to protect his village from a tyrannical zamindar.',
    language: ['ta'], genres: ['Action', 'Historical'], type: 'movie',
    rating: 'U/A 13+', releaseYear: 2023,
    thumbnailUrl: 'https://picsum.photos/seed/veera/400/600',
    bannerUrl: 'https://picsum.photos/seed/veerabanner/1200/600',
    isFeatured: false, isTrending: true, trendingRank: 6, totalSeasons: 1,
    tags: ['tamil', 'action', 'historical', 'warrior'],
  },
  {
    title: 'Manasu Maata',
    description: "A Telugu drama about a mother sacrificing everything to fulfil her daughter's dream.",
    language: ['te'], genres: ['Drama', 'Family'], type: 'movie',
    rating: 'U', releaseYear: 2024,
    thumbnailUrl: 'https://picsum.photos/seed/manasumaata/400/600',
    bannerUrl: 'https://picsum.photos/seed/manasumaatabanner/1200/600',
    isFeatured: false, isTrending: false, totalSeasons: 1,
    tags: ['telugu', 'family', 'drama', 'emotional'],
  },
  {
    title: 'Ek Pal',
    description: 'A 15-minute short film about two strangers who meet on a rooftop and find unexpected connection.',
    language: ['hi'], genres: ['Romance', 'Short Film'], type: 'short',
    rating: 'U', releaseYear: 2024,
    thumbnailUrl: 'https://picsum.photos/seed/ekpal/400/600',
    bannerUrl: null, isFeatured: false, isTrending: false, totalSeasons: 1,
    tags: ['hindi', 'short', 'romance', 'rooftop'],
  },
  {
    title: 'Kadal Kaatru',
    description: "A Tamil short about a lighthouse keeper's solitary life and a message in a bottle.",
    language: ['ta'], genres: ['Drama', 'Short Film'], type: 'short',
    rating: 'U', releaseYear: 2023,
    thumbnailUrl: 'https://picsum.photos/seed/kadalkaatru/400/600',
    bannerUrl: null, isFeatured: false, isTrending: false, totalSeasons: 1,
    tags: ['tamil', 'short', 'drama', 'sea'],
  },
];

// ── Episode Data ──────────────────────────────────────────────────────────

const EPISODES_BY_TITLE = {
  'Prem Kahaani': [
    { season: 1, episodeNumber: 1, title: 'Pehli Mulaqat',    description: 'Arjun and Priya meet by chance at a Mumbai café.',           duration: 2400, isFree: true },
    { season: 1, episodeNumber: 2, title: 'Doosri Baat',      description: 'A second encounter leads to an unexpected friendship.',      duration: 2520, isFree: true },
    { season: 1, episodeNumber: 3, title: 'Rishte Ki Dori',   description: 'Family tensions rise as their bond deepens.',                duration: 2700, isFree: false },
    { season: 1, episodeNumber: 4, title: 'Toota Sapna',      description: 'A misunderstanding tears them apart.',                       duration: 2580, isFree: false },
    { season: 1, episodeNumber: 5, title: 'Naya Savera',      description: 'Season 1 finale — a surprise reunion changes everything.',   duration: 3000, isFree: false },
    { season: 2, episodeNumber: 1, title: 'Naya Adhyay',      description: 'Six months later — Arjun returns from London.',             duration: 2640, isFree: false },
    { season: 2, episodeNumber: 2, title: 'Purani Raahein',   description: 'Old wounds reopen as they meet again.',                      duration: 2760, isFree: false },
    { season: 2, episodeNumber: 3, title: 'Pyaar Ka Faisla',  description: 'The final choice — love or ambition?',                      duration: 3180, isFree: false },
  ],
  'Namma Ooru': [
    { season: 1, episodeNumber: 1, title: 'Ooru Pandu',       description: 'IAS officer Ravi arrives in his home village after 10 years.', duration: 2460, isFree: true },
    { season: 1, episodeNumber: 2, title: 'Patha Vaallu',     description: 'Ravi meets old friends and discovers a water crisis.',         duration: 2520, isFree: true },
    { season: 1, episodeNumber: 3, title: 'Porata Margam',    description: 'The fight against the corrupt politician begins.',             duration: 2700, isFree: false },
    { season: 1, episodeNumber: 4, title: 'Matti Poru',       description: 'Villagers unite to protect their farmland.',                   duration: 2880, isFree: false },
    { season: 1, episodeNumber: 5, title: 'Vijayam',          description: 'Season finale — justice prevails.',                           duration: 3120, isFree: false },
  ],
  'Kalki': [
    { season: 1, episodeNumber: 1, title: 'Naangu Kaigal',    description: "Officer Karthik goes undercover in Chennai's port district.",        duration: 2700, isFree: true },
    { season: 1, episodeNumber: 2, title: 'Iravin Nizhal',    description: "Karthik earns the trust of the syndicate's second-in-command.",      duration: 2820, isFree: true },
    { season: 1, episodeNumber: 3, title: 'Thunbu Theriyal',  description: 'A mole inside the police force is exposed.',                         duration: 3000, isFree: false },
    { season: 1, episodeNumber: 4, title: 'Mudivurai',        description: 'The final confrontation — truth or loyalty?',                        duration: 3300, isFree: false },
  ],
  'Theeram': [
    { season: 1, episodeNumber: 1, title: 'Kadal Kinavu',     description: "The fishermen's cooperative faces its first eviction notice.", duration: 2580, isFree: true },
    { season: 1, episodeNumber: 2, title: 'Mazha Vili',       description: 'A young journalist arrives to cover the story.',              duration: 2640, isFree: true },
    { season: 1, episodeNumber: 3, title: 'Oru Naalile',      description: 'Protests turn violent. The corporation escalates.',           duration: 2880, isFree: false },
    { season: 1, episodeNumber: 4, title: 'Theeram Kaanaan',  description: 'Series finale — the community finds its voice.',             duration: 3060, isFree: false },
  ],
  'Hosa Baalina Kathe': [
    { season: 1, episodeNumber: 1, title: 'Bengaluru Bidi',   description: 'Kiran quits his startup job and returns to his village near Mysuru.', duration: 2400, isFree: true },
    { season: 1, episodeNumber: 2, title: 'Hasiru Gadi',      description: 'Kiran tries to modernise the village farm and fails hilariously.',   duration: 2520, isFree: true },
    { season: 1, episodeNumber: 3, title: 'Preethiya Payana', description: 'A childhood friend rekindles old memories.',                         duration: 2640, isFree: false },
  ],
  'Raat Ke Raaste': [
    { season: 1, episodeNumber: 1, title: 'Teesri Seeti',     description: 'The night train departs Delhi. Three strangers share a compartment.', duration: 2700, isFree: true },
    { season: 1, episodeNumber: 2, title: 'Bhed Ka Raaz',     description: "Each traveller's secret slowly unravels.",                           duration: 2820, isFree: true },
    { season: 1, episodeNumber: 3, title: 'Andhere Mein',     description: 'The train stops unexpectedly in the middle of nowhere.',             duration: 3000, isFree: false },
    { season: 1, episodeNumber: 4, title: 'Subah Ki Roshni',  description: 'Series finale — the truth comes to light at dawn.',                 duration: 3180, isFree: false },
  ],
  'Tujhse Zyada': [
    { season: 1, episodeNumber: 1, title: 'Tujhse Zyada (Full Movie)', description: 'Full film — 1h 45min.', duration: 6300, isFree: false },
  ],
  'Veera': [
    { season: 1, episodeNumber: 1, title: 'Veera (Full Movie)', description: 'Full film — 2h 10min.', duration: 7800, isFree: false },
  ],
  'Manasu Maata': [
    { season: 1, episodeNumber: 1, title: 'Manasu Maata (Full Movie)', description: 'Full film — 2h 05min.', duration: 7500, isFree: false },
  ],
  'Ek Pal': [
    { season: 1, episodeNumber: 1, title: 'Ek Pal (Short Film)', description: 'Full short — 15min.', duration: 900, isFree: true },
  ],
  'Kadal Kaatru': [
    { season: 1, episodeNumber: 1, title: 'Kadal Kaatru (Short Film)', description: 'Full short — 18min.', duration: 1080, isFree: true },
  ],
};

// ── Run ───────────────────────────────────────────────────────────────────

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  console.log('Connected.\n');

  // ── Seed Content ──
  console.log('=== Seeding Content ===');
  const contentIdMap = {};

  for (const item of CONTENT_DATA) {
    const existing = await Content.findOne({ title: item.title });
    if (existing) {
      console.log(`  SKIP  ${item.title} (already exists)`);
      contentIdMap[item.title] = existing._id;
    } else {
      const created = await Content.create({ ...item, isActive: true });
      console.log(`  CREATE ${item.title} [${item.type}] → ${created._id}`);
      contentIdMap[item.title] = created._id;
    }
  }

  // ── Seed Episodes ──
  console.log('\n=== Seeding Episodes ===');

  for (const [title, episodes] of Object.entries(EPISODES_BY_TITLE)) {
    const contentId = contentIdMap[title];
    if (!contentId) { console.log(`  SKIP  ${title} — content not found`); continue; }

    console.log(`\n  ${title} (contentId: ${contentId})`);

    for (const ep of episodes) {
      const existing = await Episode.findOne({ contentId, season: ep.season, episodeNumber: ep.episodeNumber });
      if (existing) {
        console.log(`    SKIP  S${ep.season}E${ep.episodeNumber} — ${ep.title}`);
      } else {
        const thumbnailUrl = `https://picsum.photos/seed/${title.replace(/\s/g,'')}_s${ep.season}e${ep.episodeNumber}/320/180`;
        const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const videoKey_HD = `videos/${slug}/s${ep.season}e${ep.episodeNumber}_hd.mp4`;
        const videoKey_SD = `videos/${slug}/s${ep.season}e${ep.episodeNumber}_sd.mp4`;
        await Episode.create({ ...ep, contentId, thumbnailUrl, videoKey_HD, videoKey_SD, isActive: true });
        console.log(`    CREATE S${ep.season}E${ep.episodeNumber} — ${ep.title} (${ep.isFree ? 'FREE' : 'PREMIUM'})`);
      }
    }
  }

  console.log('\nDone.');
  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
