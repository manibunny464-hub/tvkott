import { requireAuth } from '@/lib/authMiddleware';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Subscription from '@/models/Subscription';
import SubscriptionPlan from '@/models/SubscriptionPlan';

export async function GET(request) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    await dbConnect();
    const dbUser = await User.findById(user.userId).lean();
    if (!dbUser) {
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    const isSubscribed = !!(dbUser.isPremium && dbUser.premiumExpiry && dbUser.premiumExpiry > now);

    let planDetails = null;
    if (isSubscribed) {
      const activeSub = await Subscription.findOne({
        userId: user.userId,
        status: 'active',
        endDate: { $gt: now },
      })
      .populate('planId', 'name price duration tagline iconFeatures label')
      .lean();

      if (activeSub && activeSub.planId) {
        planDetails = {
          name: activeSub.planId.name,
          price: activeSub.planId.price,
          duration: activeSub.planId.duration,
          tagline: activeSub.planId.tagline,
          iconFeatures: activeSub.planId.iconFeatures,
          label: activeSub.planId.label,
          endDate: activeSub.endDate,
        };
      }
    }

    return Response.json({
      success: true,
      user: {
        userId: dbUser._id,
        phone: dbUser.phone,
        email: dbUser.email || '',
        name: dbUser.name || '',
        avatarUrl: dbUser.avatarUrl || '',
        isPremium: dbUser.isPremium,
        premiumExpiry: dbUser.premiumExpiry,
        isSubscribed,
        planDetails,
      },
    });
  } catch (err) {
    console.error('[/api/user/me] GET error:', err);
    return Response.json(
      { success: false, message: 'Failed to fetch user state' },
      { status: 500 }
    );
  }
}
