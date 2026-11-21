import dbConnect from '@/lib/db';
import SubscriptionPlan from '@/models/SubscriptionPlan';
import SubscriptionPage from '@/models/SubscriptionPage';
import Coupon from '@/models/Coupon';

export async function GET() {
  try {
    await dbConnect();

    const [plans, page, coupons] = await Promise.all([
      SubscriptionPlan.find({ isActive: true })
        .sort({ displayOrder: 1 })
        .lean(),
      SubscriptionPage.findOne({}).lean(),
      Coupon.find({ isActive: true })
        .select({ code: 1, type: 1, value: 1, applicablePlans: 1, expiresAt: 1, maxUses: 1, usedCount: 1 })
        .lean(),
    ]);

    // Filter out expired and maxed-out coupons
    const now = new Date();
    const activeCoupons = coupons.filter((c) => {
      if (c.expiresAt && new Date(c.expiresAt) < now) return false;
      if (c.maxUses && c.usedCount >= c.maxUses) return false;
      return true;
    });

    return Response.json({
      success: true,
      plans,
      banner: page
        ? {
            bannerImage: page.bannerImage || '',
            bannerTitle: page.bannerTitle || '',
            bannerSubtitle: page.bannerSubtitle || '',
          }
        : null,
      coupons: activeCoupons,
    });
  } catch (error) {
    console.error('[subscription/plans] Error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
