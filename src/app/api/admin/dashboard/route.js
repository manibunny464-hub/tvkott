import { requireAdmin } from '@/lib/admin/auth';
import { getDashboardData } from '@/lib/admin/data';

export async function GET(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    const data = await getDashboardData();
    return Response.json({ success: true, data });
  } catch (error) {
    console.error('[admin/dashboard] Error:', error);
    return Response.json(
      { success: false, message: 'Failed to load dashboard' },
      { status: 500 }
    );
  }
}
