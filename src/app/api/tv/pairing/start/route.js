import TvPairing from '@/models/TvPairing';
import { readTvSettings } from '@/lib/tv-settings';
import { hashPairingSecret, pairingCode, pairingSecret } from '@/lib/tv-pairing';
import { assertAuthRateLimit } from '@/lib/admin/auth';

export async function POST(request) {
  const limited = assertAuthRateLimit(request);
  if (limited) return limited;
  const { enabled, pairingMinutes } = await readTvSettings();
  if (!enabled) return Response.json({ success: false, message: 'TV pairing is disabled.' }, { status: 403 });
  const data = await request.json().catch(() => null);
  const deviceName = typeof data?.deviceName === 'string' ? data.deviceName.trim().slice(0, 80) : '';
  const code = pairingCode();
  const deviceSecret = pairingSecret();
  const expiresAt = new Date(Date.now() + pairingMinutes * 60000);
  await TvPairing.create({ code, deviceSecretHash: hashPairingSecret(deviceSecret), deviceName: deviceName || 'TV', state: 'pending', expiresAt });
  return Response.json({ success: true, code, deviceSecret, expiresAt, pollIntervalSeconds: 5 },
    { status: 201, headers: { 'Cache-Control': 'no-store' } });
}
