import { checkTvSession } from '@/lib/tv-pairing';
import { verifyToken } from './jwt';
import dbConnect from './db';
import User from '../models/User';
import Language from '../models/Language';

/**
 * Resolves the logged-in user's preferred content languages from the request.
 * Returns an array of language names (e.g. ['English', 'Hindi']).
 * If the user is not authenticated or has no preferences set, returns an empty array.
 */
export async function getUserPreferredLanguages(request, { activeOnly = false } = {}) {
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
    
    if (!token) return [];

    const decoded = verifyToken(token);
    if (!decoded || (decoded.tvSessionId && !(await checkTvSession(decoded)))) return [];

    const userId = decoded.userId || decoded.adminId;
    if (!userId || !/^[0-9a-fA-F]{24}$/.test(userId)) return [];

    await dbConnect();
    const dbUser = await User.findById(userId, { contentLanguages: 1 }).lean();
    if (!dbUser || !dbUser.contentLanguages || dbUser.contentLanguages.length === 0) {
      return [];
    }

    const languageDocs = await Language.find({
      _id: { $in: dbUser.contentLanguages },
      ...(activeOnly ? { isActive: true } : {}),
    }).select('englishName').lean();

    return languageDocs.map(l => l.englishName).filter(Boolean);
  } catch (err) {
    console.error('Error resolving user preferred languages:', err);
    return [];
  }
}
