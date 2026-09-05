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
      className={`w-full border-t transition-colors duration-200 mt-10 sm:mt-14 md:mt-18 py-6 sm:py-8 md:py-9 px-4 sm:px-8 md:px-10 ${
        isDark
          ? 'bg-[#070D18] border-[#15233A] text-[#8E9CAE]'
          : 'bg-slate-50 border-slate-200 text-slate-500'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 text-xs md:text-[13.5px]">
        {/* Left: Logo & Copyright */}
        <div className="flex items-center gap-3 md:gap-4">
          <Link href="/" className="inline-block">
            <GBPlugLogo dark={isDark} />
          </Link>
          <span className="text-[11px] md:text-xs">© {currentYear} GB Plug</span>
        </div>

        {/* Center: Essential Links */}
        <div className="flex items-center gap-4 sm:gap-5 md:gap-7 font-medium flex-wrap justify-center">
          <Link href="/blog" className="hover:text-[#00C853] transition-colors">
            Blog &amp; Guides
          </Link>
          <a
            href="https://wa.me/233530677880?text=Hello%20GB%20Plug,%20I%20would%20like%20to%20register%20my%20MTN%20number%20for%20Flexa%20bundles"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#00C853] transition-colors"
          >
            Register Flexa
          </a>
          <Link href="/terms" className="hover:text-[#00C853] transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-[#00C853] transition-colors">
            Privacy
          </Link>
          <Link href="/refund-policy" className="hover:text-[#00C853] transition-colors">
            Refunds
          </Link>
        </div>

        {/* Right: WhatsApp Contact */}
        <div>
          <a
            href="https://wa.me/233530677880?text=Hello%20GB%20Plug,%20I%20need%20assistance"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 md:gap-2 text-[#00C853] font-semibold hover:underline"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current" />
            <span>Support</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
