import dbConnect from '@/lib/db';
import Content from '@/models/Content';
import Episode from '@/models/Episode';

// Episodes keyed by content title — contentId is looked up at runtime
const EPISODES_BY_TITLE = {
  'Prem Kahaani': [
    // Season 1
    { season: 1, episodeNumber: 1, title: 'Pehli Mulaqat', description: 'Arjun and Priya meet by chance at a Mumbai café.', duration: 2400, isFree: true,  thumbnailUrl: 'https://picsum.photos/seed/pk_s1e1/320/180', videoKey_HD: 'videos/prem-kahaani/s1e1_hd.mp4', videoKey_SD: 'videos/prem-kahaani/s1e1_sd.mp4' },
    { season: 1, episodeNumber: 2, title: 'Doosri Baat',  description: 'A second encounter leads to an unexpected friendship.', duration: 2520, isFree: true,  thumbnailUrl: 'https://picsum.photos/seed/pk_s1e2/320/180', videoKey_HD: 'videos/prem-kahaani/s1e2_hd.mp4', videoKey_SD: 'videos/prem-kahaani/s1e2_sd.mp4' },
    { season: 1, episodeNumber: 3, title: 'Rishte Ki Dori', description: 'Family tensions rise as their bond deepens.', duration: 2700, isFree: false, thumbnailUrl: 'https://picsum.photos/seed/pk_s1e3/320/180', videoKey_HD: 'videos/prem-kahaani/s1e3_hd.mp4', videoKey_SD: 'videos/prem-kahaani/s1e3_sd.mp4' },
    { season: 1, episodeNumber: 4, title: 'Toota Sapna',  description: 'A misunderstanding tears them apart.', duration: 2580, isFree: false, thumbnailUrl: 'https://picsum.photos/seed/pk_s1e4/320/180', videoKey_HD: 'videos/prem-kahaani/s1e4_hd.mp4', videoKey_SD: 'videos/prem-kahaani/s1e4_sd.mp4' },
    { season: 1, episodeNumber: 5, title: 'Naya Savera',  description: 'Season 1 finale — a surprise reunion changes everything.', duration: 3000, isFree: false, thumbnailUrl: 'https://picsum.photos/seed/pk_s1e5/320/180', videoKey_HD: 'videos/prem-kahaani/s1e5_hd.mp4', videoKey_SD: 'videos/prem-kahaani/s1e5_sd.mp4' },
    // Season 2
    { season: 2, episodeNumber: 1, title: 'Naya Adhyay',  description: 'Six months later — Arjun returns from London.', duration: 2640, isFree: false, thumbnailUrl: 'https://picsum.photos/seed/pk_s2e1/320/180', videoKey_HD: 'videos/prem-kahaani/s2e1_hd.mp4', videoKey_SD: 'videos/prem-kahaani/s2e1_sd.mp4' },
    { season: 2, episodeNumber: 2, title: 'Purani Raahein', description: 'Old wounds reopen as they meet again.', duration: 2760, isFree: false, thumbnailUrl: 'https://picsum.photos/seed/pk_s2e2/320/180', videoKey_HD: 'videos/prem-kahaani/s2e2_hd.mp4', videoKey_SD: 'videos/prem-kahaani/s2e2_sd.mp4' },
    { season: 2, episodeNumber: 3, title: 'Pyaar Ka Faisla', description: 'The final choice — love or ambition?', duration: 3180, isFree: false, thumbnailUrl: 'https://picsum.photos/seed/pk_s2e3/320/180', videoKey_HD: 'videos/prem-kahaani/s2e3_hd.mp4', videoKey_SD: 'videos/prem-kahaani/s2e3_sd.mp4' },
  ],

  'Namma Ooru': [
    { season: 1, episodeNumber: 1, title: 'Ooru Pandu',     description: 'IAS officer Ravi arrives in his home village after 10 years.', duration: 2460, isFree: true,  thumbnailUrl: 'https://picsum.photos/seed/no_s1e1/320/180', videoKey_HD: 'videos/namma-ooru/s1e1_hd.mp4', videoKey_SD: 'videos/namma-ooru/s1e1_sd.mp4' },
    { season: 1, episodeNumber: 2, title: 'Patha Vaallu',   description: 'Ravi meets old friends and discovers a water crisis.', duration: 2520, isFree: true,  thumbnailUrl: 'https://picsum.photos/seed/no_s1e2/320/180', videoKey_HD: 'videos/namma-ooru/s1e2_hd.mp4', videoKey_SD: 'videos/namma-ooru/s1e2_sd.mp4' },
    { season: 1, episodeNumber: 3, title: 'Porata Margam',  description: 'The fight against the politician begins.', duration: 2700, isFree: false, thumbnailUrl: 'https://picsum.photos/seed/no_s1e3/320/180', videoKey_HD: 'videos/namma-ooru/s1e3_hd.mp4', videoKey_SD: 'videos/namma-ooru/s1e3_sd.mp4' },
    { season: 1, episodeNumber: 4, title: 'Matti Poru',     description: 'Villagers unite to protect their farmland.', duration: 2880, isFree: false, thumbnailUrl: 'https://picsum.photos/seed/no_s1e4/320/180', videoKey_HD: 'videos/namma-ooru/s1e4_hd.mp4', videoKey_SD: 'videos/namma-ooru/s1e4_sd.mp4' },
    { season: 1, episodeNumber: 5, title: 'Vijayam',        description: 'Season finale — justice prevails.', duration: 3120, isFree: false, thumbnailUrl: 'https://picsum.photos/seed/no_s1e5/320/180', videoKey_HD: 'videos/namma-ooru/s1e5_hd.mp4', videoKey_SD: 'videos/namma-ooru/s1e5_sd.mp4' },
  ],

  'Kalki': [
    { season: 1, episodeNumber: 1, title: 'Naangu Kaigal',  description: 'Officer Karthik goes undercover in Chennai\'s port district.', duration: 2700, isFree: true,  thumbnailUrl: 'https://picsum.photos/seed/kalki_e1/320/180', videoKey_HD: 'videos/kalki/s1e1_hd.mp4', videoKey_SD: 'videos/kalki/s1e1_sd.mp4' },
    { season: 1, episodeNumber: 2, title: 'Iravin Nizhal',  description: 'Karthik earns the trust of the syndicate\'s second-in-command.', duration: 2820, isFree: true,  thumbnailUrl: 'https://picsum.photos/seed/kalki_e2/320/180', videoKey_HD: 'videos/kalki/s1e2_hd.mp4', videoKey_SD: 'videos/kalki/s1e2_sd.mp4' },
    { season: 1, episodeNumber: 3, title: 'Thunbu Theriyal', description: 'A mole inside the police force is exposed.', duration: 3000, isFree: false, thumbnailUrl: 'https://picsum.photos/seed/kalki_e3/320/180', videoKey_HD: 'videos/kalki/s1e3_hd.mp4', videoKey_SD: 'videos/kalki/s1e3_sd.mp4' },
    { season: 1, episodeNumber: 4, title: 'Mudivurai',      description: 'The final confrontation — truth or loyalty?', duration: 3300, isFree: false, thumbnailUrl: 'https://picsum.photos/seed/kalki_e4/320/180', videoKey_HD: 'videos/kalki/s1e4_hd.mp4', videoKey_SD: 'videos/kalki/s1e4_sd.mp4' },
  ],

  'Theeram': [
    { season: 1, episodeNumber: 1, title: 'Kadal Kinavu',   description: 'The fishermen\'s cooperative faces its first eviction notice.', duration: 2580, isFree: true,  thumbnailUrl: 'https://picsum.photos/seed/theeram_e1/320/180', videoKey_HD: 'videos/theeram/s1e1_hd.mp4', videoKey_SD: 'videos/theeram/s1e1_sd.mp4' },
    { season: 1, episodeNumber: 2, title: 'Mazha Vili',     description: 'A young journalist arrives to cover the story.', duration: 2640, isFree: true,  thumbnailUrl: 'https://picsum.photos/seed/theeram_e2/320/180', videoKey_HD: 'videos/theeram/s1e2_hd.mp4', videoKey_SD: 'videos/theeram/s1e2_sd.mp4' },
    { season: 1, episodeNumber: 3, title: 'Oru Naalile',    description: 'Protests turn violent. The corporation escalates.', duration: 2880, isFree: false, thumbnailUrl: 'https://picsum.photos/seed/theeram_e3/320/180', videoKey_HD: 'videos/theeram/s1e3_hd.mp4', videoKey_SD: 'videos/theeram/s1e3_sd.mp4' },
    { season: 1, episodeNumber: 4, title: 'Theeram Kaanaan', description: 'Series finale — the community finds its voice.', duration: 3060, isFree: false, thumbnailUrl: 'https://picsum.photos/seed/theeram_e4/320/180', videoKey_HD: 'videos/theeram/s1e4_hd.mp4', videoKey_SD: 'videos/theeram/s1e4_sd.mp4' },
  ],

  'Hosa Baalina Kathe': [
    { season: 1, episodeNumber: 1, title: 'Bengaluru Bidi', description: 'Kiran quits his startup job and returns to his village near Mysuru.', duration: 2400, isFree: true,  thumbnailUrl: 'https://picsum.photos/seed/hbk_e1/320/180', videoKey_HD: 'videos/hosa-baalina-kathe/s1e1_hd.mp4', videoKey_SD: 'videos/hosa-baalina-kathe/s1e1_sd.mp4' },
    { season: 1, episodeNumber: 2, title: 'Hasiru Gadi',    description: 'Kiran tries to modernise the village farm and fails hilariously.', duration: 2520, isFree: true,  thumbnailUrl: 'https://picsum.photos/seed/hbk_e2/320/180', videoKey_HD: 'videos/hosa-baalina-kathe/s1e2_hd.mp4', videoKey_SD: 'videos/hosa-baalina-kathe/s1e2_sd.mp4' },
    { season: 1, episodeNumber: 3, title: 'Preethiya Payana', description: 'A childhood friend rekindles old memories.', duration: 2640, isFree: false, thumbnailUrl: 'https://picsum.photos/seed/hbk_e3/320/180', videoKey_HD: 'videos/hosa-baalina-kathe/s1e3_hd.mp4', videoKey_SD: 'videos/hosa-baalina-kathe/s1e3_sd.mp4' },
  ],

  'Raat Ke Raaste': [
    { season: 1, episodeNumber: 1, title: 'Teesri Seeti',   description: 'The night train departs Delhi. Three strangers share a compartment.', duration: 2700, isFree: true,  thumbnailUrl: 'https://picsum.photos/seed/rkr_e1/320/180', videoKey_HD: 'videos/raat-ke-raaste/s1e1_hd.mp4', videoKey_SD: 'videos/raat-ke-raaste/s1e1_sd.mp4' },
    { season: 1, episodeNumber: 2, title: 'Bhed Ka Raaz',   description: 'Each traveller\'s secret slowly unravels.', duration: 2820, isFree: true,  thumbnailUrl: 'https://picsum.photos/seed/rkr_e2/320/180', videoKey_HD: 'videos/raat-ke-raaste/s1e2_hd.mp4', videoKey_SD: 'videos/raat-ke-raaste/s1e2_sd.mp4' },
    { season: 1, episodeNumber: 3, title: 'Andhere Mein',   description: 'The train stops unexpectedly in the middle of nowhere.', duration: 3000, isFree: false, thumbnailUrl: 'https://picsum.photos/seed/rkr_e3/320/180', videoKey_HD: 'videos/raat-ke-raaste/s1e3_hd.mp4', videoKey_SD: 'videos/raat-ke-raaste/s1e3_sd.mp4' },
    { season: 1, episodeNumber: 4, title: 'Subah Ki Roshni', description: 'Series finale — the truth comes to light at dawn.', duration: 3180, isFree: false, thumbnailUrl: 'https://picsum.photos/seed/rkr_e4/320/180', videoKey_HD: 'videos/raat-ke-raaste/s1e4_hd.mp4', videoKey_SD: 'videos/raat-ke-raaste/s1e4_sd.mp4' },
  ],

  // Movies and shorts get a single "episode" that IS the full film
  'Tujhse Zyada': [
    { season: 1, episodeNumber: 1, title: 'Tujhse Zyada (Full Movie)', description: 'Full film — 1h 45min.', duration: 6300, isFree: false, thumbnailUrl: 'https://picsum.photos/seed/tujhsezyada_ep/320/180', videoKey_HD: 'videos/tujhse-zyada/full_hd.mp4', videoKey_SD: 'videos/tujhse-zyada/full_sd.mp4' },
  ],
  'Veera': [
    { season: 1, episodeNumber: 1, title: 'Veera (Full Movie)', description: 'Full film — 2h 10min.', duration: 7800, isFree: false, thumbnailUrl: 'https://picsum.photos/seed/veera_ep/320/180', videoKey_HD: 'videos/veera/full_hd.mp4', videoKey_SD: 'videos/veera/full_sd.mp4' },
  ],
  'Manasu Maata': [
    { season: 1, episodeNumber: 1, title: 'Manasu Maata (Full Movie)', description: 'Full film — 2h 05min.', duration: 7500, isFree: false, thumbnailUrl: 'https://picsum.photos/seed/manasumaata_ep/320/180', videoKey_HD: 'videos/manasu-maata/full_hd.mp4', videoKey_SD: 'videos/manasu-maata/full_sd.mp4' },
  ],
  'Ek Pal': [
    { season: 1, episodeNumber: 1, title: 'Ek Pal (Short Film)', description: 'Full short — 15min.', duration: 900, isFree: true, thumbnailUrl: 'https://picsum.photos/seed/ekpal_ep/320/180', videoKey_HD: 'videos/ek-pal/full_hd.mp4', videoKey_SD: 'videos/ek-pal/full_sd.mp4' },
  ],
  'Kadal Kaatru': [
    { season: 1, episodeNumber: 1, title: 'Kadal Kaatru (Short Film)', description: 'Full short — 18min.', duration: 1080, isFree: true, thumbnailUrl: 'https://picsum.photos/seed/kadalkaatru_ep/320/180', videoKey_HD: 'videos/kadal-kaatru/full_hd.mp4', videoKey_SD: 'videos/kadal-kaatru/full_sd.mp4' },
  ],
};

export async function POST() {
  try {
    await dbConnect();

    const titles = Object.keys(EPISODES_BY_TITLE);

    // Fetch all matching content in one query
    const contentList = await Content.find({ title: { $in: titles } }, { _id: 1, title: 1 }).lean();
    const contentMap = Object.fromEntries(contentList.map((c) => [c.title, c._id]));

    const results = [];

    for (const title of titles) {
      const contentId = contentMap[title];

      if (!contentId) {
        results.push({ title, status: 'skipped — content not found in DB, run seed-content first' });
        continue;
      }

      const episodes = EPISODES_BY_TITLE[title];
      const titleResults = [];

      for (const ep of episodes) {
        const existing = await Episode.findOne({ contentId, season: ep.season, episodeNumber: ep.episodeNumber });
        if (existing) {
          titleResults.push({ episode: `S${ep.season}E${ep.episodeNumber}`, status: 'skipped (exists)' });
          continue;
        }
        await Episode.create({ ...ep, contentId, isActive: true });
        titleResults.push({ episode: `S${ep.season}E${ep.episodeNumber} — ${ep.title}`, status: 'created' });
      }

      results.push({ title, contentId, episodes: titleResults });
    }

    return Response.json({ success: true, results });
  } catch (error) {
    console.error('[seed-episodes] Error:', error);
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}
