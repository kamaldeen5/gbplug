'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, CheckCircle2, ShieldCheck, Loader2, AlertCircle, PackageSearch, Smartphone } from 'lucide-react';
import { Network, BundleOption } from '../data/bundles';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  network: Network;
  bundle: BundleOption;
  phoneNumber: string;
}

type ModalStatus = 'review' | 'prompt_sent' | 'success' | 'error';

export function PaymentModal({
  isOpen,
  onClose,
  isDark,
  network,
  bundle,
  phoneNumber,
}: PaymentModalProps) {
  const [status, setStatus] = useState<ModalStatus>('review');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [sikaReference, setSikaReference] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const cleanPhone = phoneNumber.replace(/\D/g, '');

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const startPolling = (reference: string) => {
    let attempts = 0;
    const maxAttempts = 36; // 36 × 5s = 3 minutes max

    pollingRef.current = setInterval(async () => {
      attempts++;
      setPollCount(attempts);

      try {
        const url = `/api/payment/verify/${encodeURIComponent(reference)}?productId=${encodeURIComponent(bundle.productId)}&recipient=${encodeURIComponent(cleanPhone)}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.success && data.paymentStatus === 'success') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          // Save order to local history
          const newOrderId = data.order?.order_id || reference;
          setOrderId(newOrderId);
          try {
            const history = JSON.parse(localStorage.getItem('gbplug_orders') || '[]');
            history.unshift({
              order_id: newOrderId,
              network: network.name,
              networkId: network.id,
              bundle: bundle.name,
              data: bundle.data,
              price: bundle.price,
              recipient: cleanPhone,
              status: 'delivered',
              timestamp: new Date().toISOString(),
            });
            localStorage.setItem('gbplug_orders', JSON.stringify(history.slice(0, 20)));
          } catch (e) {}
          setStatus('success');
          return;
        }

        if (data.paymentStatus === 'failed') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setErrorMessage('Payment was not completed. Please try again.');
          setStatus('error');
          return;
        }
      } catch (err) {
        console.error('Poll error:', err);
      }

      if (attempts >= maxAttempts) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setErrorMessage('Payment is taking longer than expected. Check your MoMo or try again.');
        setStatus('error');
      }
    }, 5000);
  };

  const handlePay = async () => {
    setStatus('prompt_sent');
    setErrorMessage(null);

    try {
      const res = await fetch('/api/payment/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: bundle.price,
          phone: cleanPhone,
          bundleName: bundle.name,
          productId: bundle.productId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to initiate payment');
      }

      setSikaReference(data.reference);
      startPolling(data.reference);
    } catch (err: any) {
      console.error('Charge error:', err);
      setErrorMessage(err.message || 'Payment initiation failed. Please try again.');
      setStatus('error');
    }
  };

  const handleDone = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setStatus('review');
    setOrderId(null);
    setSikaReference(null);
    setErrorMessage(null);
    setPollCount(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={status === 'review' ? handleDone : undefined} />

      {/* Modal Box */}
      <div className={`relative w-full max-w-sm rounded-2xl p-6 shadow-2xl z-10 ${
        isDark
          ? 'bg-[#0B1322] text-white border border-[#1A2840] shadow-[0_25px_60px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.06)]'
          : 'bg-white text-slate-900 border border-slate-200 shadow-2xl'
      }`}>

        {/* Close — only on review & error states */}
        {(status === 'review' || status === 'error') && (
          <button onClick={handleDone} className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors ${
            isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}>
            <X className="w-5 h-5" />
          </button>
        )}

        {/* ── REVIEW ── */}
        {status === 'review' && (
          <div>
            <h3 className="text-lg font-bold tracking-tight mb-4">Order Summary</h3>

            <div className={`rounded-xl p-4 mb-4 space-y-2.5 text-sm ${
              isDark ? 'bg-[#070D18] border border-[#18263E]' : 'bg-slate-50 border border-slate-100'
            }`}>
              {[
                { label: 'Network', value: network.displayName },
                { label: 'Bundle', value: bundle.name },
                { label: 'Recipient', value: phoneNumber, mono: true },
                { label: 'Validity', value: bundle.validity, green: true },
              ].map(({ label, value, mono, green }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className={isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}>{label}</span>
                  <span className={`font-semibold text-right ${mono ? 'font-mono' : ''} ${green ? 'text-[#00C853]' : ''}`}>{value}</span>
                </div>
              ))}
              <div className="pt-2.5 border-t border-slate-700/30 flex justify-between items-baseline">
                <span className="font-bold">Total</span>
                <span className="text-xl font-black text-[#00C853]">GH₵ {bundle.price.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-5 text-xs font-semibold text-[#00C853]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>MoMo prompt will be sent directly to {phoneNumber}</span>
            </div>

            <button
              type="button"
              onClick={handlePay}
              className="w-full h-12 bg-[#00C853] hover:bg-[#00B74A] active:bg-[#009E40] text-white font-bold tracking-tight rounded-xl shadow-[0_4px_16px_rgba(0,200,83,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
            >
              <Smartphone className="w-4 h-4" />
              <span>Send MoMo Prompt — GH₵ {bundle.price.toFixed(2)}</span>
            </button>
          </div>
        )}

        {/* ── PROMPT SENT / WAITING ── */}
        {status === 'prompt_sent' && (
          <div className="py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#00C853]/10 flex items-center justify-center mx-auto mb-5 shadow-[0_0_24px_rgba(0,200,83,0.2)]">
              <Smartphone className="w-8 h-8 text-[#00C853] animate-pulse" />
            </div>
            <h4 className="font-extrabold text-lg tracking-tight mb-2">Approve on Your Phone</h4>
            <p className={`text-sm mb-1 ${isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}`}>
              A MoMo prompt for <span className="font-bold text-[#00C853]">GH₵ {bundle.price.toFixed(2)}</span> has been sent to
            </p>
            <p className="font-bold font-mono text-lg text-[#00C853] mb-5">{phoneNumber}</p>

            <div className={`rounded-xl p-3.5 mb-5 text-xs ${isDark ? 'bg-[#070D18] border border-[#18263E] text-[#8E9CAE]' : 'bg-slate-50 border border-slate-100 text-slate-500'}`}>
              <p className="font-semibold mb-1">Instructions:</p>
              <ol className="list-decimal list-inside space-y-1 text-left">
                <li>Open your MoMo prompt notification</li>
                <li>Enter your MoMo PIN to approve</li>
                <li>Data is delivered automatically within seconds ✅</li>
              </ol>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-[#00C853]">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Waiting for your MoMo approval...</span>
            </div>

            {pollCount > 6 && (
              <p className={`mt-3 text-xs ${isDark ? 'text-[#64748B]' : 'text-slate-400'}`}>
                Taking too long? Make sure you have sufficient MoMo balance or{' '}
                <button onClick={handleDone} className="text-[#00C853] underline font-semibold">cancel and retry</button>.
              </p>
            )}
          </div>
        )}

        {/* ── SUCCESS ── */}
        {status === 'success' && (
          <div className="py-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#00C853]/15 text-[#00C853] flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(0,200,83,0.25)]">
              <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
            </div>
            <h4 className="font-extrabold text-lg tracking-tight mb-1">Data Delivered!</h4>
            <p className={`text-xs mb-3 ${isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}`}>
              <span className="font-bold text-[#00C853]">{bundle.data}</span> has been credited to{' '}
              <span className={`font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{phoneNumber}</span>
            </p>

            {orderId && (
              <div className={`p-2.5 rounded-xl border text-xs font-mono mb-4 ${
                isDark ? 'bg-[#070D18] border-[#18263E] text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                Order Ref: <span className="font-bold text-[#00C853]">{orderId}</span>
              </div>
            )}

            <div className="space-y-2">
              {orderId && (
                <Link
                  href={`/track-order?order_id=${encodeURIComponent(orderId)}`}
                  onClick={handleDone}
                  className={`w-full h-11 rounded-xl text-xs font-bold tracking-tight transition-all flex items-center justify-center gap-2 border ${
                    isDark ? 'border-[#18263E] bg-[#070D18] hover:bg-white/5 text-white' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <PackageSearch className="w-4 h-4 text-[#00C853]" />
                  Track Live Status
                </Link>
              )}
              <button
                onClick={handleDone}
                className="w-full h-11 bg-[#00C853] hover:bg-[#00B74A] text-white font-bold text-xs tracking-tight rounded-xl shadow-[0_4px_14px_rgba(0,200,83,0.3)] transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* ── ERROR ── */}
        {status === 'error' && (
          <div className="py-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/15 text-red-500 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 stroke-[2.2]" />
            </div>
            <h4 className="font-extrabold text-lg tracking-tight mb-1 text-red-400">Payment Failed</h4>
            <p className={`text-xs mb-5 ${isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}`}>
              {errorMessage || 'Unable to complete payment. Please try again.'}
            </p>
            <div className="space-y-2">
              <button
                onClick={handlePay}
                className="w-full h-11 bg-[#00C853] hover:bg-[#00B74A] text-white font-bold text-xs tracking-tight rounded-xl transition-all cursor-pointer"
              >
                Retry Payment
              </button>
              <button
                onClick={handleDone}
                className={`w-full h-11 rounded-xl text-xs font-semibold border transition-all ${
                  isDark ? 'border-[#18263E] text-[#8E9CAE] hover:text-white hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
