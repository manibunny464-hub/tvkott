import { getUserPreferredLanguages } from '@/lib/userLanguages';
import { getVisibleBanners } from '@/lib/banners';

export async function GET(request) {
  try {
    const preferredLanguages = await getUserPreferredLanguages(request, { activeOnly: true });
    const data = await getVisibleBanners(preferredLanguages);
    return Response.json({ success: true, data }, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch {
    return Response.json({ success: false, message: 'Failed to fetch banners' }, { status: 500 });
  }
}
