import { redirect } from 'next/navigation';
import { getMasterSettings } from '@/lib/admin/data';

export default async function LegacyWatchRedirect() {
  const settings = await getMasterSettings().catch(() => ({}));
  const playStoreUrl =
    process.env.NEXT_PUBLIC_PLAYSTORE_URL ||
    settings?.playStoreUrl ||
    'https://play.google.com/store/apps/details?id=com.chirpii.app';

  redirect(playStoreUrl);
}
