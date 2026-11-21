import AdminRoutePage from '@/components/admin/admin-route';

export default async function VideoDetailPage({ params }) {
  const { id } = await params;
  return <AdminRoutePage view="video-detail" videoId={id} />;
}
