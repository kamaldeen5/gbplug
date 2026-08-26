'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, CheckCircle2, ShieldCheck, Loader2, AlertCircle, PackageSearch, Smartphone, ExternalLink } from 'lucide-react';
import { Network, BundleOption } from '../data/bundles';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  network: Network;
  bundle: BundleOption;
  phoneNumber: string;
}

type ModalStatus = 'review' | 'redirecting' | 'prompt_sent' | 'success' | 'error';

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
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
    const maxAttempts = 40; // 40 × 4s = 160s

    pollingRef.current = setInterval(async () => {
      attempts++;

      try {
        const url = `/api/payment/verify/${encodeURIComponent(reference)}?productId=${encodeURIComponent(bundle.productId)}&recipient=${encodeURIComponent(cleanPhone)}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.success && data.paymentStatus === 'success') {
          if (pollingRef.current) clearInterval(pollingRef.current);
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
          setErrorMessage('Payment was cancelled or failed. Please try again.');
          setStatus('error');
          return;
        }
      } catch (err) {
        console.error('Poll error:', err);
      }

      if (attempts >= maxAttempts) {
        if (pollingRef.current) clearInterval(pollingRef.current);
      }
    }, 4000);
  };

  const handlePay = async () => {
    setStatus('redirecting');
    setErrorMessage(null);

    try {
      const callbackUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/track-order`
        : 'https://gbplug.com/track-order';

      const res = await fetch('/api/payment/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: bundle.price,
          phone: cleanPhone,
          bundleName: bundle.name,
          productId: bundle.productId,
          callbackUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to initiate payment');
      }

      if (data.authorization_url) {
        setAuthUrl(data.authorization_url);
        startPolling(data.reference);
        setStatus('prompt_sent');

        // Automatically open the payment page in the window
        window.location.href = data.authorization_url;
      } else {
        throw new Error('No checkout URL received from gateway');
      }
    } catch (err: any) {
      console.error('Payment initialization error:', err);
      setErrorMessage(err.message || 'Payment initiation failed. Please try again.');
      setStatus('error');
    }
  };

  const handleDone = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setStatus('review');
    setOrderId(null);
    setAuthUrl(null);
    setErrorMessage(null);
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

        {/* Close button */}
        {(status === 'review' || status === 'error' || status === 'prompt_sent') && (
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
              <span>Instant automated data delivery to {phoneNumber}</span>
            </div>

            <button
              type="button"
              onClick={handlePay}
              className="w-full h-12 bg-[#00C853] hover:bg-[#00B74A] active:bg-[#009E40] text-white font-bold tracking-tight rounded-xl shadow-[0_4px_16px_rgba(0,200,83,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
            >
              <Smartphone className="w-4 h-4" />
              <span>Pay GH₵ {bundle.price.toFixed(2)} with MoMo</span>
            </button>
          </div>
        )}

        {/* ── REDIRECTING / LOADING ── */}
        {status === 'redirecting' && (
          <div className="py-8 text-center">
            <Loader2 className="w-12 h-12 text-[#00C853] animate-spin mx-auto mb-4" />
            <h4 className="font-bold text-base tracking-tight mb-1">Opening Secure MoMo Gateway...</h4>
            <p className={`text-xs ${isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}`}>
              Connecting to Ghana Mobile Money network...
            </p>
          </div>
        )}

        {/* ── PROMPT SENT / REDIRECT FALLBACK ── */}
        {status === 'prompt_sent' && (
          <div className="py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#00C853]/10 flex items-center justify-center mx-auto mb-4 shadow-[0_0_24px_rgba(0,200,83,0.2)]">
              <Smartphone className="w-8 h-8 text-[#00C853] animate-pulse" />
            </div>
            <h4 className="font-extrabold text-lg tracking-tight mb-2">Redirecting to Payment</h4>
            <p className={`text-xs mb-5 ${isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}`}>
              If the payment page didn&apos;t open automatically, click the button below to authorize <span className="font-bold text-[#00C853]">GH₵ {bundle.price.toFixed(2)}</span>:
            </p>

            {authUrl && (
              <a
                href={authUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full h-12 mb-4 bg-[#00C853] hover:bg-[#00B74A] text-white font-bold text-sm tracking-tight rounded-xl shadow-[0_4px_16px_rgba(0,200,83,0.3)] transition-all flex items-center justify-center gap-2"
              >
                <span>Proceed to MoMo Payment</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            <div className="flex items-center justify-center gap-2 text-xs text-[#00C853]">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Awaiting payment confirmation...</span>
            </div>
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
