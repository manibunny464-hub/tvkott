import { GET as getCW, POST as postCW } from '../../home/continue-watching/route';

export async function GET(request) {
  return getCW(request);
}

export async function POST(request) {
  return postCW(request);
}
