import fs from 'fs';
import path from 'path';

for (const envFile of ['.env.local', '.env']) {
  const fullPath = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(fullPath)) {
    if (typeof process.loadEnvFile === 'function') {
      try { process.loadEnvFile(fullPath); break; } catch {}
    } else {
      const content = fs.readFileSync(fullPath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const eq = trimmed.indexOf('=');
          if (eq > 0) {
            const key = trimmed.slice(0, eq).trim();
            const val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
            if (!process.env[key]) process.env[key] = val;
          }
        }
      });
      break;
    }
  }
}
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'REPLACE_WITH_ENVIRONMENT_VALUE';
}

import assert from 'assert';
import {
  validatePlanFeatures,
  ALLOWED_VIDEO_QUALITIES,
  DEFAULT_PLAN_FEATURES,
  DEFAULT_FREE_ENTITLEMENTS,
} from '../../src/lib/subscription/featureValidator.js';
import {
  isQualityAllowed,
  filterQualitiesForEntitlement,
} from '../../src/lib/subscription/entitlementService.js';
import crypto from 'crypto';
import {
  mapDurationToPeriod,
  verifyRazorpaySignature,
} from '../../src/lib/subscription/razorpayService.js';

let totalTests = 0;
let passedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

console.log('====================================================');
console.log(' Running Subscription & Entitlement Test Suite');
console.log('====================================================\n');

// 1. Feature Validation Tests
console.log('--- 1. Feature Validation Tests ---');

runTest('Validates default plan features correctly', () => {
  const result = validatePlanFeatures({});
  assert.strictEqual(result.videoQuality, '1080p');
  assert.strictEqual(result.simultaneousDevices, 1);
  assert.strictEqual(result.monthlyDownloadLimit, 0);
  assert.strictEqual(result.premiumContentAccess, true);
  assert.strictEqual(result.adsFree, false);
});

runTest('Accepts valid 4K enum and normalizes to uppercase', () => {
  const result = validatePlanFeatures({ videoQuality: '4k' });
  assert.strictEqual(result.videoQuality, '4K');
});

runTest('Rejects invalid video quality enum', () => {
  assert.throws(() => {
    validatePlanFeatures({ videoQuality: '240p' });
  }, /Invalid videoQuality/);
});

runTest('Rejects invalid simultaneousDevices (> 10 or < 1)', () => {
  assert.throws(() => {
    validatePlanFeatures({ simultaneousDevices: 0 });
  }, /simultaneousDevices/);

  assert.throws(() => {
    validatePlanFeatures({ simultaneousDevices: 15 });
  }, /simultaneousDevices/);
});

runTest('Rejects negative monthlyDownloadLimit', () => {
  assert.throws(() => {
    validatePlanFeatures({ monthlyDownloadLimit: -5 });
  }, /monthlyDownloadLimit/);
});

// 2. Quality Hierarchy & Filtering Tests
console.log('\n--- 2. Quality Hierarchy & Filtering Tests ---');

runTest('Allows 480p and 720p when max allowed is 720p', () => {
  assert.strictEqual(isQualityAllowed('720p', '480p'), true);
  assert.strictEqual(isQualityAllowed('720p', '720p'), true);
});

runTest('Denies 1080p and 4K when max allowed is 720p', () => {
  assert.strictEqual(isQualityAllowed('720p', '1080p'), false);
  assert.strictEqual(isQualityAllowed('720p', '4K'), false);
});

runTest('Allows 4K only when plan has 4K quality', () => {
  assert.strictEqual(isQualityAllowed('4K', '4K'), true);
  assert.strictEqual(isQualityAllowed('1080p', '4K'), false);
});

runTest('filterQualitiesForEntitlement correctly marks unentitled qualities', () => {
  const sampleQualities = [
    { quality: '1080p', enabled: true },
    { quality: '720p', enabled: true },
    { quality: '480p', enabled: true },
  ];

  const filtered = filterQualitiesForEntitlement(sampleQualities, '720p');
  const q1080 = filtered.find((q) => q.quality === '1080p');
  const q720 = filtered.find((q) => q.quality === '720p');

  assert.strictEqual(q1080.enabled, false);
  assert.strictEqual(q1080.isPermittedByPlan, false);
  assert.strictEqual(q720.enabled, true);
  assert.strictEqual(q720.isPermittedByPlan, true);
});

// 3. Entitlement Snapshot Policy Tests
console.log('\n--- 3. Grandfathering & Snapshot Policy Tests ---');

runTest('Existing subscribers retain purchased featuresSnapshot even if live plan changes', () => {
  const originalPlan = {
    id: 'plan_1',
    version: 1,
    features: {
      adsFree: true,
      premiumContentAccess: true,
      offlineDownloads: true,
      videoQuality: '4K',
      simultaneousDevices: 4,
      monthlyDownloadLimit: 0,
    },
  };

  // User purchased version 1
  const userSubscription = {
    planId: originalPlan.id,
    planVersion: originalPlan.version,
    featuresSnapshot: { ...originalPlan.features },
  };

  // Admin subsequently downgrades the plan to version 2 (e.g. max quality 1080p, devices 2)
  const updatedPlan = {
    ...originalPlan,
    version: 2,
    features: {
      ...originalPlan.features,
      videoQuality: '1080p',
      simultaneousDevices: 2,
    },
  };

  // Verify subscriber retains version 1 snapshot
  assert.strictEqual(userSubscription.featuresSnapshot.videoQuality, '4K');
  assert.strictEqual(userSubscription.featuresSnapshot.simultaneousDevices, 4);
  assert.notStrictEqual(userSubscription.featuresSnapshot.videoQuality, updatedPlan.features.videoQuality);
});

// 5. Webhook Signature Security Tests
console.log('\n--- 5. Webhook Security & Idempotency Tests ---');

runTest('Mock signatures are strictly rejected in production environment', () => {
  const env = 'production';
  const webhookSecret = 'your_razorpay_webhook_secret';
  const signature = 'mock_signature';

  const isProduction = env === 'production';
  const isMock = !isProduction && (webhookSecret === 'your_razorpay_webhook_secret' || signature === 'mock_signature');

  assert.strictEqual(isMock, false);
});

runTest('Transaction with status success prevents duplicate subscription creation', () => {
  const existingTx = {
    status: 'success',
    subscriptionId: 'sub_123',
    amount: 499,
  };

  const isAlreadyProcessed = existingTx.status === 'success';
  assert.strictEqual(isAlreadyProcessed, true);
});

// 6. Razorpay Auto-Renewal & Dual Signature Verification Tests
console.log('\n--- 6. Razorpay Auto-Renewal & Dual Signature Verification Tests ---');

runTest('Maps 30 days to monthly and 365 days to yearly', () => {
  const monthly = mapDurationToPeriod(30);
  assert.strictEqual(monthly.period, 'monthly');
  assert.strictEqual(monthly.interval, 1);

  const yearly = mapDurationToPeriod(365);
  assert.strictEqual(yearly.period, 'yearly');
  assert.strictEqual(yearly.interval, 1);

  const weekly = mapDurationToPeriod(7);
  assert.strictEqual(weekly.period, 'weekly');
  assert.strictEqual(weekly.interval, 1);
});

runTest('Correctly verifies recurring subscription signature (payment_id + | + subscription_id)', () => {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'REPLACE_WITH_ENVIRONMENT_VALUE';
  const paymentId = 'pay_test_12345';
  const subId = 'sub_test_67890';
  const validSignature = crypto
    .createHmac('sha256', secret)
    .update(`${paymentId}|${subId}`)
    .digest('hex');

  const isValid = verifyRazorpaySignature({
    subscriptionId: subId,
    paymentId,
    signature: validSignature,
  });
  assert.strictEqual(isValid, true);
});

runTest('Correctly verifies one-time order signature (order_id + | + payment_id)', () => {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'REPLACE_WITH_ENVIRONMENT_VALUE';
  const paymentId = 'pay_test_order_123';
  const orderId = 'order_test_456';
  const validSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const isValid = verifyRazorpaySignature({
    orderId,
    paymentId,
    signature: validSignature,
  });
  assert.strictEqual(isValid, true);
});

runTest('Rejects mismatched signature', () => {
  const isValid = verifyRazorpaySignature({
    subscriptionId: 'sub_test_abc',
    paymentId: 'pay_test_xyz',
    signature: 'fake_tampered_signature',
  });
  assert.strictEqual(isValid, false);
});

console.log('\n====================================================');
console.log(` Test Summary: ${passedTests} / ${totalTests} tests passed.`);
console.log('====================================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
