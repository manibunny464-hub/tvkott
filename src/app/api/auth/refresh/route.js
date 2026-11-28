import { createHash, randomBytes } from 'node:crypto';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { signToken } from '@/lib/jwt';
import User from '@/models/User';

const headers = { 'Cache-Control': 'no-store' };
const hash = token => createHash('sha256').update(token).digest('hex');

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!mongoose.isObjectIdOrHexString(body?.userId) || typeof body?.refreshToken !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(body.refreshToken)) {
    return Response.json({ success: false, message: 'Invalid refresh credentials' }, { status: 400, headers });
  }
  await dbConnect();
  const session = { refreshHash: hash(body.refreshToken), refreshExpiresAt: { $gt: new Date() } };
  const refreshToken = randomBytes(32).toString('base64url');
  const user = await User.findOneAndUpdate(
    { _id: body.userId, activeDevices: { $elemMatch: session } },
    { $set: { 'activeDevices.$.refreshHash': hash(refreshToken), 'activeDevices.$.lastActiveAt': new Date() } },
    { projection: { phone: 1, activeDevices: { $elemMatch: session } } },
  ).lean();
  const device = user?.activeDevices?.[0];
  if (!device) return Response.json({ success: false, code: 'DEVICE_LOGOUT', message: 'Session expired or revoked' }, { status: 401, headers });
  const token = signToken({ userId: body.userId, phone: user.phone, deviceId: device.deviceId, sessionId: device.sessionId }, { expiresIn: Math.max(1, Math.min(900, Math.floor((new Date(device.refreshExpiresAt).getTime() - Date.now()) / 1000))) });
  return Response.json({ success: true, token, refreshToken }, { headers });
}
