import dbConnect from '@/lib/db';
import CmsPage from '@/models/CmsPage';

export async function GET() {
  try {
    await dbConnect();
    let page = await CmsPage.findOne({ key: 'privacy' }).lean();

    if (!page) {
      const defaultContent = "We value your privacy at Chirpii. This policy outlines how we handle your personal data. We secure your credentials, payment details, and watch preferences. Your information is never sold, traded, or shared with third parties without your explicit permission. We employ high-standard encryption to protect your account activity.";
      page = await CmsPage.create({
        key: 'privacy',
        title: 'Privacy Policy',
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
    console.error('[privacy-api] Error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
