import { requireAuth } from '@/lib/authMiddleware';
import { assertAuthRateLimit } from '@/lib/admin/auth';
import { getUserEntitlements } from '@/lib/subscription/entitlementService';
import TvPairing from '@/models/TvPairing';
import { readTvSettings } from '@/lib/tv-settings';
import { normalizePairingCode, validPairingCode } from '@/lib/tv-pairing';

export async function POST(request) {
  const limited = assertAuthRateLimit(request);
  if (limited) return limited;
  const { user, error } = await requireAuth(request);
  if (error) return error;
  if (!user.userId || user.adminId || user.tvSessionId) {
    return Response.json({ success: false, message: 'Approve from a signed-in mobile account.' }, { status: 403 });
  }
  if (!(await readTvSettings()).enabled) return Response.json({ success: false, message: 'TV pairing is disabled.' }, { status: 403 });
  if (!(await getUserEntitlements(user.userId)).features.tvAccess) {
    return Response.json({ success: false, message: 'Your plan does not include TV access.' }, { status: 403 });
  }
  const data = await request.json().catch(() => null);
  const code = normalizePairingCode(data?.code);
  if (!validPairingCode(code)) return Response.json({ success: false, message: 'Invalid pairing code.' }, { status: 400 });
  const result = await TvPairing.updateOne({ code, state: 'pending', expiresAt: { $gt: new Date() } },
    { $set: { state: 'approved', userId: user.userId } });
  return result.modifiedCount === 1 ? Response.json({ success: true })
    : Response.json({ success: false, message: 'Pairing code unavailable.' }, { status: 404 });
}
