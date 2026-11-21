import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';
import User from '@/models/User';
import Language from '@/models/Language';

// GET /api/user/content-languages
// Returns whether the user has selected languages and the selected language details
export async function GET(request) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  await dbConnect();

  const dbUser = await User.findById(user.userId)
    .select('contentLanguages')
    .populate('contentLanguages', '_id code englishName nativeName imageUrl');

  if (!dbUser) {
    return Response.json(
      { success: false, message: 'User not found' },
      { status: 404 }
    );
  }

  const hasSelected = dbUser.contentLanguages.length > 0;

  return Response.json({
    success: true,
    hasSelected,
    languages: dbUser.contentLanguages,
  });
}

// POST /api/user/content-languages
// Body: { languageIds: ["<ObjectId>", ...] }
export async function POST(request) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  const body = await request.json();
  const { languageIds } = body;

  if (!Array.isArray(languageIds) || languageIds.length === 0) {
    return Response.json(
      { success: false, message: 'At least one language must be selected' },
      { status: 400 }
    );
  }

  await dbConnect();

  // Validate all provided IDs exist and are active
  const found = await Language.find({
    _id: { $in: languageIds },
    isActive: true,
  }).select('_id');

  if (found.length !== languageIds.length) {
    return Response.json(
      { success: false, message: 'One or more language IDs are invalid' },
      { status: 400 }
    );
  }

  await User.findByIdAndUpdate(user.userId, { contentLanguages: languageIds });

  return Response.json({ success: true });
}
