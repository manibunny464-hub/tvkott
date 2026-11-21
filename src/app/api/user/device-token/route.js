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

  if (!deviceId) {
    return Response.json({ success: false, message: 'deviceId is required' }, { status: 400 });
  }

  await dbConnect();

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

  const device = await Device.findOneAndUpdate(
    { userId, deviceId },
    { $set: updateFields },
    { upsert: true, new: true, runValidators: true }
  );

  return Response.json({
    success: true,
    message: 'Device token registered successfully',
    device,
  });
}

export async function DELETE(request) {
  const auth = await requireAuth(request);
  if (!auth.success) return authError(auth);

  const userId = auth.user.userId || auth.user.id;
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get('deviceId');

  await dbConnect();

  if (deviceId) {
    await Device.findOneAndUpdate(
      { userId, deviceId },
      { $set: { fcmToken: null, isPushActive: false } }
    );
  } else {
    // Unset all device tokens for user on logout
    await Device.updateMany(
      { userId },
      { $set: { fcmToken: null, isPushActive: false } }
    );
  }

  return Response.json({
    success: true,
    message: 'Device push token removed successfully',
  });
}
