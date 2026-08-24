'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { Network, BundleOption } from '../data/bundles';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  network: Network;
  bundle: BundleOption;
  phoneNumber: string;
}

export function PaymentModal({
  isOpen,
  onClose,
  isDark,
  network,
  bundle,
  phoneNumber,
}: PaymentModalProps) {
  const [status, setStatus] = useState<'review' | 'processing' | 'success'>('review');

  if (!isOpen) return null;

  const handlePay = () => {
    setStatus('processing');
    setTimeout(() => {
      setStatus('success');
    }, 1800);
  };

  const handleDone = () => {
    setStatus('review');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity" onClick={handleDone} />

      {/* Modal Box */}
      <div
        className={`relative w-full max-w-sm rounded-2xl p-6 shadow-2xl z-10 transition-all ${
          isDark
            ? 'bg-[#0B1322] text-white border border-[#1A2840] shadow-[0_25px_60px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.06)]'
            : 'bg-white text-slate-900 border border-slate-200 shadow-2xl'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleDone}
          className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors ${
            isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {status === 'review' && (
          <div>
            <h3 className="text-lg font-bold tracking-tight mb-4">Order Summary</h3>

            <div
              className={`rounded-xl p-4 mb-4 space-y-2.5 text-sm ${
                isDark ? 'bg-[#070D18] border border-[#18263E]' : 'bg-slate-50 border border-slate-100'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}>Network</span>
                <span className="font-semibold text-right">{network.displayName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}>Bundle</span>
                <span className="font-semibold text-right">{bundle.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}>Phone Number</span>
                <span className="font-semibold font-mono text-right">{phoneNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}>Validity</span>
                <span className="font-semibold text-right text-[#00C853]">{bundle.validity}</span>
              </div>
              <div className="pt-2.5 border-t border-slate-700/30 flex justify-between items-baseline">
                <span className="font-bold tracking-tight">Total Amount</span>
                <span className="text-xl font-black text-[#00C853] tracking-tight">
                  GH₵ {bundle.price.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-5 text-xs font-semibold text-[#00C853]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Instant MoMo prompt will be sent to your phone</span>
            </div>

            <button
              type="button"
              onClick={handlePay}
              className="w-full h-12 bg-[#00C853] hover:bg-[#00B74A] active:bg-[#009E40] text-white font-bold tracking-tight rounded-xl shadow-[0_4px_16px_rgba(0,200,83,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Pay with Mobile Money
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {status === 'processing' && (
          <div className="py-8 text-center">
            <Loader2 className="w-12 h-12 text-[#00C853] animate-spin mx-auto mb-4" />
            <h4 className="font-bold text-base tracking-tight mb-1">Authorizing Payment...</h4>
            <p className={`text-xs ${isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}`}>
              Please approve the MoMo prompt on your phone ({phoneNumber}).
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-6 text-center">
            <div className="w-14 h-14 rounded-full bg-[#00C853]/15 text-[#00C853] flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(0,200,83,0.25)]">
              <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
            </div>
            <h4 className="font-extrabold text-lg tracking-tight mb-1">Bundle Sent Successfully!</h4>
            <p className={`text-xs mb-5 ${isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}`}>
              {bundle.data} has been credited to <span className="font-bold text-white">{phoneNumber}</span>.
            </p>
            <button
              type="button"
              onClick={handleDone}
              className="w-full h-12 bg-[#00C853] hover:bg-[#00B74A] text-white font-bold tracking-tight rounded-xl shadow-[0_4px_14px_rgba(0,200,83,0.3)] transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
