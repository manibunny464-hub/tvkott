import SeriesDetailClient from "./SeriesDetailClient";

export default async function Page({ params }) {
  const { slug } = await params;
  return <SeriesDetailClient slug={slug} />;
}
