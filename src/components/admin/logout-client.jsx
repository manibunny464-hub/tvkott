'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutClient() {
  const router = useRouter();

  useEffect(() => {
    async function logout() {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      router.replace('/admin/login');
    }

    logout();
  }, [router]);

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--admin-background)]">
      <div className="rounded-[8px] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 text-center shadow-lg">
        <p className="font-display text-xl font-semibold">Signing out</p>
        <p className="mt-2 text-sm text-[var(--admin-muted)]">Closing the admin session securely.</p>
      </div>
    </main>
  );
}
