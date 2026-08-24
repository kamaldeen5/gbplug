'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, PackageSearch } from 'lucide-react';
import { GBPlugLogo, WhatsAppIcon } from './NetworkLogos';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenMenu: () => void;
}

export function Header({
  isDark,
  onToggleTheme,
  onOpenMenu,
}: HeaderProps) {
  const pathname = usePathname();
  const isTrackOrder = pathname === '/track-order';

  const openWhatsApp = () => {
    window.open('https://wa.me/233241234567?text=Hello%20GB%20Plug,%20I%20need%20help%20with%20data%20bundle', '_blank');
  };

  return (
    <header className="w-full max-w-7xl mx-auto flex items-center justify-between py-4 sm:py-5 px-4 sm:px-8 transition-colors duration-200">
      {/* Left: Mobile hamburger + Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMenu}
          aria-label="Open navigation menu"
          className={`lg:hidden p-2 rounded-xl transition-all ${
            isDark
              ? 'text-white hover:bg-white/10 active:bg-white/15'
              : 'text-slate-900 hover:bg-slate-100 active:bg-slate-200'
          }`}
        >
          <Menu className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* GB Plug Logo */}
        <Link href="/" className="flex items-center">
          <GBPlugLogo dark={isDark} />
        </Link>
      </div>

      {/* Right Controls: Single 'Track Order' Link + Theme Switch + WhatsApp Button */}
      <div className="flex items-center gap-4 sm:gap-5">
        {/* Single Track Order Link (Desktop & Tablet) */}
        <Link
          href="/track-order"
          className={`hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13.5px] font-semibold tracking-tight transition-all ${
            isTrackOrder
              ? 'bg-[#00C853]/15 text-[#00C853] shadow-[0_0_12px_rgba(0,200,83,0.15)] border border-[#00C853]/30'
              : isDark
              ? 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <PackageSearch className="w-4 h-4 text-[#00C853] stroke-[2.2]" />
          <span>Track Order</span>
        </Link>

        {/* Theme Toggle */}
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

        {/* Mobile WhatsApp icon button */}
        <button
          onClick={openWhatsApp}
          aria-label="Contact support on WhatsApp"
          className="lg:hidden w-9 h-9 rounded-xl bg-[#00C853] hover:bg-[#00B74A] active:bg-[#009E40] text-white flex items-center justify-center shadow-[0_2px_8px_rgba(0,200,83,0.25),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all transform active:scale-95 cursor-pointer"
        >
          <WhatsAppIcon className="w-4 h-4 fill-current" />
        </button>

        {/* Desktop WhatsApp Button with Text */}
        <button
          onClick={openWhatsApp}
          className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00C853] hover:bg-[#00B74A] active:bg-[#009E40] text-white text-[13.5px] font-semibold tracking-tight shadow-[0_2px_8px_rgba(0,200,83,0.25),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all transform active:scale-95 cursor-pointer"
        >
          <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
          <span>Chat on WhatsApp</span>
        </button>
      </div>
    </header>
  );
}
