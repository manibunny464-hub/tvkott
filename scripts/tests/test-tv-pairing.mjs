import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Run against a dedicated local instance configured with the same URI and JWT secret.
const uri = process.env.MONGODB_URI || '';
assert.match(uri, /^mongodb:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?\/tvk_ott_tv_test(?:\?.*)?$/);
const base = process.env.TVK_TEST_BASE_URL || 'http://127.0.0.1:3012';
assert.match(base, /^http:\/\/(?:localhost|127\.0\.0\.1):\d+$/);
assert(process.env.JWT_SECRET, 'JWT_SECRET required');
await mongoose.connect(uri);
const db = mongoose.connection;
const id = new mongoose.Types.ObjectId();
const phone = String(7000000000 + Math.floor(Math.random() * 1000000000));
const planId = new mongoose.Types.ObjectId();
const movieId = new mongoose.Types.ObjectId();
const userToken = jwt.sign({ userId: String(id) }, process.env.JWT_SECRET, { expiresIn: '10m' });
const adminToken = jwt.sign({ type: 'admin', adminId: String(new mongoose.Types.ObjectId()), email: 'tv-fixture@example.test', role: 'super_admin' }, process.env.JWT_SECRET, { expiresIn: '10m' });
async function call(path, method = 'GET', body, token) {
  const headers = {};
  if (body) headers['content-type'] = 'application/json';
  if (token) headers.authorization = 'Bearer ' + token;
  const res = await fetch(base + path, { method, headers, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(40000) });
  return { status: res.status, body: await res.json() };
}
let saved;
let code;
let touched = false;
try {
  saved = await db.collection('tvsettings').findOne({ _id: 'tv' });
  await db.collection('users').insertOne({ _id: id, phone, name: 'TV test viewer' });
  await db.collection('subscriptionplans').insertOne({ _id: planId, name: 'TV test plan', price: 1, features: { tvAccess: true, simultaneousDevices: 3 } });
  await db.collection('subscriptions').insertOne({ userId: id, planId, status: 'active', endDate: new Date(Date.now() + 86400000) });
  const settings = '/api/admin/tv-settings';
  assert.equal((await call(settings)).status, 401);
  assert.equal((await call(settings, 'GET', undefined, userToken)).status, 401);
  assert.equal((await call(settings, 'PUT', { enabled: true, pairingMinutes: 1, sessionDays: 7 }, adminToken)).status, 400);
  touched = true;
  const setEnabled = async enabled => assert.equal((await call(settings, 'PUT', { enabled, pairingMinutes: 5, sessionDays: 7 }, adminToken)).status, 200);
  await setEnabled(false);
  assert.equal((await call('/api/tv/pairing/start', 'POST', {})).status, 403);
  await setEnabled(true);
  const start = await call('/api/tv/pairing/start', 'POST', { deviceName: 'Integration test TV' });
  assert.equal(start.status, 201);
  code = start.body.code;
  const body = { code, deviceSecret: start.body.deviceSecret };
  assert.equal((await call('/api/tv/pairing/status', 'POST', body)).body.state, 'pending');
  assert.equal((await call('/api/tv/pairing/status', 'POST', { ...body, deviceSecret: 'x'.repeat(43) })).status, 404);
  assert.equal((await call('/api/tv/pairing/approve', 'POST', { code }, userToken)).status, 200);
  const claims = await Promise.all([call('/api/tv/pairing/status', 'POST', body), call('/api/tv/pairing/status', 'POST', body)]);
  const issued = claims.filter(result => result.body.token);
  assert.equal(issued.length, 1);
  const tvToken = issued[0].body.token;
  assert.equal((await call('/api/user/profile', 'GET', undefined, tvToken)).status, 200);
  const sessions = await call('/api/user/tv-sessions', 'GET', undefined, userToken);
  assert.equal(sessions.body.sessions.length, 1);
  const sessionId = sessions.body.sessions[0]._id;
  assert.equal((await call('/api/user/tv-sessions?sessionId=' + sessionId, 'DELETE', undefined, userToken)).status, 200);
  assert.equal((await call('/api/user/profile', 'GET', undefined, tvToken)).status, 401);
  async function login(deviceId) {
    await db.collection('otps').insertOne({ phone, otp: '7391', isUsed: false, expiresAt: new Date(Date.now() + 60000) });
    const result = await call('/api/auth/verify-otp', 'POST', { phone, otp: '7391', deviceId, supportsTokenRefresh: true });
    assert.equal(result.status, 200, result.body.message);
    return result.body;
  }
  const first = await login('one');
  const second = await login('two');
  const third = await login('three');
  const renewed = await call('/api/auth/refresh', 'POST', { userId: String(id), refreshToken: first.refreshToken });
  assert.equal(renewed.status, 200, renewed.body.message);
  assert.equal((await call('/api/auth/refresh', 'POST', { userId: String(id), refreshToken: first.refreshToken })).status, 401);
  const fourth = await login('four');
  for (const oldToken of [renewed.body.token, second.token, third.token]) {
    assert.equal((await call('/api/user/profile', 'GET', undefined, oldToken)).status, 401);
  }
  assert.equal((await call('/api/user/profile', 'GET', undefined, fourth.token)).status, 200);
  assert.equal((await call('/api/auth/refresh', 'POST', { userId: String(id), refreshToken: renewed.body.refreshToken })).status, 401);
  await db.collection('contents').insertOne({
    _id: movieId, type: 'movie', isActive: true, primaryLanguage: 'te',
    publishedMovie: [{ language: 'te', trailerUrl: 'https://example.test/trailer.mp4' }],
  });
  const baseTrailer = '/api/trailers/' + movieId;
  const forLanguage = '?language=te';
  const adminEngagement = '/api/admin/trailers/' + movieId + '/engagement' + forLanguage;
  const settingsResponse = await call(adminEngagement, 'PATCH',
    { likesEnabled: true, commentsEnabled: true, showLikeCount: false }, adminToken);
  assert.equal(settingsResponse.status, 200, settingsResponse.body.message);
  const like = await call(baseTrailer + '/like' + forLanguage, 'POST', undefined, fourth.token);
  assert.equal(like.status, 200);
  assert.equal(like.body.liked, true);
  assert.equal('likesCount' in like.body, false);
  assert.equal((await call(baseTrailer + '/like' + forLanguage, 'POST', undefined, fourth.token)).status, 200);
  assert.equal(await db.collection('trailerinteractions').countDocuments({ trailerKey: `movie:${movieId}:te`, kind: 'like' }), 1);
  const posted = await call(baseTrailer + '/comments' + forLanguage, 'POST', { text: 'Good trailer' }, fourth.token);
  assert.equal(posted.status, 201);
  assert.equal((await call(adminEngagement, 'PATCH', { commentId: posted.body.comment.id, action: 'hide' }, adminToken)).status, 200);
  const visible = await call(baseTrailer + '/comments' + forLanguage, 'GET', undefined, fourth.token);
  assert.deepEqual(visible.body.comments, []);
  console.log('TV pairing, device overflow, refresh rotation and trailer moderation verified.');
} finally {
  if (code) await db.collection('tvpairings').deleteOne({ code });
  await db.collection('users').deleteOne({ _id: id });
  await db.collection('contents').deleteOne({ _id: movieId });
  await db.collection('trailerinteractions').deleteMany({ trailerKey: `movie:${movieId}:te` });
  await db.collection('notifications').deleteMany({ userId: id });
  await db.collection('otps').deleteMany({ phone });
  await db.collection('subscriptions').deleteMany({ userId: id });
  await db.collection('subscriptionplans').deleteOne({ _id: planId });
  if (touched) {
    if (saved) await db.collection('tvsettings').replaceOne({ _id: 'tv' }, saved, { upsert: true });
    else await db.collection('tvsettings').deleteOne({ _id: 'tv' });
  }
  await db.collection('auditlogs').deleteMany({ user: 'tv-fixture@example.test', module: 'tv' });
  await mongoose.disconnect();
}
