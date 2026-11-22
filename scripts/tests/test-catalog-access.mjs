import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const uri = process.env.MONGODB_URI || '';
assert.match(uri, /^mongodb:\/\/(localhost|127\.0\.0\.1)([:/]|$)/, 'Run this fixture test against local MongoDB.');
await mongoose.connect(uri);
const db = mongoose.connection;
const id = () => new mongoose.Types.ObjectId();
const user = id();
const draft = id();
const live = id();
const other = id();
const paid = id();
const foreign = id();
const base = process.env.TVK_TEST_BASE_URL || 'http://127.0.0.1:3000';
const token = (claims) => jwt.sign(claims, process.env.JWT_SECRET, { expiresIn: '5m' });
const headers = { authorization: 'Bearer ' + token({ userId: String(user) }) };
const get = (path, requestHeaders = headers) =>
  fetch(base + path, { headers: requestHeaders, signal: AbortSignal.timeout(60000) });

try {
  await db.collection('users').insertOne({
    _id: user,
    phone: `catalog-test-${user}`,
    watchHistory: [{ contentId: String(draft), progress: 25, watchedSeconds: 15, watchedAt: new Date() }],
  });
  await db.collection('contents').insertMany([draft, live, other].map((_id) => ({
    _id,
    slug: `workflow-test-${_id}`,
    title: 'Verification series',
    type: 'series',
    isActive: !_id.equals(draft),
  })));
  await db.collection('episodes').insertMany([
    { _id: paid, seriesId: live, isActive: true, isFree: false },
    { _id: foreign, seriesId: other, isActive: true, isFree: true,
      languages: [{ language: 'Telugu', videoFiles: ['480p', '4k'].map((quality) => ({
        quality, videoUrl: `https://example.invalid/${quality}.mp4`,
      })) }] },
  ]);

  assert.equal((await get('/api/content/' + draft)).status, 404);
  for (const [content, episode, status] of [[draft, paid, 404], [live, foreign, 404], [live, paid, 403]]) {
    const query = new URLSearchParams({ contentId: String(content), episodeId: String(episode) });
    assert.equal((await get('/api/home/continue-watching/play?' + query)).status, status);
  }
  const freeQuery = new URLSearchParams({ contentId: String(other), episodeId: String(foreign) });
  const free = await get('/api/home/continue-watching/play?' + freeQuery, { 'x-auth-token': headers.authorization.slice(7) });
  assert.equal(free.status, 200);
  assert.deepEqual((await free.json()).episode.languages[0].videoFiles.map((file) => file.quality), ['480p']);
  const history = await get('/api/home/continue-watching');
  assert.equal(history.status, 200);
  assert.deepEqual((await history.json()).items, []);
  const noAccess = {
    authorization: 'Bearer ' + token({ type: 'admin', adminId: String(id()), role: 'audit-test-no-trailer-access' }),
  };
  assert.equal((await get('/api/admin/trailers', noAccess)).status, 403);
  assert.equal((await get('/api/admin/trailers', {})).status, 401);
  console.log('Draft visibility, episode ownership, premium access, and trailer permissions verified.');
} finally {
  await Promise.all([
    db.collection('users').deleteOne({ _id: user }),
    db.collection('contents').deleteMany({ _id: { $in: [draft, live, other] } }),
    db.collection('episodes').deleteMany({ _id: { $in: [paid, foreign] } }),
  ]);
  await mongoose.disconnect();
}
