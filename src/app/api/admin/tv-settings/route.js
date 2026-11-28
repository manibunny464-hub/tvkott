import { requireAdmin, writeAuditLog } from '@/lib/admin/auth';
import { readTvSettings, validateTvSettings, writeTvSettings } from '@/lib/tv-settings';

export async function GET(request) {
  const { error } = await requireAdmin(request, 'super_admin');
  if (error) return error;
  return Response.json({ success: true, settings: await readTvSettings() });
}

export async function PUT(request) {
  const { admin, error } = await requireAdmin(request, 'super_admin');
  if (error) return error;
  const data = validateTvSettings(await request.json().catch(() => null));
  if (!data) return Response.json({ success: false, message: 'Choose 2–15 pairing minutes and 1–30 session days.' }, { status: 400 });
  const settings = await writeTvSettings(data);
  await writeAuditLog({ user: admin.email, role: admin.role, action: 'Updated TV settings', module: 'tv', newData: settings, request });
  return Response.json({ success: true, settings });
}
