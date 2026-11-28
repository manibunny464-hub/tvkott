export async function POST() {
  return Response.json({ success: false, message: 'Route unavailable' }, { status: 404 });
}

export async function DELETE() {
  return Response.json({ success: false, message: 'Route unavailable' }, { status: 404 });
}
