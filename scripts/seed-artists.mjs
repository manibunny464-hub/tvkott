import mongoose from 'mongoose';

const MONGODB_URI = 'REPLACE_WITH_ENVIRONMENT_VALUE';

// ── Artist Schema ─────────────────────────────────────────────────────────
const ArtistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['actor', 'director', 'writer'], required: true },
  bio: { type: String, default: '' },
  photo: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const Artist = mongoose.models.Artist || mongoose.model('Artist', ArtistSchema);

const ARTISTS_DATA = [
  // Actors
  {
    name: 'Harold Perrineau',
    type: 'actor',
    bio: 'An American actor best known for his roles as Michael Dawson in Lost, Link in The Matrix trilogy, and Boyd Stevens in From.',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'Catalina Sandino Moreno',
    type: 'actor',
    bio: 'A Colombian actress who shared the Silver Bear for Best Actress at the Berlin Film Festival and was nominated for the Academy Award for Maria Full of Grace.',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'Eion Bailey',
    type: 'actor',
    bio: 'An American actor known for Band of Brothers, Once Upon a Time, and his role as Jim Matthews in From.',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'David Alpay',
    type: 'actor',
    bio: 'A Canadian actor known for Ararat, The Vampire Diaries, and Jade Herrera in From.',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'Elizabeth Saunders',
    type: 'actor',
    bio: 'A Canadian actress known for It, Orphan Black, and her role as Donna Raines in From.',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'Scott McCord',
    type: 'actor',
    bio: 'An actor and singer known for his roles in Total Drama, The Sinner, and Victor in From.',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'Ricky He',
    type: 'actor',
    bio: 'An actor known for The Good Doctor, Freaky Friday, and Kenny Liu in From.',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'Chloe Van Landschoot',
    type: 'actor',
    bio: 'An actress and director known for Lune, Chris Watts: Confessions of a Killer, and Kristi Miller in From.',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'Pegah Ghafoori',
    type: 'actor',
    bio: 'An Iranian-Canadian actress known for Fatima Hassan in From.',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'Corteon Moore',
    type: 'actor',
    bio: 'An actor known for Slasher, Utopia Falls, and Ellis Stevens in From.',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'Hannah Cheramy',
    type: 'actor',
    bio: 'An actress known for Van Helsing, Under Wraps, and Julie Matthews in From.',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'Simon Webster',
    type: 'actor',
    bio: 'A young actor known for When Hope Calls, Lucas the Spider, and Ethan Matthews in From.',
    photo: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'Avery Konrad',
    type: 'actor',
    bio: 'An actress known for Honor Society, Sacred Lies, and Sara Myers in From.',
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'Kaelen Ohm',
    type: 'actor',
    bio: 'An actress and director, known for her role as Marielle Sinclair in From, Queen of Spades, and Condor.',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'AJ Simmons',
    type: 'actor',
    bio: 'An actor known for his roles as Randall Kirkland in From, and appearing in several TV series like Reacher.',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'Nathan D. Simmons',
    type: 'actor',
    bio: 'An actor known for his role as Elgin Williams in From and various Canadian theater productions.',
    photo: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'Shaun Majumder',
    type: 'actor',
    bio: 'A Canadian comedian and actor known for his role as Father Khatri in From, and his work on This Hour Has 22 Minutes.',
    photo: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'Elizabeth Moy',
    type: 'actor',
    bio: 'An actress known for her role as Tian Chen Liu, the mother of Kenny Liu, in the series From.',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'Robert Joy',
    type: 'actor',
    bio: 'A veteran Canadian character actor, known for CSI: NY, Land of the Dead, and Henry Kavanaugh in From.',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'Deborah Grover',
    type: 'actor',
    bio: 'A Canadian actress known for Anne with an E, Jann, and her role as Tillie in From.',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'Angela Moore',
    type: 'actor',
    bio: 'An actress known for her roles in The L Word, A Series of Unfortunate Events, and Bakta in From.',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
  },

  // Writers
  {
    name: 'John Griffin',
    type: 'writer',
    bio: 'Creator and head writer of the MGM+ sci-fi horror series From.',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'Jeff Pinkner',
    type: 'writer',
    bio: 'An American television writer and producer known for his work on Alias, Lost, Fringe, and From.',
    photo: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=300&h=300&fit=crop&crop=face',
  },

  // Directors
  {
    name: 'Jack Bender',
    type: 'director',
    bio: 'A prominent American television director and executive producer best known for Lost, Game of Thrones, and From.',
    photo: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'Brad Turner',
    type: 'director',
    bio: 'A Canadian television director and producer known for 24, Homeland, and directing episodes of From.',
    photo: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'Alexandra La Roche',
    type: 'director',
    bio: 'A director and producer, known for directing episodes of From, The Flash, and Supergirl.',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'Bruce McDonald',
    type: 'director',
    bio: 'A Canadian director, writer, and producer known for Roadkill, Hard Core Logo, and directing episodes of From.',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'Jeff Renfroe',
    type: 'director',
    bio: 'A director and writer, known for One Point O, The Colony, and directing episodes of From.',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face',
  },
  {
    name: 'Jennifer Liao',
    type: 'director',
    bio: 'A director and writer, known for directing episodes of From, Hudson & Rex, and her feature film debut, Katherine\'s Lullaby.',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
  },
];

async function seedArtists() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  console.log('Connected.\n');

  console.log('=== Seeding Artists ===');
  for (const item of ARTISTS_DATA) {
    const existing = await Artist.findOne({ name: item.name, type: item.type });
    if (existing) {
      console.log(`  SKIP  ${item.name} (${item.type}) - already exists`);
    } else {
      const created = await Artist.create(item);
      console.log(`  CREATE ${created.name} (${created.type}) → ${created._id}`);
    }
  }

  console.log('\nDone.');
  await mongoose.disconnect();
}

seedArtists().catch((err) => {
  console.error(err);
  process.exit(1);
});
