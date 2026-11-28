import { enforceDeviceSession, getUserEntitlements } from '@/lib/subscription/entitlementService';
import TvPairing from '@/models/TvPairing';
import { signToken } from '@/lib/jwt';
import { readTvSettings } from '@/lib/tv-settings';
import { normalizePairingCode, validPairingCode, validPairingSecret, hashPairingSecret } from '@/lib/tv-pairing';

const headers = { 'Cache-Control': 'no-store' };
export async function POST(request) {
  const data = await request.json().catch(() => null);
  const code = normalizePairingCode(data?.code);
  if (!validPairingCode(code) || !validPairingSecret(data?.deviceSecret)) {
    return Response.json({ success: false, message: 'Invalid pairing credentials.' }, { status: 400, headers });
  }
  const { enabled, sessionDays } = await readTvSettings();
  if (!enabled) return Response.json({ success: false, message: 'TV pairing is disabled.' }, { status: 403, headers });
  const filter = { code, deviceSecretHash: hashPairingSecret(data.deviceSecret), expiresAt: { $gt: new Date() } };
  const pairing = await TvPairing.findOne({ ...filter, state: { $in: ['pending', 'approved'] } }).lean();
  if (!pairing) return Response.json({ success: false, message: 'Pairing expired or unavailable.' }, { status: 404, headers });
  if (pairing.state === 'pending') return Response.json({ success: true, state: 'pending' }, { headers });
  const { features } = await getUserEntitlements(pairing.userId);
  if (!features.tvAccess) return Response.json({ success: false, message: 'Your plan does not include TV access.' }, { status: 403, headers });
  const tvSessionId = String(pairing._id);
  const deviceId = `tv:${tvSessionId}`;
  const token = signToken({ userId: String(pairing.userId), tvSessionId, deviceId, sessionId: tvSessionId }, { expiresIn: `${sessionDays}d` });
  const result = await TvPairing.updateOne({ ...filter, _id: pairing._id, state: 'approved' },
    { $set: { state: 'active', expiresAt: new Date(Date.now() + sessionDays * 86400000) } });
  if (result.modifiedCount !== 1) return Response.json({ success: false, message: 'Pairing already used.' }, { status: 409, headers });
  try {
    const session = await enforceDeviceSession(pairing.userId, deviceId, 'TV', features.simultaneousDevices, tvSessionId);
    if (!session.success) throw new Error('Unable to register TV device');
  } catch {
    await TvPairing.updateOne({ _id: pairing._id, state: 'active' }, { $set: { state: 'approved', expiresAt: pairing.expiresAt } });
    return Response.json({ success: false, message: 'Could not activate TV. Please retry.' }, { status: 503, headers });
  }
  return Response.json({ success: true, state: 'active', token }, { headers });
}
