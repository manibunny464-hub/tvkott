import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';

// Load environment variables from .env.local or .env
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

const MONGODB_URI = process.env.MONGODB_URI || 'REPLACE_WITH_ENVIRONMENT_VALUE';

async function runPaymentReconciliation() {
  console.log(`[Payment Cron CLI] Starting payment reconciliation at ${new Date().toISOString()}...`);

  await mongoose.connect(MONGODB_URI);
  console.log('[Payment Cron CLI] Connected to MongoDB.');

  const rzpKeyId = process.env.RAZORPAY_KEY_ID || 'REPLACE_WITH_ENVIRONMENT_VALUE';
  const rzpKeySecret = process.env.RAZORPAY_KEY_SECRET || 'REPLACE_WITH_ENVIRONMENT_VALUE';

  const razorpay = new Razorpay({
    key_id: rzpKeyId,
    key_secret: rzpKeySecret,
  });

  const db = mongoose.connection.db;
  const transactionsColl = db.collection('transactions');
  const subscriptionsColl = db.collection('subscriptions');
  const subscriptionPlansColl = db.collection('subscriptionplans');
  const usersColl = db.collection('users');
  const notificationsColl = db.collection('notifications');

  const now = new Date();
  const minDate = new Date(now.getTime() - 48 * 60 * 60 * 1000); // last 48 hours
  const maxDate = new Date(now.getTime() - 3 * 60 * 1000);        // older than 3 mins

  const pendingList = await transactionsColl.find({
    status: 'pending',
    createdAt: { $gte: minDate, $lte: maxDate },
    $or: [
      { reconcileAttempts: { $exists: false } },
      { reconcileAttempts: { $lt: 5 } },
    ],
  }).toArray();

  console.log(`[Payment Cron CLI] Found ${pendingList.length} pending transactions to verify.`);

  let reconciled = 0;
  let failed = 0;
  let skipped = 0;

  for (const tx of pendingList) {
    const orderId = tx.razorpayOrderId;
    const attempts = (tx.reconcileAttempts || 0) + 1;

    if (!orderId || orderId.startsWith('order_free_') || orderId.startsWith('order_mock_')) {
      await transactionsColl.updateOne(
        { _id: tx._id },
        { $set: { reconcileAttempts: attempts, lastReconciledAt: new Date(), reconcileNotes: 'Skipped non-Razorpay order' } }
      );
      skipped++;
      continue;
    }

    try {
      const order = await razorpay.orders.fetch(orderId);

      if (order.status === 'paid') {
        const payments = await razorpay.orders.fetchPayments(orderId);
        const successfulPayment = payments?.items?.find((p) => p.status === 'captured');

        if (!successfulPayment) {
          await transactionsColl.updateOne(
            { _id: tx._id },
            { $set: { reconcileAttempts: attempts, lastReconciledAt: new Date(), reconcileNotes: 'Order paid on Razorpay but no captured payment found' } }
          );
          skipped++;
          continue;
        }

        const paymentId = successfulPayment.id;
        const paymentMethod = successfulPayment.method || 'Razorpay';

        // Fetch plan
        const plan = await subscriptionPlansColl.findOne({ _id: tx.planId });
        const duration = plan?.duration || 30;
        const planFeatures = plan?.features || {
          adsFree: false,
          premiumContentAccess: true,
          offlineDownloads: false,
          videoQuality: '1080p',
          simultaneousDevices: 1,
          monthlyDownloadLimit: 0,
        };
        const planVersion = plan?.version || 1;

        // Check active subscription
        const activeSub = await subscriptionsColl.findOne({
          userId: tx.userId,
          status: 'active',
          endDate: { $gt: new Date() },
        }, { sort: { endDate: -1 } });

        let startDate = new Date();
        let endDate = new Date();
        let subId;

        if (activeSub) {
          if (String(activeSub.planId) === String(tx.planId)) {
            // Extend existing
            const newEndDate = new Date(activeSub.endDate);
            newEndDate.setDate(newEndDate.getDate() + duration);

            await subscriptionsColl.updateOne(
              { _id: activeSub._id },
              {
                $set: {
                  endDate: newEndDate,
                  nextRenewalDate: newEndDate,
                  featuresSnapshot: planFeatures,
                  planVersion,
                },
              }
            );
            subId = activeSub._id;
          } else {
            // Queue different plan
            startDate = new Date(activeSub.endDate);
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + duration);

            const insRes = await subscriptionsColl.insertOne({
              userId: tx.userId,
              planId: tx.planId,
              planVersion,
              featuresSnapshot: planFeatures,
              startDate,
              endDate,
              nextRenewalDate: endDate,
              status: 'active',
              autoRenew: plan?.autoRenew ?? true,
              paymentMethod,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            subId = insRes.insertedId;

            await subscriptionsColl.updateOne({ _id: activeSub._id }, { $set: { autoRenew: false } });
          }
        } else {
          // New subscription
          endDate.setDate(endDate.getDate() + duration);
          const insRes = await subscriptionsColl.insertOne({
            userId: tx.userId,
            planId: tx.planId,
            planVersion,
            featuresSnapshot: planFeatures,
            startDate,
            endDate,
            nextRenewalDate: endDate,
            status: 'active',
            autoRenew: plan?.autoRenew ?? true,
            paymentMethod,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          subId = insRes.insertedId;
        }

        // Update transaction
        await transactionsColl.updateOne(
          { _id: tx._id },
          {
            $set: {
              status: 'success',
              paidAt: new Date(),
              razorpayPaymentId: paymentId,
              subscriptionId: subId,
              paymentMethod,
              reconcileAttempts: attempts,
              lastReconciledAt: new Date(),
              reconcileNotes: `Auto-reconciled via Payment Cron CLI on attempt ${attempts}`,
            },
          }
        );

        // Update user
        await usersColl.updateOne(
          { _id: tx.userId },
          { $set: { isPremium: true, premiumExpiry: endDate } }
        );

        // Insert notification
        await notificationsColl.insertOne({
          userId: tx.userId,
          title: `🎉 Welcome to ${plan?.name || 'Premium'}!`,
          message: `Your subscription is active until ${endDate.toDateString()}. Enjoy your plan features!`,
          type: 'subscription',
          deepLink: '/profile/subscription',
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        console.log(`[Payment Cron CLI] Successfully reconciled transaction ${tx._id} for user ${tx.userId}.`);
        reconciled++;
      } else if (order.status === 'expired') {
        await transactionsColl.updateOne(
          { _id: tx._id },
          {
            $set: {
              status: 'failed',
              reconcileAttempts: attempts,
              lastReconciledAt: new Date(),
              reconcileNotes: 'Order marked expired on Razorpay',
            },
          }
        );
        failed++;
      } else {
        await transactionsColl.updateOne(
          { _id: tx._id },
          {
            $set: {
              reconcileAttempts: attempts,
              lastReconciledAt: new Date(),
              reconcileNotes: `Order status: ${order.status} (attempt ${attempts})`,
            },
          }
        );
        skipped++;
      }
    } catch (err) {
      console.error(`[Payment Cron CLI] Error processing order ${orderId}:`, err.message);
      await transactionsColl.updateOne(
        { _id: tx._id },
        {
          $set: {
            reconcileAttempts: attempts,
            lastReconciledAt: new Date(),
            reconcileNotes: `Error: ${err.message}`,
          },
        }
      );
      skipped++;
    }
  }

  console.log(`[Payment Cron CLI] Completed: ${reconciled} reconciled, ${failed} marked failed, ${skipped} skipped.`);
  await mongoose.disconnect();
}

runPaymentReconciliation()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[Payment Cron CLI] Fatal error:', err);
    process.exit(1);
  });
