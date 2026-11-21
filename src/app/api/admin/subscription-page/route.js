import { requireAdmin } from '@/lib/admin/auth';
import { serialize } from '@/lib/admin/data';
import dbConnect from '@/lib/db';
import SubscriptionPage from '@/models/SubscriptionPage';

const DEFAULT_PAGE = {
  bannerImage: '',
  bannerTitle: '',
  bannerSubtitle: '',
};

async function getOrCreatePage() {
  const page = await SubscriptionPage.findOneAndUpdate(
    {},
    { $setOnInsert: DEFAULT_PAGE },
    { upsert: true, returnDocument: 'after' }
  ).lean();
  return serialize(page);
}

export async function GET(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  await dbConnect();
  const page = await getOrCreatePage();
  return Response.json({ success: true, page });
}

export async function PUT(request) {
  const { error } = await requireAdmin(request, ['super_admin']);
  if (error) return error;

  const body = await request.json();
  await dbConnect();

  const page = await SubscriptionPage.findOneAndUpdate(
    {},
    {
      $set: {
        bannerImage: body.bannerImage || '',
        bannerTitle: body.bannerTitle || '',
        bannerSubtitle: body.bannerSubtitle || '',
      },
    },
    { upsert: true, returnDocument: 'after' }
  ).lean();

  return Response.json({ success: true, page: serialize(page) });
}
