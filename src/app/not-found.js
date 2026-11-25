import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#06090e] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Background ambient glow effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-[#00d9ff]/15 via-[#ff1f8f]/15 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <Link
        href="/"
        className="relative z-10 flex flex-col items-center justify-center text-center group cursor-pointer"
        aria-label="404 - Return to Home"
      >
        {/* Bird Mascot with Cut Wing */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.6)] border border-white/10 mb-6 bg-[#09111e] group-hover:scale-[1.02] transition-transform duration-300">
          <Image
            src="/tvk-admin-logo.webp"
            alt="404 Mascot"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Only 404 */}
        <h1 className="text-8xl sm:text-9xl font-black tracking-tight bg-gradient-to-r from-[#00d9ff] via-[#ff1f8f] to-[#ffb21f] bg-clip-text text-transparent drop-shadow-[0_0_50px_rgba(0,217,255,0.35)] leading-none">
          404
        </h1>
      </Link>
    </main>
  );
}

