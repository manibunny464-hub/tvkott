import dbConnect from '@/lib/db';
import Genre from '@/models/Genre';
import Content from '@/models/Content';
import { getUserPreferredLanguages } from '@/lib/userLanguages';
import { getValidSeriesIds } from '@/lib/seriesFilter';

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    const page = Math.max(parseInt(searchParams.get('page')) || 1, 1);
    const limit = Math.min(parseInt(searchParams.get('limit')) || 20, 50);
    const skip = (page - 1) * limit;

    const preferredLangs = await getUserPreferredLanguages(request);

    await dbConnect();

    const genre = await Genre.findOne({ slug, isActive: true }).lean();
    if (!genre) {
      return Response.json(
        { success: false, message: 'Genre not found' },
        { status: 404 }
      );
    }

    const query = {
      genres: genre.name,
      isActive: true,
      isDeleted: { $ne: true },
      $or: [
        { isComingSoon: { $ne: true } },
        { expectedReleaseDate: { $lte: new Date() } }
      ]
    };

    if (preferredLangs.length > 0) {
      query.language = { $in: preferredLangs };
    }

    const [rawContent, totalRaw] = await Promise.all([
      Content.find(
        query,
        { _id: 1, title: 1, thumbnailUrl: 1, type: 1, rating: 1, releaseYear: 1, language: 1 }
      )
        .skip(skip)
        .limit(limit)
        .lean(),
      Content.countDocuments(query),
    ]);

    const validSeriesSet = new Set(await getValidSeriesIds());
    const content = rawContent.filter(
      (item) => item.type !== 'series' || validSeriesSet.has(item._id.toString())
    );

    const totalPages = Math.ceil(content.length / limit) || 1;

    return Response.json({
      success: true,
      genre: {
        name: genre.name,
        description: genre.description,
        borderColor: genre.borderColor,
        color: genre.color || '0xFFE91E63',
      },
      content,
      page,
      totalPages,
      total: content.length,
    });
  } catch (error) {
    console.error('[genres/[slug]] GET error:', error);
    return Response.json(
      { success: false, message: 'Failed to fetch genre content' },
      { status: 500 }
    );
  }
}
