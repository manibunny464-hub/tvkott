import { requireAdmin, writeAuditLog } from '@/lib/admin/auth';
import dbConnect from '@/lib/db';
import Season from '@/models/Season';
import SeasonTrailer from '@/models/SeasonTrailer';

export async function GET(request, { params }) {
  const { error } = await requireAdmin(request, 'seasons.view');
  if (error) return error;

  const { seasonId } = await params;
  await dbConnect();

  const trailer = await SeasonTrailer.findOne({ seasonId, language: null }).lean();
  return Response.json({ success: true, trailer });
}

export async function POST(request, { params }) {
  const { admin, error } = await requireAdmin(request, 'seasons.edit');
  if (error) return error;

  const { seasonId } = await params;
  const body = await request.json();

  await dbConnect();
  const season = await Season.findById(seasonId);
  if (!season) {
    return Response.json({ success: false, message: 'Season not found' }, { status: 404 });
  }

  // Create or Update SeasonTrailer
  const trailer = await SeasonTrailer.findOneAndUpdate(
    { seasonId, language: null },
    {
      $set: {
        seriesId: season.seriesId,
        languages: body.languages || [],
        isActive: body.isActive !== false,
      },
    },
    { upsert: true, returnDocument: 'after', new: true }
  );

  // Write audit log
  await writeAuditLog({
    user: admin.email,
    role: admin.role,
    action: 'Saved Season Trailer',
    module: 'seasons',
    entityId: seasonId,
    newData: trailer.toObject ? trailer.toObject() : trailer,
    request,
  });

  return Response.json({ success: true, trailer });
}
export { POST as PUT };
