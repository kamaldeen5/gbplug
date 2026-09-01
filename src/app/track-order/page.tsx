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
import { Footer } from '@/components/Footer';
import { MTNLogo, TelecelLogo, AirtelTigoLogo, WhatsAppIcon } from '@/components/NetworkLogos';

interface OrderRecord {
  id: string;
  reference: string;
  network: 'mtn' | 'telecel' | 'airteltigo';
  networkName: string;
  bundle: string;
  data: string;
  phone: string;
  amount: number;
  status: 'delivered' | 'pending' | 'processing' | 'failed' | 'refunded';
  timeline?: {
    orderPlacedAt: string | null;
    processingAt: string | null;
    deliveredAt: string | null;
  };
}

function formatTimelineDate(dateStr?: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const day = d.getDate();
  const month = d.toLocaleDateString('en-GB', { month: 'short' });
  const time = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${day} ${month}, ${time}`;
}

function OrderCard({ order, isDark, searchQuery, onRefresh }: {
  order: OrderRecord;
  isDark: boolean;
  searchQuery: string;
  onRefresh: () => void;
}) {
  const isDelivered = order.status === 'delivered';
  const isProcessingActive = !isDelivered;

  return (
    <div
      className={`rounded-2xl p-5 transition-all border animate-fade-in ${
        isDark
          ? 'bg-[#09121F] border-[#15233A] shadow-2xl'
          : 'bg-white border-[#E2E8F0] shadow-xl'
      }`}
    >
      {/* Top row: ref + badge + amount */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[11px] font-mono font-bold ${isDark ? 'text-[#8E9CAE]' : 'text-slate-400'}`}>
              ORDER {order.id}
            </span>
            {isDelivered ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00C853]/15 text-[#00C853] flex items-center gap-1 border border-[#00C853]/30">
                <CheckCircle2 className="w-2.5 h-2.5" /> Delivered
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                Processing
              </span>
            )}
          </div>
          <p className={`text-base font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
            {order.bundle}
          </p>
        </div>
        {order.amount > 0 && (
          <span className="text-lg font-black text-[#00C853] tracking-tight shrink-0">
            GH₵ {order.amount.toFixed(2)}
          </span>
        )}
      </div>

      {/* Network + Phone row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#070D18] border-[#18263E]' : 'bg-slate-50 border-slate-100'}`}>
          <span className={`block text-[10px] font-medium mb-1 ${isDark ? 'text-[#64748B]' : 'text-slate-400'}`}>Network</span>
          <div className="flex items-center gap-1.5 font-bold text-xs">
            {order.network === 'mtn' && <MTNLogo className="w-10 h-5" />}
            {order.network === 'telecel' && <TelecelLogo className="w-6 h-6" />}
            {order.network === 'airteltigo' && <AirtelTigoLogo className="w-14 h-5" />}
            <span>{order.networkName}</span>
          </div>
        </div>
        <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#070D18] border-[#18263E]' : 'bg-slate-50 border-slate-100'}`}>
          <span className={`block text-[10px] font-medium mb-1 ${isDark ? 'text-[#64748B]' : 'text-slate-400'}`}>Recipient</span>
          <span className="font-bold font-mono text-sm text-[#00C853]">{order.phone}</span>
        </div>
      </div>

      {/* Status Timeline */}
      <div className={`p-4 rounded-xl border mb-4 ${isDark ? 'bg-[#070D18]/90 border-[#18263E]' : 'bg-slate-50 border-slate-200/80'}`}>
        <h4 className={`text-[11px] font-extrabold uppercase tracking-wider mb-4 ${isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}`}>
          Status Timeline
        </h4>

        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700/40">
          {/* Step 1: Order Placed */}
          <div className="relative">
            <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-[#00C853] flex items-center justify-center ring-4 ring-[#070D18]">
              <CheckCircle2 className="w-3 h-3 text-black stroke-[3]" />
            </span>
            <p className={`text-sm font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Order Placed
            </p>
            {order.timeline?.orderPlacedAt && (
              <p className={`text-xs mt-0.5 font-medium ${isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}`}>
                {formatTimelineDate(order.timeline.orderPlacedAt)}
              </p>
            )}
          </div>

          {/* Step 2: Processing */}
          <div className="relative">
            <span
              className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center ring-4 ring-[#070D18] ${
                isDelivered
                  ? 'bg-[#00C853]'
                  : 'bg-amber-400'
              }`}
            >
              {isDelivered ? (
                <CheckCircle2 className="w-3 h-3 text-black stroke-[3]" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-ping" />
              )}
            </span>
            <p
              className={`text-sm font-bold leading-tight ${
                isDelivered
                  ? (isDark ? 'text-white' : 'text-slate-900')
                  : 'text-amber-400'
              }`}
            >
              Processing
            </p>
            {order.timeline?.processingAt && (
              <p className={`text-xs mt-0.5 font-medium ${isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}`}>
                {formatTimelineDate(order.timeline.processingAt)}
              </p>
            )}
          </div>

          {/* Step 3: Delivered */}
          <div className="relative">
            <span
              className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center ring-4 ring-[#070D18] ${
                isDelivered
                  ? 'bg-[#00C853]'
                  : 'bg-slate-700'
              }`}
            >
              {isDelivered ? (
                <CheckCircle2 className="w-3 h-3 text-black stroke-[3]" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              )}
            </span>
            <p
              className={`text-sm font-bold leading-tight ${
                isDelivered
                  ? 'text-[#00C853]'
                  : (isDark ? 'text-slate-500' : 'text-slate-400')
              }`}
            >
              Delivered
            </p>
            {order.timeline?.deliveredAt && (
              <p className={`text-xs mt-0.5 font-medium ${isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}`}>
                {formatTimelineDate(order.timeline.deliveredAt)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Wait notice */}
      {isProcessingActive && (
        <p className={`text-center text-[11px] mb-3 ${isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}`}>
          ⏳ Network delivery in progress. Orders deliver in a few minutes.
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-slate-700/20">
        <button
          type="button"
          onClick={onRefresh}
          className="flex-1 h-10 bg-[#00C853] hover:bg-[#00B74A] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
        <a
          href={`https://wa.me/233241234567?text=Hello%20GB%20Plug,%20I%20am%20inquiring%20about%20order%20${order.id}`}
          target="_blank"
          rel="noreferrer"
          className={`h-10 px-4 rounded-xl font-semibold text-xs flex items-center gap-1.5 border transition-all ${
            isDark
              ? 'border-[#18263E] bg-[#070D18] hover:bg-white/5 text-slate-200'
              : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
          }`}
        >
          <WhatsAppIcon className="w-3.5 h-3.5 text-[#00C853] fill-current" />
          Help
        </a>
      </div>
    </div>
  );
}

function TrackOrderContent() {
  const [isDark, setIsDark] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searched, setSearched] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [foundOrders, setFoundOrders] = useState<OrderRecord[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  // Auto-search from URL params or localStorage recent order
  useEffect(() => {
    const paramOrderId = searchParams.get('order_id') || searchParams.get('orderId');
    const paramPhone = searchParams.get('phone') || searchParams.get('query');

    if (paramOrderId) {
      setSearchQuery(paramOrderId);
      executeSearch(paramOrderId);
    } else if (paramPhone) {
      setSearchQuery(paramPhone);
      executeSearch(paramPhone);
    } else {
      // Auto-load most recent order from device localStorage
      try {
        const history = JSON.parse(localStorage.getItem('gbplug_orders') || '[]');
        if (Array.isArray(history) && history.length > 0) {
          const latest = history[0];
          const queryTarget = latest.recipient || latest.order_id;
          if (queryTarget) {
            setSearchQuery(queryTarget);
            executeSearch(queryTarget);
          }
        }
      } catch (e) {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const executeSearch = async (query: string) => {
    const clean = query.trim();
    if (!clean) return;

    setSearched(true);
    setLoading(true);
    setErrorMsg(null);
    setFoundOrders([]);

    // Collect all order IDs stored in this device's localStorage
    let localOrderIds: string[] = [];
    try {
      const history = JSON.parse(localStorage.getItem('gbplug_orders') || '[]');
      if (Array.isArray(history)) {
        localOrderIds = history
          .map((h: any) => h.order_id || h.orderId)
          .filter((id: string) => typeof id === 'string' && (id.startsWith('API-') || id.startsWith('FLX-')));
      }
    } catch (e) {}

    try {
      const orderIdsParam = localOrderIds.length > 0 ? `&orderIds=${encodeURIComponent(localOrderIds.join(','))}` : '';
      const res = await fetch(`/api/track?query=${encodeURIComponent(clean)}${orderIdsParam}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
        setFoundOrders(data.orders);
        setLoading(false);
        return;
      }

      setErrorMsg(
        data.error ||
        `No orders found for "${clean}". Make sure you enter the number you used to pay.`
      );
      setLoading(false);
    } catch (err: any) {
      console.error('Track error:', err);
      setErrorMsg('Unable to retrieve orders right now. Please try again.');
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
            Enter Your Phone Number
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="tel"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. 024XXXXXXX or Order ID"
                inputMode="numeric"
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
                <span>Track Orders</span>
              )}
            </button>
          </div>
        </form>

        {/* Loading state */}
        {loading && (
          <div className="py-12 text-center">
            <Loader2 className="w-10 h-10 text-[#00C853] animate-spin mx-auto mb-3" />
            <p className={`text-sm ${isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}`}>
              Looking up live orders...
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

        {/* Live Order Results — up to 5 */}
        {searched && !loading && foundOrders.length > 0 && (
          <div className="flex flex-col gap-4">
            <p className={`text-xs font-semibold ${isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}`}>
              {foundOrders.length} order{foundOrders.length > 1 ? 's' : ''} found for {searchQuery}
            </p>
            {foundOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                isDark={isDark}
                searchQuery={searchQuery}
                onRefresh={() => executeSearch(searchQuery)}
              />
            ))}
          </div>
        )}
      </main>

      <Footer isDark={isDark} />
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
