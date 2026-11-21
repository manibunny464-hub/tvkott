import LoginClient from '@/components/admin/login-client';
import { redirectIfAdmin } from '@/lib/admin/auth';

export default async function LoginPage() {
  await redirectIfAdmin();
  return <LoginClient />;
}
