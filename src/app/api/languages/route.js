import dbConnect from '@/lib/db';
import Language from '@/models/Language';

export async function GET() {
  try {
    await dbConnect();

    const languages = await Language.find({ isActive: true })
      .select('_id code englishName nativeName imageUrl color')
      .sort({ order: 1, englishName: 1 });

    return Response.json({ success: true, languages });
  } catch (error) {
    console.error('[languages] Error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
