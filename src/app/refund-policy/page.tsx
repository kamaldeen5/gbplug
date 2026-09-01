'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function RefundPolicyPage() {
  const [isDark, setIsDark] = useState<boolean>(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#070D18';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#F8FAFC';
    }
  }, [isDark]);

  return (
    <div className={`min-h-screen transition-colors duration-200 flex flex-col justify-between ${
      isDark ? 'bg-[#070D18] text-white' : 'bg-[#F8FAFC] text-slate-900'
    }`}>
      <Header isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />

      <main className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12 flex-1">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className={`inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-tight transition-colors ${
              isDark ? 'text-[#8E9CAE] hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#00C853]/15 text-[#00C853] border border-[#00C853]/30 mb-3">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Customer Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Refund &amp; Cancellation Policy
          </h1>
          <p className={`text-xs sm:text-sm ${isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}`}>
            Last Updated: September 1, 2026 • Effective Immediately
          </p>
        </div>

        {/* Content Card */}
        <div className={`rounded-2xl p-6 sm:p-10 border leading-relaxed space-y-8 ${
          isDark ? 'bg-[#09121F] border-[#15233A] text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
        }`}>
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              1. Overview
            </h2>
            <p className="text-sm">
              At <strong>GB Plug</strong> (&quot;gbplug.com&quot;), we are committed to providing fast, reliable, and transparent automated data bundle delivery. Because data bundles are digital telecommunications products that deliver and activate electronically on your mobile number, our refund and cancellation policy is structured around carrier verification and fulfillment status.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              2. Eligibility for a Refund
            </h2>
            <p className="text-sm">
              You are entitled to a full refund or an immediate automated re-dispatch under the following conditions:
            </p>
            <ul className="list-disc list-inside text-sm space-y-2 pl-2">
              <li>
                <strong>Failed Delivery / Carrier Error:</strong> Your payment was successfully deducted via Mobile Money or card, but the telecommunications network (MTN, Telecel, or AirtelTigo) rejected or failed to deliver the data bundle within 2 hours.
              </li>
              <li>
                <strong>Invalid or Unassigned Phone Number:</strong> If a non-existent or unassigned phone number was entered and the telecom supplier rejected the transaction without crediting any SIM.
              </li>
              <li>
                <strong>Duplicate Charges:</strong> In the rare event that your account is charged more than once for the same single order due to a network timeout, the duplicate charge will be refunded in full immediately.
              </li>
              <li>
                <strong>Prolonged Network Outage:</strong> If a telecom carrier experiences a prolonged service outage and cannot fulfill your queued bundle within 24 hours.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              3. Non-Refundable Situations
            </h2>
            <p className="text-sm">
              Refunds cannot be issued under the following circumstances:
            </p>
            <div className={`p-4 rounded-xl border space-y-2 text-xs sm:text-sm ${
              isDark ? 'bg-[#070D18] border-red-500/30 text-red-300' : 'bg-red-50 border-red-200 text-red-900'
            }`}>
              <div className="flex items-start gap-2 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Successful Delivery to Wrong Number Provided by Customer</span>
              </div>
              <p>
                Telecommunications data is credited immediately upon dispatch. If you accidentally input an active, valid phone number belonging to another person and the carrier confirms delivery, the data cannot be revoked or refunded by GB Plug. Please double-check your recipient phone number before making payment.
              </p>
            </div>
            <ul className="list-disc list-inside text-sm space-y-1.5 pl-2 pt-2">
              <li>Orders that have already been confirmed as <strong>&quot;Delivered&quot;</strong> by the telecommunications network carrier.</li>
              <li>Customer change of mind after the data bundle has already been dispatched and received on the SIM card.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              4. Refund Processing Timeframe
            </h2>
            <p className="text-sm">
              When a refund is approved:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1.5 pl-2">
              <li><strong>Mobile Money (MTN MoMo, Telecel Cash, AT Money):</strong> Refunds are processed back to the original MoMo wallet within <strong>24 to 48 business hours</strong>.</li>
              <li><strong>Bank Cards (Visa / Mastercard):</strong> Refunds processed through Paystack will reflect in your account within <strong>3 to 5 business days</strong> depending on your issuing bank.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              5. How to Request a Refund or Report an Issue
            </h2>
            <p className="text-sm">
              If your data has not arrived or your order appears delayed:
            </p>
            <ol className="list-decimal list-inside text-sm space-y-2 pl-2">
              <li>First, check your live status on our <Link href="/track-order" className="text-[#00C853] underline font-semibold">Track Order Page</Link> using your 10-digit phone number or Order ID (e.g. <code>FLX-XXXXX</code>).</li>
              <li>If the order failed or was not fulfilled, contact our 24/7 Support with:
                <ul className="list-disc list-inside text-xs sm:text-sm pl-4 pt-1 space-y-1 text-slate-400 dark:text-slate-300">
                  <li>Your recipient phone number</li>
                  <li>Order Reference or MoMo transaction ID</li>
                  <li>Approximate time of purchase</li>
                </ul>
              </li>
            </ol>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 pt-4 border-t border-slate-700/20">
            <h2 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              6. Support Channels
            </h2>
            <p className="text-sm">
              Our support team is available 24/7 to resolve any delivery disputes or refund requests:
            </p>
            <div className="text-sm space-y-1 font-medium">
              <p><strong>Business Name:</strong> GB Plug (gbplug.com)</p>
              <p><strong>Support Email:</strong> support@gbplug.com / uskdeen@gmail.com</p>
              <p><strong>WhatsApp Support:</strong> Available 24/7 on gbplug.com</p>
              <p><strong>Physical Address:</strong> Accra, Greater Accra Region, Ghana</p>
            </div>
          </section>
        </div>
      </main>

      <Footer isDark={isDark} />
    </div>
  );
}
