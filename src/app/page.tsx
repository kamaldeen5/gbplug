'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { PurchaseCard } from '@/components/PurchaseCard';
import { TrustBadges } from '@/components/TrustBadges';
import { PaymentModal } from '@/components/PaymentModal';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { NETWORKS, Network, BundleOption } from '@/data/bundles';

export default function Home() {
  const [isDark, setIsDark] = useState<boolean>(true);
  const [selectedNetwork, setSelectedNetwork] = useState<Network>(NETWORKS[0]); // MTN default
  const [selectedBundle, setSelectedBundle] = useState<BundleOption | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync dark class to html document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#070D18';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#F8FAFC';
    }
  }, [isDark]);

  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleBuyNow = () => {
    if (!selectedBundle) {
      setErrorMsg('Please select a data bundle first.');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit Ghana phone number.');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    // Strict MTN-only check for Flexa
    if (selectedBundle.serviceType === 'mtn_flexa') {
      const isMtn = ['024', '054', '055', '059', '025'].some((p) => cleanPhone.startsWith(p));
      if (!isMtn) {
        setErrorMsg('MTN Flexa is only for MTN numbers (024, 054, 055, 059, 025). Switch to Data Bundles for other networks.');
        setTimeout(() => setErrorMsg(null), 4000);
        return;
      }
    }

    setErrorMsg(null);
    setIsPaymentOpen(true);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 flex flex-col justify-between ${
        isDark ? 'bg-[#070D18] text-white' : 'bg-[#F8FAFC] text-slate-900'
      }`}
    >
      {/* Top Header */}
      <Header
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area: Responsive 1-col on mobile, 2-col on Fold/Tablet/PC */}
      <main className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 md:px-8 py-2 sm:py-6 md:py-8 flex-1 flex flex-col justify-center">
        {/* Error notification */}
        {errorMsg && (
          <div className="max-w-md mx-auto md:max-w-none w-full mb-3 p-2.5 sm:p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold tracking-tight animate-pulse text-center">
            {errorMsg}
          </div>
        )}

        {/* Responsive Grid: 1-col on phone, 2-col on fold/tablet/desktop */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-6 md:gap-8 lg:gap-12 xl:gap-16 items-center">
          <div className="md:col-span-6 lg:col-span-6 xl:col-span-7 flex flex-col justify-center">
            <Hero isDark={isDark} />
          </div>

          {/* Right Column: Form Card */}
          <div className="md:col-span-6 lg:col-span-6 xl:col-span-5 w-full max-w-md mx-auto md:max-w-none">
            <PurchaseCard
              isDark={isDark}
              selectedNetwork={selectedNetwork}
              setSelectedNetwork={setSelectedNetwork}
              selectedBundle={selectedBundle}
              setSelectedBundle={setSelectedBundle}
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              onBuyNow={handleBuyNow}
            />
          </div>
        </div>
      </main>

      {/* Footer Section with Trust Badges (Scroll down to view) */}
      <footer className="w-full border-t border-slate-700/10 dark:border-slate-800/40 py-8 px-4 mt-8 sm:mt-12 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
          <TrustBadges isDark={isDark} className="max-w-md w-full" />
          <p className="text-xs text-slate-500 text-center font-medium">
            © {new Date().getFullYear()} GB Plug. Fast, secure, and automated data delivery across all networks in Ghana.
          </p>
        </div>
      </footer>

      {/* PWA Install Prompt Banner */}
      <PWAInstallPrompt isDark={isDark} />

      {/* Payment / Order Confirmation Modal */}
      {selectedBundle && (
        <PaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          isDark={isDark}
          network={selectedNetwork}
          bundle={selectedBundle}
          phoneNumber={phoneNumber}
        />
      )}
    </div>
  );
}
