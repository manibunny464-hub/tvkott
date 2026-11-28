import { requireAuth } from '@/lib/authMiddleware';
import dbConnect from '@/lib/db';
import Device from '@/models/Device';

function authError(result) {
  return Response.json({ success: false, message: result.message }, { status: 401 });
}

export async function POST(request) {
  const auth = await requireAuth(request);
  if (!auth.success) return authError(auth);

  const userId = auth.user.userId || auth.user.id;
  const body = await request.json();
  const { deviceId, fcmToken, platform = 'web', deviceName, os, ipAddress } = body;

  if (auth.user.tvSessionId || !auth.user.deviceId || deviceId !== auth.user.deviceId) {
    return Response.json({ success: false, message: 'deviceId is required' }, { status: 400 });
  }

  if (fcmToken !== undefined && (typeof fcmToken !== 'string' || !fcmToken.trim() || fcmToken.length > 4096)) {
    return Response.json({ success: false, message: 'Invalid push token' }, { status: 400 });
  }

  await dbConnect();
  if (fcmToken) await Device.updateMany(
    { fcmToken, $or: [{ userId: { $ne: userId } }, { deviceId: { $ne: deviceId } }] },
    { $set: { fcmToken: null, isPushActive: false } },
  );

  const updateFields = {
    userId,
    deviceId,
    lastActive: new Date(),
  };

  if (fcmToken !== undefined) updateFields.fcmToken = fcmToken;
  if (platform) updateFields.platform = platform;
  if (deviceName) updateFields.deviceName = deviceName;
  if (os) updateFields.os = os;
  if (ipAddress) updateFields.ipAddress = ipAddress;
  if (fcmToken) updateFields.isPushActive = true;

  await Device.findOneAndUpdate(
    { userId, deviceId },
    { $set: updateFields },
    { upsert: true, new: true, runValidators: true }
  );

  return Response.json({
    success: true,
    message: 'Device token registered successfully',

  });
}

export async function DELETE(request) {
  const auth = await requireAuth(request);
  if (!auth.success) return authError(auth);

  const userId = auth.user.userId || auth.user.id;
  const deviceId = auth.user.deviceId;
  if (!deviceId || auth.user.tvSessionId) {
    return Response.json({ success: false, message: 'Device session required' }, { status: 403 });
  }
  await dbConnect();
  await Device.updateOne({ userId, deviceId }, { $set: { fcmToken: null, isPushActive: false } });

  return Response.json({
    success: true,
    message: 'Device push token removed successfully',
  });
}
