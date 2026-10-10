'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Gift,
  Share2,
  Copy,
  Check,
  Users,
  Award,
  Zap,
  ArrowRight,
  LogOut,
  RotateCw,
  Sparkles,
  Phone,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppIcon } from '@/components/NetworkLogos';

interface ReferredCustomer {
  phone: string;
  maskedPhone: string;
  cumulativeGb: number;
  targetGb: number;
  status: 'in_progress' | 'reward_delivered';
  rewardOrderId?: string;
  rewardDeliveredAt?: string;
  purchases: Array<{
    orderId: string;
    reference: string;
    bundleGb: number;
    timestamp: string;
  }>;
}

interface ReferrerData {
  phone: string;
  referralCode: string;
  rewardsEarned: number;
  totalEligibleGb: number;
  totalReferredCount: number;
  referredCustomers: ReferredCustomer[];
}

export default function ReferPage() {
  const [isDark, setIsDark] = useState<boolean>(true);
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [referrer, setReferrer] = useState<ReferrerData | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Sync dark theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#070D18';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#F8FAFC';
    }
  }, [isDark]);

  // Load existing session on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/referrals/me');
      const data = await res.json();
      if (res.ok && data.authenticated && data.referrer) {
        setReferrer(data.referrer);
      } else {
        setReferrer(null);
      }
    } catch {
      setReferrer(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLoginOrRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const cleanPhone = phoneInput.replace(/\D/g, '');

    if (cleanPhone.length !== 10 || !cleanPhone.startsWith('0')) {
      setErrorMsg('Please enter a valid 10-digit Ghana phone number (e.g. 054 123 4567)');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/referrals/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to authenticate');
      }

      await fetchProfile();
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/referrals/logout', { method: 'POST' });
      setReferrer(null);
      setPhoneInput('');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const referralLink = referrer
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://gbplug.com'}/r/${referrer.referralCode}`
    : '';

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    if (!referralLink || !referrer) return;
    const text = `Hey! Buy fast, affordable data bundles (MTN, Telecel, AirtelTigo) on GB Plug with instant delivery! No login needed. Check it out here: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between transition-colors duration-200 ${
        isDark ? 'bg-[#070D18] text-white' : 'bg-[#F8FAFC] text-slate-900'
      }`}
    >
      <Header isDark={isDark} onToggleTheme={() => setIsDark((prev) => !prev)} />

      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <RotateCw className="w-8 h-8 text-[#00C853] animate-spin mb-3" />
            <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Loading referral program...</p>
          </div>
        ) : !referrer ? (
          /* ==============================================================
             UNAUTHENTICATED VIEW: PROGRAM OVERVIEW + INSTANT PHONE LOGIN
             ============================================================== */
          <div className="space-y-6 sm:space-y-8 max-w-2xl mx-auto">
            {/* Value Proposition Hero */}
            <div
              className={`rounded-3xl p-6 sm:p-8 text-center border relative overflow-hidden ${
                isDark
                  ? 'bg-gradient-to-b from-[#0C1B24] via-[#09151F] to-[#07111A] border-emerald-500/25 shadow-[0_10px_40px_rgba(0,0,0,0.5)]'
                  : 'bg-gradient-to-b from-white to-emerald-50/50 border-emerald-100 shadow-xl'
              }`}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00C853]/15 text-[#00C853] border border-[#00C853]/30 text-xs sm:text-sm font-bold tracking-tight mb-4">
                <Gift className="w-4 h-4 fill-current" />
                <span>GB Plug Refer & Earn</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-3">
                Refer Friends, Get <span className="text-[#00C853]">Free 1 GB</span>
              </h1>

              <p
                className={`text-sm sm:text-base font-medium max-w-lg mx-auto leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                Earn <span className="font-bold text-white">1 GB of free data</span> automatically sent to your phone every time a referred friend accumulates <span className="font-bold text-white">7 GB</span> of purchases!
              </p>

              {/* How it works cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 text-left">
                <div
                  className={`p-4 rounded-2xl border ${
                    isDark ? 'bg-[#08121E]/70 border-[#152336]' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-[#00C853]/20 text-[#00C853] font-bold text-xs flex items-center justify-center mb-2">
                    1
                  </div>
                  <h4 className="font-bold text-sm mb-1">Share Your Link</h4>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Send your unique link to friends via WhatsApp or social media.
                  </p>
                </div>

                <div
                  className={`p-4 rounded-2xl border ${
                    isDark ? 'bg-[#08121E]/70 border-[#152336]' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-[#00C853]/20 text-[#00C853] font-bold text-xs flex items-center justify-center mb-2">
                    2
                  </div>
                  <h4 className="font-bold text-sm mb-1">Friends Buy 7 GB</h4>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Friends buy data normally with zero account or login required.
                  </p>
                </div>

                <div
                  className={`p-4 rounded-2xl border ${
                    isDark ? 'bg-[#08121E]/70 border-[#152336]' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-[#00C853]/20 text-[#00C853] font-bold text-xs flex items-center justify-center mb-2">
                    3
                  </div>
                  <h4 className="font-bold text-sm mb-1">Get 1 GB Free</h4>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    When their total hits 7 GB, 1 GB is instantly delivered to you.
                  </p>
                </div>
              </div>
            </div>

            {/* Instant Phone Login Box */}
            <div
              className={`rounded-3xl p-6 sm:p-8 border ${
                isDark
                  ? 'bg-[#0B1528] border-[#18263E] shadow-2xl'
                  : 'bg-white border-slate-200 shadow-xl'
              }`}
            >
              <div className="text-center mb-5">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight mb-1">
                  Access Your Referral Dashboard
                </h3>
                <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Enter your Ghana phone number to generate your link and track your rewards.
                </p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold text-center">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleLoginOrRegister} className="space-y-4">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Your Ghana Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="024 123 4567"
                      maxLength={14}
                      required
                      className={`w-full h-14 pl-12 pr-4 rounded-2xl border text-base font-semibold tracking-tight outline-none transition-all ${
                        isDark
                          ? 'bg-[#070D18] border-[#18263E] text-white placeholder-slate-500 focus:border-[#00C853] focus:ring-2 focus:ring-[#00C853]/20'
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-[#00C853] focus:ring-2 focus:ring-[#00C853]/20'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-14 bg-[#00C853] hover:bg-[#00B74A] active:bg-[#009E40] text-white font-bold text-base rounded-2xl transition-all shadow-[0_4px_20px_rgba(0,200,83,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RotateCw className="w-5 h-5 animate-spin" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <span>Get Referral Link & Dashboard</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className={`text-center text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  🔒 No password required. Your free data rewards will be delivered directly to this number.
                </p>
              </form>
            </div>
          </div>
        ) : (
          /* ==============================================================
             AUTHENTICATED REFERRAL DASHBOARD
             ============================================================== */
          <div className="space-y-5 sm:space-y-6">
            {/* Top Bar with User Info and Logout */}
            <div
              className={`rounded-2xl p-4 sm:p-5 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                isDark ? 'bg-[#0B1528] border-[#18263E]' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00C853]/20 text-[#00C853] flex items-center justify-center font-bold">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold">Referral Dashboard</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Active
                    </span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Rewards deliver to: <span className="font-semibold text-white">{referrer.phone}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={fetchProfile}
                  disabled={refreshing}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isDark
                      ? 'border-[#18263E] text-slate-300 hover:text-white hover:bg-white/5'
                      : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  title="Refresh statistics"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#00C853]' : ''}`} />
                  <span className="hidden xs:inline">Refresh</span>
                </button>

                <button
                  onClick={handleLogout}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isDark
                      ? 'border-[#18263E] text-red-400 hover:bg-red-500/10'
                      : 'border-slate-200 text-red-600 hover:bg-red-50'
                  }`}
                  title="Log out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Log Out</span>
                </button>
              </div>
            </div>

            {/* Unique Referral Link Card */}
            <div
              className={`rounded-3xl p-5 sm:p-6 border relative overflow-hidden ${
                isDark
                  ? 'bg-gradient-to-br from-[#0C1B24] to-[#081320] border-emerald-500/30 shadow-[0_8px_30px_rgba(0,0,0,0.4)]'
                  : 'bg-gradient-to-br from-white to-emerald-50/60 border-emerald-200 shadow-md'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#00C853]">
                    Your Unique Referral Link
                  </span>
                  <h3 className="text-lg sm:text-xl font-black tracking-tight mt-0.5">
                    Share & Earn 1 GB Per Friend
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">Code:</span>
                  <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-emerald-500/40 font-mono font-bold text-sm text-emerald-400 tracking-wider">
                    {referrer.referralCode}
                  </span>
                </div>
              </div>

              {/* Link Box & Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div
                  className={`flex-1 h-12 px-4 rounded-xl border flex items-center justify-between font-mono text-xs sm:text-sm select-all overflow-x-auto ${
                    isDark ? 'bg-[#060D17] border-[#18263E] text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                >
                  <span className="truncate">{referralLink}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="h-12 px-4 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/10 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all flex-1 sm:flex-initial"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-[#00C853]" />
                        <span className="text-[#00C853]">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleWhatsAppShare}
                    className="h-12 px-5 rounded-xl bg-[#00C853] hover:bg-[#00B74A] active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-[0_2px_12px_rgba(0,200,83,0.3)] flex-1 sm:flex-initial"
                  >
                    <WhatsAppIcon className="w-4 h-4 fill-white" />
                    <span>WhatsApp Share</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Performance Metrics Stats Row */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div
                className={`p-4 sm:p-5 rounded-2xl border text-center ${
                  isDark ? 'bg-[#0B1528] border-[#18263E]' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex justify-center mb-1 text-slate-400">
                  <Users className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-xl sm:text-3xl font-black text-white">{referrer.totalReferredCount}</div>
                <div className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Friends Referred
                </div>
              </div>

              <div
                className={`p-4 sm:p-5 rounded-2xl border text-center ${
                  isDark ? 'bg-[#0B1528] border-[#18263E]' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex justify-center mb-1 text-slate-400">
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-xl sm:text-3xl font-black text-white">{referrer.totalEligibleGb} GB</div>
                <div className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Data Bought by Friends
                </div>
              </div>

              <div
                className={`p-4 sm:p-5 rounded-2xl border text-center ${
                  isDark ? 'bg-[#0B1528] border-[#18263E]' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex justify-center mb-1 text-slate-400">
                  <Award className="w-4 h-4 text-[#00C853]" />
                </div>
                <div className="text-xl sm:text-3xl font-black text-[#00C853]">{referrer.rewardsEarned} GB</div>
                <div className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Free Rewards Earned
                </div>
              </div>
            </div>

            {/* Referred Friends Progress Section */}
            <div
              className={`rounded-3xl p-5 sm:p-6 border ${
                isDark ? 'bg-[#0B1528] border-[#18263E]' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold tracking-tight">Referred Friends Progress</h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Each friend earns you 1 GB of free data once they reach 7 GB.
                  </p>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/20">
                  Goal: 7 GB / Friend
                </span>
              </div>

              {referrer.referredCustomers.length === 0 ? (
                /* Empty state */
                <div className="py-12 px-4 text-center">
                  <div className="w-14 h-14 rounded-full bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-slate-400" />
                  </div>
                  <h4 className="font-bold text-sm sm:text-base mb-1">No referrals yet</h4>
                  <p className={`text-xs sm:text-sm max-w-sm mx-auto mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Share your unique link on WhatsApp or with friends. As soon as they make their first data purchase, they will appear here!
                  </p>
                  <button
                    onClick={handleWhatsAppShare}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00C853] text-white text-xs sm:text-sm font-bold shadow-[0_2px_10px_rgba(0,200,83,0.3)] hover:bg-[#00B74A]"
                  >
                    <WhatsAppIcon className="w-4 h-4 fill-white" />
                    <span>Invite on WhatsApp</span>
                  </button>
                </div>
              ) : (
                /* List of referred customers */
                <div className="space-y-3">
                  {referrer.referredCustomers.map((cust) => {
                    const progressPercent = Math.min(100, Math.round((cust.cumulativeGb / cust.targetGb) * 100));
                    const isDelivered = cust.status === 'reward_delivered';

                    return (
                      <div
                        key={cust.phone}
                        className={`p-4 rounded-2xl border transition-all ${
                          isDark
                            ? 'bg-[#070D18] border-[#18263E]'
                            : 'bg-slate-50/70 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm sm:text-base text-white">
                              {cust.maskedPhone}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              ({cust.purchases?.length || 0} order{cust.purchases?.length === 1 ? '' : 's'})
                            </span>
                          </div>

                          <div>
                            {isDelivered ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#00C853]/15 text-[#00C853] border border-[#00C853]/30">
                                <Check className="w-3 h-3 stroke-[3]" />
                                <span>Reward Delivered (1 GB)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                <span>In Progress</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                              Cumulative Purchases:
                            </span>
                            <span className={isDelivered ? 'text-[#00C853] font-bold' : 'text-white'}>
                              {cust.cumulativeGb} / {cust.targetGb} GB ({progressPercent}%)
                            </span>
                          </div>

                          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 rounded-full ${
                                isDelivered
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                  : 'bg-gradient-to-r from-amber-500 to-emerald-400'
                              }`}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>

                          {isDelivered && cust.rewardOrderId && (
                            <p className="text-[10px] text-slate-400 font-mono mt-1">
                              Reward Order ID: <span className="text-emerald-400">{cust.rewardOrderId}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Back to Home CTA */}
            <div className="text-center pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors"
              >
                <span>← Back to GB Plug Store</span>
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer isDark={isDark} />
    </div>
  );
}
