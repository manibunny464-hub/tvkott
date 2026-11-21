import AdminApp from '@/components/admin/admin-app';
import { requireAdminPage } from '@/lib/admin/auth';
import { getDashboardData, getMasterSettings } from '@/lib/admin/data';

export default async function AdminRoutePage({ view = 'dashboard', videoId = null }) {
  const admin = await requireAdminPage();
  const settings = await getMasterSettings();
  const dashboardData = view === 'dashboard' ? await getDashboardData().catch(() => null) : null;

  return (
    <AdminApp
      initialAdmin={admin}
      initialSettings={settings}
      initialDashboardData={dashboardData}
      initialView={view}
      videoId={videoId}
    />
  );
}
