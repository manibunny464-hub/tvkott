/**
 * cleanup-seed-movies.mjs
 *
 * Permanently removes all seeded movies, shorts, and any soft-deleted series
 * from the database. Run this once if you don't want seed data.
 *
 * Usage:  node scripts/cleanup-seed-movies.mjs
 */

import mongoose from 'mongoose';

const MONGODB_URI = 'REPLACE_WITH_ENVIRONMENT_VALUE';

const ContentSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const EpisodeSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const SeasonSchema  = new mongoose.Schema({}, { strict: false, timestamps: true });

const Content = mongoose.models.Content || mongoose.model('Content', ContentSchema);
const Episode = mongoose.models.Episode || mongoose.model('Episode', EpisodeSchema);
const Season  = mongoose.models.Season  || mongoose.model('Season',  SeasonSchema);

async function run() {
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  console.log('✅ Connected to MongoDB\n');

  // ── 1. Show current state ──────────────────────────────────────────────────
  const before = await Content.find({}).lean();
  console.log('📊 Content before cleanup:');
  before.forEach(c =>
    console.log(`   [${c.type}] ${c.title}  isDeleted=${c.isDeleted} isActive=${c.isActive}`)
  );
  console.log('');

  // ── 2. Delete movies & shorts ──────────────────────────────────────────────
  const movieIds = before.filter(c => c.type === 'movie' || c.type === 'short').map(c => c._id);

  if (movieIds.length > 0) {
    const epDel = await Episode.deleteMany({ contentId: { $in: movieIds } });
    console.log(`🗑  Deleted ${epDel.deletedCount} episode(s) for movies/shorts`);

    const movDel = await Content.deleteMany({ _id: { $in: movieIds } });
    console.log(`🗑  Deleted ${movDel.deletedCount} movie/short content document(s)`);
  } else {
    console.log('ℹ️  No movies/shorts found — nothing to delete');
  }

  // ── 3. Hard-delete soft-deleted series & their orphan data ─────────────────
  const deletedSeries = before.filter(c => c.type === 'series' && c.isDeleted === true).map(c => c._id);

  if (deletedSeries.length > 0) {
    const sdEp  = await Episode.deleteMany({ $or: [{ seriesId: { $in: deletedSeries } }, { contentId: { $in: deletedSeries } }] });
    const sdSea = await Season.deleteMany({ seriesId: { $in: deletedSeries } });
    const sdCon = await Content.deleteMany({ _id: { $in: deletedSeries } });

    console.log(`🗑  Hard-deleted ${deletedSeries.length} soft-deleted series`);
    console.log(`   → ${sdSea.deletedCount} seasons, ${sdEp.deletedCount} episodes removed`);
  } else {
    console.log('ℹ️  No soft-deleted series found');
  }

  // ── 4. Remove orphan seasons (pointing to non-existent series) ─────────────
  const allSeriesIds = (await Content.find({ type: 'series' }, { _id: 1 }).lean()).map(c => String(c._id));
  const orphanSeasons = await Season.find({}).lean();
  const orphanSeasonIds = orphanSeasons.filter(s => !allSeriesIds.includes(String(s.seriesId))).map(s => s._id);

  if (orphanSeasonIds.length > 0) {
    await Season.deleteMany({ _id: { $in: orphanSeasonIds } });
    console.log(`🗑  Removed ${orphanSeasonIds.length} orphan season(s)`);
  } else {
    console.log('ℹ️  No orphan seasons found');
  }

  // ── 5. Show final state ────────────────────────────────────────────────────
  console.log('\n📊 Content after cleanup:');
  const after = await Content.find({}).lean();
  after.forEach(c =>
    console.log(`   [${c.type}] ${c.title}  isDeleted=${c.isDeleted} isActive=${c.isActive}`)
  );

  const seriesCount  = await Content.countDocuments({ type: 'series', isDeleted: { $ne: true } });
  const seasonCount  = await Season.countDocuments({ isDeleted: { $ne: true } });
  const episodeCount = await Episode.countDocuments({ isDeleted: { $ne: true } });
  console.log(`\n✅ Final counts — Series: ${seriesCount}, Seasons: ${seasonCount}, Episodes: ${episodeCount}`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

run().catch(err => { console.error(err); process.exit(1); });
