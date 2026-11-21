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

    return Response.json({
      success: true,
      genres: genres.map((genre) => ({
        ...genre,
        color: genre.color || '0xFFE91E63',
      })),
    });
  } catch (error) {
    return Response.json(
      { success: false, message: 'Failed to fetch genres' },
      { status: 500 }
    );
  }
}
