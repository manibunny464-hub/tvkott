import { requireAdmin } from '@/lib/admin/auth';
import { getMasterSettings } from '@/lib/admin/data';

export async function GET(request) {
  const { admin, error } = await requireAdmin(request);
  if (error) return error;

  const settings = await getMasterSettings();
  return Response.json({ success: true, admin, settings });
}
