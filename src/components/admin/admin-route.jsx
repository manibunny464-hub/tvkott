import { notFound } from 'next/navigation';
import AdminApp from '@/components/admin/admin-app';
import { hasPermission, requireAdminPage } from '@/lib/admin/auth';
import { getDashboardData, getMasterSettings } from '@/lib/admin/data';

export default async function AdminRoutePage({ view = 'dashboard', movieId = null, bannerId = null, seriesEditorId = null, studioSection = "details" }) {
  const admin = await requireAdminPage();
  if (view === 'banner-editor' && !['super_admin', 'editor'].includes(admin.role)) notFound();
  if (view === 'movie-editor' && !movieId && !['super_admin', 'editor'].includes(admin.role)) notFound();
  if (view === 'trailers-admin' && !(await hasPermission(admin, 'trailers'))) notFound();
  if (view === 'series-editor') {
    const permission = seriesEditorId
      ? { details: 'series.view', seasons: 'seasons.view', episodes: 'episodes.view', bulk: 'episodes.create' }[studioSection]
      : 'series.create';
    if (!permission || !(await hasPermission(admin, permission)) ||
        (seriesEditorId && !(await hasPermission(admin, 'series.view')))) notFound();
  }
  const settings = await getMasterSettings();
  const dashboardData = view === 'dashboard' ? await getDashboardData().catch(() => null) : null;

  return (
    <AdminApp
      initialAdmin={admin}
      initialSettings={settings}
      initialDashboardData={dashboardData}
      initialView={view}
      movieId={movieId}
      bannerId={bannerId}
      seriesEditorId={seriesEditorId}
      studioSection={studioSection}
    />
  );
}
