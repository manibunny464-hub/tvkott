import dbConnect from '@/lib/db';
import CmsPage from '@/models/CmsPage';

export async function GET() {
  try {
    await dbConnect();
    let page = await CmsPage.findOne({ key: 'about' }).lean();

    if (!page) {
      const defaultContent = "Chirpii is the leading next-generation streaming platform for high-quality short movies and exclusive premium series. We collaborate with independent creators to bring you award-winning, bite-sized entertainment. Thank you for being a part of our growing community!";
      page = await CmsPage.create({
        key: 'about',
        title: 'About Us',
        content: defaultContent
      });
    }

    return Response.json({
      success: true,
      title: page.title,
      content: page.content,
      updatedAt: page.updatedAt
    });
  } catch (error) {
    console.error('[about-api] Error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
