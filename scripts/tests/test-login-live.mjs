// Creates one isolated test user and removes only its own records afterwards.
import mongoose from 'mongoose';
import { randomInt } from 'node:crypto';
import assert from 'node:assert/strict';
await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
const db = mongoose.connection.db;
const phone = `9${randomInt(100000000, 999999999)}`;
let ownsPhone = false;
try {
  assert.equal(await db.collection('users').countDocuments({ phone }), 0, 'Test phone already exists');
  assert.equal(await db.collection('otps').countDocuments({ phone }), 0, 'Test phone has OTP records');
  ownsPhone = true;
  const base = process.env.LOGIN_TEST_BASE || 'http://localhost:3012';
  for (const isNewUser of [true, false]) {
    const start = Date.now();
    const sent = await fetch(`${base}/api/auth/send-otp`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }), signal: AbortSignal.timeout(30000),
    });
    assert.equal(sent.status, 200, 'send OTP status');
    const record = await db.collection('otps').findOne({ phone, isUsed: false });
    assert.ok(record);
    const response = await fetch(`${base}/api/auth/verify-otp`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp: record.otp, deviceId: 'isolated-login-test' }),
      signal: AbortSignal.timeout(30000),
    });
    const result = await response.json();
    assert.equal(response.status, 200, result.message);
    assert.equal(result.isNewUser, isNewUser);
    assert.ok(result.token);
    console.log(JSON.stringify({ scenario: isNewUser ? 'new-user' : 'existing-user',
      status: response.status, sendAndVerifyMs: Date.now() - start }));
    await db.collection('otps').deleteMany({ phone });
  }
} finally {
  if (ownsPhone) {
    await db.collection('otps').deleteMany({ phone });
    await db.collection('users').deleteOne({ phone });
  }
  await mongoose.disconnect();
}
