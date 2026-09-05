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
  HelpCircle,
  X,
  ShieldCheck,
  Radio,
  Server,
  Sparkles,
  Info,
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

function WhyOrderTakingLongerModal({
  isOpen,
  onClose,
  isDark,
}: {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Card */}
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-5 sm:p-7 md:p-9 border shadow-2xl z-10 transition-all ${
          isDark
            ? 'bg-[#09121F] border-[#182844] text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className={`absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-xl border transition-colors cursor-pointer ${
            isDark
              ? 'bg-[#0E1B2E] border-[#1D3252] text-slate-300 hover:text-white hover:bg-white/10'
              : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#00C853]/15 text-[#00C853] border border-[#00C853]/30 mb-3">
          <Info className="w-3.5 h-3.5" />
          <span>Good to know</span>
        </div>

        {/* Header Title */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-tight mb-2">
          Why does data delivery sometimes take a little longer?
        </h2>

        {/* Short summary callout */}
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed mb-6 ${
            isDark
              ? 'bg-[#060C16] border-[#15233A] text-slate-300'
              : 'bg-emerald-50/70 border-emerald-200 text-slate-700'
          }`}
        >
          <p className="font-semibold text-[#00C853] mb-1">Quick Answer:</p>
          <p>
            Most orders arrive within a few minutes. During network congestion, telco servers may take longer (occasionally up to a couple of hours). Here is the honest story of what happens the moment you tap Buy.
          </p>
        </div>

        {/* Section 1: 3-Step Process */}
        <div className="mb-7">
          <h3 className={`text-sm md:text-base font-extrabold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            What happens the moment you order
          </h3>

          <div className="space-y-3">
            {/* Step 1 */}
            <div
              className={`p-3.5 sm:p-4 rounded-2xl border flex items-start gap-3.5 ${
                isDark ? 'bg-[#060C16] border-[#15233A]' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="w-7 h-7 rounded-xl bg-[#00C853] text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                1
              </div>
              <div>
                <h4 className="font-bold text-sm md:text-base tracking-tight mb-0.5">
                  You make payment
                </h4>
                <p className={`text-xs md:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  The instant your Mobile Money payment approves, your order is already moving. There is zero queue or waiting time on our platform.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div
              className={`p-3.5 sm:p-4 rounded-2xl border flex items-start gap-3.5 ${
                isDark ? 'bg-[#060C16] border-[#15233A]' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="w-7 h-7 rounded-xl bg-[#00C853] text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                2
              </div>
              <div>
                <h4 className="font-bold text-sm md:text-base tracking-tight mb-0.5">
                  We send it straight to the network automatically
                </h4>
                <p className={`text-xs md:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Our automated engine hands your bundle request directly to MTN, Telecel, or AirtelTigo gateways in seconds. No manual typing, no waiting around.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div
              className={`p-3.5 sm:p-4 rounded-2xl border flex items-start gap-3.5 ${
                isDark ? 'bg-[#060C16] border-[#15233A]' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="w-7 h-7 rounded-xl bg-[#00C853] text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                3
              </div>
              <div>
                <h4 className="font-bold text-sm md:text-base tracking-tight mb-0.5">
                  The network completes the SIM top-up
                </h4>
                <p className={`text-xs md:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  The cellular provider validates your phone number, processes the gigabytes, and applies them to your line. That final crediting step happens on their servers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: How Telecom Reselling Works */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border mb-7 ${
            isDark ? 'bg-[#0D1B2D]/60 border-[#1B3150]' : 'bg-slate-100/80 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-bold text-[#00C853] mb-1.5 uppercase tracking-wider">
            <Radio className="w-4 h-4" />
            <span>How telecom fulfillment works</span>
          </div>
          <h4 className="font-bold text-sm md:text-base mb-2">
            GB Plug connects directly to telecom bulk gateways
          </h4>
          <p className={`text-xs md:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            We purchase data at wholesale volume to give you affordable rates for MTN, Telecel, and AirtelTigo. Because the final delivery happens across the cellular network infrastructure, the speed of delivery depends directly on telecom server traffic at that exact moment.
          </p>
        </div>

        {/* Section 3: Why fast sometimes and slower other times */}
        <div className="mb-7">
          <h3 className={`text-sm md:text-base font-extrabold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            Common reasons for temporary delivery delays
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#060C16] border-[#15233A]' : 'bg-slate-50 border-slate-200'}`}>
              <p className="font-bold text-xs md:text-sm text-[#00C853] mb-1">⚡ Peak Network Hours</p>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                When thousands of subscribers across Ghana top up at once, the telecom queue moves in batches.
              </p>
            </div>

            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#060C16] border-[#15233A]' : 'bg-slate-50 border-slate-200'}`}>
              <p className="font-bold text-xs md:text-sm text-[#00C853] mb-1">🔍 Number Eligibility Check</p>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Certain bundles require the network to verify SIM active status before crediting data.
              </p>
            </div>

            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#060C16] border-[#15233A]' : 'bg-slate-50 border-slate-200'}`}>
              <p className="font-bold text-xs md:text-sm text-[#00C853] mb-1">🛠️ Telecom Maintenance</p>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Telco systems occasionally perform routine database synchronization that briefly pauses queue dispatch.
              </p>
            </div>

            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#060C16] border-[#15233A]' : 'bg-slate-50 border-slate-200'}`}>
              <p className="font-bold text-xs md:text-sm text-[#00C853] mb-1">📱 Number Formatting</p>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                A single mistyped digit can cause network verification retries, so always double-check your digits.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: What We Can and Cannot Do */}
        <div className="mb-7">
          <h3 className={`text-sm md:text-base font-extrabold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            What we can (and cannot) do
          </h3>

          <div className="space-y-3">
            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#060C16] border-[#15233A]' : 'bg-slate-50 border-slate-200'}`}>
              <p className="font-bold text-xs md:text-sm text-amber-400 mb-1">What we cannot do:</p>
              <p className={`text-xs md:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Once your order is accepted by the network, our team cannot force the telco server to jump its queue. We believe in telling you the honest truth rather than giving unrealistic estimates.
              </p>
            </div>

            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#060C16] border-[#15233A]' : 'bg-slate-50 border-slate-200'}`}>
              <p className="font-bold text-xs md:text-sm text-[#00C853] mb-1">What we do:</p>
              <p className={`text-xs md:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                If an order ever encounters a gateway timeout or fails to credit automatically, our monitoring system flags it immediately and our support team steps in to resolve it.
              </p>
            </div>
          </div>
        </div>

        {/* Section 5: The 100% Delivery Guarantee */}
        <div
          className={`p-5 rounded-2xl border mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            isDark
              ? 'bg-gradient-to-br from-[#0B1728] to-[#060C16] border-[#00C853]/30'
              : 'bg-emerald-50 border-emerald-200'
          }`}
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00C853] mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Our 100% Delivery Guarantee</span>
            </div>
            <p className={`text-xs md:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
              Every order on GB Plug is logged and guaranteed. Your money and your data are 100% safe. Even during telecom traffic delays, your bundle will always be delivered.
            </p>
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-700/30">
          <a
            href="https://wa.me/233530677880?text=Hello%20GB%20Plug,%20I%20have%20a%20question%20about%20my%20data%20order"
            target="_blank"
            rel="noreferrer"
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              isDark
                ? 'bg-[#0E1B2E] border-[#1D3252] text-slate-200 hover:bg-white/5'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <WhatsAppIcon className="w-4 h-4 text-[#00C853] fill-current" />
            <span>Chat with Support</span>
          </a>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#00C853] hover:bg-[#00B74A] active:bg-[#009E40] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderCard({
  order,
  isDark,
  searchQuery,
  onRefresh,
  onOpenWhyModal,
}: {
  order: OrderRecord;
  isDark: boolean;
  searchQuery: string;
  onRefresh: () => void;
  onOpenWhyModal: () => void;
}) {
  const isDelivered = order.status === 'delivered';
  const isProcessingActive = !isDelivered;

  return (
    <div
      className={`rounded-2xl p-5 md:p-6 transition-all border animate-fade-in ${
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
          <p className={`text-base md:text-lg font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
            {order.bundle}
          </p>
        </div>
        {order.amount > 0 && (
          <span className="text-lg md:text-xl font-black text-[#00C853] tracking-tight shrink-0">
            GH₵ {order.amount.toFixed(2)}
          </span>
        )}
      </div>

      {/* Network + Phone row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#070D18] border-[#18263E]' : 'bg-slate-50 border-slate-100'}`}>
          <span className={`block text-[10px] font-medium mb-1 ${isDark ? 'text-[#64748B]' : 'text-slate-400'}`}>Network</span>
          <div className="flex items-center gap-1.5 font-bold text-xs md:text-sm">
            {order.network === 'mtn' && <MTNLogo className="w-10 h-5" />}
            {order.network === 'telecel' && <TelecelLogo className="w-6 h-6" />}
            {order.network === 'airteltigo' && <AirtelTigoLogo className="w-14 h-5" />}
            <span>{order.networkName}</span>
          </div>
        </div>
        <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#070D18] border-[#18263E]' : 'bg-slate-50 border-slate-100'}`}>
          <span className={`block text-[10px] font-medium mb-1 ${isDark ? 'text-[#64748B]' : 'text-slate-400'}`}>Recipient</span>
          <span className="font-bold font-mono text-sm md:text-base text-[#00C853]">{order.phone}</span>
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
            <p className={`text-sm font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {isDelivered ? 'Processed' : 'Processing with Network'}
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
                  : isDark
                  ? 'bg-slate-700'
                  : 'bg-slate-300'
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
                  ? isDark
                    ? 'text-white'
                    : 'text-slate-900'
                  : isDark
                  ? 'text-slate-500'
                  : 'text-slate-400'
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

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={onRefresh}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
            isDark
              ? 'border-[#18263E] text-slate-300 hover:text-white hover:bg-white/5'
              : 'border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>

        {isProcessingActive && (
          <button
            onClick={onOpenWhyModal}
            className="text-xs text-[#00C853] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Why is delivery taking longer?</span>
          </button>
        )}
      </div>
    </div>
  );
}

function formatPhoneDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(-10);
  if (digits.length > 3 && digits.length <= 6) {
    return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  } else if (digits.length > 6) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return digits || raw;
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const rawParam = (
    searchParams.get('phone') ||
    searchParams.get('q') ||
    searchParams.get('query') ||
    searchParams.get('order_id') ||
    searchParams.get('orderId') ||
    searchParams.get('ref') ||
    searchParams.get('reference') ||
    ''
  ).trim();

  const initialQuery = /^\d+$/.test(rawParam) ? formatPhoneDisplay(rawParam) : rawParam;

  const [isDark, setIsDark] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [loading, setLoading] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);
  const [foundOrders, setFoundOrders] = useState<OrderRecord[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isWhyModalOpen, setIsWhyModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#070D18';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#F8FAFC';
    }
  }, [isDark]);

  // Execute lookup
  const executeSearch = async (query: string) => {
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    setLoading(true);
    setErrorMsg('');
    setSearched(true);

    try {
      // Collect any known order IDs saved in this browser's localStorage
      let extraOrderIds: string[] = [];
      let localMatchingOrders: any[] = [];
      try {
        const rawHistory = localStorage.getItem('gbplug_orders');
        if (rawHistory) {
          const parsed = JSON.parse(rawHistory);
          if (Array.isArray(parsed)) {
            const cleanDigits = cleanQuery.replace(/\D/g, '').slice(-9);
            localMatchingOrders = parsed.filter((item: any) => {
              if (!cleanDigits) {
                return (item.id || '').toUpperCase().includes(cleanQuery.toUpperCase()) || (item.order_id || '').toUpperCase().includes(cleanQuery.toUpperCase());
              }
              const rec = (item.recipient || '').replace(/\D/g, '');
              return rec.endsWith(cleanDigits) || (item.id || '').toUpperCase().includes(cleanQuery.toUpperCase());
            });

            extraOrderIds = localMatchingOrders
              .map((item: any) => item.order_id || item.id || item.reference)
              .filter(Boolean);
          }
        }
      } catch (err) {
        console.error('Error reading localStorage orders:', err);
      }

      const orderIdsParam = extraOrderIds.length > 0 ? `&orderIds=${encodeURIComponent(extraOrderIds.join(','))}` : '';
      const res = await fetch(`/api/track?q=${encodeURIComponent(cleanQuery)}${orderIdsParam}`);
      const data = await res.json();

      if (res.ok && data.success && Array.isArray(data.orders) && data.orders.length > 0) {
        setFoundOrders(data.orders);
        setErrorMsg('');

        // Sync fresh statuses back to localStorage
        try {
          const rawHistory = localStorage.getItem('gbplug_orders');
          const history = rawHistory ? JSON.parse(rawHistory) : [];
          if (Array.isArray(history)) {
            data.orders.forEach((serverOrder: any) => {
              const idx = history.findIndex(
                (h: any) => h.order_id === serverOrder.id || h.id === serverOrder.id || h.reference === serverOrder.reference
              );
              if (idx !== -1) {
                history[idx].status = serverOrder.status;
                history[idx].order_id = serverOrder.id;
              }
            });
            localStorage.setItem('gbplug_orders', JSON.stringify(history.slice(0, 30)));
          }
        } catch (e) {}
      } else if (localMatchingOrders.length > 0) {
        // Use local storage records formatted for UI
        const mappedLocal: OrderRecord[] = localMatchingOrders.map((item: any) => {
          const placedAt = item.timestamp || new Date().toISOString();
          return {
            id: item.order_id || item.id || 'ORDER',
            reference: item.reference || item.order_id || item.id,
            network: item.networkId || 'mtn',
            networkName: item.network || 'MTN Ghana',
            bundle: item.bundle || `${item.data || ''} Data Bundle`,
            data: item.data || 'Data Bundle',
            phone: item.recipient || cleanQuery,
            amount: item.price || 0,
            status: item.status || 'processing',
            timeline: {
              orderPlacedAt: placedAt,
              processingAt: new Date(new Date(placedAt).getTime() + 20000).toISOString(),
              deliveredAt: item.status === 'delivered' ? new Date().toISOString() : null,
            },
          };
        });

        setFoundOrders(mappedLocal);
        setErrorMsg('');
      } else {
        setFoundOrders([]);
        setErrorMsg(data?.error || 'No orders found for this search. Please check your phone number or order reference.');
      }
    } catch {
      setFoundOrders([]);
      setErrorMsg('Failed to connect to order server. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      executeSearch(initialQuery);
    } else {
      // Auto-populate from recent localStorage order if available
      try {
        const rawHistory = localStorage.getItem('gbplug_orders');
        if (rawHistory) {
          const parsed = JSON.parse(rawHistory);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].recipient) {
            const recentPhone = parsed[0].recipient;
            setSearchQuery(recentPhone);
            executeSearch(recentPhone);
          }
        }
      } catch {}
    }
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  const handleToggleTheme = () => {
    setIsDark(!isDark);
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
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-10 md:py-14 flex-1 flex flex-col justify-center">
        {/* Back Link */}
        <div className="mb-6 md:mb-8">
          <Link
            href="/"
            className={`inline-flex items-center gap-2 text-xs sm:text-sm md:text-[14.5px] font-semibold tracking-tight transition-colors ${
              isDark ? 'text-[#8E9CAE] hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Buy Data</span>
          </Link>
        </div>

        {/* Hero Title */}
        <div className="text-center sm:text-left mb-8 md:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-extrabold sm:font-black tracking-[-0.035em] leading-tight">
            <span>Track Your</span> <span className="text-[#00C853]">Order.</span>
          </h1>
          <p
            className={`mt-2.5 text-sm sm:text-base md:text-lg font-normal ${
              isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
            }`}
          >
            Live status verified directly with payment and network gateways.
          </p>
        </div>

        {/* Search Card */}
        <form
          onSubmit={handleSearchSubmit}
          className={`rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 transition-all border mb-4 ${
            isDark
              ? 'bg-[#09121F] border-[#15233A] shadow-[0_25px_60px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.05)]'
              : 'bg-white border-[#E2E8F0] shadow-xl shadow-slate-200/50'
          }`}
        >
          <label
            className={`block text-[14px] md:text-[16px] font-bold tracking-tight mb-2.5 md:mb-3 ${
              isDark ? 'text-white' : 'text-[#0F172A]'
            }`}
          >
            Enter Your Phone Number
          </label>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <div className="relative flex-1">
              <input
                type="tel"
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  const digits = val.replace(/\D/g, '').slice(0, 10);
                  if (digits.length > 0) {
                    setSearchQuery(formatPhoneDisplay(digits));
                  } else {
                    setSearchQuery(val);
                  }
                }}
                placeholder="e.g. 024 123 4567"
                inputMode="numeric"
                className={`w-full h-[52px] sm:h-[54px] md:h-[60px] px-4 md:px-5 pl-11 md:pl-12 rounded-xl md:rounded-2xl border text-[16px] md:text-[17px] font-medium tracking-tight transition-all outline-none ${
                  isDark
                    ? 'bg-[#070D18] border-[#18263E] text-white placeholder-[#5A6E85] focus:border-[#00C853] focus:ring-2 focus:ring-[#00C853]/25'
                    : 'bg-white border-[#E2E8F0] text-slate-900 placeholder-slate-400 focus:border-[#00C853] focus:ring-2 focus:ring-[#00C853]/20'
                }`}
              />
              <Search
                className={`absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  isDark ? 'text-[#64748B]' : 'text-slate-400'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-[52px] sm:h-[54px] md:h-[60px] px-8 md:px-10 bg-[#00C853] hover:bg-[#00B74A] active:bg-[#009E40] text-white font-bold text-base md:text-[17px] tracking-tight rounded-xl md:rounded-2xl shadow-[0_4px_16px_rgba(0,200,83,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span>Track Orders</span>
              )}
            </button>
          </div>
        </form>

        {/* Info Trigger Link: "Why is my order taking longer?" */}
        <div className="flex items-center justify-center sm:justify-start mb-8 md:mb-10">
          <button
            type="button"
            onClick={() => setIsWhyModalOpen(true)}
            className={`inline-flex items-center gap-1.5 text-xs sm:text-[13px] md:text-sm font-semibold tracking-tight transition-colors py-1 px-2 rounded-lg cursor-pointer ${
              isDark
                ? 'text-[#8E9CAE] hover:text-[#00C853]'
                : 'text-slate-600 hover:text-[#00C853]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#00C853] shrink-0" />
            <span className="underline decoration-dotted underline-offset-4">
              Why is my order taking longer?
            </span>
          </button>
        </div>

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
                href={`https://wa.me/233530677880?text=Hello%20GB%20Plug,%20I%20need%20help%20tracking%20my%20order%20for%20${searchQuery}`}
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

        {/* Live Order Results */}
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
                onOpenWhyModal={() => setIsWhyModalOpen(true)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Why is my order taking longer modal */}
      <WhyOrderTakingLongerModal
        isOpen={isWhyModalOpen}
        onClose={() => setIsWhyModalOpen(false)}
        isDark={isDark}
      />

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
