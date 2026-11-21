import dbConnect from '@/lib/db';
import Genre from '@/models/Genre';

export async function GET() {
  try {
    await dbConnect();

    const genres = await Genre.find(
      { isActive: true },
      { _id: 1, name: 1, slug: 1, description: 1, imageUrl: 1, borderColor: 1, color: 1, isFeatured: 1 }
    )
      .sort({ displayOrder: 1 })
      .lean();

    const formattedCategories = genres.map((genre) => ({
      _id: genre._id.toString(),
      id: genre._id.toString(),
      name: genre.name,
      slug: genre.slug,
      description: genre.description || '',
      imageUrl: genre.imageUrl || '',
      borderColor: genre.borderColor || '#06b6d4',
      color: genre.color || '0xFFE91E63',
      isFeatured: Boolean(genre.isFeatured),
    }));

    return Response.json({
      success: true,
      categories: formattedCategories,
      genres: formattedCategories,
    });
  } catch (error) {
    console.error('[GET /api/categories] Error:', error);
    return Response.json(
      { success: false, message: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
