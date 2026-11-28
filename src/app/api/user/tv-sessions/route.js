import mongoose from 'mongoose';
import { requireAuth } from '@/lib/authMiddleware';
import User from '@/models/User';
import TvPairing from '@/models/TvPairing';
import dbConnect from '@/lib/db';

export async function GET(request) {
  const { user, error } = await requireAuth(request);
  if (error) return error;
  if (!user.userId || user.adminId) return Response.json({ success: false }, { status: 403 });
  await dbConnect();
  const account = await User.findById(user.userId).select('activeDevices.deviceId').lean();
  const ids = (account?.activeDevices || []).map(device => device.deviceId)
    .filter(id => id?.startsWith('tv:')).map(id => id.slice(3));
  const sessions = await TvPairing.find({ _id: { $in: ids }, userId: user.userId, state: 'active', expiresAt: { $gt: new Date() } })
    .select('deviceName expiresAt createdAt').sort({ createdAt: -1 }).limit(50).lean();
  return Response.json({ success: true, sessions }, { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function DELETE(request) {
  const { user, error } = await requireAuth(request);
  if (error) return error;
  if (!user.userId || user.adminId) return Response.json({ success: false }, { status: 403 });
  const id = new URL(request.url).searchParams.get('sessionId');
  if (!mongoose.isObjectIdOrHexString(id)) return Response.json({ success: false, message: 'Invalid session ID.' }, { status: 400 });
  await dbConnect();
  const result = await TvPairing.deleteOne({ _id: id, userId: user.userId, state: 'active' });
  if (result.deletedCount) await User.updateOne({ _id: user.userId }, {
    $pull: { activeDevices: { deviceId: `tv:${id}` } },
  });
  return result.deletedCount === 1 ? Response.json({ success: true })
    : Response.json({ success: false, message: 'Session not found.' }, { status: 404 });
}
