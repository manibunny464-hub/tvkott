import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';
import User from '@/models/User';
import Subscription from '@/models/Subscription';
import SubscriptionPlan from '@/models/SubscriptionPlan';

export async function GET(request) {
  const { success, user, message } = await requireAuth(request);
  if (!success) {
    return Response.json({ success: false, message }, { status: 401 });
  }

  try {
    await dbConnect();

    const dbUser = await User.findById(
      user.userId,
      { _id: 1, phone: 1, name: 1, yearOfBirth: 1, gender: 1, appLanguage: 1, contentLanguages: 1, isPremium: 1, premiumExpiry: 1 }
    ).lean();

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
        ...dbUser,
        isSubscribed,
        planDetails,
      },
    });
  } catch (err) {
    console.error('[/api/user/profile] GET error:', err);
    return Response.json(
      { success: false, message: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

const VALID_GENDERS = ['male', 'female', 'prefer_not_to_say'];
const CURRENT_YEAR = new Date().getFullYear();

export async function PUT(request) {
  const { success, user, message } = await requireAuth(request);
  if (!success) {
    return Response.json({ success: false, message }, { status: 401 });
  }

  try {
    const { name, yearOfBirth, gender } = await request.json();

    if (!name || typeof name !== 'string' || !name.trim()) {
      return Response.json(
        { success: false, message: 'name is required' },
        { status: 400 }
      );
    }

    if (yearOfBirth !== undefined) {
      const y = Number(yearOfBirth);
      if (!Number.isInteger(y) || y < 1900 || y > CURRENT_YEAR) {
        return Response.json(
          { success: false, message: `yearOfBirth must be between 1900 and ${CURRENT_YEAR}` },
          { status: 400 }
        );
      }
    }

    if (gender !== undefined && !VALID_GENDERS.includes(gender)) {
      return Response.json(
        { success: false, message: `gender must be one of: ${VALID_GENDERS.join(', ')}` },
        { status: 400 }
      );
    }

    const update = { name: name.trim() };
    if (yearOfBirth !== undefined) update.yearOfBirth = Number(yearOfBirth);
    if (gender !== undefined) update.gender = gender;

    await dbConnect();

    const updated = await User.findByIdAndUpdate(
      user.userId,
      { $set: update },
      { returnDocument: 'after', projection: { _id: 1, phone: 1, name: 1, yearOfBirth: 1, gender: 1, appLanguage: 1, contentLanguages: 1, isPremium: 1, premiumExpiry: 1 } }
    ).lean();

    if (!updated) {
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return Response.json({ success: true, user: updated });
  } catch (err) {
    return Response.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
