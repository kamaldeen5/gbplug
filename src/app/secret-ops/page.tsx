'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Lock,
  RefreshCw,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  LogOut,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { REGULAR_MTN_PACKAGES } from '@/data/bundles';
import { WhatsAppIcon } from '@/components/NetworkLogos';

interface AdminOrder {
  id: string;
  reference: string;
  orderId?: string | null;
  recipient: string;
  bundleName: string;
  bundleGb: number;
  amountPaid: number;
  serviceType: string;
  status: string;
  failureReason?: string | null;
  paidAt: string;
}

export default function SecretOpsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [actionNeededOrders, setActionNeededOrders] = useState<AdminOrder[]>([]);
  const [allOrders, setAllOrders] = useState<AdminOrder[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Manual dispatch form state
  const [manualPhone, setManualPhone] = useState<string>('');
  const [manualGb, setManualGb] = useState<number>(1);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);
  const [dispatchErrorMsg, setDispatchErrorMsg] = useState<string | null>(null);

  const fetchOrders = useCallback(async (token?: string) => {
    const activeToken = token || localStorage.getItem('gbplug_admin_token');
    if (!activeToken) return;

    setRefreshing(true);
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setActionNeededOrders(data.actionNeeded || []);
        setAllOrders(data.allOrders || []);
      } else if (res.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem('gbplug_admin_token');
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem('gbplug_admin_token');
    if (savedToken) {
      setIsAuthenticated(true);
      fetchOrders(savedToken);
    }
  }, [fetchOrders]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;

    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.token) {
        localStorage.setItem('gbplug_admin_token', data.token);
        setIsAuthenticated(true);
        setPinInput('');
        fetchOrders(data.token);
      } else {
        setAuthError(data.error || 'Incorrect secret PIN');
      }
    } catch {
      setAuthError('Connection failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('gbplug_admin_token');
    setIsAuthenticated(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPhone(text);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const handleDispatchRegular = async (recipient: string, bundleGb: number, targetIdKey?: string) => {
    const activeToken = localStorage.getItem('gbplug_admin_token');
    if (!activeToken) return;

    const actionKey = targetIdKey || recipient;
    setDispatchingId(actionKey);
    setDispatchSuccessMsg(null);
    setDispatchErrorMsg(null);

    try {
      const res = await fetch('/api/admin/dispatch', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${activeToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient,
          bundleGb,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setDispatchSuccessMsg(data.message || `Dispatched ${bundleGb} GB to ${recipient}!`);
        // Remove from action needed locally
        setActionNeededOrders((prev) => prev.filter((o) => o.id !== targetIdKey && o.reference !== targetIdKey));
        fetchOrders();
      } else {
        setDispatchErrorMsg(data.error || 'Dispatch failed on DataSika');
      }
    } catch (err: any) {
      setDispatchErrorMsg(err.message || 'Network error executing dispatch');
    } finally {
      setDispatchingId(null);
    }
  };

  const formatPhone = (p: string) => {
    const raw = p.replace(/\D/g, '');
    if (raw.length === 10) {
      return `${raw.slice(0, 3)} ${raw.slice(3, 6)} ${raw.slice(6)}`;
    }
    return p;
  };

  // ── 1. LOGIN PIN SCREEN ──
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070D18] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#0C1524] border border-[#1A2942] rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#00C853]/15 border border-[#00C853]/30 flex items-center justify-center mx-auto mb-5 shadow-[0_0_20px_rgba(0,200,83,0.2)]">
            <Lock className="w-8 h-8 text-[#00C853]" />
          </div>

          <h1 className="text-xl font-black tracking-tight mb-1">GB Plug Operations</h1>
          <p className="text-xs text-slate-400 mb-6">Enter secret admin PIN to access dashboard</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              inputMode="numeric"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Enter PIN"
              className="w-full h-14 bg-[#070D18] border border-[#1E304D] rounded-2xl text-center text-2xl font-bold tracking-widest text-white placeholder-slate-600 focus:outline-none focus:border-[#00C853] focus:ring-2 focus:ring-[#00C853]/30"
              autoFocus
            />

            {authError && (
              <p className="text-xs font-semibold text-rose-400 bg-rose-950/40 border border-rose-800/50 py-2 px-3 rounded-xl">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full h-13 bg-[#00C853] hover:bg-[#00B74A] active:bg-[#009E40] text-white font-bold text-base rounded-2xl shadow-lg transition-all transform active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {authLoading ? 'Verifying...' : 'Unlock Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── 2. MAIN OPERATIONS DASHBOARD ──
  return (
    <div className="min-h-screen bg-[#070D18] text-white pb-16">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#070D18]/90 backdrop-blur-md border-b border-[#15233A] px-4 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00C853]/15 flex items-center justify-center border border-[#00C853]/30">
              <Zap className="w-4 h-4 text-[#00C853]" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight leading-none">GB Plug Ops</h1>
              <span className="text-[10px] text-[#00C853] font-bold tracking-wide">● LIVE SYSTEM</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOrders()}
              disabled={refreshing}
              className="p-2 rounded-xl bg-[#0E1B2E] border border-[#1A2E4C] text-slate-200 hover:text-white hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
              title="Refresh Orders"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#00C853]' : ''}`} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-[#0E1B2E] border border-[#1A2E4C] text-slate-400 hover:text-rose-400 active:scale-95 transition-all cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-4 sm:pt-6 space-y-6">
        {/* Alerts Banner */}
        {dispatchSuccessMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs font-semibold flex items-center justify-between gap-2 shadow-lg">
            <span>{dispatchSuccessMsg}</span>
            <button onClick={() => setDispatchSuccessMsg(null)} className="text-emerald-400 hover:text-white font-bold text-sm">✕</button>
          </div>
        )}
        {dispatchErrorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs font-semibold flex items-center justify-between gap-2 shadow-lg">
            <span>{dispatchErrorMsg}</span>
            <button onClick={() => setDispatchErrorMsg(null)} className="text-rose-400 hover:text-white font-bold text-sm">✕</button>
          </div>
        )}

        {/* ── SECTION 1: ACTION NEEDED (REFUNDED / NON-FLEXA) ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-extrabold tracking-tight">
                Action Needed (Refunded / Failed)
              </h2>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              actionNeededOrders.length > 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              {actionNeededOrders.length}
            </span>
          </div>

          {actionNeededOrders.length === 0 ? (
            <div className="bg-[#0C1524] border border-[#16253C] rounded-2xl p-6 text-center">
              <CheckCircle2 className="w-8 h-8 text-[#00C853] mx-auto mb-2 opacity-80" />
              <p className="text-xs font-bold text-slate-300">All clear! No refunded or stuck orders.</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Every customer order is successfully processed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {actionNeededOrders.map((order) => {
                const matchedPkg = REGULAR_MTN_PACKAGES.find((p) => p.gb === order.bundleGb) || REGULAR_MTN_PACKAGES[0];
                const isDispatching = dispatchingId === order.id || dispatchingId === order.reference;

                return (
                  <div
                    key={order.id || order.reference}
                    className="bg-[#0C1524] border-2 border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-xl transition-all"
                  >
                    {/* Top Row: Customer Phone & Paid Amount */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base sm:text-lg font-black text-white tracking-tight font-mono">
                            {formatPhone(order.recipient)}
                          </span>
                          <button
                            onClick={() => handleCopy(order.recipient)}
                            className="p-1 rounded-md bg-[#16253C] text-slate-300 hover:text-white active:scale-95"
                            title="Copy number"
                          >
                            {copiedPhone === order.recipient ? <Check className="w-3.5 h-3.5 text-[#00C853]" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Paid GH₵ {order.amountPaid.toFixed(2)} • {new Date(order.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="inline-block px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 font-extrabold text-xs rounded-xl">
                          {order.bundleName}
                        </span>
                      </div>
                    </div>

                    {/* Failure / Refund Info */}
                    <div className="bg-[#121E31] rounded-xl p-2.5 mb-3.5 text-xs text-amber-200/90 border border-amber-500/20">
                      <span className="font-bold">⚠️ Non-Flexa / Refunded:</span> {order.failureReason || 'Number not registered for Flexa. Refunded to DataSika balance.'}
                    </div>

                    {/* Action Buttons Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        onClick={() => handleDispatchRegular(order.recipient, order.bundleGb, order.id || order.reference)}
                        disabled={isDispatching}
                        className="h-11 bg-[#00C853] hover:bg-[#00B74A] active:bg-[#009E40] text-white font-bold text-xs tracking-tight rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 transition-all"
                      >
                        <Zap className="w-4 h-4 fill-current" />
                        <span>
                          {isDispatching ? 'Dispatching...' : `Dispatch Normal MTN (${order.bundleGb} GB @ GH₵ ${matchedPkg.cost.toFixed(2)})`}
                        </span>
                      </button>

                      <a
                        href={`https://wa.me/233${order.recipient.replace(/\D/g, '').slice(-9)}?text=${encodeURIComponent(
                          `Hello! We noticed a brief delay with your ${order.bundleName} bundle delivery to ${order.recipient}. We have just expedited it to you now.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="h-11 bg-[#101F33] hover:bg-[#162A45] text-slate-200 border border-[#1E3456] font-semibold text-xs tracking-tight rounded-xl flex items-center justify-center gap-2 transition-all"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 text-[#00C853] fill-current" />
                        <span>WhatsApp Customer</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── SECTION 2: QUICK MANUAL DISPATCH TOOL ── */}
        <section className="bg-[#0C1524] border border-[#16253C] rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Smartphone className="w-4 h-4 text-[#00C853]" />
            <h2 className="text-sm font-extrabold tracking-tight">Manual Instant Dispatch (Normal MTN)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Recipient Number</label>
              <input
                type="tel"
                value={manualPhone}
                onChange={(e) => setManualPhone(e.target.value)}
                placeholder="e.g. 0531310088"
                className="w-full h-11 px-3 bg-[#070D18] border border-[#1A2C46] rounded-xl text-sm font-bold text-white focus:outline-none focus:border-[#00C853]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Bundle Size</label>
              <select
                value={manualGb}
                onChange={(e) => setManualGb(Number(e.target.value))}
                className="w-full h-11 px-3 bg-[#070D18] border border-[#1A2C46] rounded-xl text-sm font-bold text-white focus:outline-none focus:border-[#00C853]"
              >
                {REGULAR_MTN_PACKAGES.map((pkg) => (
                  <option key={pkg.gb} value={pkg.gb}>
                    {pkg.name} (Cost: GH₵ {pkg.cost.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => handleDispatchRegular(manualPhone, manualGb, 'manual-custom')}
                disabled={!manualPhone || dispatchingId === 'manual-custom'}
                className="w-full h-11 bg-[#00C853] hover:bg-[#00B74A] active:bg-[#009E40] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{dispatchingId === 'manual-custom' ? 'Sending...' : 'Send Normal Data'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* ── SECTION 3: RECENT TRANSACTIONS FEED ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-extrabold tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Recent Transactions ({allOrders.length})</span>
            </h2>
          </div>

          <div className="space-y-2">
            {allOrders.map((ord) => {
              const isDelivered = ord.status === 'delivered';
              const isRefunded = ord.status === 'refunded';

              return (
                <div
                  key={ord.id || ord.reference}
                  className="bg-[#0C1524] border border-[#16253C] rounded-xl p-3 sm:p-3.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-mono">{formatPhone(ord.recipient)}</span>
                      <span className="text-slate-400 font-medium">• {ord.bundleName}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate font-mono">
                      {ord.id || ord.reference}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide ${
                      isDelivered
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : isRefunded
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                    }`}>
                      {ord.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
