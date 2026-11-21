import { requireAdmin } from '@/lib/admin/auth';
import { serialize } from '@/lib/admin/data';
import dbConnect from '@/lib/db';
import Content from '@/models/Content';
import Genre from '@/models/Genre';

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function listCategories() {
  await dbConnect();
  const [genres, counts] = await Promise.all([
    Genre.find({}).sort({ displayOrder: 1, name: 1 }).lean(),
    Content.aggregate([
      { $unwind: '$genres' },
      { $group: { _id: '$genres', count: { $sum: 1 } } },
    ]),
  ]);
  const countMap = new Map(counts.map((row) => [row._id, row.count]));

  return serialize(genres).map((genre) => ({
    ...genre,
    id: genre._id,
    borderColor: genre.borderColor || '#06b6d4',
    videoCount: countMap.get(genre.name) || countMap.get(genre.slug) || 0,
  }));
}

export async function GET(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const categories = await listCategories();
  return Response.json({ success: true, categories });
}

export async function POST(request) {
  const { error } = await requireAdmin(request, ['super_admin', 'editor']);
  if (error) return error;

  const body = await request.json();
  await dbConnect();
  const genre = await Genre.create({
    name: body.name,
    slug: body.slug || slugify(body.name),
    description: body.description || '',
    imageUrl: body.imageUrl || '',
    borderColor: body.borderColor || '#06b6d4',
    isFeatured: Boolean(body.isFeatured),
    displayOrder: Number(body.displayOrder || 0),
    isActive: body.isActive ?? true,
  });

  return Response.json({ success: true, category: genre });
}

export async function PUT(request) {
  const { error } = await requireAdmin(request, ['super_admin', 'editor']);
  if (error) return error;

  const body = await request.json();
  await dbConnect();

  if (body.action === 'reorder') {
    await Promise.all(
      (body.items || []).map((item, index) =>
        Genre.findByIdAndUpdate(item.id, { $set: { displayOrder: index + 1 } })
      )
    );
    return Response.json({ success: true, categories: await listCategories() });
  }

  const genre = await Genre.findByIdAndUpdate(
    body.id,
    {
      $set: {
        name: body.name,
        slug: body.slug || slugify(body.name),
        description: body.description || '',
        imageUrl: body.imageUrl || '',
        borderColor: body.borderColor || '#06b6d4',
        isFeatured: Boolean(body.isFeatured),
        displayOrder: Number(body.displayOrder || 0),
        isActive: body.isActive ?? true,
      },
    },
    { returnDocument: 'after', runValidators: true }
  );

  return Response.json({ success: true, category: genre });
}

export async function DELETE(request) {
  const { error } = await requireAdmin(request, ['super_admin']);
  if (error) return error;

  const { id } = await request.json();
  await dbConnect();
  await Genre.findByIdAndDelete(id);
  return Response.json({ success: true });
}
