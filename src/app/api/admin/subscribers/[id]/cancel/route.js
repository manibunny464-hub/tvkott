import Razorpay from 'razorpay';
import { requireAdmin } from '@/lib/admin/auth';
import dbConnect from '@/lib/db';
import Subscription from '@/models/Subscription';

export async function POST(request, { params }) {
  const { error } = await requireAdmin(request, ['super_admin']);
  if (error) return error;

  const { id } = await params;

  await dbConnect();

  try {
    // Find subscription by ID or find active subscription for User ID
    let sub = await Subscription.findById(id);
    if (!sub) {
      sub = await Subscription.findOne({
        userId: id,
        status: { $in: ['active', 'paused'] },
      });
    }

    if (!sub) {
      return Response.json(
        { success: false, message: 'Subscription not found' },
        { status: 404 }
      );
    }

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
          // Cancel immediate
          await razorpay.subscriptions.cancel(razorpaySubscriptionId);
          console.log(`[Razorpay Subscriptions] Cancelled subscription ${razorpaySubscriptionId} on Razorpay`);
        } catch (err) {
          console.error('[Razorpay Subscriptions] API cancellation error, falling back:', err);
        }
      }
    }

    // Cancel in local DB
    sub.status = 'cancelled';
    sub.autoRenew = false;
    await sub.save();

    return Response.json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription: sub,
    });
  } catch (error) {
    console.error(`[admin/subscribers/${id}/cancel] error:`, error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
