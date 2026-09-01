'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Zap, FileText, RefreshCw, Mail } from 'lucide-react';
import { GBPlugLogo, WhatsAppIcon, MTNLogo, TelecelLogo, AirtelTigoLogo } from './NetworkLogos';

interface FooterProps {
  isDark: boolean;
}

export function Footer({ isDark }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`w-full border-t transition-colors duration-200 mt-12 sm:mt-16 ${
        isDark
          ? 'bg-[#050B14] border-[#15233A] text-slate-400'
          : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand & Bio */}
          <div className="md:col-span-1 space-y-3">
            <Link href="/" className="inline-block">
              <GBPlugLogo dark={isDark} />
            </Link>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}`}>
              GB Plug is Ghana&apos;s trusted automated platform for instant, high-speed data bundle top-ups across MTN, Telecel, and AirtelTigo.
            </p>
            <div className="flex items-center gap-2 pt-2 text-[11px] font-semibold text-[#00C853]">
              <ShieldCheck className="w-4 h-4" />
              <span>Instant Automated Delivery</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className={`hover:text-[#00C853] transition-colors flex items-center gap-1.5 ${isDark ? 'text-[#8E9CAE]' : 'text-slate-600'}`}>
                  <Zap className="w-3.5 h-3.5 text-[#00C853]" />
                  <span>Buy Data Bundles</span>
                </Link>
              </li>
              <li>
                <Link href="/track-order" className={`hover:text-[#00C853] transition-colors flex items-center gap-1.5 ${isDark ? 'text-[#8E9CAE]' : 'text-slate-600'}`}>
                  <RefreshCw className="w-3.5 h-3.5 text-[#00C853]" />
                  <span>Track Order Status</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Compliance (Paystack Required) */}
          <div className="space-y-3">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Legal & Compliance
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/terms" className={`hover:text-[#00C853] transition-colors flex items-center gap-1.5 ${isDark ? 'text-[#8E9CAE]' : 'text-slate-600'}`}>
                  <FileText className="w-3.5 h-3.5" />
                  <span>Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={`hover:text-[#00C853] transition-colors flex items-center gap-1.5 ${isDark ? 'text-[#8E9CAE]' : 'text-slate-600'}`}>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className={`hover:text-[#00C853] transition-colors flex items-center gap-1.5 ${isDark ? 'text-[#8E9CAE]' : 'text-slate-600'}`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Refund & Cancellation Policy</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Support & Contact */}
          <div className="space-y-3">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Customer Support
            </h4>
            <p className={`text-xs ${isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}`}>
              Need assistance with an order or payment? Reach our team 24/7.
            </p>
            <div className="space-y-2 text-xs">
              <a
                href="https://wa.me/233241234567?text=Hello%20GB%20Plug,%20I%20need%20assistance"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-[#00C853] font-semibold hover:underline"
              >
                <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
                <span>24/7 WhatsApp Support</span>
              </a>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs">support@gbplug.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Supported Telecom Networks */}
        <div className={`pt-6 pb-6 border-t flex flex-wrap items-center justify-between gap-4 ${isDark ? 'border-[#15233A]' : 'border-slate-200'}`}>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className={isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}>Supported Networks:</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-[11px] font-bold"><MTNLogo className="w-8 h-4" /> MTN</div>
              <div className="flex items-center gap-1 text-[11px] font-bold"><TelecelLogo className="w-4 h-4" /> Telecel</div>
              <div className="flex items-center gap-1 text-[11px] font-bold"><AirtelTigoLogo className="w-10 h-4" /> AT</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Lock className="w-3.5 h-3.5 text-[#00C853]" />
            <span>256-Bit Encrypted Mobile Money Checkout</span>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className={`pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${isDark ? 'border-[#15233A] text-[#64748B]' : 'border-slate-200 text-slate-400'}`}>
          <p>© {currentYear} GB Plug (gbplug.com). All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/refund-policy" className="hover:underline">Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
