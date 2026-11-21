import { PATCH as userPATCH, PUT as userPUT, POST as userPOST } from '@/app/api/user/notifications/read-all/route';

export async function PATCH(request) { return userPATCH(request); }
export async function PUT(request) { return userPUT(request); }
export async function POST(request) { return userPOST(request); }
