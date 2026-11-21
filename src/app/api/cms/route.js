import dbConnect from '@/lib/db';
import CmsPage from '@/models/CmsPage';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();
    
    // Fetch all 3 CMS pages
    const pages = await CmsPage.find({ key: { $in: ['privacy', 'help', 'about'] } }).lean();
    
    let privacy = pages.find(p => p.key === 'privacy');
    let help = pages.find(p => p.key === 'help');
    let about = pages.find(p => p.key === 'about');

    // Return the data directly to frontend
    return NextResponse.json({
      success: true,
      data: {
        privacy: privacy || null,
        help: help || null,
        about: about || null
      }
    });
  } catch (err) {
    console.error('[api/cms] GET Error:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch CMS pages' },
      { status: 500 }
    );
  }
}
