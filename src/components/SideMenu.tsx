'use client';

import React from 'react';
import Link from 'next/link';
import { X, HelpCircle, Phone, Zap, PackageSearch, BookOpen } from 'lucide-react';
import { GBPlugLogo } from './NetworkLogos';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export function SideMenu({ isOpen, onClose, isDark }: SideMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`relative w-4/5 max-w-xs h-full flex flex-col p-6 shadow-2xl z-10 transition-transform ${
          isDark
            ? 'bg-[#0B1322] text-white border-r border-[#15233A]'
            : 'bg-white text-slate-900 border-r border-slate-200'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-700/30">
          <Link href="/" onClick={onClose}>
            <GBPlugLogo dark={isDark} />
          </Link>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links */}
        <div className="py-6 flex-1 space-y-3 text-sm font-medium">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3 w-full p-3 rounded-xl text-left text-[#00C853] bg-[#00C853]/10 font-bold tracking-tight"
          >
            <Zap className="w-4 h-4 shrink-0" />
            Buy Data Bundles
          </Link>

          <Link
            href="/track-order"
            onClick={onClose}
            className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors tracking-tight font-semibold ${
              isDark ? 'hover:bg-white/5 text-white' : 'hover:bg-slate-100 text-slate-900'
            }`}
          >
            <PackageSearch className="w-4 h-4 text-[#00C853] shrink-0" />
            Track Order
          </Link>

          <Link
            href="/blog"
            onClick={onClose}
            className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors tracking-tight font-semibold ${
              isDark ? 'hover:bg-white/5 text-white' : 'hover:bg-slate-100 text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#00C853] shrink-0" />
            Guides &amp; Blog
          </Link>

          <a
            href="https://wa.me/233241234567"
            target="_blank"
            rel="noreferrer"
            className={`flex items-center gap-3 w-full p-3 rounded-xl transition-colors tracking-tight ${
              isDark ? 'hover:bg-white/5 text-[#94A3B8]' : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Phone className="w-4 h-4 shrink-0" />
            24/7 WhatsApp Support
          </a>

          <div className="pt-6 border-t border-slate-700/20">
            <div className={`text-[11px] uppercase font-bold tracking-wider mb-2.5 ${isDark ? 'text-[#64748B]' : 'text-slate-400'}`}>
              Network Check Codes
            </div>
            <div className={`space-y-2 text-xs ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
              <p><span className="font-bold text-[#FFCC00]">MTN:</span> *124# or *138#</p>
              <p><span className="font-bold text-[#E60000]">Telecel:</span> *124# or *126#</p>
              <p><span className="font-bold text-[#3B82F6]">AT:</span> *124# or *125#</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700/20 space-y-2 text-xs">
            <Link href="/terms" onClick={onClose} className={`block hover:text-[#00C853] ${isDark ? 'text-[#8E9CAE]' : 'text-slate-600'}`}>
              Terms of Service
            </Link>
            <Link href="/privacy" onClick={onClose} className={`block hover:text-[#00C853] ${isDark ? 'text-[#8E9CAE]' : 'text-slate-600'}`}>
              Privacy Policy
            </Link>
            <Link href="/refund-policy" onClick={onClose} className={`block hover:text-[#00C853] ${isDark ? 'text-[#8E9CAE]' : 'text-slate-600'}`}>
              Refund &amp; Cancellation Policy
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className={`pt-4 border-t text-[11.5px] font-medium ${isDark ? 'border-slate-800 text-[#64748B]' : 'border-slate-200 text-slate-400'}`}>
          GB Plug Ghana © {new Date().getFullYear()} • Fast & Secure
        </div>
      </div>
    </div>
  );
}
