import mongoose from 'mongoose';

// Run with: node --env-file=.env.local scripts/seed-movies-2026.mjs
// Undo with: node --env-file=.env.local scripts/seed-movies-2026.mjs --undo
const seedBatch = 'tvk-local-movies-2026-v1';
const localUri = 'mongodb://127.0.0.1:27028/tvk_ott_local';
const poster = (path) => `https://upload.wikimedia.org/wikipedia/en/${path}`;
const still = (id) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;

const languages = {
  te: ['Telugu', 'తెలుగు'],
  hi: ['Hindi', 'हिन्दी'],
  ta: ['Tamil', 'தமிழ்'],
  kn: ['Kannada', 'ಕನ್ನಡ'],
  ml: ['Malayalam', 'മലയാളം'],
  en: ['English', 'English'],
};

const films = [
  {
    slug: 'peddi',
    title: 'Peddi',
    source: 'https://www.netflix.com/title/83075036',
    posterUrl: poster('2/26/Peddi_Poster.jpg'),
    bannerUrl: still('sF2dj7ycZvA'),
    genres: ['Drama', 'Sports', 'Action'],
    actors: ['Ram Charan', 'Janhvi Kapoor', 'Shiva Rajkumar', 'Jagapathi Babu', 'Divyenndu', 'Boman Irani'],
    directors: ['Buchi Babu Sana'],
    writers: ['Buchi Babu Sana'],
    variants: {
      te: ['పెద్ది', 'తన ఊరి గౌరవం కోసం ఒక గ్రామీణ క్రీడాకారుడు పోరాడతాడు.'],
      hi: ['पेद्दी', 'एक ग्रामीण खिलाड़ी अपने गाँव के सम्मान के लिए संघर्ष करता है।'],
      ta: ['பெத்தி', 'தன் கிராமத்தின் கௌரவத்திற்காக ஒரு விளையாட்டு வீரர் போராடுகிறார்.'],
      kn: ['ಪೆದ್ದಿ', 'ತನ್ನ ಹಳ್ಳಿಯ ಗೌರವಕ್ಕಾಗಿ ಒಬ್ಬ ಕ್ರೀಡಾಪಟು ಹೋರಾಡುತ್ತಾನೆ.'],
      ml: ['പെദ്ദി', 'തന്റെ ഗ്രാമത്തിന്റെ അഭിമാനത്തിനായി ഒരു കായികതാരം പോരാടുന്നു.'],
    },
  },
  {
    slug: 'dacoit-a-love-story',
    title: 'Dacoit: A Love Story',
    source: 'https://www.primevideo.com/detail/0U1APLVDPHLV8AYRJ9QGKP7ORH',
    posterUrl: poster('d/d2/Dacoit_-_A_Love_Story_Poster.jpg'),
    bannerUrl: still('8Y_D7-GCcxY'),
    genres: ['Action', 'Romance', 'Drama'],
    actors: ['Adivi Sesh', 'Mrunal Thakur', 'Anurag Kashyap'],
    directors: ['Shaneil Deo'],
    writers: ['Shaneil Deo', 'Adivi Sesh'],
    variants: {
      te: ['డెకాయిట్: ఒక ప్రేమ కథ', 'జైలు నుంచి తప్పించుకున్న హరి తన గతంలోని ప్రేమను, ద్రోహాన్ని ఎదుర్కొంటాడు.'],
      hi: ['डकैत: एक प्रेम कथा', 'जेल से भागने के बाद हरि अपने अतीत के प्यार और धोखे का सामना करता है।'],
      ta: ['டகாய்ட்: ஒரு காதல் கதை', 'சிறையிலிருந்து தப்பிய ஹரி தனது கடந்தகாலக் காதலையும் துரோகத்தையும் எதிர்கொள்கிறான்.'],
    },
  },
  {
    slug: 'the-raja-saab',
    title: 'The RajaSaab',
    source: 'https://www.youtube.com/watch?v=i-8w5yDwukA',
    posterUrl: poster('9/9e/The_RajaSaab_poster.jpg'),
    bannerUrl: still('i-8w5yDwukA'),
    genres: ['Horror', 'Fantasy', 'Comedy'],
    actors: ['Prabhas', 'Sanjay Dutt', 'Nidhhi Agerwal', 'Malavika Mohanan', 'Riddhi Kumar', 'Zarina Wahab'],
    directors: ['Maruthi'],
    writers: ['Maruthi'],
    variants: {
      te: ['ది రాజాసాబ్', 'తాత కోసం వెతుకుతున్న యువకుడు ఒక భవనంలో అతీంద్రియ రహస్యాన్ని ఎదుర్కొంటాడు.'],
      hi: ['द राजा साब', 'अपने दादा की तलाश में एक युवक ऐसी हवेली में पहुँचता है जहाँ एक अलौकिक रहस्य छिपा है।'],
      ta: ['தி ராஜா சாப்', 'தன் தாத்தாவைத் தேடும் இளைஞன் ஒரு மாளிகையில் அமானுஷ்ய மர்மத்தை எதிர்கொள்கிறான்.'],
      kn: ['ದಿ ರಾಜಾ ಸಾಬ್', 'ತಾತನನ್ನು ಹುಡುಕುವ ಯುವಕನಿಗೆ ಅರಮನೆಯಲ್ಲಿ ಅತೀಂದ್ರಿಯ ರಹಸ್ಯ ಎದುರಾಗುತ್ತದೆ.'],
      ml: ['ദി രാജാ സാബ്', 'മുത്തച്ഛനെ തേടുന്ന യുവാവ് ഒരു മാളികയിൽ അമാനുഷിക രഹസ്യം നേരിടുന്നു.'],
    },
  },
  {
    slug: 'border-2',
    title: 'Border 2',
    source: 'https://qr.netflix.com/in/title/81956873',
    posterUrl: poster('2/26/Border_2_Poster.jpg'),
    bannerUrl: 'https://occ-0-4857-3662.1.nflxso.net/dnm/api/v6/6AYY37jfdO6hpXcMjf9Yu5cnmO0/AAAABXolXWq_2LyB-CICMBx_Qs5XLiGWQeJrdfiSAram55yzgtUAxRtXfdQpmyamFuqEAkmTlbL82ShsVCD0jHGs4rS3lp70kIDlWio8.jpg?r=d8a',
    genres: ['War', 'Action', 'Drama'],
    actors: ['Sunny Deol', 'Varun Dhawan', 'Diljit Dosanjh', 'Ahan Shetty', 'Mona Singh', 'Sonam Bajwa', 'Medha Rana'],
    directors: ['Anurag Singh'],
    writers: ['Anurag Singh', 'Sumit Arora', 'Nidhi Dutta'],
    variants: {
      hi: ['बॉर्डर 2', '1971 के युद्ध में भारतीय सेना, नौसेना और वायुसेना के जवान अलग-अलग मोर्चों पर लड़ते हैं।'],
      en: ['Border 2', 'Indian soldiers, sailors and airmen face separate fronts during the 1971 war.'],
    },
  },
  {
    slug: 'dhurandhar-the-revenge',
    title: 'Dhurandhar: The Revenge',
    source: 'https://cdn.jiostar.com/jiostar/wp-content/uploads/2026/06/ELEVEN-MARQUEE-BRANDS-JOIN-JIOHOTSTAR-FOR-GRAND-%E2%80%98RAW-UNDEKHA-DIGITAL-PREMIERE-OF-BLOCKBUSTER-DHURANDHAR-THE-REVENGE.docx-Google-Docs.pdf',
    posterUrl: poster('c/c8/Dhurandhar-_The_Revenge_poster.jpg'),
    bannerUrl: still('qfQ4-suh4Pk'),
    genres: ['Action', 'Thriller', 'Crime'],
    actors: ['Ranveer Singh', 'Arjun Rampal', 'Sanjay Dutt', 'R. Madhavan', 'Sara Arjun', 'Rakesh Bedi', 'Gaurav Gera', 'Danish Pandor'],
    directors: ['Aditya Dhar'],
    writers: ['Aditya Dhar'],
    variants: {
      hi: ['धुरंधर: द रिवेंज', 'भारतीय एजेंट जसकीरत सिंह रंगी हमज़ा की पहचान से कराची के अपराध जगत में आगे बढ़ता है।'],
      te: ['ధురంధర్: ది రివెంజ్', 'హమ్జా పేరుతో భారతీయ ఏజెంట్ జస్కీరత్ సింగ్ రంగీ కరాచీ నేర ప్రపంచంలోకి చొరబడతాడు.'],
      ta: ['துரந்தர்: தி ரிவெஞ்ச்', 'ஹம்சா என்ற பெயரில் இந்திய உளவாளி ஜஸ்கீரத் சிங் ரங்கி கராச்சியின் குற்ற உலகில் ஊடுருவுகிறார்.'],
      kn: ['ಧುರಂಧರ್: ದಿ ರಿವೆಂಜ್', 'ಹಮ್ಜಾ ಎಂಬ ಹೆಸರಿನಲ್ಲಿ ಭಾರತೀಯ ಏಜೆಂಟ್ ಜಸ್ಕೀರತ್ ಸಿಂಗ್ ರಂಗಿ ಕರಾಚಿಯ ಅಪರಾಧ ಲೋಕವನ್ನು ಪ್ರವೇಶಿಸುತ್ತಾನೆ.'],
      ml: ['ധുരന്ധർ: ദ റിവഞ്ച്', 'ഹംസ എന്ന പേരിൽ ഇന്ത്യൻ ഏജന്റ് ജസ്കീരത് സിങ് രംഗി കറാച്ചിയിലെ കുറ്റലോകത്തിലേക്ക് കടക്കുന്നു.'],
    },
  },
];

const flags = process.argv.slice(2);
if (flags.length > 1 || (flags.length === 1 && flags[0] !== '--undo')) {
  throw new Error('Usage: seed-movies-2026.mjs [--undo]');
}
if (process.env.MONGODB_URI !== localUri) {
  throw new Error('This fixture can only run against the configured local TVK database on port 27028.');
}

await mongoose.connect(localUri, { serverSelectionTimeoutMS: 5000 });
const db = mongoose.connection.db;
const fixtureCollections = ['banners', 'contents', 'artists', 'genres', 'languages'];
const fixture = { seedBatch };

async function insertIfMissing(collection, filter, fields) {
  const now = new Date();
  return db.collection(collection).findOneAndUpdate(
    filter,
    { $setOnInsert: { ...fields, ...fixture, createdAt: now, updatedAt: now } },
    { upsert: true, returnDocument: 'after' },
  );
}

async function seed() {
  for (const [order, [code, [englishName, nativeName]]] of Object.entries(languages).entries()) {
    await insertIfMissing('languages', { code }, { code, englishName, nativeName, isActive: true, order });
  }

  const genreNames = [...new Set(films.flatMap((film) => film.genres))];
  for (const [index, name] of genreNames.entries()) {
    const slug = name.toLowerCase();
    await insertIfMissing('genres', { $or: [{ slug }, { name }] }, { name, slug, isActive: true, displayOrder: index });
  }

  for (const [index, film] of films.entries()) {
    const cast = {};
    for (const [group, type] of [['actors', 'actor'], ['directors', 'director'], ['writers', 'writer']]) {
      cast[group] = [];
      for (const name of film[group]) {
        const artist = await insertIfMissing('artists', { name }, { name, type, bio: '', photo: '' });
        cast[group].push({ artistId: artist._id, name: artist.name, photo: artist.photo || '' });
      }
    }

    // Reuse credited people across films, while retaining distinct roles in each film.
    const localizations = Object.entries(film.variants).map(([language, [title, description]]) => ({
      language, title, description, posterUrl: film.posterUrl, bannerUrl: film.bannerUrl,
    }));
    const primary = localizations[0];
    const names = localizations.map((row) => languages[row.language][0]);
    const movie = await insertIfMissing('contents', { slug: film.slug }, {
      slug: film.slug,
      title: film.title,
      description: primary.description,
      type: 'movie',
      releaseYear: 2026,
      // Both fields are read by existing TVK catalog endpoints.
      language: names,
      languages: names,
      primaryLanguage: primary.language,
      localizations,
      genres: film.genres,
      posterUrl: film.posterUrl,
      thumbnailUrl: film.posterUrl,
      bannerUrl: film.bannerUrl,
      cast,
      pricing: 'free',
      isActive: false,
      isDeleted: false,
    });

    if (movie.seedBatch !== seedBatch) {
      console.log(`Skipped existing Movie: ${film.title}`);
      continue;
    }
    await insertIfMissing('banners', { ...fixture, linkedContentId: movie._id }, {
      title: film.title,
      imageUrl: film.bannerUrl,
      linkedContentId: movie._id,
      linkedContentType: 'movie',
      order: index + 1,
      isActive: false,
      isDeleted: false,
    });
    console.log(`Movie draft ready: ${film.title} (${names.join(', ')})`);
  }
}

try {
  if (flags[0] === '--undo') {
    for (const collection of ['banners', 'contents']) {
      const { deletedCount } = await db.collection(collection).deleteMany(fixture);
      console.log(`${collection}: removed ${deletedCount} seed records`);
    }

    // A different fixture or an ordinary title can reuse these catalog values.
    const titles = db.collection('contents');
    const [genreNames, languageNames, languageCodes, artistIdsByRole] = await Promise.all([
      titles.distinct('genres'),
      titles.distinct('language'),
      titles.distinct('localizations.language'),
      Promise.all(['contents', 'seasons'].flatMap((collection) =>
        ['actors', 'directors', 'writers'].map((role) =>
          db.collection(collection).distinct(`cast.${role}.artistId`)))),
    ]);
    const unused = {
      artists: { _id: { $nin: artistIdsByRole.flat() } },
      genres: { name: { $nin: genreNames } },
      languages: { code: { $nin: languageCodes }, englishName: { $nin: languageNames } },
    };
    for (const [collection, filter] of Object.entries(unused)) {
      const { deletedCount } = await db.collection(collection).deleteMany({ ...fixture, ...filter });
      console.log(`${collection}: removed ${deletedCount} unreferenced seed records`);
    }
  } else {
    await seed();
    for (const collection of fixtureCollections) {
      const count = await db.collection(collection).countDocuments(fixture);
      console.log(`${collection}: ${count} seed records`);
    }
  }
} finally {
  await mongoose.disconnect();
}
