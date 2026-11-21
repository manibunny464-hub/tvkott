'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

export default function LoginClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(payload.message || 'Invalid admin credentials');
        return;
      }

      startTransition(() => router.replace('/admin'));
    } catch (err) {
      setError('Connection failed. Please try again.');
    }
  }

  return (
    <main className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 bg-[#06090e] text-white overflow-hidden select-none">
      {/* Ambient glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#00d9ff]/12 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#ff1f8f]/12 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,217,255,0.12),rgba(255,255,255,0))]" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Link href="/" className="inline-block transition-transform hover:scale-105 active:scale-95 mb-4">
            <div className="relative w-44 h-14">
              <Image
                src="/chirpii-logo-transparent.png"
                alt="Chirpii"
                fill
                className="object-contain drop-shadow-[0_4px_24px_rgba(0,217,255,0.25)]"
                priority
              />
            </div>
          </Link>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-xs font-semibold tracking-wider uppercase text-white/70">
              Command Center
            </span>
          </div>
        </div>

        {/* Login Glassmorphic Card */}
        <div className="w-full rounded-3xl bg-[#0b121e]/85 border border-white/10 p-7 sm:p-9 shadow-[0_30px_90px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-black tracking-tight text-white mb-1.5">
              Admin Login
            </h1>
            <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
              Enter your authorized credentials to access studio controls.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold tracking-wider uppercase text-white/70 mb-2">
                Admin Email
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#00d9ff] transition-colors"
                  size={18}
                />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm((curr) => ({ ...curr, email: e.target.value }))}
                  className="w-full h-12 bg-[#060a12]/90 border border-white/10 rounded-2xl pl-11 pr-4 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-[#00d9ff] focus:ring-2 focus:ring-[#00d9ff]/20"
                  placeholder="admin@chirpii.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold tracking-wider uppercase text-white/70 mb-2">
                Password
              </label>
              <div className="relative group">
                <LockKeyhole
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#00d9ff] transition-colors"
                  size={18}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm((curr) => ({ ...curr, password: e.target.value }))}
                  className="w-full h-12 bg-[#060a12]/90 border border-white/10 rounded-2xl pl-11 pr-11 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-[#00d9ff] focus:ring-2 focus:ring-[#00d9ff]/20 font-sans"
                  placeholder="Enter secure password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message Banner */}
            {error && (
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-shake">
                <AlertCircle size={16} className="text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full h-12 mt-2 rounded-2xl bg-gradient-to-r from-[#00d9ff] via-[#38bdf8] to-[#ff1f8f] text-white font-bold text-sm shadow-lg shadow-[#00d9ff]/25 hover:shadow-[#00d9ff]/45 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <span>Login Securely</span>
              )}
            </button>
          </form>

          {/* Security Assurance Badge */}
          <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-center gap-2 text-[11px] text-white/40">
            <ShieldCheck size={14} className="text-[#00d9ff]" />
            <span>256-bit Encrypted Session • Studio Operations</span>
          </div>
        </div>

        {/* Small Footer Text */}
        <p className="mt-8 text-xs text-white/30 text-center">
          Chirpii Mini OTT • Small wings, big emotions
        </p>
      </div>
    </main>
  );
}

