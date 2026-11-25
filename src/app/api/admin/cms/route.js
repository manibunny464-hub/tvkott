import { requireAdmin } from '@/lib/admin/auth';
import dbConnect from '@/lib/db';
import CmsPage from '@/models/CmsPage';

export async function GET(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    await dbConnect();
    
    // Ensure all 3 pages exist
    let privacy = await CmsPage.findOne({ key: 'privacy' }).lean();
    if (!privacy) {
      privacy = await CmsPage.create({
        key: 'privacy',
        title: 'Privacy Policy',
        content: 'We value your privacy at TVK OTT. This policy outlines how we handle your personal data.'
      });
    }

    let help = await CmsPage.findOne({ key: 'help' }).lean();
    if (!help) {
      help = await CmsPage.create({
        key: 'help',
        title: 'Help & Support',
        content: 'Our support team is here to assist you with any questions or technical issues 24/7.',
        metadata: {
          phone: '+91 9999999999',
          email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || '',
          whatsapp: '+91 7777777777'
        }
      });
    }

    let about = await CmsPage.findOne({ key: 'about' }).lean();
    if (!about) {
      about = await CmsPage.create({
        key: 'about',
        title: 'About Us',
        content: 'TVK OTT is the leading next-generation streaming platform for high-quality short movies.'
      });
    }

    return Response.json({
      success: true,
      data: { privacy, help, about }
    });
  } catch (err) {
    console.error('[admin/cms] GET Error:', err);
    return Response.json(
      { success: false, message: 'Failed to fetch CMS pages' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  const { error } = await requireAdmin(request, ['super_admin', 'admin']);
  if (error) return error;

  try {
    const payload = await request.json();
    const { key, title, content, metadata } = payload;

    if (!key || !['privacy', 'help', 'about'].includes(key)) {
      return Response.json(
        { success: false, message: 'Invalid or missing CMS page key' },
        { status: 400 }
      );
    }

    await dbConnect();

    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (content !== undefined) updateFields.content = content;
    if (metadata !== undefined) {
      updateFields.metadata = {
        phone: metadata.phone || '',
        email: metadata.email || '',
        whatsapp: metadata.whatsapp || '',
      };
    }

    const updatedPage = await CmsPage.findOneAndUpdate(
      { key },
      { $set: updateFields },
      { new: true, upsert: true }
    ).lean();

    return Response.json({
      success: true,
      data: updatedPage
    });
  } catch (err) {
    console.error('[admin/cms] PUT Error:', err);
    return Response.json(
      { success: false, message: 'Failed to save CMS page' },
      { status: 500 }
    );
  }
}
