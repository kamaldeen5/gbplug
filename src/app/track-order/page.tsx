'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Zap,
  Loader2,
  AlertCircle,
  RefreshCw,
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
  status: 'delivered' | 'pending' | 'processing' | 'failed' | 'refunded';
  timestamp: string;
}

function TrackOrderContent() {
  const [isDark, setIsDark] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searched, setSearched] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [foundOrder, setFoundOrder] = useState<OrderRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  const searchParams = useSearchParams();

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

  // Load actual local history
  useEffect(() => {
    try {
      const stored = localStorage.getItem('gbplug_orders');
      if (stored) {
        setRecentOrders(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Auto-search if order_id is in URL
  useEffect(() => {
    const paramOrderId = searchParams.get('order_id');
    if (paramOrderId) {
      setSearchQuery(paramOrderId);
      executeSearch(paramOrderId);
    }
  }, [searchParams]);

  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const executeSearch = async (query: string) => {
    const clean = query.trim();
    if (!clean) return;

    setSearched(true);
    setLoading(true);
    setErrorMsg(null);
    setFoundOrder(null);

    try {
      // Query server live tracking endpoint (checks SikaPay live transactions + DataSika live gateway)
      const res = await fetch(`/api/track?query=${encodeURIComponent(clean)}`);
      const data = await res.json();

      if (data.success && data.order) {
        setFoundOrder(data.order);
        setLoading(false);
        return;
      }

      // Check local storage fallback
      const stored = JSON.parse(localStorage.getItem('gbplug_orders') || '[]');
      const cleanDigits = clean.replace(/\D/g, '');
      const historyMatch = stored.find(
        (o: any) =>
          (cleanDigits.length >= 9 && o.recipient?.replace(/\D/g, '') === cleanDigits) ||
          o.order_id?.toLowerCase() === clean.toLowerCase()
      );

      if (historyMatch) {
        setFoundOrder({
          id: historyMatch.order_id,
          network: historyMatch.networkId || 'mtn',
          networkName: historyMatch.network || 'MTN Ghana',
          bundle: `${historyMatch.bundle || historyMatch.data} Data Bundle`,
          data: historyMatch.data,
          phone: historyMatch.recipient,
          amount: historyMatch.price,
          status: (historyMatch.status || 'delivered').toLowerCase() as any,
          timestamp: 'Recent purchase',
        });
        setLoading(false);
        return;
      }

      // Not found
      setErrorMsg(`No active order found for "${clean}". Please verify the 10-digit number or Reference ID.`);
      setLoading(false);
    } catch (err: any) {
      console.error('Track error:', err);
      setErrorMsg('Unable to retrieve order details right now. Please try again.');
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery);
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

      {/* Main Track Order Content */}
      <main className="w-full max-w-3xl mx-auto px-4 sm:px-8 py-6 sm:py-10 flex-1 flex flex-col justify-center">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className={`inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-tight transition-colors ${
              isDark ? 'text-[#8E9CAE] hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Buy Data</span>
          </Link>
        </div>

        {/* Hero Title */}
        <div className="text-center sm:text-left mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold sm:font-black tracking-[-0.035em] leading-tight">
            <span>Track Your</span> <span className="text-[#00C853]">Order.</span>
          </h1>
          <p
            className={`mt-2.5 text-sm sm:text-base font-normal ${
              isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
            }`}
          >
            Live status verified directly with payment and network gateways.
          </p>
        </div>

        {/* Search Card */}
        <form
          onSubmit={handleSearchSubmit}
          className={`rounded-2xl p-5 sm:p-6 transition-all border mb-8 ${
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
            Enter Phone Number or Reference ID
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. 0542778141 or SKPY_MT9RXRUX_1D2B4652568E"
                className={`w-full h-[52px] sm:h-[54px] px-4 pl-11 rounded-xl border text-[16px] font-medium tracking-tight transition-all outline-none ${
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
              disabled={loading}
              className="h-[52px] sm:h-[54px] px-8 bg-[#00C853] hover:bg-[#00B74A] active:bg-[#009E40] text-white font-bold text-base tracking-tight rounded-xl shadow-[0_4px_16px_rgba(0,200,83,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span>Track Live</span>
              )}
            </button>
          </div>

          {/* Real Recent Orders Chips */}
          {recentOrders.length > 0 && (
            <div className="mt-4 flex items-center gap-2 flex-wrap text-xs">
              <span className={isDark ? 'text-[#64748B]' : 'text-slate-400'}>Recent on this device:</span>
              {recentOrders.slice(0, 3).map((o, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSearchQuery(o.order_id || o.recipient);
                    executeSearch(o.order_id || o.recipient);
                  }}
                  className={`px-2.5 py-1 rounded-lg border font-mono font-medium transition-all ${
                    isDark
                      ? 'border-[#18263E] bg-[#070D18] text-[#8E9CAE] hover:text-white hover:border-[#00C853]'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:border-[#00C853]'
                  }`}
                >
                  {o.order_id} ({o.data || o.bundle})
                </button>
              ))}
            </div>
          )}
        </form>

        {/* Loading state */}
        {loading && (
          <div className="py-12 text-center">
            <Loader2 className="w-10 h-10 text-[#00C853] animate-spin mx-auto mb-3" />
            <p className={`text-sm ${isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}`}>
              Searching live SikaPay transactions & network gateway...
            </p>
          </div>
        )}

        {/* Not Found / Error State */}
        {searched && !loading && errorMsg && (
          <div
            className={`rounded-2xl p-6 transition-all border text-center animate-fade-in ${
              isDark ? 'bg-[#09121F] border-[#15233A]' : 'bg-white border-[#E2E8F0] shadow-lg'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="font-bold text-base tracking-tight mb-1">No Orders Found</h3>
            <p className={`text-xs max-w-md mx-auto mb-5 ${isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}`}>
              {errorMsg}
            </p>
            <div className="flex justify-center gap-3">
              <Link
                href="/"
                className="px-5 py-2.5 bg-[#00C853] hover:bg-[#00B74A] text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Buy Data Bundle
              </Link>
              <a
                href={`https://wa.me/233241234567?text=Hello%20GB%20Plug,%20I%20need%20help%20tracking%20my%20order%20for%20${searchQuery}`}
                target="_blank"
                rel="noreferrer"
                className={`px-5 py-2.5 rounded-xl font-semibold text-xs transition-all border flex items-center gap-1.5 ${
                  isDark ? 'border-[#18263E] text-slate-200 hover:bg-white/5' : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <WhatsAppIcon className="w-3.5 h-3.5 text-[#00C853] fill-current" />
                <span>Contact Support</span>
              </a>
            </div>
          </div>
        )}

        {/* Real Live Result Card */}
        {searched && !loading && foundOrder && (
          <div
            className={`rounded-2xl p-6 transition-all border animate-fade-in ${
              isDark
                ? 'bg-[#09121F] border-[#15233A] shadow-2xl'
                : 'bg-white border-[#E2E8F0] shadow-xl'
            }`}
          >
            {/* Top info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-700/20 gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-mono font-bold ${isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}`}>
                    ORDER {foundOrder.id}
                  </span>
                  {foundOrder.status === 'delivered' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#00C853]/15 text-[#00C853] flex items-center gap-1 border border-[#00C853]/30">
                      <CheckCircle2 className="w-3 h-3" />
                      Delivered to SIM
                    </span>
                  )}
                  {(foundOrder.status === 'pending' || foundOrder.status === 'processing') && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 flex items-center gap-1 border border-amber-500/30">
                      <Clock className="w-3 h-3 animate-spin" />
                      Paid & Dispatching
                    </span>
                  )}
                  {(foundOrder.status === 'failed' || foundOrder.status === 'refunded') && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/15 text-red-400 flex items-center gap-1 border border-red-500/30">
                      <AlertCircle className="w-3 h-3" />
                      {foundOrder.status === 'refunded' ? 'Refunded' : 'Failed'}
                    </span>
                  )}
                </div>
                <h3 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
                  {foundOrder.bundle}
                </h3>
              </div>

              <div className="text-left sm:text-right">
                {foundOrder.amount > 0 && (
                  <span className="text-2xl font-black text-[#00C853] tracking-tight">
                    GH₵ {foundOrder.amount.toFixed(2)}
                  </span>
                )}
                <p className={`text-xs ${isDark ? 'text-[#64748B]' : 'text-slate-400'}`}>
                  {foundOrder.timestamp}
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
                  <span className="text-xs sm:text-sm">{foundOrder.networkName}</span>
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
                <span className="font-bold font-mono text-sm sm:text-base text-[#00C853]">
                  {foundOrder.phone}
                </span>
              </div>
            </div>

            {/* Visual Delivery Step Timeline */}
            <div className="pt-2 pb-5">
              <div className="flex items-center justify-between text-xs font-semibold text-[#00C853] mb-2">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Paid via MoMo</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Gateway Confirmed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {foundOrder.status === 'delivered' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Data Credited</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                      <span className="text-amber-400">Crediting SIM...</span>
                    </>
                  )}
                </div>
              </div>

              {/* Progress bar line */}
              <div className="w-full h-1.5 bg-[#00C853]/20 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full shadow-[0_0_8px_rgba(0,200,83,0.5)] transition-all duration-500 ${
                    foundOrder.status === 'delivered'
                      ? 'w-full bg-[#00C853]'
                      : 'w-2/3 bg-amber-400 animate-pulse'
                  }`}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-700/20 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => executeSearch(searchQuery)}
                className="flex-1 h-12 bg-[#00C853] hover:bg-[#00B74A] active:bg-[#009E40] text-white font-bold text-sm tracking-tight rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Status</span>
              </button>

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
                <span>Need Help?</span>
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070D18] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00C853] animate-spin" />
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
