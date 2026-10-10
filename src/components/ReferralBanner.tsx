'use client';

import React from 'react';
import Link from 'next/link';
import { Gift, ArrowRight } from 'lucide-react';

interface ReferralBannerProps {
  isDark: boolean;
}

export function ReferralBanner({ isDark }: ReferralBannerProps) {
  return (
    <Link
      href="/refer"
      className={`group relative mt-3 sm:mt-4 w-full rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-all duration-200 border overflow-hidden ${
        isDark
          ? 'bg-gradient-to-r from-[#0C1B1E] via-[#09151A] to-[#0B1424] border-emerald-500/25 hover:border-emerald-400/50 hover:shadow-[0_4px_24px_rgba(16,185,129,0.15)]'
          : 'bg-gradient-to-r from-emerald-50/90 to-teal-50/70 border-emerald-200 hover:border-emerald-300 hover:shadow-md'
      }`}
    >
      {/* Subtle background glow */}
      <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />

      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center flex-shrink-0 shadow-[0_2px_10px_rgba(16,185,129,0.35)] group-hover:scale-105 transition-transform">
          <Gift className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`text-[14px] sm:text-[15px] font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Refer & Earn
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Free 1 GB
            </span>
          </div>
          <p className={`text-[11.5px] sm:text-[12.5px] truncate font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Invite friends. Earn rewards when they buy data.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0 text-emerald-400 group-hover:text-emerald-300 font-semibold text-[12.5px] sm:text-[13px] tracking-tight">
        <span className="hidden xs:inline">Start Earning</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
