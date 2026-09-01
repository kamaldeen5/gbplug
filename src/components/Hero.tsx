import React from 'react';
import { Zap, ShieldCheck, Clock, CheckCircle2, Sparkles, Activity } from 'lucide-react';

interface HeroProps {
  isDark: boolean;
}

export function Hero({ isDark }: HeroProps) {
  return (
    <>
      {/* Mobile: Prominent Left-Aligned Headline (Strictly Preserved - Untouched) */}
      <div className="block md:hidden text-left pt-0 pb-1 mb-3">
        <h1 className="text-[24px] xs:text-[26px] sm:text-[30px] font-black tracking-tight leading-[1.15]">
          <span className={isDark ? 'text-white' : 'text-[#0F172A]'}>Fast, affordable data bundles for </span>
          <span className="text-[#00C853] drop-shadow-[0_0_16px_rgba(0,200,83,0.35)]">all networks</span>
        </h1>
      </div>

      {/* Desktop: Rich, High-Converting Hero Layout */}
      <div className="hidden md:flex flex-col justify-center text-left py-4 lg:py-6 pr-4 lg:pr-8">
        {/* Live Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-tight bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/25 w-fit mb-5 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#00C853] animate-ping" />
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Instant Automated Data Dispatch
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-[38px] lg:text-[46px] xl:text-[52px] font-black leading-[1.08] tracking-[-0.035em]">
          <span className={isDark ? 'text-white' : 'text-[#0F172A]'}>Fast, Cheap Data Bundles </span>
          <br />
          <span className="text-[#00C853] drop-shadow-[0_0_24px_rgba(0,200,83,0.25)]">
            For Every SIM in Ghana.
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className={`mt-4 text-[15px] lg:text-[16.5px] font-normal leading-relaxed max-w-xl ${
            isDark ? 'text-[#94A3B8]' : 'text-[#475569]'
          }`}
        >
          Top up high-speed MTN Flexa, Telecel, and AirtelTigo bundles directly to your phone. Instant SIM credit 24/7 with secure Mobile Money.
        </p>

        {/* 2x2 Feature Bento Cards on Desktop */}
        <div className="grid grid-cols-2 gap-3.5 mt-7 max-w-xl">
          {/* Feature 1 */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              isDark
                ? 'bg-[#09121F]/80 border-[#15233A] hover:border-[#00C853]/30'
                : 'bg-white/80 border-slate-200 hover:border-[#00C853]/30'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold text-[#00C853] mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Instant Delivery</span>
            </div>
            <p className={`text-[12px] leading-snug ${isDark ? 'text-[#8E9CAE]' : 'text-slate-600'}`}>
              Automated crediting straight to your SIM in under 60 seconds.
            </p>
          </div>

          {/* Feature 2 */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              isDark
                ? 'bg-[#09121F]/80 border-[#15233A] hover:border-[#00C853]/30'
                : 'bg-white/80 border-slate-200 hover:border-[#00C853]/30'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold text-[#00C853] mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Extended Validity</span>
            </div>
            <p className={`text-[12px] leading-snug ${isDark ? 'text-[#8E9CAE]' : 'text-slate-600'}`}>
              Non-expiry and 90-day bundles that stay active until finished.
            </p>
          </div>

          {/* Feature 3 */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              isDark
                ? 'bg-[#09121F]/80 border-[#15233A] hover:border-[#00C853]/30'
                : 'bg-white/80 border-slate-200 hover:border-[#00C853]/30'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold text-[#00C853] mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Secure MoMo</span>
            </div>
            <p className={`text-[12px] leading-snug ${isDark ? 'text-[#8E9CAE]' : 'text-slate-600'}`}>
              Pay with MTN MoMo, Telecel Cash, or AT Money securely.
            </p>
          </div>

          {/* Feature 4 */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              isDark
                ? 'bg-[#09121F]/80 border-[#15233A] hover:border-[#00C853]/30'
                : 'bg-white/80 border-slate-200 hover:border-[#00C853]/30'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold text-[#00C853] mb-1">
              <Activity className="w-3.5 h-3.5" />
              <span>Live Order Tracking</span>
            </div>
            <p className={`text-[12px] leading-snug ${isDark ? 'text-[#8E9CAE]' : 'text-slate-600'}`}>
              Track real-time order status by phone number anytime.
            </p>
          </div>
        </div>

        {/* Live Social Proof Strip */}
        <div className="flex items-center gap-6 mt-6 pt-5 border-t border-slate-700/20 text-xs">
          <div>
            <div className="font-extrabold text-sm text-[#00C853]">50K+</div>
            <div className={isDark ? 'text-[#64748B]' : 'text-slate-500'}>Bundles Delivered</div>
          </div>
          <div className="w-[1px] h-6 bg-slate-700/30" />
          <div>
            <div className="font-extrabold text-sm text-[#00C853]">99.8%</div>
            <div className={isDark ? 'text-[#64748B]' : 'text-slate-500'}>Success Rate</div>
          </div>
          <div className="w-[1px] h-6 bg-slate-700/30" />
          <div>
            <div className="font-extrabold text-sm text-[#00C853]">24/7</div>
            <div className={isDark ? 'text-[#64748B]' : 'text-slate-500'}>Automated Service</div>
          </div>
        </div>
      </div>
    </>
  );
}
