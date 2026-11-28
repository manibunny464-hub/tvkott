import mongoose from 'mongoose';

const localUri = 'mongodb://127.0.0.1:27028/tvk_ott_local';
const fixture = { seedBatch: 'tvk-local-series-v1' };
const collections = ['episodes', 'seasons', 'contents', 'artists', 'genres', 'languages'];
const artworkBase = 'https://occ-0-4857-3662.1.nflxso.net/dnm/api/v6/6AYY37jfdO6hpXcMjf9Yu5cnmO0/';
const languages = {
  hi: ['Hindi', 'हिन्दी'],
  te: ['Telugu', 'తెలుగు'],
  ta: ['Tamil', 'தமிழ்'],
  en: ['English', 'English'],
};
const numberedEpisodes = (minutes) => minutes.map((length, index) => ['Episode ' + (index + 1), length]);

const shows = [
  {
    title: 'Heeramandi: The Diamond Bazaar', slug: 'heeramandi-the-diamond-bazaar', year: 2024,
    source: 'https://www.netflix.com/in/title/81122198',
    poster: 'e/ea/Heeramandi_Poster.jpg',
    banner: 'AAAABZdCWAQGXLMIwxzhnB93cnTIVTvqV38FBs9La-ZS5JSfrl6Ishd2N4lmGPsxsXXyvLrt1ynVznervzwsTwsw2rDXk9xgYGa698nF.jpg?r=3aa',
    genres: ['Drama', 'Romance'],
    cast: {
      actors: ['Manisha Koirala', 'Sonakshi Sinha', 'Aditi Rao Hydari', 'Sharmin Segal', 'Richa Chadha', 'Sanjeeda Shaikh'],
      directors: ['Sanjay Leela Bhansali'],
    },
    variants: {
      hi: ['हीरामंडी: द डायमंड बाज़ार', 'ब्रिटिश शासन के अंतिम दौर में लाहौर की तवायफ़ों की दुनिया मोहब्बत, सत्ता और आज़ादी की लड़ाई से बदलती है।'],
      te: ['హీరామండి: ది డైమండ్ బజార్', 'బ్రిటిష్ పాలన చివరి రోజుల్లో లాహోర్ కళాకారిణుల జీవితాలను ప్రేమ, ఆధిపత్యం, స్వాతంత్య్ర పోరాటం మారుస్తాయి.'],
      ta: ['ஹீராமண்டி: தி டைமண்ட் பஜார்', 'பிரிட்டிஷ் ஆட்சியின் இறுதியில் லாகூரின் கலைஞர்களின் வாழ்வை காதலும் அதிகாரப் போட்டியும் மாற்றுகின்றன.'],
      en: ['Heeramandi: The Diamond Bazaar', 'Love, power and the independence movement unsettle the lives of courtesans in pre-independence Lahore.'],
    },
    episodes: [
      ['Mallikajaan - The Queen of Heeramandi', 68], ['Fareedanjaan - The Challenger Returns', 47],
      ['Waheedajaan - Scarred for Life', 60], ['Alamzeb - The Innocent Pawn', 62],
      ['Tajdar - The Lover’s Dilemma', 48], ['Tajdar & Alamzeb - Nation v/s Love', 58],
      ['Bibbojaan - Long Live the Revolution', 47], ['Heeramandi - The Swan Song', 46],
    ],
  },
  {
    title: 'The Railway Men', slug: 'the-railway-men', year: 2023,
    source: 'https://www.netflix.com/in/title/81711003',
    poster: 'https://mir-s3-cdn-cf.behance.net/project_modules/fs_webp/cda817187691007.658ddc2151501.jpg',
    banner: 'AAAABeCx8IF1pq5m6qux_fMh4d8jKA7twWa9mwtlrDdXHaCTUedzJcHVZNdHHMa_0A64CXj5Fkm2PzenvzphZiclwyxjHL_zG6HRV9kI.jpg?r=b61',
    genres: ['Drama', 'Thriller'],
    cast: { actors: ['R. Madhavan', 'Kay Kay Menon', 'Divyenndu', 'Babil Khan'], directors: ['Shiv Rawail'], writers: ['Aayush Gupta'] },
    variants: {
      hi: ['द रेलवे मेन', '1984 की भोपाल गैस त्रासदी के दौरान रेलवे कर्मचारी फँसे हुए लोगों को बचाने की कोशिश करते हैं।'],
      te: ['ది రైల్వే మెన్', '1984 భోపాల్ గ్యాస్ దుర్ఘటనలో చిక్కుకున్న ప్రజలను రైల్వే సిబ్బంది కాపాడేందుకు ప్రయత్నిస్తారు.'],
      ta: ['தி ரயில்வே மென்', '1984 போபால் விஷவாயு பேரழிவில் சிக்கியவர்களை ரயில்வே ஊழியர்கள் காப்பாற்ற முயல்கின்றனர்.'],
      en: ['The Railway Men', 'Railway workers race to rescue stranded people during the 1984 Bhopal gas disaster.'],
    },
    episodes: numberedEpisodes([55, 64, 51, 65]),
  },
  {
    title: 'IC 814: The Kandahar Hijack', slug: 'ic-814-the-kandahar-hijack', year: 2024,
    source: 'https://www.netflix.com/in/title/81265803',
    poster: 'a/aa/IC_814_-_The_Kandahar_Hijack.jpg',
    banner: 'AAAABTfDAPdry3zLXhFyCZ3I1LbPUffian5NUGkn6-_wONXjKJjBE2BrLOEC2CNVxjsZeGxA3_YuHnLOd9KwrJohW7RyCbNTNjmSbnyU.jpg?r=180',
    genres: ['Drama', 'Thriller'],
    cast: {
      actors: ['Naseeruddin Shah', 'Pankaj Kapur', 'Vijay Varma', 'Manoj Pahwa', 'Kumud Mishra', 'Arvind Swamy', 'Dia Mirza'],
      directors: ['Anubhav Sinha'], writers: ['Anubhav Sinha', 'Trishant Srivastava'],
    },
    variants: {
      hi: ['आईसी 814: द कंधार हाईजैक', '1999 में एक भारतीय यात्री विमान के अपहरण के बाद अधिकारी बंधकों की रिहाई के लिए बातचीत करते हैं।'],
      te: ['ఐసీ 814: ది కాందహార్ హైజాక్', '1999లో భారత ప్రయాణికుల విమానం హైజాక్ కావడంతో బందీల విడుదల కోసం అధికారులు చర్చలు జరుపుతారు.'],
      ta: ['ஐசி 814: தி காந்தஹார் ஹைஜாக்', '1999இல் இந்திய பயணிகள் விமானம் கடத்தப்பட்டபோது பணயக்கைதிகளை மீட்க அதிகாரிகள் பேச்சுவார்த்தை நடத்துகின்றனர்.'],
      en: ['IC 814: The Kandahar Hijack', 'Officials negotiate for the release of hostages after an Indian passenger flight is hijacked in 1999.'],
    },
    episodes: numberedEpisodes([44, 45, 41, 52, 48, 33]),
  },
  {
    title: 'Black Warrant', slug: 'black-warrant', year: 2025,
    source: 'https://www.netflix.com/in/title/81971071',
    poster: '0/03/Black_Warrant_Poster.jpeg',
    banner: 'AAAABS58b5teDi1F9pumlJJfzvz7TNyzJXeHqXHo0aZTsrQWz3Jr3YdZZ3g72J8qczZxBzrVeEH5n0zcdkF1QUBjHT1NCh02Zhqfg-4L.jpg?r=f67',
    genres: ['Crime', 'Drama', 'Thriller'],
    cast: {
      actors: ['Zahan Kapoor', 'Rahul Bhat', 'Paramvir Singh Cheema', 'Anurag Thakur', 'Sidhant Gupta'],
      directors: ['Vikramaditya Motwane', 'Satyanshu Singh'],
    },
    variants: {
      hi: ['ब्लैक वॉरंट', 'तिहाड़ जेल में काम शुरू करने वाला एक युवा अधिकारी वहाँ की हिंसा और भ्रष्टाचार से जूझता है।'],
      te: ['బ్లాక్ వారెంట్', 'తిహార్ జైలులో చేరిన యువ అధికారి అక్కడి హింసను, అవినీతిని ఎదుర్కొంటాడు.'],
      ta: ['பிளாக் வாரண்ட்', 'திகார் சிறையில் புதிதாகப் பணியில் சேரும் இளம் அதிகாரி வன்முறையையும் ஊழலையும் எதிர்கொள்கிறார்.'],
      en: ['Black Warrant', 'A young officer confronts violence and corruption after joining Tihar Jail.'],
    },
    episodes: [['Saanp', 51], ['Phaansi Kothi', 49], ['Dhaakad', 42], ['Team Player', 48], ['Jail ka Khaana', 44], ['Kambal', 45], ['Double Umar Qaid', 54]],
  },
  {
    title: 'The Royals', slug: 'the-royals', year: 2025,
    source: 'https://www.netflix.com/in/title/81593166',
    poster: 'c/c0/The_Royals_%282025_TV_series%29.jpg',
    banner: 'AAAABWvxMKpUO8zPwGc56i3gRz5bgnmhsaTLvjyz62b6BMdiB7uLQD-zVJcm50Mqjac0uiz9gBJIAheukIg_SkA2YIsC6KD4yz4fsnEL.jpg?r=fce',
    genres: ['Romance', 'Comedy', 'Drama'],
    cast: {
      actors: ['Bhumi Pednekar', 'Ishaan Khatter', 'Sakshi Tanwar', 'Zeenat Aman', 'Nora Fatehi', 'Vihaan Samat'],
      directors: ['Priyanka Ghose', 'Nupur Asthana'], writers: ['Neha Veena Sharma'],
    },
    variants: {
      hi: ['द रॉयल्स', 'एक उद्यमी और एक राजकुमार पुराने महल को बचाने के लिए साथ आते हैं और उनके बीच प्यार पनपता है।'],
      te: ['ది రాయల్స్', 'పాత రాజభవనాన్ని కాపాడేందుకు కలిసి పనిచేసే వ్యాపారవేత్త, యువరాజు మధ్య ప్రేమ మొదలవుతుంది.'],
      ta: ['தி ராயல்ஸ்', 'பழைய அரண்மனையைக் காப்பாற்ற இணைந்து செயல்படும் தொழில்முனைவோருக்கும் இளவரசருக்கும் இடையே காதல் மலர்கிறது.'],
      en: ['The Royals', 'An entrepreneur and a prince grow closer as they work together to save a struggling royal estate.'],
    },
    episodes: [
      ['A Royal Misunderstanding.', 40], ['A Pitch Made in Heaven.', 39], ['A Swing and a Ms.', 45], ['A Ball to Remember.', 44],
      ['The Ex-Factor.', 43], ['The Maharaja and the CEO.', 48], ['The Maharaja who Loved.', 45], ['Lights, Camera, AUCTION!', 49],
    ],
  },
];

const args = process.argv.slice(2);
if (args.length && (args.length !== 1 || args[0] !== '--undo')) throw new Error('Usage: seed-series.mjs [--undo]');
if (process.env.MONGODB_URI !== localUri) throw new Error('Only the local TVK test database on port 27028 is supported.');

await mongoose.connect(localUri, { serverSelectionTimeoutMS: 5000 });
const db = mongoose.connection.db;

async function insert(collection, query, document) {
  const now = new Date();
  return db.collection(collection).findOneAndUpdate(query, {
    $setOnInsert: { ...document, ...fixture, createdAt: now, updatedAt: now },
  }, { upsert: true, returnDocument: 'after' });
}

async function seed() {
  for (const [order, [code, [englishName, nativeName]]] of Object.entries(languages).entries()) {
    await insert('languages', { code }, { code, englishName, nativeName, isActive: true, order });
  }
  for (const [displayOrder, name] of [...new Set(shows.flatMap((show) => show.genres))].entries()) {
    const slug = name.toLowerCase();
    await insert('genres', { $or: [{ slug }, { name }] }, { slug, name, displayOrder, isActive: true });
  }
  for (const show of shows) {
    const existing = await db.collection('contents').findOne({ slug: show.slug });
    if (existing && existing.seedBatch !== fixture.seedBatch) {
      console.log('Skipped existing title: ' + show.title);
      continue;
    }
    const cast = { actors: [], directors: [], writers: [] };
    for (const [group, type] of [['actors', 'actor'], ['directors', 'director'], ['writers', 'writer']]) {
      for (const name of show.cast[group] || []) {
        const person = await insert('artists', { name }, { name, type, bio: '', photo: '' });
        cast[group].push({ artistId: person._id, name: person.name, photo: person.photo || '' });
      }
    }
    const posterUrl = show.poster.startsWith('https://') ? show.poster : 'https://upload.wikimedia.org/wikipedia/en/' + show.poster;
    const bannerUrl = artworkBase + show.banner;
    const localizations = Object.entries(show.variants).map(([language, [title, description]]) => ({
      language, title, description, posterUrl, bannerUrl,
    }));
    const names = localizations.map(({ language }) => languages[language][0]);
    const series = await insert('contents', { slug: show.slug }, {
      title: show.title, slug: show.slug, description: show.variants.en[1], type: 'series',
      releaseYear: show.year, genres: show.genres, language: names, languages: names,
      primaryLanguage: 'hi', localizations, posterUrl, thumbnailUrl: posterUrl, bannerUrl, cast,
      isActive: false, isDeleted: false, totalSeasons: 1, pricing: 'free',
    });
    if (series.seedBatch !== fixture.seedBatch) continue;
    const season = await insert('seasons', { seriesId: series._id, seasonNumber: 1 }, {
      seriesId: series._id, seasonNumber: 1, title: 'Season 1', poster: posterUrl, cast,
      isActive: false, isDeleted: false,
    });
    if (season.seedBatch !== fixture.seedBatch) continue;
    for (const [index, [title, minutes]] of show.episodes.entries()) {
      const episodeNumber = index + 1;
      await insert('episodes', { seasonId: season._id, episodeNumber }, {
        seriesId: series._id, seasonId: season._id, episodeNumber, title, duration: minutes * 60,
        status: 'Draft', isActive: false, isDeleted: false,
        languages: names.map((language) => ({ language, title, videoFiles: [] })),
      });
    }
    console.log(show.title + ' — ' + show.episodes.length + ' draft episodes');
  }
}

try {
  if (args[0] === '--undo') {
    for (const collection of collections) {
      const { deletedCount } = await db.collection(collection).deleteMany(fixture);
      console.log(collection + ': removed ' + deletedCount + ' seed records');
    }
  } else {
    await seed();
    for (const collection of collections) {
      console.log(collection + ': ' + await db.collection(collection).countDocuments(fixture) + ' seed records');
    }
  }
} finally {
  await mongoose.disconnect();
}
