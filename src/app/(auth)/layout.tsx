import React from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, ArrowUpRight } from "lucide-react";
import { ZevonLogo } from "@/components/common/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-slate-950 via-zinc-900 to-black text-slate-100 antialiased selection:bg-amber-500 selection:text-black">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <ZevonLogo showSubtitle={true} />

        <div className="hidden sm:flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>End-to-End Encrypted Session</span>
          </div>
          <a
            href={`${process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.mirnoman.com"}/api/docs`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 hover:text-amber-400 transition-colors"
          >
            API Docs <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      </header>

      {/* ── Center Content ────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md relative">
          {/* Ambient Glow */}
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Card Container */}
          <div className="relative z-10">{children}</div>
        </div>
      </main>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/5">
        <p>© {new Date().getFullYear()} ZEVON Luxury Retail Systems. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-slate-400">
            <Sparkles className="w-3 h-3 text-amber-400" /> Enterprise v1.0
          </span>
          <span className="text-slate-600">•</span>
          <span>Fast & Secure</span>
        </div>
      </footer>
    </div>
  );
}
