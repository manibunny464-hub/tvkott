import { PATCH as userPATCH, PUT as userPUT, POST as userPOST } from '@/app/api/user/notifications/[id]/read/route';

export async function PATCH(request, ctx) { return userPATCH(request, ctx); }
export async function PUT(request, ctx) { return userPUT(request, ctx); }
export async function POST(request, ctx) { return userPOST(request, ctx); }
