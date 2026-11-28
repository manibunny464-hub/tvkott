import TvPairing from '@/models/TvPairing';
import { requireAuth } from '@/lib/authMiddleware';
import dbConnect from '@/lib/db';
import Device from '@/models/Device';
import User from '@/models/User';

export async function POST(request) {
  const auth = await requireAuth(request);
  
  if (!auth.success) {
    return Response.json(
      { success: false, message: auth.message },
      { status: 401 }
    );
  }

  if (auth.user.tvSessionId) {
    await TvPairing.deleteOne({ _id: auth.user.tvSessionId, userId: auth.user.userId });

  }

  if (auth.user.userId && auth.user.deviceId) {
    await dbConnect();
    const { userId, deviceId, sessionId } = auth.user;
    const result = await User.updateOne({ _id: userId }, {
      $pull: { activeDevices: { deviceId, sessionId: sessionId || null } },
    });
    await User.updateOne({ _id: userId, currentDeviceId: deviceId, 'activeDevices.deviceId': { $ne: deviceId } },
      { $unset: { currentDeviceId: 1 } });
    if (result.modifiedCount) await Device.updateOne({ userId, deviceId }, { $set: { fcmToken: null, isPushActive: false } });
  }

  // JWT is stateless — client must discard the token on their side
  return Response.json(
    { success: true, message: 'Logged out successfully' },
    { status: 200 }
  );
}
