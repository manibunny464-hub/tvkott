import dbConnect from '@/lib/db';
import Content from '@/models/Content';

const CONTENT_DATA = [
  // ─── SERIES ──────────────────────────────────────────────────────────────
  {
    title: 'Prem Kahaani',
    description: 'A young couple navigates love, family pressure, and modern relationships in Mumbai.',
    language: ['hi'],
    genres: ['Romance', 'Drama'],
    type: 'series',
    rating: 'U/A 13+',
    releaseYear: 2024,
    thumbnailUrl: 'https://picsum.photos/seed/premkahaani/400/600',
    bannerUrl: 'https://picsum.photos/seed/premkahaanibanner/1200/600',
    isFeatured: true,
    isTrending: true,
    trendingRank: 1,
    totalSeasons: 2,
    tags: ['romance', 'hindi', 'drama', 'love story'],
  },
  {
    title: 'Namma Ooru',
    description: 'A village in Andhra Pradesh is turned upside down when a young IAS officer returns home.',
    language: ['te'],
    genres: ['Drama', 'Family'],
    type: 'series',
    rating: 'U',
    releaseYear: 2024,
    thumbnailUrl: 'https://picsum.photos/seed/nammaooru/400/600',
    bannerUrl: 'https://picsum.photos/seed/nammaoorubanner/1200/600',
    isFeatured: true,
    isTrending: true,
    trendingRank: 2,
    totalSeasons: 1,
    tags: ['telugu', 'village', 'drama', 'family'],
  },
  {
    title: 'Kalki',
    description: 'An undercover cop infiltrates a crime syndicate in Chennai, risking everything he loves.',
    language: ['ta'],
    genres: ['Action', 'Thriller'],
    type: 'series',
    rating: 'U/A 16+',
    releaseYear: 2024,
    thumbnailUrl: 'https://picsum.photos/seed/kalki/400/600',
    bannerUrl: 'https://picsum.photos/seed/kalkibanner/1200/600',
    isFeatured: false,
    isTrending: true,
    trendingRank: 3,
    totalSeasons: 1,
    tags: ['tamil', 'action', 'thriller', 'crime', 'cop'],
  },
  {
    title: 'Theeram',
    description: 'A fisherman community in Kerala fights against illegal land acquisition by a powerful corporation.',
    language: ['ml'],
    genres: ['Drama', 'Social'],
    type: 'series',
    rating: 'U/A 13+',
    releaseYear: 2023,
    thumbnailUrl: 'https://picsum.photos/seed/theeram/400/600',
    bannerUrl: 'https://picsum.photos/seed/theerambanner/1200/600',
    isFeatured: true,
    isTrending: false,
    totalSeasons: 1,
    tags: ['malayalam', 'drama', 'social', 'kerala'],
  },
  {
    title: 'Hosa Baalina Kathe',
    description: 'A coming-of-age story of a Bengaluru tech worker who rediscovers his roots.',
    language: ['kn'],
    genres: ['Drama', 'Comedy'],
    type: 'series',
    rating: 'U',
    releaseYear: 2024,
    thumbnailUrl: 'https://picsum.photos/seed/hosabaalina/400/600',
    bannerUrl: 'https://picsum.photos/seed/hosabaalinabanner/1200/600',
    isFeatured: false,
    isTrending: true,
    trendingRank: 5,
    totalSeasons: 1,
    tags: ['kannada', 'comedy', 'drama', 'bengaluru'],
  },
  {
    title: 'Raat Ke Raaste',
    description: 'Three strangers on a night train from Delhi share secrets that change their lives forever.',
    language: ['hi'],
    genres: ['Thriller', 'Mystery'],
    type: 'series',
    rating: 'U/A 16+',
    releaseYear: 2024,
    thumbnailUrl: 'https://picsum.photos/seed/raatkeraaste/400/600',
    bannerUrl: 'https://picsum.photos/seed/raatkeraastebanner/1200/600',
    isFeatured: false,
    isTrending: true,
    trendingRank: 4,
    totalSeasons: 1,
    tags: ['hindi', 'thriller', 'mystery', 'night', 'suspense'],
  },
  // ─── MOVIES ──────────────────────────────────────────────────────────────
  {
    title: 'Tujhse Zyada',
    description: 'A heart-warming Hindi romantic film about long-distance love in the age of social media.',
    language: ['hi'],
    genres: ['Romance'],
    type: 'movie',
    rating: 'U',
    releaseYear: 2024,
    thumbnailUrl: 'https://picsum.photos/seed/tujhsezyada/400/600',
    bannerUrl: 'https://picsum.photos/seed/tujhsezyadabanner/1200/600',
    isFeatured: true,
    isTrending: false,
    totalSeasons: 1,
    tags: ['hindi', 'romance', 'love', 'movie'],
  },
  {
    title: 'Veera',
    description: 'A fearless Tamil warrior fights to protect his village from a tyrannical zamindar.',
    language: ['ta'],
    genres: ['Action', 'Historical'],
    type: 'movie',
    rating: 'U/A 13+',
    releaseYear: 2023,
    thumbnailUrl: 'https://picsum.photos/seed/veera/400/600',
    bannerUrl: 'https://picsum.photos/seed/veerabanner/1200/600',
    isFeatured: false,
    isTrending: true,
    trendingRank: 6,
    totalSeasons: 1,
    tags: ['tamil', 'action', 'historical', 'warrior'],
  },
  {
    title: 'Manasu Maata',
    description: 'A Telugu drama about a mother sacrificing everything to fulfil her daughter\'s dream.',
    language: ['te'],
    genres: ['Drama', 'Family'],
    type: 'movie',
    rating: 'U',
    releaseYear: 2024,
    thumbnailUrl: 'https://picsum.photos/seed/manasumaata/400/600',
    bannerUrl: 'https://picsum.photos/seed/manasumaatabanner/1200/600',
    isFeatured: false,
    isTrending: false,
    totalSeasons: 1,
    tags: ['telugu', 'family', 'drama', 'emotional'],
  },
  // ─── SHORTS ──────────────────────────────────────────────────────────────
  {
    title: 'Ek Pal',
    description: 'A 15-minute short film about two strangers who meet on a rooftop and find unexpected connection.',
    language: ['hi'],
    genres: ['Romance', 'Short Film'],
    type: 'short',
    rating: 'U',
    releaseYear: 2024,
    thumbnailUrl: 'https://picsum.photos/seed/ekpal/400/600',
    bannerUrl: 'https://picsum.photos/seed/ekpalbanner/1200/600',
    isFeatured: false,
    isTrending: false,
    totalSeasons: 1,
    tags: ['hindi', 'short', 'romance', 'rooftop'],
  },
  {
    title: 'Kadal Kaatru',
    description: 'A Tamil short about a lighthouse keeper\'s solitary life and a message in a bottle that changes it.',
    language: ['ta'],
    genres: ['Drama', 'Short Film'],
    type: 'short',
    rating: 'U',
    releaseYear: 2023,
    thumbnailUrl: 'https://picsum.photos/seed/kadalkaatru/400/600',
    bannerUrl: null,
    isFeatured: false,
    isTrending: false,
    totalSeasons: 1,
    tags: ['tamil', 'short', 'drama', 'sea'],
  },
];

export async function POST() {
  try {
    await dbConnect();

    const results = [];

    for (const item of CONTENT_DATA) {
      const existing = await Content.findOne({ title: item.title });
      if (existing) {
        results.push({ title: item.title, status: 'skipped (already exists)', id: existing._id });
        continue;
      }
      const created = await Content.create({ ...item, isActive: true });
      results.push({ title: created.title, status: 'created', id: created._id, type: created.type });
    }

    return Response.json({ success: true, total: results.length, results });
  } catch (error) {
    console.error('[seed-content] Error:', error);
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}
