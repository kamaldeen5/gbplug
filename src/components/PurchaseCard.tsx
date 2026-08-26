'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, UserSquare2, Zap, AlertTriangle } from 'lucide-react';
import { NETWORKS, NETWORK_BUNDLES, MTN_FLEXA_BUNDLES, Network, BundleOption } from '../data/bundles';
import { MTNLogo, TelecelLogo, AirtelTigoLogo, WhatsAppIcon } from './NetworkLogos';

interface PurchaseCardProps {
  isDark: boolean;
  selectedNetwork: Network;
  setSelectedNetwork: (net: Network) => void;
  selectedBundle: BundleOption | null;
  setSelectedBundle: (bundle: BundleOption | null) => void;
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  onBuyNow: () => void;
}

export function PurchaseCard({
  isDark,
  selectedNetwork,
  setSelectedNetwork,
  selectedBundle,
  setSelectedBundle,
  phoneNumber,
  setPhoneNumber,
  onBuyNow,
}: PurchaseCardProps) {
  const [activeTab, setActiveTab] = useState<'regular' | 'flexa'>('regular');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [inStock, setInStock] = useState(true);
  const [stockMessage, setStockMessage] = useState('In Stock - Orders Delivered Daily');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check live stock status on mount
  useEffect(() => {
    fetch('/api/stock')
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.inStock === 'boolean') {
          setInStock(data.inStock);
          if (data.message) setStockMessage(data.message);
        }
      })
      .catch(() => {});
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format phone number with spaces e.g. 024 123 4567
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    let formatted = raw;
    if (raw.length > 3 && raw.length <= 6) {
      formatted = `${raw.slice(0, 3)} ${raw.slice(3)}`;
    } else if (raw.length > 6) {
      formatted = `${raw.slice(0, 3)} ${raw.slice(3, 6)} ${raw.slice(6)}`;
    }
    setPhoneNumber(formatted);

    // Auto-detect network prefix if user types
    if (raw.length >= 3) {
      const prefix = raw.slice(0, 3);
      const matched = NETWORKS.find((n) => n.phonePrefixes.includes(prefix));
      if (matched) {
        if (activeTab === 'flexa' && matched.id !== 'mtn') {
          // If non-MTN entered during Flexa, switch to regular bundles
          setActiveTab('regular');
        }
        if (matched.id !== selectedNetwork.id) {
          setSelectedNetwork(matched);
          setSelectedBundle(null);
        }
      }
    }
  };

  const handleSelectNetwork = (net: Network) => {
    if (activeTab === 'flexa' && net.id !== 'mtn') {
      setActiveTab('regular');
    }
    setSelectedNetwork(net);
    setSelectedBundle(null);
  };

  const currentBundles =
    activeTab === 'flexa'
      ? MTN_FLEXA_BUNDLES
      : NETWORK_BUNDLES[selectedNetwork.id] || [];

  const handleQuickContact = () => {
    const prefix = selectedNetwork.phonePrefixes[0] || '024';
    setPhoneNumber(`${prefix} 123 4567`);
  };

  return (
    <div
      className={`w-full rounded-[22px] sm:rounded-2xl p-5 sm:p-6 transition-all duration-200 border ${
        isDark
          ? 'bg-[#09121F] border-[#15233A] shadow-[0_25px_60px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.05)]'
          : 'bg-white border-[#E2E8F0] shadow-[0_20px_50px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.05)]'
      }`}
    >
      {/* Stock Status Indicator */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/15">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span className={`w-2 h-2 rounded-full ${inStock ? 'bg-[#00C853] animate-pulse shadow-[0_0_8px_#00C853]' : 'bg-amber-500'}`} />
          <span className={inStock ? 'text-[#00C853]' : 'text-amber-400'}>
            {inStock ? (activeTab === 'flexa' ? 'MTN Flexa Gateway Active' : 'Orders Delivered Daily') : 'Restocking Shortly'}
          </span>
        </div>
      </div>

      {/* Service Type Tab Switcher */}
      <div
        className={`p-1 rounded-xl mb-5 flex items-center border ${
          isDark ? 'bg-[#070D18] border-[#18263E]' : 'bg-slate-100/90 border-slate-200'
        }`}
      >
        <button
          type="button"
          onClick={() => {
            setActiveTab('regular');
            setSelectedBundle(null);
          }}
          className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all text-center cursor-pointer ${
            activeTab === 'regular'
              ? isDark
                ? 'bg-[#09121F] text-white shadow-md border border-[#1F2F4A]'
                : 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
              : isDark
              ? 'text-slate-400 hover:text-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Data Bundles
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('flexa');
            const mtnNet = NETWORKS.find((n) => n.id === 'mtn') || NETWORKS[0];
            setSelectedNetwork(mtnNet);
            setSelectedBundle(null);
          }}
          className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'flexa'
              ? isDark
                ? 'bg-[#09121F] text-[#00C853] shadow-md border border-[#00C853]/40'
                : 'bg-white text-[#00A844] shadow-sm border border-[#00C853]/40'
              : isDark
              ? 'text-slate-400 hover:text-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>MTN Flexa</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase tracking-wider bg-[#00C853]/15 text-[#00C853]">
            Instant
          </span>
        </button>
      </div>

      {/* Flexa Feature Callout */}
      {activeTab === 'flexa' && (
        <div
          className={`mb-5 p-3 rounded-xl border text-xs leading-relaxed animate-fade-in ${
            isDark
              ? 'bg-[#070D18]/90 border-[#18263E] text-slate-300'
              : 'bg-emerald-50/60 border-emerald-200 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold text-[#00C853] mb-1">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Near-Instant MTN Delivery</span>
          </div>
          <p className={isDark ? 'text-slate-400 text-[11px]' : 'text-slate-600 text-[11px]'}>
            Powered by a dedicated supplier for fast delivery on MTN. New numbers complete a standard one-time network check.
          </p>
        </div>
      )}

      {/* 1. Choose Network */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label
            className={`block text-[14px] font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-[#0F172A]'
            }`}
          >
            1. Choose Network
          </label>
          {activeTab === 'flexa' && (
            <span className="text-[11px] font-bold text-[#00C853] bg-[#00C853]/10 px-2 py-0.5 rounded-full border border-[#00C853]/20">
              MTN Only
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {NETWORKS.map((network) => {
            const isSelected = selectedNetwork.id === network.id;
            return (
              <button
                key={network.id}
                type="button"
                onClick={() => handleSelectNetwork(network)}
                className={`relative flex flex-col items-center justify-between py-3.5 px-1 rounded-xl transition-all h-[98px] sm:h-[104px] active:scale-[0.97] cursor-pointer select-none ${
                  isSelected
                    ? 'border-2 border-[#00C853] bg-[#00C853]/[0.03] shadow-[0_0_16px_rgba(0,200,83,0.15)]'
                    : isDark
                    ? 'border border-[#17263E] bg-[#070D18] hover:border-[#263E63]'
                    : 'border border-[#E2E8F0] bg-[#FAFAFA] hover:border-slate-300'
                }`}
              >
                {/* Active Checkmark Badge */}
                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] bg-[#00C853] rounded-full flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                    <Check className="w-3 h-3 text-white stroke-[3.5]" />
                  </div>
                )}

                {/* Network Logo */}
                <div className="flex-1 flex items-center justify-center scale-105 sm:scale-100">
                  {network.id === 'mtn' && <MTNLogo />}
                  {network.id === 'telecel' && <TelecelLogo />}
                  {network.id === 'airteltigo' && <AirtelTigoLogo />}
                </div>

                {/* Network Label */}
                <span
                  className={`text-[12px] font-semibold truncate max-w-full px-0.5 tracking-tight ${
                    isSelected
                      ? isDark
                        ? 'text-white'
                        : 'text-[#0F172A]'
                      : isDark
                      ? 'text-[#8E9CAE]'
                      : 'text-[#64748B]'
                  }`}
                >
                  {network.displayName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Choose Bundle */}
      <div className="mb-6 relative" ref={dropdownRef}>
        <label
          className={`block text-[14px] font-bold tracking-tight mb-2.5 ${
            isDark ? 'text-white' : 'text-[#0F172A]'
          }`}
        >
          2. Choose Bundle
        </label>

        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`w-full h-[52px] sm:h-[54px] flex items-center justify-between px-4 rounded-xl border text-[15px] font-medium transition-all text-left active:scale-[0.99] cursor-pointer ${
            isDark
              ? 'bg-[#070D18] border-[#18263E] text-slate-100 hover:border-[#263C5E]'
              : 'bg-white border-[#E2E8F0] text-slate-800 hover:border-slate-300'
          } ${isDropdownOpen ? 'ring-2 ring-[#00C853]/40 border-[#00C853]' : ''}`}
        >
          {selectedBundle ? (
            <div className="flex items-center justify-between w-full pr-2">
              <span
                className={`font-bold tracking-tight truncate mr-2 ${
                  isDark ? 'text-white' : 'text-[#0F172A]'
                }`}
              >
                {selectedBundle.name} {activeTab === 'flexa' ? 'MTN Flexa' : 'Data Bundle'}
              </span>
              <span className="text-[#00C853] font-bold text-[14px] sm:text-[15px] tracking-tight shrink-0">
                GH₵ {selectedBundle.price.toFixed(2)}
              </span>
            </div>
          ) : (
            <span className={isDark ? 'text-[#64748B]' : 'text-slate-400'}>
              {activeTab === 'flexa' ? 'Select an MTN Flexa bundle' : 'Select a data bundle'}
            </span>
          )}
          <ChevronDown
            className={`w-5 h-5 transition-transform duration-200 shrink-0 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            } ${isDropdownOpen ? 'transform rotate-180 text-[#00C853]' : ''}`}
          />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div
            className={`absolute left-0 right-0 top-full mt-2 max-h-64 overflow-y-auto rounded-xl border z-30 shadow-2xl ${
              isDark
                ? 'bg-[#09121F] border-[#1A2840] divide-y divide-[#152338]'
                : 'bg-white border-[#E2E8F0] divide-y divide-slate-100'
            }`}
          >
            {currentBundles.map((bundle) => {
              const isSelected = selectedBundle?.id === bundle.id;
              return (
                <button
                  key={bundle.id}
                  type="button"
                  onClick={() => {
                    setSelectedBundle(bundle);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 sm:px-4 py-3 text-sm transition-colors text-left active:bg-[#00C853]/20 cursor-pointer ${
                    isSelected
                      ? isDark
                        ? 'bg-[#00C853]/15 text-[#00C853] font-bold'
                        : 'bg-[#00C853]/10 text-[#00C853] font-bold'
                      : isDark
                      ? 'text-slate-200 hover:bg-[#0D182A]'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <span
                      className={`font-bold tracking-tight text-[14px] sm:text-[15px] ${
                        isSelected
                          ? 'text-[#00C853]'
                          : isDark
                          ? 'text-white'
                          : 'text-[#0F172A]'
                      }`}
                    >
                      {bundle.name}
                    </span>
                    {bundle.popular && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase tracking-wider bg-[#00C853]/15 text-[#00C853] border border-[#00C853]/25 shrink-0">
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">{bundle.validity}</span>
                    <span className="font-bold text-[#00C853] tracking-tight text-[13px] sm:text-[14px]">
                      GH₵ {bundle.price.toFixed(2)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Enter Phone Number */}
      <div className="mb-6">
        <label
          className={`block text-[14px] font-bold tracking-tight mb-2.5 ${
            isDark ? 'text-white' : 'text-[#0F172A]'
          }`}
        >
          3. Enter Phone Number
        </label>

        <div className="relative">
          <input
            type="tel"
            inputMode="numeric"
            placeholder="e.g. 024 123 4567"
            value={phoneNumber}
            onChange={handlePhoneChange}
            className={`w-full h-[52px] sm:h-[54px] px-4 pr-12 rounded-xl border text-[16px] font-medium tracking-tight transition-all outline-none ${
              isDark
                ? 'bg-[#070D18] border-[#18263E] text-white placeholder-[#5A6E85] focus:border-[#00C853] focus:ring-2 focus:ring-[#00C853]/25'
                : 'bg-white border-[#E2E8F0] text-slate-900 placeholder-slate-400 focus:border-[#00C853] focus:ring-2 focus:ring-[#00C853]/20'
            }`}
          />
          <button
            type="button"
            onClick={handleQuickContact}
            title="Autofill sample contact"
            className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors active:scale-95 ${
              isDark
                ? 'text-[#64748B] hover:text-white hover:bg-white/5'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <UserSquare2 className="w-5 h-5 stroke-[1.8]" />
          </button>
        </div>
      </div>

      {/* Buy Now CTA Button / Out of Stock Banner */}
      {inStock ? (
        <button
          type="button"
          onClick={onBuyNow}
          className="w-full h-[54px] sm:h-[56px] bg-[#00C853] hover:bg-[#00B74A] active:bg-[#009E40] text-white font-bold text-[16px] sm:text-[17px] tracking-tight rounded-xl transition-all transform active:scale-[0.98] shadow-[0_4px_18px_rgba(0,200,83,0.35),inset_0_1px_0_rgba(255,255,255,0.22)] flex items-center justify-center gap-2 cursor-pointer select-none"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>Buy Now</span>
        </button>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            disabled
            className="w-full h-[54px] sm:h-[56px] bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-[15px] tracking-tight rounded-xl flex items-center justify-center gap-2 cursor-not-allowed opacity-90"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Temporarily Restocking — Back in 5 Mins</span>
          </button>

          <a
            href="https://wa.me/233241234567?text=Hello%20GB%20Plug,%20please%20notify%20me%20when%20data%20is%20back%20in%20stock."
            target="_blank"
            rel="noreferrer"
            className={`w-full h-10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
              isDark ? 'border-[#18263E] text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <WhatsAppIcon className="w-3.5 h-3.5 text-[#00C853] fill-current" />
            <span>Notify Me When In Stock</span>
          </a>
        </div>
      )}
    </div>
  );
}
