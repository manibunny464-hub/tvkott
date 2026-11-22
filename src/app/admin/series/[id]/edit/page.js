import { notFound, redirect } from 'next/navigation';
import AdminRoutePage from '@/components/admin/admin-route';

export default async function EditSeriesPage({ params, searchParams }) {
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/i.test(id)) notFound();
  const { section = "details" } = await searchParams;
  if (section === "trailers") redirect(`/admin/trailers-admin?seriesId=${id}`);
  if (!["details", "seasons", "episodes", "bulk"].includes(section)) notFound();
  return <AdminRoutePage view="series-editor" seriesEditorId={id} studioSection={section} />;
}
