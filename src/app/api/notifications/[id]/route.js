import { DELETE as userDELETE, PATCH as userPATCH, PUT as userPUT } from '@/app/api/user/notifications/[id]/route';

export async function DELETE(request, ctx) { return userDELETE(request, ctx); }
export async function PATCH(request, ctx) { return userPATCH(request, ctx); }
export async function PUT(request, ctx) { return userPUT(request, ctx); }
