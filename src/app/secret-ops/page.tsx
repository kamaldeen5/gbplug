'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Lock,
  RefreshCw,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Send,
  LogOut,
  Smartphone,
  Copy,
  Check,
  Wallet,
  CreditCard,
  PiggyBank,
  Bell,
  BellRing,
  CheckCheck,
  X,
} from 'lucide-react';
import { REGULAR_MTN_PACKAGES } from '@/data/bundles';
import { WhatsAppIcon, GBPlugLogo } from '@/components/NetworkLogos';

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
  customerCode?: string;
}

interface WalletData {
  balance: number;
  currency: string;
  spent: number;
  as_of: string;
}

interface ChartPoint {
  date: string;
  revenue: number;
  profit: number;
  orders: number;
}

export default function SecretOpsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  const [actionNeededOrders, setActionNeededOrders] = useState<AdminOrder[]>([]);
  const [allOrders, setAllOrders] = useState<AdminOrder[]>([]);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [netProfit, setNetProfit] = useState<number>(0);
  const [profitMargin, setProfitMargin] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Notification bell state
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [readNotifIds, setReadNotifIds] = useState<string[]>([]);
  const notifRef = React.useRef<HTMLDivElement>(null);

  // Manual dispatch form state
  const [manualPhone, setManualPhone] = useState<string>('');
  const [manualGb, setManualGb] = useState<number>(1);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);
  const [dispatchErrorMsg, setDispatchErrorMsg] = useState<string | null>(null);

  const fetchData = useCallback(async (token?: string, isSilent = false) => {
    const activeToken = token || localStorage.getItem('gbplug_admin_token');
    if (!activeToken) return;

    if (!isSilent) setRefreshing(true);
    try {
      const [ordersRes, statsRes] = await Promise.all([
        fetch('/api/admin/orders', {
          headers: { Authorization: `Bearer ${activeToken}` },
          cache: 'no-store',
        }),
        fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${activeToken}` },
          cache: 'no-store',
        }),
      ]);

      if (ordersRes.status === 401 || statsRes.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem('gbplug_admin_token');
        return;
      }

      if (ordersRes.ok) {
        const oData = await ordersRes.json();
        if (oData.success) {
          setActionNeededOrders(oData.actionNeeded || []);
          setAllOrders(oData.allOrders || []);
        }
      }

      if (statsRes.ok) {
        const sData = await statsRes.json();
        if (sData.success) {
          if (sData.wallet) setWallet(sData.wallet);
          if (sData.chartData) setChartData(sData.chartData);
          if (typeof sData.totalRevenue === 'number') setTotalRevenue(sData.totalRevenue);
          if (typeof sData.netProfit === 'number') setNetProfit(sData.netProfit);
          if (typeof sData.profitMargin === 'number') setProfitMargin(sData.profitMargin);
          if (typeof sData.totalOrders === 'number') setTotalOrders(sData.totalOrders);
        }
      }
    } catch (err) {
      console.error('Fetch admin data error:', err);
    } finally {
      if (!isSilent) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem('gbplug_admin_token');
    if (savedToken) {
      setIsAuthenticated(true);
      fetchData(savedToken);
    }
  }, [fetchData]);

  // Real-time background sync: poll every 12 seconds and instantly on tab focus
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchData(undefined, true);
    }, 12000);

    const handleFocus = () => {
      fetchData(undefined, true);
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, fetchData]);

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
        fetchData(data.token);
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

  const handleDispatchRegular = async (
    recipient: string,
    bundleGb: number,
    targetIdKey?: string,
    reference?: string,
    customerCode?: string
  ) => {
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
          reference,
          customerCode,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setDispatchSuccessMsg(data.message || `Dispatched ${bundleGb} GB to ${recipient}!`);
        setActionNeededOrders((prev) => prev.filter((o) => o.id !== targetIdKey && o.reference !== targetIdKey));
        fetchData();
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

  const formatNotifTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Just now';
      return (
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
        ' · ' +
        d.toLocaleDateString([], { month: 'short', day: 'numeric' })
      );
    } catch {
      return 'Just now';
    }
  };

  // Hydrate read notification IDs from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gbplug_admin_read_notifs');
      if (saved) {
        setReadNotifIds(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // Close notifications dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute live notifications from all orders
  const notifications = React.useMemo(() => {
    return allOrders
      .map((o) => {
        const isActionNeeded = o.status === 'refunded' || !!o.failureReason;
        const isDelivered = o.status === 'delivered';
        const timeMs = new Date(o.paidAt).getTime() || Date.now();

        let notifType: 'action_needed' | 'success' | 'new_order' = 'new_order';
        let title = `New Order: ${o.bundleName}`;
        let detail = `GHS ${o.amountPaid.toFixed(2)} received for ${formatPhone(o.recipient)}`;

        if (isActionNeeded) {
          notifType = 'action_needed';
          title = `Action Needed: ${o.bundleName}`;
          detail = o.failureReason || `Refunded on gateway for ${formatPhone(o.recipient)}`;
        } else if (isDelivered) {
          notifType = 'success';
          title = `Delivered: ${o.bundleName}`;
          detail = `Successfully sent to ${formatPhone(o.recipient)}`;
        }

        return {
          id: `${o.reference}-${o.status}`,
          title,
          detail,
          time: formatNotifTime(o.paidAt),
          timestamp: timeMs,
          type: notifType,
          recipient: o.recipient,
          bundle: o.bundleName,
          reference: o.reference,
          status: o.status,
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [allOrders]);

  const unreadNotifs = notifications.filter((n) => !readNotifIds.includes(n.id));
  const unreadCount = unreadNotifs.length;
  const hasUnreadActionNeeded = unreadNotifs.some((n) => n.type === 'action_needed');

  const markAsRead = (id: string) => {
    setReadNotifIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      try {
        localStorage.setItem('gbplug_admin_read_notifs', JSON.stringify(updated.slice(-300)));
      } catch {}
      return updated;
    });
  };

  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadNotifIds((prev) => {
      const merged = Array.from(new Set([...prev, ...allIds]));
      try {
        localStorage.setItem('gbplug_admin_read_notifs', JSON.stringify(merged.slice(-300)));
      } catch {}
      return merged;
    });
  };

  // Max value for clean bar visualization
  const maxRevenue = chartData.length > 0 ? Math.max(...chartData.map((d) => d.revenue), 1) : 1;

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
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Enter Password"
              className="w-full h-14 bg-[#070D18] border border-[#1E304D] rounded-2xl text-center text-lg sm:text-xl font-bold tracking-wider text-white placeholder-slate-600 focus:outline-none focus:border-[#00C853] focus:ring-2 focus:ring-[#00C853]/30"
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
          <div className="flex items-center gap-3">
            <GBPlugLogo dark={true} className="shrink-0" />
            <div className="h-5 w-px bg-slate-700/60 hidden sm:block" />
            <span className="text-xs sm:text-sm font-black tracking-wider uppercase text-slate-300">
              Ops
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen((prev) => !prev)}
                className={`relative p-2 rounded-xl bg-[#0E1B2E] border transition-all cursor-pointer ${
                  isNotifOpen
                    ? 'text-white border-[#00C853]/60 bg-[#00C853]/10'
                    : 'border-[#1A2E4C] text-slate-200 hover:text-white hover:bg-white/5 active:scale-95'
                }`}
                title="Notifications"
              >
                {unreadCount > 0 ? (
                  <BellRing
                    className={`w-4 h-4 ${
                      hasUnreadActionNeeded ? 'text-amber-400 animate-bounce' : 'text-[#00C853]'
                    }`}
                  />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
                {unreadCount > 0 && (
                  <span
                    className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 text-[10px] font-black rounded-full flex items-center justify-center text-black shadow-lg ${
                      hasUnreadActionNeeded ? 'bg-amber-400' : 'bg-[#00C853]'
                    }`}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown Menu */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[460px] bg-[#0C1524] border border-[#1E3456] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Dropdown Header */}
                  <div className="p-3 sm:p-3.5 border-b border-[#1A2E4C] flex items-center justify-between bg-[#080E1A]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00C853]/20 text-[#00C853] border border-[#00C853]/30">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] font-bold text-slate-400 hover:text-[#00C853] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Dropdown List */}
                  <div className="overflow-y-auto divide-y divide-[#15233A] flex-1 max-h-[380px]">
                    {notifications.length === 0 ? (
                      <div className="py-10 px-4 text-center">
                        <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                        <p className="text-xs text-slate-400 font-medium">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const isRead = readNotifIds.includes(n.id);
                        return (
                          <div
                            key={n.id}
                            className={`p-3 sm:p-3.5 transition-colors flex items-start justify-between gap-3 ${
                              isRead
                                ? 'bg-transparent opacity-65 hover:opacity-100'
                                : n.type === 'action_needed'
                                ? 'bg-amber-500/5 border-l-2 border-l-amber-400'
                                : 'bg-[#00C853]/5 border-l-2 border-l-[#00C853]'
                            }`}
                          >
                            <div className="flex items-start gap-2.5 min-w-0 flex-1">
                              <div className="shrink-0 mt-0.5">
                                {n.type === 'action_needed' ? (
                                  <div className="w-7 h-7 rounded-lg bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                  </div>
                                ) : n.type === 'success' ? (
                                  <div className="w-7 h-7 rounded-lg bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  </div>
                                ) : (
                                  <div className="w-7 h-7 rounded-lg bg-cyan-400/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                                    <Zap className="w-3.5 h-3.5" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  <h4
                                    className={`text-xs font-bold truncate ${
                                      n.type === 'action_needed' ? 'text-amber-300' : 'text-slate-200'
                                    }`}
                                  >
                                    {n.title}
                                  </h4>
                                  <span className="text-[10px] text-slate-500 shrink-0 font-medium">
                                    {n.time}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 leading-tight line-clamp-2 mb-1">
                                  {n.detail}
                                </p>
                                <div className="text-[10px] font-mono text-slate-500 truncate">
                                  Ref: {n.reference}
                                </div>
                              </div>
                            </div>
                            {!isRead && (
                              <button
                                onClick={() => markAsRead(n.id)}
                                className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-[#00C853] hover:bg-[#00C853]/10 transition-colors cursor-pointer"
                                title="Mark as read"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => fetchData()}
              disabled={refreshing}
              className="p-2 rounded-xl bg-[#0E1B2E] border border-[#1A2E4C] text-slate-200 hover:text-white hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
              title="Refresh Data"
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

        {/* ── TOP SECTION 1: ACTION NEEDED (REFUNDED ORDERS) ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-extrabold tracking-tight">
                Action Needed (Refunded Orders)
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
                        onClick={() =>
                          handleDispatchRegular(
                            order.recipient,
                            order.bundleGb,
                            order.id || order.reference,
                            order.reference,
                            order.customerCode
                          )
                        }
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

        {/* ── TOP SECTION 2: QUICK MANUAL DISPATCH TOOL ── */}
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

        {/* ── SECTION: BALANCES & REAL-TIME PROFIT CARDS ── */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* DataSika Balance Card */}
          <div className="bg-[#0C1524] border border-[#1A3152] rounded-2xl p-4 sm:p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <Wallet className="w-4 h-4 text-amber-400" />
              <span>DataSika Wholesale</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              GH₵ {wallet ? Number(wallet.balance).toFixed(2) : '...'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Wholesale data spent: GH₵ {wallet ? Number(wallet.spent).toFixed(2) : '0.00'}
            </p>
          </div>

          {/* Paystack Gross Earnings Card */}
          <div className="bg-[#0C1524] border border-[#1A3152] rounded-2xl p-4 sm:p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <CreditCard className="w-4 h-4 text-sky-400" />
              <span>Paystack Revenue</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-sky-300 font-mono tracking-tight">
              GH₵ {totalRevenue.toFixed(2)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Gross from {totalOrders} customer orders
            </p>
          </div>

          {/* Real-Time Net Profit Card */}
          <div className="bg-gradient-to-br from-[#0B1E16] to-[#07130F] border border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <PiggyBank className="w-4 h-4 text-[#00C853]" />
              <span>Net Profit Earned</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#00C853] font-mono tracking-tight">
              GH₵ {netProfit.toFixed(2)}
            </div>
            <p className="text-[11px] text-emerald-300/80 mt-1">
              {profitMargin.toFixed(1)}% profit margin after fees and costs
            </p>
          </div>
        </section>

        {/* ── SECTION: REVENUE & PROFIT HISTORY ── */}
        <section className="bg-[#0C1524] border border-[#16253C] rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-black tracking-tight text-white uppercase">Daily Revenue & Profit</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Every sale automatically recalculates your margins in real time.
              </p>
            </div>
          </div>

          {/* Clean progress breakdown per day with revenue + net profit */}
          {chartData.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs font-semibold">
              Loading financial breakdown...
            </div>
          ) : (
            <div className="space-y-3">
              {chartData.map((d) => {
                const pct = Math.max(Math.round((d.revenue / maxRevenue) * 100), 5);
                const formattedDate = new Date(d.date).toLocaleDateString('en-GB', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                });

                return (
                  <div key={d.date} className="bg-[#070D18] border border-[#142640] rounded-xl p-3">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{formattedDate}</span>
                        <span className="text-slate-500 text-[11px] font-mono">
                          ({d.orders} {d.orders === 1 ? 'order' : 'orders'})
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-[11px] font-mono">
                          Revenue: GH₵ {d.revenue.toFixed(2)}
                        </span>
                        <span className="font-mono font-black text-[#00C853] text-sm">
                          Profit: GH₵ {d.profit.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Clean Progress Bar */}
                    <div className="w-full h-2 bg-[#0C1726] rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-gradient-to-r from-[#00C853] to-[#4AFFA3] rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
