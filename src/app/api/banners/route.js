import { GET as getHomeBanners } from '../home/banner/route';

export async function GET(request) {
  return getHomeBanners(request);
}
