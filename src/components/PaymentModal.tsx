'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, CheckCircle2, ShieldCheck, Loader2, AlertCircle, PackageSearch, Smartphone, ExternalLink } from 'lucide-react';
import { Network, BundleOption } from '../data/bundles';
import { WhatsAppIcon } from './NetworkLogos';

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
  const [isQueued, setIsQueued] = useState<boolean>(false);
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
        const serviceTypeParam = bundle.serviceType ? `&serviceType=${encodeURIComponent(bundle.serviceType)}` : '';
        const url = `/api/payment/verify/${encodeURIComponent(reference)}?productId=${encodeURIComponent(bundle.productId)}&recipient=${encodeURIComponent(cleanPhone)}${serviceTypeParam}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.success && data.paymentStatus === 'success') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          const newOrderId = data.order?.order_id || reference;
          setOrderId(newOrderId);
          setIsQueued(!!data.dispatchError || data.order?.status?.toLowerCase() === 'pending');

          try {
            const raw = localStorage.getItem('gbplug_orders');
            const history = raw ? JSON.parse(raw) : [];
            const list = Array.isArray(history) ? history : [];
            const idx = list.findIndex((item: any) => item.id === reference || item.reference === reference || item.order_id === reference);
            const isDelivered = data.order?.status?.toLowerCase() === 'delivered';
            const updatedRecord = {
              id: newOrderId,
              order_id: newOrderId,
              reference: reference,
              network: network.name,
              networkId: network.id,
              bundle: `${bundle.name} Data Bundle`,
              data: bundle.data,
              price: bundle.price,
              recipient: cleanPhone,
              status: isDelivered ? 'delivered' : 'processing',
              timestamp: new Date().toISOString(),
            };

            if (idx !== -1) {
              list[idx] = updatedRecord;
            } else {
              list.unshift(updatedRecord);
            }
            localStorage.setItem('gbplug_orders', JSON.stringify(list.slice(0, 30)));
          } catch (e) {
            console.error('Failed to update order in localStorage:', e);
          }
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
      const res = await fetch('/api/payment/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: bundle.price,
          phone: cleanPhone,
          bundleName: bundle.name,
          productId: bundle.productId,
          serviceType: bundle.serviceType || 'data_bundles',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to initiate payment');
      }

      if (data.authorization_url) {
        setAuthUrl(data.authorization_url);

        // Save order immediately into localStorage so it is trackable even before verification completes
        try {
          const raw = localStorage.getItem('gbplug_orders');
          const history = raw ? JSON.parse(raw) : [];
          const list = Array.isArray(history) ? history : [];
          const filtered = list.filter((item: any) => item.id !== data.reference && item.reference !== data.reference);
          filtered.unshift({
            id: data.reference,
            order_id: data.reference,
            reference: data.reference,
            network: network.name,
            networkId: network.id,
            bundle: `${bundle.name} Data Bundle`,
            data: bundle.data,
            price: bundle.price,
            recipient: cleanPhone,
            productId: bundle.productId,
            serviceType: bundle.serviceType || 'data_bundles',
            status: 'processing',
            timestamp: new Date().toISOString(),
          });
          localStorage.setItem('gbplug_orders', JSON.stringify(filtered.slice(0, 30)));
        } catch (e) {
          console.error('Failed to save initial order to localStorage:', e);
        }

        startPolling(data.reference);
        setStatus('prompt_sent');

        // Open payment in new tab — keep this page alive so the success modal can show
        window.open(data.authorization_url, '_blank', 'noopener,noreferrer');
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
    setIsQueued(false);
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
                { label: 'Bundle', value: `${bundle.name} Data Bundle` },
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
              <span>Data delivered to your SIM after payment</span>
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
          <div className="py-2 text-center">
            {/* Animated success ring */}
            <div className="relative w-20 h-20 mx-auto mb-5">
              <div className="absolute inset-0 rounded-full bg-[#00C853]/10 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="relative w-20 h-20 rounded-full bg-[#00C853]/15 border-2 border-[#00C853]/30 flex items-center justify-center shadow-[0_0_32px_rgba(0,200,83,0.3)]">
                <CheckCircle2 className="w-10 h-10 text-[#00C853] stroke-[2]" />
              </div>
            </div>

            <h4 className="font-extrabold text-xl tracking-tight mb-1">
              {isQueued ? 'Order Confirmed!' : 'Payment Successful!'}
            </h4>
            <p className={`text-sm mb-5 leading-relaxed ${isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}`}>
              {isQueued
                ? <>Your <span className="font-bold text-[#00C853]">{bundle.data}</span> bundle is queued and will arrive on <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{phoneNumber}</span> within minutes.</>
                : <>Your <span className="font-bold text-[#00C853]">{bundle.data}</span> bundle is on its way to <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{phoneNumber}</span>.</>
              }
            </p>

            {/* Order reference card */}
            {orderId && (
              <div className={`rounded-xl p-3.5 mb-5 text-left ${
                isDark ? 'bg-[#070D18] border border-[#18263E]' : 'bg-slate-50 border border-slate-200'
              }`}>
                <p className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${isDark ? 'text-[#4A5A6A]' : 'text-slate-400'}`}>Order Reference</p>
                <p className={`font-mono text-sm font-bold tracking-wide ${isDark ? 'text-white' : 'text-slate-800'}`}>{orderId}</p>
                <p className={`text-[11px] mt-1 ${isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}`}>Save this to track your order</p>
              </div>
            )}

            <div className="space-y-2.5">
              {/* Primary CTA — Track Order */}
              <Link
                href={`/track-order?phone=${encodeURIComponent(cleanPhone)}`}
                onClick={handleDone}
                className="w-full h-12 bg-[#00C853] hover:bg-[#00B74A] active:bg-[#009E40] text-white font-bold tracking-tight rounded-xl shadow-[0_4px_16px_rgba(0,200,83,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <PackageSearch className="w-4 h-4" />
                Track My Order
              </Link>

              {/* Secondary — WhatsApp support */}
              <a
                href={`https://wa.me/233241234567?text=Hello%20GB%20Plug!%20I%20just%20paid%20for%20${encodeURIComponent(bundle.data)}%20to%20${cleanPhone}.%20Order%3A%20${orderId || 'N/A'}`}
                target="_blank"
                rel="noreferrer"
                className={`w-full h-11 rounded-xl text-xs font-semibold tracking-tight transition-all flex items-center justify-center gap-2 border ${
                  isDark ? 'border-[#18263E] text-[#8E9CAE] hover:text-white hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <WhatsAppIcon className="w-4 h-4 text-[#00C853] fill-current" />
                Need help with this order?
              </a>

              {/* Dismiss */}
              <button
                onClick={handleDone}
                className={`w-full text-xs font-medium py-2 transition-colors ${
                  isDark ? 'text-[#4A5A6A] hover:text-[#8E9CAE]' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Close
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
