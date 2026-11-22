import { notFound } from 'next/navigation';
import AdminRoutePage from '@/components/admin/admin-route';

export default async function MovieViewPage({ params }) {
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/i.test(id)) notFound();
  return <AdminRoutePage view="movie-preview" movieId={id} />;
}
