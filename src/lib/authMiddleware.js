import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function requireAuth(request, { allowLegacyHeaders = false } = {}) {
  const authHeader = request.headers.get('authorization');
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else {
    token = (allowLegacyHeaders && (request.headers.get('x-auth-token') || request.headers.get('token'))) ||
      request.cookies.get('token')?.value || request.cookies.get('chirpii_admin_session')?.value;
  }

  if (!token) {
    const errorResponse = Response.json(
      { success: false, message: 'Authorization token required' },
      { status: 401 }
    );
    return {
      success: false,
      message: 'Authorization token required',
      user: null,
      error: errorResponse,
    };
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    const errorResponse = Response.json(
      { success: false, message: 'Invalid or expired token' },
      { status: 401 }
    );
    return {
      success: false,
      message: 'Invalid or expired token',
      user: null,
      error: errorResponse,
    };
  }

  let userId = decoded.userId || decoded.adminId;
  if (userId && !/^[0-9a-fA-F]{24}$/.test(userId)) {
    userId = '000000000000000000000000';
  }
  const mappedUser = { ...decoded, userId };

  // Multi-device login check: verify if the token's deviceId is an active session
  if (decoded.userId) {
    await dbConnect();
    const dbUser = await User.findById(userId, { currentDeviceId: 1, activeDevices: 1 }).lean();
    if (!dbUser) {
      const errorResponse = Response.json(
        { success: false, message: 'User not found' },
        { status: 401 }
      );
      return {
        success: false,
        message: 'User not found',
        user: null,
        error: errorResponse,
      };
    }

    if (decoded.deviceId) {
      const activeDevices = Array.isArray(dbUser.activeDevices) ? dbUser.activeDevices : [];
      const hasActiveSession = activeDevices.length > 0
        ? activeDevices.some(d => d && d.deviceId === decoded.deviceId)
        : (!dbUser.currentDeviceId || dbUser.currentDeviceId === decoded.deviceId);

      if (!hasActiveSession) {
        const errorResponse = Response.json(
          { success: false, message: 'Logged out because device session expired or another device logged in', code: 'DEVICE_LOGOUT' },
          { status: 401 }
        );
        return {
          success: false,
          message: 'Logged out because device session expired or another device logged in',
          user: null,
          error: errorResponse,
        };
      }
    }
  }

  return { success: true, message: null, user: mappedUser, error: null };
}
