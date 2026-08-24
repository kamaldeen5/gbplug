'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  CheckCircle2,
  ArrowLeft,
  Zap,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { MTNLogo, TelecelLogo, AirtelTigoLogo, WhatsAppIcon } from '@/components/NetworkLogos';

interface OrderRecord {
  id: string;
  network: 'mtn' | 'telecel' | 'airteltigo';
  networkName: string;
  bundle: string;
  data: string;
  phone: string;
  amount: number;
  status: 'completed' | 'processing';
  timestamp: string;
}

export default function TrackOrderPage() {
  const [isDark, setIsDark] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searched, setSearched] = useState<boolean>(false);
  const [foundOrder, setFoundOrder] = useState<OrderRecord | null>(null);

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

  const sampleOrders: OrderRecord[] = [
    {
      id: 'GBP-849201',
      network: 'mtn',
      networkName: 'MTN Ghana',
      bundle: '5 GB Non-Expiry',
      data: '5 GB',
      phone: '024 123 4567',
      amount: 26.0,
      status: 'completed',
      timestamp: '2 mins ago',
    },
    {
      id: 'GBP-738192',
      network: 'telecel',
      networkName: 'Telecel Ghana',
      bundle: '10 GB Non-Expiry',
      data: '10 GB',
      phone: '020 987 6543',
      amount: 48.0,
      status: 'completed',
      timestamp: '15 mins ago',
    },
  ];

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = searchQuery.replace(/\s/g, '').toLowerCase();
    if (!clean) return;

    setSearched(true);
    const match = sampleOrders.find(
      (o) =>
        o.id.toLowerCase().includes(clean) ||
        o.phone.replace(/\s/g, '').includes(clean)
    );

    if (match) {
      setFoundOrder(match);
    } else {
      const isMtn = clean.startsWith('024') || clean.startsWith('054') || clean.startsWith('055') || clean.startsWith('059');
      const isTelecel = clean.startsWith('020') || clean.startsWith('050');

      setFoundOrder({
        id: `GBP-${Math.floor(100000 + Math.random() * 900000)}`,
        network: isMtn ? 'mtn' : isTelecel ? 'telecel' : 'airteltigo',
        networkName: isMtn ? 'MTN Ghana' : isTelecel ? 'Telecel Ghana' : 'AirtelTigo',
        bundle: '5 GB Non-Expiry',
        data: '5 GB',
        phone: searchQuery,
        amount: 26.0,
        status: 'completed',
        timestamp: 'Just now',
      });
    }
  };

  const handleQuickDemo = (demoPhone: string) => {
    setSearchQuery(demoPhone);
    setSearched(true);
    const match = sampleOrders.find((o) => o.phone === demoPhone);
    setFoundOrder(match || sampleOrders[0]);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 flex flex-col justify-between overflow-x-auto ${
        isDark ? 'bg-[#070D18] text-white' : 'bg-[#F8FAFC] text-slate-900'
      }`}
    >
      {/* Top Header */}
      <Header
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Track Order Content */}
      <main className="w-full max-w-3xl min-w-[720px] mx-auto px-8 py-10 flex-1 flex flex-col justify-center">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className={`inline-flex items-center gap-2 text-sm font-semibold tracking-tight transition-colors ${
              isDark ? 'text-[#8E9CAE] hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Buy Data</span>
          </Link>
        </div>

        {/* Hero Title */}
        <div className="text-left mb-8">
          <h1 className="text-4xl lg:text-5xl font-black tracking-[-0.035em] leading-tight">
            <span>Track Your</span> <span className="text-[#00C853]">Order.</span>
          </h1>
          <p
            className={`mt-2.5 text-base font-normal ${
              isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
            }`}
          >
            Check the instant delivery status of your Ghana data bundle.
          </p>
        </div>

        {/* Search Card */}
        <form
          onSubmit={handleSearch}
          className={`rounded-2xl p-6 transition-all border mb-8 ${
            isDark
              ? 'bg-[#09121F] border-[#15233A] shadow-[0_25px_60px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.05)]'
              : 'bg-white border-[#E2E8F0] shadow-xl shadow-slate-200/50'
          }`}
        >
          <label
            className={`block text-[14px] font-bold tracking-tight mb-2.5 ${
              isDark ? 'text-white' : 'text-[#0F172A]'
            }`}
          >
            Enter Phone Number or Order ID
          </label>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. 024 123 4567 or GBP-849201"
                className={`w-full h-[54px] px-4 pl-11 rounded-xl border text-[16px] font-medium tracking-tight transition-all outline-none ${
                  isDark
                    ? 'bg-[#070D18] border-[#18263E] text-white placeholder-[#5A6E85] focus:border-[#00C853] focus:ring-2 focus:ring-[#00C853]/25'
                    : 'bg-white border-[#E2E8F0] text-slate-900 placeholder-slate-400 focus:border-[#00C853] focus:ring-2 focus:ring-[#00C853]/20'
                }`}
              />
              <Search
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  isDark ? 'text-[#64748B]' : 'text-slate-400'
                }`}
              />
            </div>

            <button
              type="submit"
              className="h-[54px] px-8 bg-[#00C853] hover:bg-[#00B74A] active:bg-[#009E40] text-white font-bold text-base tracking-tight rounded-xl shadow-[0_4px_16px_rgba(0,200,83,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>Track</span>
            </button>
          </div>

          {/* Quick Demo Chips */}
          <div className="mt-4 flex items-center gap-2 flex-wrap text-xs">
            <span className={isDark ? 'text-[#64748B]' : 'text-slate-400'}>Recent samples:</span>
            <button
              type="button"
              onClick={() => handleQuickDemo('024 123 4567')}
              className={`px-2.5 py-1 rounded-lg border font-medium transition-all ${
                isDark
                  ? 'border-[#18263E] bg-[#070D18] text-[#8E9CAE] hover:text-white hover:border-[#00C853]'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:border-[#00C853]'
              }`}
            >
              024 123 4567 (MTN)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('020 987 6543')}
              className={`px-2.5 py-1 rounded-lg border font-medium transition-all ${
                isDark
                  ? 'border-[#18263E] bg-[#070D18] text-[#8E9CAE] hover:text-white hover:border-[#00C853]'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:border-[#00C853]'
              }`}
            >
              020 987 6543 (Telecel)
            </button>
          </div>
        </form>

        {/* Result Card */}
        {searched && foundOrder && (
          <div
            className={`rounded-2xl p-6 transition-all border animate-fade-in ${
              isDark
                ? 'bg-[#09121F] border-[#15233A] shadow-2xl'
                : 'bg-white border-[#E2E8F0] shadow-xl'
            }`}
          >
            {/* Top info */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-700/20 gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-mono font-bold ${isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}`}>
                    ORDER {foundOrder.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#00C853]/15 text-[#00C853] flex items-center gap-1 border border-[#00C853]/30">
                    <CheckCircle2 className="w-3 h-3" />
                    Delivered
                  </span>
                </div>
                <h3 className="text-xl font-extrabold tracking-tight text-white dark:text-white">
                  {foundOrder.bundle}
                </h3>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-[#00C853] tracking-tight">
                  GH₵ {foundOrder.amount.toFixed(2)}
                </span>
                <p className={`text-xs ${isDark ? 'text-[#64748B]' : 'text-slate-400'}`}>
                  Delivered {foundOrder.timestamp}
                </p>
              </div>
            </div>

            {/* Network & Recipient Details */}
            <div className="py-5 grid grid-cols-2 gap-4 text-sm">
              <div
                className={`p-3.5 rounded-xl border ${
                  isDark ? 'bg-[#070D18] border-[#18263E]' : 'bg-slate-50 border-slate-100'
                }`}
              >
                <span className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-[#64748B]' : 'text-slate-400'}`}>
                  Network
                </span>
                <div className="flex items-center gap-2 font-bold">
                  {foundOrder.network === 'mtn' && <MTNLogo className="w-12 h-6" />}
                  {foundOrder.network === 'telecel' && <TelecelLogo className="w-7 h-7" />}
                  {foundOrder.network === 'airteltigo' && <AirtelTigoLogo className="w-16 h-6" />}
                  <span className="text-sm">{foundOrder.networkName}</span>
                </div>
              </div>

              <div
                className={`p-3.5 rounded-xl border ${
                  isDark ? 'bg-[#070D18] border-[#18263E]' : 'bg-slate-50 border-slate-100'
                }`}
              >
                <span className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-[#64748B]' : 'text-slate-400'}`}>
                  Recipient Number
                </span>
                <span className="font-bold font-mono text-base text-[#00C853]">
                  {foundOrder.phone}
                </span>
              </div>
            </div>

            {/* Visual Delivery Step Timeline */}
            <div className="pt-2 pb-5">
              <div className="flex items-center justify-between text-xs font-semibold text-[#00C853] mb-2">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Order Placed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>MoMo Paid</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Data Credited</span>
                </div>
              </div>

              {/* Progress bar line */}
              <div className="w-full h-1.5 bg-[#00C853]/20 rounded-full overflow-hidden">
                <div className="w-full h-full bg-[#00C853] rounded-full shadow-[0_0_8px_rgba(0,200,83,0.5)]" />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-700/20 flex gap-3">
              <Link
                href="/"
                className="flex-1 h-12 bg-[#00C853] hover:bg-[#00B74A] active:bg-[#009E40] text-white font-bold text-sm tracking-tight rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Buy Another Bundle</span>
              </Link>

              <a
                href={`https://wa.me/233241234567?text=Hello%20GB%20Plug,%20I%20am%20inquiring%20about%20Order%20${foundOrder.id}`}
                target="_blank"
                rel="noreferrer"
                className={`h-12 px-5 rounded-xl font-semibold text-sm tracking-tight transition-all flex items-center justify-center gap-2 border ${
                  isDark
                    ? 'border-[#18263E] bg-[#070D18] hover:bg-white/5 text-slate-200'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                }`}
              >
                <WhatsAppIcon className="w-4 h-4 text-[#00C853] fill-current" />
                <span>Help with this order</span>
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
