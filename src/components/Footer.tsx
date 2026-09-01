'use client';

import React from 'react';
import Link from 'next/link';
import { GBPlugLogo, WhatsAppIcon } from './NetworkLogos';

interface FooterProps {
  isDark: boolean;
}

export function Footer({ isDark }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`w-full border-t transition-colors duration-200 mt-10 sm:mt-14 py-6 px-4 sm:px-8 ${
        isDark
          ? 'bg-[#070D18] border-[#15233A] text-[#8E9CAE]'
          : 'bg-slate-50 border-slate-200 text-slate-500'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        {/* Left: Logo & Copyright */}
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-block">
            <GBPlugLogo dark={isDark} />
          </Link>
          <span className="text-[11px]">© {currentYear} GB Plug</span>
        </div>

        {/* Center: Essential Compliance Links */}
        <div className="flex items-center gap-5 font-medium">
          <Link href="/terms" className="hover:text-[#00C853] transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-[#00C853] transition-colors">
            Privacy Policy
          </Link>
          <Link href="/refund-policy" className="hover:text-[#00C853] transition-colors">
            Refund Policy
          </Link>
        </div>

        {/* Right: WhatsApp Contact */}
        <div>
          <a
            href="https://wa.me/233241234567?text=Hello%20GB%20Plug,%20I%20need%20assistance"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-[#00C853] font-semibold hover:underline"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
            <span>Support</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
