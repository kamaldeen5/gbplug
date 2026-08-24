'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { PurchaseCard } from '@/components/PurchaseCard';
import { TrustBadges } from '@/components/TrustBadges';
import { PaymentModal } from '@/components/PaymentModal';
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
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit Ghana phone number.');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
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

      {/* Main Content Area: Responsive 1-col on mobile, 2-col on desktop */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-8 flex-1 flex flex-col justify-center">
        {/* Error notification */}
        {errorMsg && (
          <div className="max-w-md mx-auto lg:max-w-none w-full mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold tracking-tight animate-pulse text-center">
            {errorMsg}
          </div>
        )}

        {/* Responsive Grid: 1-col on mobile, 2-col on desktop (and desktop-mode) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
          {/* Left Column: Hero Headline + Subtitle + (Desktop) Trust Badges */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-center">
            <Hero isDark={isDark} />

            {/* Desktop Trust Badges (positioned below hero text on web view) */}
            <div className="hidden lg:block pt-8 xl:pt-10">
              <TrustBadges isDark={isDark} className="max-w-md" />
            </div>
          </div>

          {/* Right Column: Form Card */}
          <div className="lg:col-span-6 xl:col-span-5 w-full max-w-md mx-auto lg:max-w-none">
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

            {/* Mobile Trust Badges (positioned below card on mobile view) */}
            <div className="block lg:hidden mt-6">
              <TrustBadges isDark={isDark} />
            </div>
          </div>
        </div>
      </main>

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
