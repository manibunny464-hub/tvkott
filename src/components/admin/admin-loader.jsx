export default function AdminLoader() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--admin-background)] px-6">
      <div
        className="relative h-16 w-16"
        role="status"
        aria-label="Loading"
      >
        <div className="absolute inset-0 rounded-full border-4 border-[color-mix(in_srgb,var(--admin-accent)_18%,transparent)]" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[var(--admin-accent)] border-r-[var(--admin-accent)] shadow-[0_0_34px_rgba(255,31,143,0.34)]" />
      </div>
    </main>
  );
}
