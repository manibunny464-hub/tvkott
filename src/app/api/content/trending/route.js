import { GET as getTrending } from '../../home/trending/route';

export async function GET(request) {
  return getTrending(request);
}
