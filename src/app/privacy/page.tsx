'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function PrivacyPage() {
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
            <Lock className="w-3.5 h-3.5" />
            <span>Data Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Privacy Policy
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
              1. Introduction
            </h2>
            <p className="text-sm">
              At <strong>GB Plug</strong> (&quot;gbplug.com&quot;), we respect and protect the privacy of our customers. This Privacy Policy explains what information we collect when you visit our website or purchase telecommunications data bundles, how we use that information, and the strict security measures we maintain to keep your data safe.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              2. Information We Collect
            </h2>
            <p className="text-sm">
              To fulfill your data orders and provide live order tracking, we collect minimal and necessary information:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1.5 pl-2">
              <li><strong>Recipient Mobile Phone Number:</strong> The 10-digit Ghana phone number that receives the purchased data bundle.</li>
              <li><strong>Transaction &amp; Order Details:</strong> Selected network operator, data bundle package, amount paid in Ghana Cedis, and unique transaction reference codes.</li>
              <li><strong>Technical Data:</strong> Browser type, device details, and IP address collected automatically for cybersecurity and fraud prevention.</li>
            </ul>
            <div className={`p-4 rounded-xl border text-xs sm:text-sm ${
              isDark ? 'bg-[#070D18] border-[#18263E] text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <strong>We Do NOT Store Financial Credentials:</strong> GB Plug does not capture, store, or have access to your Mobile Money PINs, banking passwords, or card security (CVV) numbers. All payment authorizations occur securely on encrypted, PCI-DSS compliant payment gateways (Paystack, Moolre, and authorized Ghana telecom networks).
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              3. How We Use Your Information
            </h2>
            <p className="text-sm">
              The information we collect is used strictly for the following operational purposes:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1.5 pl-2">
              <li><strong>Automated Data Delivery:</strong> Transmitting your order details to the telecommunications supplier (MTN, Telecel, AirtelTigo) to dispatch data to your SIM card.</li>
              <li><strong>Order Verification &amp; Tracking:</strong> Allowing you to track your live delivery status on our <Link href="/track-order" className="text-[#00C853] underline font-semibold">Track Order</Link> service.</li>
              <li><strong>Customer Support:</strong> Assisting you with inquiries, transaction verifications, or refund requests.</li>
              <li><strong>Fraud Detection:</strong> Protecting our platform and users from unauthorized transactions or abusive activities.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              4. Third-Party Sharing &amp; Disclosures
            </h2>
            <p className="text-sm">
              We do <strong>not sell, rent, or trade</strong> your personal information to third parties or marketing agencies under any circumstances. We share data only with essential operational service providers:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1.5 pl-2">
              <li><strong>Telecommunications Operators &amp; Gateways:</strong> MTN Ghana, Telecel Ghana, AirtelTigo Ghana, and licensed data API suppliers to deliver bundles to recipient SIMs.</li>
              <li><strong>Payment Processors:</strong> Licensed payment institutions (such as Paystack and Moolre) to authenticate and verify payments.</li>
              <li><strong>Legal Compliance:</strong> When required by applicable laws, regulations, or law enforcement authorities in the Republic of Ghana.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              5. Local Storage &amp; Cookies
            </h2>
            <p className="text-sm">
              GB Plug utilizes browser <code>localStorage</code> to conveniently remember your recent Order Reference on your specific device. This ensures you can seamlessly check your order status on <Link href="/track-order" className="text-[#00C853] underline font-semibold">gbplug.com/track-order</Link> without retyping long reference numbers. You can clear this storage at any time via your browser settings.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              6. Data Security
            </h2>
            <p className="text-sm">
              We implement industry-standard security protocols, including 256-bit TLS/SSL encryption across our entire website and API endpoints. All communication between your device, our servers, and our payment gateways is encrypted in transit.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              7. Your Rights
            </h2>
            <p className="text-sm">
              You have the right to request information about the data we hold regarding your transactions, request corrections, or request deletion of customer support records, subject to statutory record-keeping requirements under Ghanaian commercial and tax law.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3 pt-4 border-t border-slate-700/20">
            <h2 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              8. Contact Us Regarding Privacy
            </h2>
            <p className="text-sm">
              If you have any questions, concerns, or requests regarding this Privacy Policy, please contact our team:
            </p>
            <div className="text-sm space-y-1 font-medium">
              <p><strong>Business Name:</strong> GB Plug (gbplug.com)</p>
              <p><strong>Email:</strong> support@gbplug.com / uskdeen@gmail.com</p>
              <p><strong>Location:</strong> Accra, Greater Accra Region, Ghana</p>
              <p><strong>WhatsApp Support:</strong> Available 24/7 on website</p>
            </div>
          </section>
        </div>
      </main>

      <Footer isDark={isDark} />
    </div>
  );
}
