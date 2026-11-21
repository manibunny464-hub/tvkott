import dbConnect from '@/lib/db';
import ComingSoon from '@/models/ComingSoon';
import { requireAuth } from '@/lib/authMiddleware';
import { getUserPreferredLanguages } from '@/lib/userLanguages';

export async function GET(request) {
  let userId = null;
  try {
    const auth = await requireAuth(request);
    if (auth && auth.success) {
      userId = auth.user?.userId || auth.user?.id;
    }
  } catch (error) {
    // Ignore auth errors to allow public access
  }

  const preferredLangs = await getUserPreferredLanguages(request);

  await dbConnect();
  
  const query = {
    isActive: true,
    isDeleted: { $ne: true },
    expectedReleaseDate: { $gt: new Date() }
  };

  if (preferredLangs.length > 0) {
    query.languages = { $in: preferredLangs };
  }

  const comingSoon = await ComingSoon.find(query)
    .sort({ expectedReleaseDate: 1, createdAt: -1 })
    .lean();

  const mappedComingSoon = comingSoon.map((item) => {
    const isNotified = userId
      ? item.notifyUsers?.some((entry) => String(entry.userId) === String(userId))
      : false;

    const { notifyUsers, ...rest } = item;
    return {
      ...rest,
      notifiedclicked: !!isNotified,
    };
  });

  return Response.json({ success: true, comingSoon: mappedComingSoon });
}
