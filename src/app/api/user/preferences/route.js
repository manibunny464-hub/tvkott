import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';
import User from '@/models/User';
import Language from '@/models/Language';

const VALID_APP_LANGUAGES = ['en', 'ml', 'te', 'hi', 'ta'];

async function handlePreferenceUpdate(request) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    const body = await request.json();
    const { contentLanguages, languageIds, languages, appLanguage, app_language, language } = body;

    const rawLangs = contentLanguages || languageIds || languages;
    const rawAppLang = appLanguage || app_language || language;

    await dbConnect();

    const update = {};

    if (rawLangs !== undefined) {
      if (!Array.isArray(rawLangs)) {
        return Response.json(
          { success: false, message: 'Content languages must be an array' },
          { status: 400 }
        );
      }

      if (rawLangs.length > 0) {
        // Separate ObjectIds from codes
        const objectIds = [];
        const codes = [];

        rawLangs.forEach((val) => {
          if (typeof val === 'string') {
            const trimmed = val.trim();
            if (mongoose.Types.ObjectId.isValid(trimmed)) {
              objectIds.push(new mongoose.Types.ObjectId(trimmed));
            } else {
              codes.push(trimmed.toLowerCase());
            }
          } else if (val instanceof mongoose.Types.ObjectId) {
            objectIds.push(val);
          }
        });

        const queryOr = [];
        if (objectIds.length > 0) queryOr.push({ _id: { $in: objectIds } });
        if (codes.length > 0) queryOr.push({ code: { $in: codes } });

        if (queryOr.length === 0) {
          return Response.json(
            { success: false, message: 'No valid language IDs or codes provided' },
            { status: 400 }
          );
        }

        const foundLanguages = await Language.find({
          $or: queryOr,
          isActive: true,
        }).select('_id');

        if (foundLanguages.length === 0) {
          return Response.json(
            { success: false, message: 'None of the provided languages were found' },
            { status: 400 }
          );
        }

        update.contentLanguages = foundLanguages.map((l) => l._id);
      } else {
        update.contentLanguages = [];
      }
    }

    if (rawAppLang !== undefined) {
      const appLangLower = String(rawAppLang).trim().toLowerCase();
      if (!VALID_APP_LANGUAGES.includes(appLangLower)) {
        return Response.json(
          { success: false, message: `appLanguage must be one of: ${VALID_APP_LANGUAGES.join(', ')}` },
          { status: 400 }
        );
      }
      update.appLanguage = appLangLower;
    }

    if (Object.keys(update).length === 0) {
      return Response.json(
        { success: false, message: 'No valid preferences to update' },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      user.userId,
      { $set: update },
      { new: true }
    ).populate('contentLanguages', '_id code englishName nativeName');

    return Response.json({
      success: true,
      user: {
        id: updatedUser._id,
        appLanguage: updatedUser.appLanguage,
        contentLanguages: updatedUser.contentLanguages,
      },
    });
  } catch (err) {
    console.error('[/api/user/preferences] Error:', err);
    return Response.json(
      { success: false, message: err.message || 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  return handlePreferenceUpdate(request);
}

export async function PUT(request) {
  return handlePreferenceUpdate(request);
}
