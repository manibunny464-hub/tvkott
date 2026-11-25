"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { RotateCw, Home, Lock, AlertTriangle } from "lucide-react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("[TVK OTT Runtime Error]:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#06090e] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ff1f8f]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00d9ff]/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center p-8 rounded-3xl bg-[#0b1019]/85 border border-white/10 backdrop-blur-2xl shadow-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link href="/">
            <div className="relative w-40 h-14 hover:scale-105 transition-transform">
              <Image
                src="/tvk-admin-logo.webp"
                alt="TVK OTT Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Warning Icon Badge */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-4 shadow-lg">
          <AlertTriangle size={32} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
          Playback Glitch
        </h1>
        <p className="text-sm text-white/60 mb-8 max-w-sm mx-auto leading-relaxed">
          Something unexpected occurred while processing your request. Our stream engineers have been notified.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-[#00d9ff] to-[#ff1f8f] text-white font-bold text-sm shadow-lg shadow-[#00d9ff]/25 hover:scale-105 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <RotateCw size={16} />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white font-bold text-sm transition flex items-center justify-center gap-2"
          >
            <Home size={15} />
            <span>Go to Home</span>
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-white/40">
          <Link href="/admin/login" className="hover:text-white transition flex items-center gap-1">
            <Lock size={12} />
            <span>Admin Control Room: /admin/login</span>
          </Link>
        </div>
      </div>

      <p className="mt-8 text-xs text-white/30 relative z-10">
        TVK OTT • Small wings, big emotions
      </p>
    </div>
  );
}
