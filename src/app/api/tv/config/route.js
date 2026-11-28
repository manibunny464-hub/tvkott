import { readTvSettings } from '@/lib/tv-settings';

export async function GET() {
  const { enabled, pairingMinutes } = await readTvSettings();
  return Response.json({ success: true, enabled, pairingMinutes }, { headers: { 'Cache-Control': 'no-store' } });
}
