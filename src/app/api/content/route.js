import { checkTvSession } from '@/lib/tv-pairing';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Content from '@/models/Content';
import Genre from '@/models/Genre';
import Language from '@/models/Language';
import User from '@/models/User';
import { requireAuth } from '@/lib/authMiddleware';
import { getValidSeriesIds } from '@/lib/seriesFilter';

function resolveUser(request) {
  try {
    let token = null;

    // 1. Check Authorization Header (Bearer token)
    const authHeader = request.headers.get('authorization') || '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }

    // 2. Check Custom Headers
    if (!token) {
      token = request.headers.get('x-auth-token') || request.headers.get('token');
    }

    // 3. Check Cookies
    if (!token) {
      token = request.cookies.get('token')?.value || request.cookies.get('tvk_admin_session')?.value;
    }

    // 4. Check Query Parameter
    if (!token) {
      const { searchParams } = new URL(request.url);
      token = searchParams.get('token');
    }

    if (!token) return null;
    return verifyToken(token) || null;
  } catch {
    return null;
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const lang = searchParams.get('lang') || searchParams.get('language');
    const type = searchParams.get('type');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';

    await dbConnect();

    // 1. Resolve category/genre name if provided
    let genreName = null;
    if (category) {
      const isObjectId = mongoose.Types.ObjectId.isValid(category);
      const genre = await Genre.findOne({
        $or: [
          { _id: isObjectId ? new mongoose.Types.ObjectId(category) : null },
          { slug: category },
        ].filter(Boolean),
      }).lean();
      if (genre) {
        genreName = genre.name;
      }
    }

    // 2. Build filters
    const filter = {
      isActive: true,
      isDeleted: { $ne: true },
      $or: [
        { isComingSoon: { $ne: true } },
        { expectedReleaseDate: { $lte: new Date() } }
      ]
    };

    if (type) {
      filter.type = type;
    }

    if (genreName) {
      filter.genres = genreName;
    } else if (category) {
      filter.genres = category;
    }

    // 3. Resolve user and their watchlist (myList)
    let userMyList = [];
    const resolvedUser = resolveUser(request);
    if (resolvedUser?.tvSessionId && !(await checkTvSession(resolvedUser))) {
      return Response.json({ success: false, message: 'TV session expired or revoked' }, { status: 401 });
    }
    let dbUser = null;
    if (resolvedUser && resolvedUser.userId) {
      dbUser = await User.findById(resolvedUser.userId, { myList: 1, contentLanguages: 1 }).lean();
      if (dbUser && dbUser.myList) {
        userMyList = dbUser.myList.map(id => id.toString());
      }
    }

    // 4. Resolve languages to filter by
    let resolvedLanguages = [];
    if (lang) {
      const langItems = lang.split(',').map(s => s.trim()).filter(Boolean);
      // Resolve language codes or names to English names
      const languageDocs = await Language.find({
        $or: [
          { code: { $in: langItems } },
          { englishName: { $in: langItems } }
        ]
      }).lean();
      resolvedLanguages = languageDocs.map(l => l.englishName);
      if (resolvedLanguages.length === 0) {
        resolvedLanguages = langItems;
      }
    } else if (dbUser && dbUser.contentLanguages && dbUser.contentLanguages.length > 0) {
      const languageDocs = await Language.find({
        _id: { $in: dbUser.contentLanguages }
      }).lean();
      resolvedLanguages = languageDocs.map(l => l.englishName);
    }

    if (resolvedLanguages.length > 0) {
      filter.language = { $in: resolvedLanguages };
    }

    const validSeriesIds = await getValidSeriesIds(resolvedLanguages);
    const catalogQuery = {
      $and: [filter, { $or: [
        { type: { $ne: 'series' } },
        { type: 'series', _id: { $in: validSeriesIds } },
      ] }],
    };

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [rawItems, total] = await Promise.all([
      Content.find(catalogQuery)
        .select('-movieIds')
        .sort({ updatedAt: -1, _id: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Content.countDocuments(catalogQuery),
    ]);

    const serializedItems = rawItems.map((item) => {
      const itemIdStr = item._id.toString();
      const addedtolist = userMyList.includes(itemIdStr);
      delete item.isComingSoon;
      delete item.expectedReleaseDate;
      delete item.scheduledPublishAt;
      return {
        ...item,
        addedtolist,
      };
    });

    return Response.json({
      success: true,
      items: serializedItems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('[GET /api/content] Error:', error);
    return Response.json(
      { success: false, message: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
