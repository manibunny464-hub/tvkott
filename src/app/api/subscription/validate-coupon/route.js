import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';
import Coupon from '@/models/Coupon';

export async function POST(request) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const code = body.code || body.couponCode;

    if (!code) {
      return Response.json(
        { success: false, message: 'Coupon code is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const coupon = await Coupon.findOne({ code: code.toString().toUpperCase() });

    if (!coupon || !coupon.isActive) {
      return Response.json(
        { success: false, message: 'Invalid coupon' },
        { status: 400 }
      );
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return Response.json(
        { success: false, message: 'Coupon has expired' },
        { status: 400 }
      );
    }

    if (coupon.usedCount >= coupon.maxUses) {
      return Response.json(
        { success: false, message: 'Coupon usage limit reached' },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      discount: {
        type: coupon.type,
        value: coupon.value,
        percent: coupon.type === 'percentage' ? coupon.value : 0,
        flatAmount: coupon.type === 'flat' ? coupon.value : 0,
        code: coupon.code,
      },
    });
  } catch (error) {
    console.error('[validate-coupon] Error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
