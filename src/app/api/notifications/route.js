import { GET as userGET } from '@/app/api/user/notifications/route';

export async function GET(request) {
  return userGET(request);
}
