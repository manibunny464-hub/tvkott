import { createHash, randomBytes } from 'node:crypto';
import mongoose from 'mongoose';
import User from '@/models/User';
import { getUserEntitlements } from '@/lib/subscription/entitlementService';
import TvPairing from '@/models/TvPairing';
import { readTvSettings } from '@/lib/tv-settings';

export const pairingCode = () => randomBytes(6).toString('hex').toUpperCase();
export const pairingSecret = () => randomBytes(32).toString('base64url');
export const hashPairingSecret = (secret) => createHash('sha256').update(secret).digest('hex');
export const validPairingSecret = (secret) => typeof secret === 'string' && /^[A-Za-z0-9_-]{43}$/.test(secret);
export const normalizePairingCode = (code) => typeof code === 'string' ? code.trim().toUpperCase() : '';
export const validPairingCode = (code) => /^[0-9A-F]{12}$/.test(code);

export async function checkTvSession(claims) {
  if (!mongoose.isObjectIdOrHexString(claims.tvSessionId) || !mongoose.isObjectIdOrHexString(claims.userId)) return false;
  if (!(await readTvSettings()).enabled) return false;
  const { features } = await getUserEntitlements(claims.userId);
  if (!features.tvAccess || !await User.exists({
    _id: claims.userId,
    activeDevices: { $elemMatch: { deviceId: `tv:${claims.tvSessionId}`, sessionId: claims.tvSessionId } },
  })) return false;
  return Boolean(await TvPairing.exists({
    _id: claims.tvSessionId, userId: claims.userId, state: 'active', expiresAt: { $gt: new Date() },
  }));
}
