import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import Content from '@/models/Content';

export default async function SeriesDetailPage({ params }) {
  const { id } = await params;

  if (!id) {
    redirect('/admin/series');
  }

  await dbConnect();

  let series = null;

  // 1. Try to find the series by ObjectId if id is a valid Mongo ObjectId
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    series = await Content.findOne({ _id: id, type: 'series', isDeleted: { $ne: true } }).lean();
  }

  // 2. If not found by ID (or not a valid ID), try to find by slug (e.g. "from")
  if (!series) {
    series = await Content.findOne({ slug: id, type: 'series', isDeleted: { $ne: true } }).lean();
  }

  if (series) {
    const slug = series.slug || String(series.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    redirect(`/admin/seasons?series=${slug}`);
  }

  redirect('/admin/series');
}
