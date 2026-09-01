'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function TermsPage() {
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
            <FileText className="w-3.5 h-3.5" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Terms of Service
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
              1. Overview &amp; Acceptance of Terms
            </h2>
            <p className="text-sm">
              Welcome to <strong>GB Plug</strong> (&quot;gbplug.com&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). These Terms of Service govern your access to and use of our automated telecommunications data bundle vending services across Ghana.
            </p>
            <p className="text-sm">
              By accessing our website, placing an order, or completing a transaction on GB Plug, you confirm that you have read, understood, and agreed to be bound by these Terms, as well as our <Link href="/privacy" className="text-[#00C853] underline font-semibold">Privacy Policy</Link> and <Link href="/refund-policy" className="text-[#00C853] underline font-semibold">Refund Policy</Link>.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              2. Description of Services
            </h2>
            <p className="text-sm">
              GB Plug operates an automated electronic top-up platform that enables consumers in Ghana to purchase internet data bundles for supported mobile telecommunications networks, including:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 pl-2">
              <li><strong>MTN Ghana</strong> (including MTN Flexa and standard retail packages)</li>
              <li><strong>Telecel Ghana</strong> (formerly Vodafone Ghana)</li>
              <li><strong>AirtelTigo Ghana (AT)</strong></li>
            </ul>
            <p className="text-sm">
              All data bundles sold through our platform are provided via licensed telecommunications suppliers and automated gateways. We facilitate the electronic purchase and dispatch of data directly to the recipient SIM card.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              3. Customer Responsibilities &amp; Recipient Numbers
            </h2>
            <p className="text-sm">
              You are solely responsible for ensuring the accuracy of the 10-digit Ghana mobile phone number entered during checkout. 
            </p>
            <div className={`p-4 rounded-xl border text-xs sm:text-sm ${
              isDark ? 'bg-[#070D18] border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <strong>Important Notice:</strong> Once a data bundle transaction has been successfully delivered by the telecommunications network to the recipient phone number specified by you, it is irreversible and non-transferable. GB Plug cannot retrieve or reassign data that was dispatched to an active, valid phone number mistakenly entered by the customer.
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              4. Pricing, Payments &amp; Currency
            </h2>
            <p className="text-sm">
              All prices displayed on GB Plug are quoted in <strong>Ghana Cedis (GH₵ / GHS)</strong> and are inclusive of any applicable digital service charges. We reserve the right to adjust bundle pricing at any time in response to carrier tariff adjustments or wholesale pricing changes.
            </p>
            <p className="text-sm">
              Payments on GB Plug are securely processed using authorized payment gateways (including Mobile Money providers MTN MoMo, Telecel Cash, AT Money, and compliant payment processors such as Paystack and Moolre). We do not store or process your private Mobile Money PINs or credit/debit card security codes.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              5. Delivery &amp; Fulfillment Timelines
            </h2>
            <p className="text-sm">
              Upon successful payment authorization, our automated dispatch engines initiate delivery immediately. Under normal operating conditions:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 pl-2">
              <li>MTN Flexa and standard bundles typically deliver within <strong>1 to 5 minutes</strong>.</li>
              <li>Telecel and AirtelTigo bundles deliver within <strong>1 to 10 minutes</strong>.</li>
            </ul>
            <p className="text-sm">
              Customers can monitor their live fulfillment progress at any time on our dedicated <Link href="/track-order" className="text-[#00C853] underline font-semibold">Track Order Page</Link>. In the event of carrier network delays or upstream API maintenance, dispatches may experience temporary processing queues.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              6. Refunds &amp; Cancellation
            </h2>
            <p className="text-sm">
              Please review our full <Link href="/refund-policy" className="text-[#00C853] underline font-semibold">Refund Policy</Link> for detailed conditions. In summary:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 pl-2">
              <li>If you pay for an order and the network fails to deliver due to carrier unavailability or invalid number rejection, you are eligible for an immediate retry or full refund.</li>
              <li>Successfully delivered data bundles cannot be canceled or refunded once accepted by the carrier.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              7. Limitation of Liability
            </h2>
            <p className="text-sm">
              GB Plug shall not be liable for any indirect, incidental, or consequential damages resulting from network downtimes, telecom operator policy changes, unexpected carrier outages, or customer entry errors. Our maximum aggregate liability for any claim arising from a transaction is limited to the exact amount paid for that transaction in Ghana Cedis.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              8. Governing Law &amp; Jurisdiction
            </h2>
            <p className="text-sm">
              These Terms of Service are governed by and construed in accordance with the laws of the <strong>Republic of Ghana</strong>. Any disputes arising in connection with these terms shall be subject to the exclusive jurisdiction of the courts of Ghana.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3 pt-4 border-t border-slate-700/20">
            <h2 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              9. Contact &amp; Support
            </h2>
            <p className="text-sm">
              If you have questions regarding these Terms of Service or need assistance with an order, please contact us:
            </p>
            <div className="text-sm space-y-1 font-medium">
              <p><strong>Business Name:</strong> GB Plug (gbplug.com)</p>
              <p><strong>Email:</strong> support@gbplug.com / uskdeen@gmail.com</p>
              <p><strong>Location:</strong> Accra, Greater Accra Region, Ghana</p>
              <p><strong>Customer Support:</strong> 24/7 WhatsApp &amp; Online Tracking</p>
            </div>
          </section>
        </div>
      </main>

      <Footer isDark={isDark} />
    </div>
  );
}
