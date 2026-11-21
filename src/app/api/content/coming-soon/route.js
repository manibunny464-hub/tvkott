import { GET as getComingSoon } from '../../coming-soon/route';

export async function GET(request) {
  return getComingSoon(request);
}
