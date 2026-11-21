import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';
import User from '@/models/User';

const VALID_LANGUAGES = ['en', 'ml', 'te', 'hi', 'ta'];

export async function POST(request) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  const { language } = await request.json();

  if (!language || !VALID_LANGUAGES.includes(language)) {
    return Response.json(
      { success: false, message: `language must be one of: ${VALID_LANGUAGES.join(', ')}` },
      { status: 400 }
    );
  }

  await dbConnect();
  await User.findByIdAndUpdate(user.userId, { appLanguage: language });

  return Response.json({ success: true });
}
