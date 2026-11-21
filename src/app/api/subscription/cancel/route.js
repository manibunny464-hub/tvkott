import Razorpay from 'razorpay';
import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';
import Subscription from '@/models/Subscription';

export async function POST(request) {
  // 1. Authenticate user
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const userId = auth.user.userId;

  // 2. Parse subscriptionId from body or query params
  let subscriptionId = null;
  try {
    const body = await request.json();
    subscriptionId = body.subscriptionId || body.id;
  } catch (e) {
    // If request has no JSON body, fallback to URL search parameters
    const { searchParams } = new URL(request.url);
    subscriptionId = searchParams.get('subscriptionId') || searchParams.get('id');
  }

  try {
    // 3. Connect to Database
    await dbConnect();

    // 4. Find the subscription to cancel
    let sub;
    if (subscriptionId) {
      // Find the specific subscription matching the ID and the authenticated user
      sub = await Subscription.findOne({
        _id: subscriptionId,
        userId,
      });
    } else {
      // Fallback: Find active/paused subscription for the user
      sub = await Subscription.findOne({
        userId,
        status: { $in: ['active', 'paused'] },
      });
    }

    if (!sub) {
      return Response.json(
        { 
          success: false, 
          message: subscriptionId 
            ? 'Subscription not found or unauthorized' 
            : 'No active or paused subscription found to cancel' 
        },
        { status: 404 }
      );
    }

    // 4. Cancel recurring subscription on Razorpay if present
    const razorpaySubscriptionId = sub.razorpaySubscriptionId;

    if (razorpaySubscriptionId && !razorpaySubscriptionId.startsWith('sub_mock_')) {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      const isMockKeys = !keyId || keyId === 'your_razorpay_key_id' || !keySecret || keySecret === 'REPLACE_WITH_ENVIRONMENT_VALUE';

      if (!isMockKeys) {
        try {
          const razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
          });

          await razorpay.subscriptions.cancel(razorpaySubscriptionId);
          console.log(`[Razorpay Subscriptions] Cancelled subscription ${razorpaySubscriptionId} on Razorpay`);
        } catch (err) {
          console.error('[Razorpay Subscriptions] API cancellation error, falling back:', err);
        }
      }
    }

    // 5. Update status and auto-renew settings in the database
    sub.status = 'cancelled';
    sub.autoRenew = false;
    await sub.save();

    return Response.json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription: {
        id: sub._id,
        status: sub.status,
        startDate: sub.startDate,
        endDate: sub.endDate,
        nextRenewalDate: sub.nextRenewalDate,
        autoRenew: sub.autoRenew,
        paymentMethod: sub.paymentMethod,
        razorpaySubscriptionId: sub.razorpaySubscriptionId,
      },
    });
  } catch (error) {
    console.error('[subscription/cancel] POST error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
