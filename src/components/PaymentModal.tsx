'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, CheckCircle2, ShieldCheck, ArrowRight, Loader2, AlertCircle, PackageSearch } from 'lucide-react';
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
  const [status, setStatus] = useState<'review' | 'processing' | 'success' | 'error'>('review');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<string>('Pending');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Clean recipient number e.g. "024 123 4567" -> "0241234567"
  const cleanPhone = phoneNumber.replace(/\D/g, '');

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const startStatusPolling = (id: string) => {
    let attempts = 0;
    const maxAttempts = 30; // 30 * 2.5s = ~75 seconds

    pollingRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/order-status?order_id=${encodeURIComponent(id)}`);
        const data = await res.json();

        if (res.ok && data.status) {
          const currentStatus = data.status.toLowerCase();
          setDeliveryStatus(data.status);

          if (currentStatus === 'delivered' || currentStatus === 'completed' || data.terminal) {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setStatus('success');
          } else if (currentStatus === 'failed' || currentStatus === 'refunded') {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setErrorMessage(`Order ${id} could not be dispatched (${data.status}).`);
            setStatus('error');
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }

      if (attempts >= maxAttempts) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        // Treat as placed successfully, user can track status
        setStatus('success');
      }
    }, 2500);
  };

  const handlePay = async () => {
    setStatus('processing');
    setErrorMessage(null);

    try {
      const res = await fetch('/api/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: bundle.productId,
          recipient: cleanPhone,
          idempotencyKey: `gbplug-${cleanPhone}-${bundle.productId}-${Date.now()}`,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to place data order');
      }

      const newOrderId = data.order?.order_id || `API-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      setOrderId(newOrderId);
      setDeliveryStatus(data.order?.status || 'Pending');

      // Save order in local history for Track Order convenience
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
          status: data.order?.status || 'Pending',
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem('gbplug_orders', JSON.stringify(history.slice(0, 20)));
      } catch (e) {
        console.error('History save error:', e);
      }

      // Start live polling to check delivery
      startStatusPolling(newOrderId);
    } catch (err: any) {
      console.error('Payment error:', err);
      setErrorMessage(err.message || 'Payment processing failed. Please try again.');
      setStatus('error');
    }
  };

  const handleDone = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setStatus('review');
    setOrderId(null);
    setErrorMessage(null);
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
                <span className={isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}>Recipient</span>
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
              <span>Instant automated data delivery to {cleanPhone}</span>
            </div>

            <button
              type="button"
              onClick={handlePay}
              className="w-full h-12 bg-[#00C853] hover:bg-[#00B74A] active:bg-[#009E40] text-white font-bold tracking-tight rounded-xl shadow-[0_4px_16px_rgba(0,200,83,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
            >
              <span>Confirm & Buy Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {status === 'processing' && (
          <div className="py-8 text-center">
            <Loader2 className="w-12 h-12 text-[#00C853] animate-spin mx-auto mb-4" />
            <h4 className="font-bold text-base tracking-tight mb-1">
              {orderId ? 'Dispatching Data Bundle...' : 'Authorizing Purchase...'}
            </h4>
            <p className={`text-xs ${isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}`}>
              {orderId
                ? `Order ID: ${orderId} (${deliveryStatus}). Crediting ${bundle.data} to ${phoneNumber}...`
                : `Connecting to ${network.name} network gateway...`}
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-6 text-center">
            <div className="w-14 h-14 rounded-full bg-[#00C853]/15 text-[#00C853] flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(0,200,83,0.25)]">
              <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
            </div>
            <h4 className="font-extrabold text-lg tracking-tight mb-1">Order Dispatched!</h4>
            <p className={`text-xs mb-3 ${isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}`}>
              {bundle.data} sent to <span className={`font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{phoneNumber}</span>.
            </p>

            {orderId && (
              <div
                className={`p-2.5 rounded-xl border text-xs font-mono mb-5 ${
                  isDark ? 'bg-[#070D18] border-[#18263E] text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                Order Ref: <span className="font-bold text-[#00C853]">{orderId}</span>
              </div>
            )}

            <div className="space-y-2">
              {orderId && (
                <Link
                  href={`/track-order?order_id=${encodeURIComponent(orderId)}`}
                  onClick={handleDone}
                  className={`w-full h-11 rounded-xl text-xs font-bold tracking-tight transition-all flex items-center justify-center gap-2 border ${
                    isDark
                      ? 'border-[#18263E] bg-[#070D18] hover:bg-white/5 text-white'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <PackageSearch className="w-4 h-4 text-[#00C853]" />
                  <span>Track Live Delivery Status</span>
                </Link>
              )}

              <button
                type="button"
                onClick={handleDone}
                className="w-full h-11 bg-[#00C853] hover:bg-[#00B74A] text-white font-bold text-xs tracking-tight rounded-xl shadow-[0_4px_14px_rgba(0,200,83,0.3)] transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="py-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/15 text-red-500 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(239,68,68,0.25)]">
              <AlertCircle className="w-8 h-8 stroke-[2.2]" />
            </div>
            <h4 className="font-extrabold text-lg tracking-tight mb-1 text-red-400">Order Failed</h4>
            <p className={`text-xs mb-5 ${isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}`}>
              {errorMessage || 'Unable to complete your transaction. Please try again.'}
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={handlePay}
                className="w-full h-11 bg-[#00C853] hover:bg-[#00B74A] text-white font-bold text-xs tracking-tight rounded-xl transition-all cursor-pointer"
              >
                Retry Purchase
              </button>
              <button
                type="button"
                onClick={handleDone}
                className={`w-full h-11 rounded-xl text-xs font-semibold tracking-tight transition-all border ${
                  isDark
                    ? 'border-[#18263E] text-[#8E9CAE] hover:text-white hover:bg-white/5'
                    : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
