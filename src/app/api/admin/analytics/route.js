import { requireAdmin } from '@/lib/admin/auth';
import { getAnalyticsData } from '@/lib/admin/data';

export async function GET(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const data = await getAnalyticsData(searchParams.get('range') || '30d');
  return Response.json({ success: true, data });
}
