export async function POST() {
  return Response.json({ success: false, message: 'Route unavailable' }, { status: 404 });
}
