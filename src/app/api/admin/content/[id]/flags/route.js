import { requireAdmin } from "@/lib/admin/auth";
import dbConnect from "@/lib/db";
import Content from "@/models/Content";
import { syncContentFlags } from "@/lib/admin/content-flags";

export async function PUT(request, { params }) {
  const { error } = await requireAdmin(request, ["super_admin", "editor"]);
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  await dbConnect();

  const content = await Content.findById(id);
  if (!content) {
    return Response.json(
      { success: false, message: "Content not found" },
      { status: 404 },
    );
  }

  if (body.isComingSoon !== undefined || body.expectedReleaseDate !== undefined) {
    return Response.json({ success: false, message: "Scheduling is no longer available." }, { status: 400 });
  }
  const updates = {};
  if (body.isTrending !== undefined) {
    updates.isTrending = body.isTrending;
  }
  if (body.isBlockbuster !== undefined) {
    updates.isBlockbuster = body.isBlockbuster;
  }

  // Update base Content document
  const updatedContent = await Content.findByIdAndUpdate(
    id,
    { $set: updates },
    { returnDocument: "after" },
  );

  // Sync flags with associated collections (BlockbusterItem, TrendingItem, ComingSoon, Banner)
  await syncContentFlags(updatedContent, updates);

  return Response.json({ success: true, content: updatedContent });
}
