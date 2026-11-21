import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';
import User from '@/models/User';

const VALID_APP_LANGUAGES = ['en', 'ml', 'te', 'hi', 'ta'];

// PUT /api/user/settings
// Updates app UI language. Use /api/user/content-languages to manage content language selection.
export async function PUT(request) {
  const { success, user, message } = await requireAuth(request);
  if (!success) {
    return Response.json({ success: false, message }, { status: 401 });
  }

  try {
    const { appLanguage } = await request.json();

    if (!appLanguage) {
      return Response.json(
        { success: false, message: 'appLanguage is required' },
        { status: 400 }
      );
    }

    if (!VALID_APP_LANGUAGES.includes(appLanguage)) {
      return Response.json(
        { success: false, message: `appLanguage must be one of: ${VALID_APP_LANGUAGES.join(', ')}` },
        { status: 400 }
      );
    }

    await dbConnect();
    await User.updateOne({ _id: user.userId }, { $set: { appLanguage } });

    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { success: false, message: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
