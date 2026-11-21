import { redirect } from 'next/navigation';

export default async function DottedAdminWatchRedirect({ params }) {
  const { contentId } = await params;
  redirect(`/admin/watch/${contentId}`);
}
