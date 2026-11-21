import { reconcilePendingPayments } from '@/lib/subscription/paymentReconciler';

/**
 * Dedicated Payment Reconciliation Cron Route
 *
 * GET or POST /api/cron/reconcile-payments
 * Headers:
 *   Authorization: Bearer <CRON_SECRET>
 *   (or query parameter: ?secret=<CRON_SECRET>)
 */
export async function GET(request) {
  return handleReconcile(request);
}

export async function POST(request) {
  return handleReconcile(request);
}

async function handleReconcile(request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const { searchParams } = new URL(request.url);
  const secretParam = searchParams.get('secret') || '';
  const cronSecret = process.env.CRON_SECRET || 'your_cron_secret_token';

  const isAuthorized = (token && token === cronSecret) || (secretParam && secretParam === cronSecret);

  if (!isAuthorized && process.env.NODE_ENV === 'production') {
    return Response.json(
      { success: false, message: 'Unauthorized: Invalid CRON_SECRET' },
      { status: 401 }
    );
  }

  try {
    const maxAgeHours = parseInt(searchParams.get('maxAgeHours') || '48', 10);
    const minAgeMinutes = parseInt(searchParams.get('minAgeMinutes') || '3', 10);

    const result = await reconcilePendingPayments({ maxAgeHours, minAgeMinutes });

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    console.error('[/api/cron/reconcile-payments] Execution error:', error);
    return Response.json(
      { success: false, message: error.message || 'Payment reconciliation failed' },
      { status: 500 }
    );
  }
}
