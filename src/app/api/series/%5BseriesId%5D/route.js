import { GET as getContentDetail } from '../../content/[contentId]/route';

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const contentId = resolvedParams.seriesId;
  return getContentDetail(request, { params: Promise.resolve({ contentId }) });
}
