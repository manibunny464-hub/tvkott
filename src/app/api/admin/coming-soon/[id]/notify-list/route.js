export async function GET() {
  return Response.json({ success: false, message: 'Route unavailable' }, { status: 404 });
}
