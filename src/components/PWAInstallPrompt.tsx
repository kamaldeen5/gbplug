'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, CheckCircle2 } from 'lucide-react';

export function PWAInstallPrompt({ isDark }: { isDark: boolean }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('Service Worker registration failed:', err);
      });
    }

    // iOS detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Chrome/Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after brief delay for smooth UX
      const dismissed = localStorage.getItem('gbplug_pwa_dismissed');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 2500);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      setShowPrompt(false);
    } else if (isIOS) {
      alert("To install GB Plug:\n1. Tap the Share button (square with arrow up ⎋) at the bottom of Safari\n2. Scroll down and tap 'Add to Home Screen' ➕");
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('gbplug_pwa_dismissed', 'true');
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-fade-in">
      <div
        className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 transition-all ${
          isDark
            ? 'bg-[#0B1322]/95 border-[#1A2840] text-white shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)]'
            : 'bg-white/95 border-slate-200 text-slate-900 shadow-2xl'
        }`}
      >
        {/* App Icon */}
        <img
          src="/icon-192.png"
          alt="GB Plug App"
          className="w-12 h-12 rounded-xl object-contain shadow-md shrink-0 border border-white/10"
        />

        {/* Copywriting */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h4 className="text-xs sm:text-sm font-black tracking-tight truncate">
              Install GB Plug
            </h4>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#00C853]/20 text-[#00C853]">
              App
            </span>
          </div>
          <p className={`text-[11.5px] leading-tight font-medium line-clamp-2 ${isDark ? 'text-[#94A3B8]' : 'text-slate-500'}`}>
            {isIOS
              ? "Tap Share ⎋ then 'Add to Home Screen' for instant 1-tap data."
              : 'Add to home screen for faster reloads and live order tracking.'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-2 bg-[#00C853] hover:bg-[#00B74A] active:bg-[#009E40] text-white text-xs font-bold tracking-tight rounded-xl shadow-[0_2px_8px_rgba(0,200,83,0.3)] transition-all transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Install</span>
          </button>

          <button
            onClick={handleDismiss}
            aria-label="Dismiss install banner"
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-[#64748B] hover:text-white' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
