import dbConnect from '@/lib/db';
import CmsPage from '@/models/CmsPage';

export async function GET() {
  try {
    await dbConnect();
    let page = await CmsPage.findOne({ key: 'help' }).lean();

    if (!page) {
      page = await CmsPage.create({
        key: 'help',
        title: 'Help & Support',
        content: 'Our support team is here to assist you with any questions or technical issues 24/7.',
        metadata: {
          phone: '+91 9999999999',
          email: 'support@chirpii.com',
          whatsapp: '+91 7777777777'
        }
      });
    }

    return Response.json({
      success: true,
      title: page.title,
      content: page.content,
      phone: page.metadata?.phone || '',
      email: page.metadata?.email || '',
      whatsapp: page.metadata?.whatsapp || '',
      updatedAt: page.updatedAt
    });
  } catch (error) {
    console.error('[help-api] Error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
