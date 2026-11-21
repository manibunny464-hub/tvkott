import { DELETE as userDELETE, POST as userPOST } from '@/app/api/user/notifications/clear-all/route';

export async function DELETE(request) { return userDELETE(request); }
export async function POST(request) { return userPOST(request); }
