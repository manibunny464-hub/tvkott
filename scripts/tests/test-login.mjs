import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import crypto from 'node:crypto';

async function route({ existing = true, sessionError = false, dbError = false, secret = true, consumed = 1 } = {}) {
  const calls = [];
  const user = { _id: 'user-id', phone: '9999999999', contentLanguages: [] };
  const otp = { _id: 'otp-id', otp: '1234', attempts: 0, save: async () => calls.push('save-otp') };
  const context = vm.createContext({ Response, console: { error() {} }, process: { env: { JWT_SECRET: secret ? 'test' : '' } } });
  const mocks = {
    '@/lib/db': { default: async options => {
      assert.equal(options.skipMaintenance, true);
      if (dbError) throw Object.assign(new Error('unavailable'), { name: 'MongooseServerSelectionError' });
    } },
    '@/lib/jwt': { signToken: () => { calls.push('sign'); return 'test-token'; } },
    '@/models/Otp': { default: {
      findOne: () => ({ sort: async () => otp }),
      updateOne: async () => { calls.push('consume'); return { modifiedCount: consumed }; },
    } },
    '@/models/User': { default: {
      findOne: () => ({ select: async () => existing ? user : null }),
      create: async () => { calls.push('create-user'); return user; },
    } },
    '@/lib/subscription/entitlementService': { enforceDeviceSession: async () => {
      calls.push('session');
      if (sessionError) throw Object.assign(new Error('unavailable'), { name: 'MongoNetworkError' });
      return { success: true };
    } },
    crypto: { randomUUID: crypto.randomUUID },
  };
  async function link(specifier) {
    if (specifier === '@/lib/authErrors') {
      const mod = new vm.SourceTextModule(await readFile(new URL('../../src/lib/authErrors.js', import.meta.url), 'utf8'), { context });
      await mod.link(link);
      return mod;
    }
    const exports = mocks[specifier];
    assert.ok(exports, specifier);
    return new vm.SyntheticModule(Object.keys(exports), function () {
      for (const [key, value] of Object.entries(exports)) this.setExport(key, value);
    }, { context });
  }
  const mod = new vm.SourceTextModule(await readFile(new URL('../../src/app/api/auth/verify-otp/route.js', import.meta.url), 'utf8'), {
    context,
    importModuleDynamically: async specifier => {
      const dependency = await link(specifier);
      await dependency.link(link);
      await dependency.evaluate();
      return dependency;
    },
  });
  await mod.link(link);
  await mod.evaluate();
  const response = await mod.namespace.POST({
    json: async () => ({ phone: 9999999999, otp: 1234 }),
    headers: new Headers(),
  });
  return { response, body: await response.json(), calls };
}
for (const existing of [true, false]) {
  test(`${existing ? 'existing' : 'new'} phone login succeeds with numeric OTP and phone`, async () => {
    const { response, body, calls } = await route({ existing });
    assert.equal(response.status, 200);
    assert.equal(body.isNewUser, !existing);
    assert.equal(body.token, 'test-token');
    assert.ok(calls.indexOf('consume') > calls.indexOf('session'));
    assert.ok(calls.indexOf('consume') > calls.indexOf('sign'));
  });
}
test('session outage returns 503 and leaves OTP usable', async () => {
  const { response, body, calls } = await route({ sessionError: true });
  assert.equal(response.status, 503);
  assert.equal(body.code, 'AUTH_SERVICE_UNAVAILABLE');
  assert.ok(!calls.includes('consume'));
});
test('database outage returns retryable 503', async () => {
  const { response } = await route({ dbError: true });
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('Retry-After'), '10');
});
test('missing signing config does not consume OTP', async () => {
  const { response, calls } = await route({ secret: false });
  assert.equal(response.status, 503);
  assert.deepEqual(calls, []);
});
test('a consumed OTP cannot produce a successful login response', async () => {
  const { response, body } = await route({ consumed: 0 });
  assert.equal(response.status, 400);
  assert.equal(body.success, false);
});
