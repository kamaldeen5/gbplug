'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Zap, ShieldCheck } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { DocumentRenderer } from '@keystatic/core/renderer';

interface ArticleReaderProps {
  post: {
    slug: string;
    title: string;
    publishedDate: string;
    author: string;
    category: string;
    summary: string;
    coverImage: string | null;
    content: any;
  };
}

export function ArticleReader({ post }: ArticleReaderProps) {
  const [isDark, setIsDark] = useState(true);

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
        <div className="mb-8">
          <Link
            href="/blog"
            className={`inline-flex items-center gap-2 text-xs sm:text-sm font-semibold transition-colors ${
              isDark ? 'text-[#8E9CAE] hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Guides</span>
          </Link>
        </div>

        {/* Article Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 text-xs text-[#00C853] font-bold uppercase tracking-wider mb-3">
            <span>Ghana Data Guide</span>
            <span>•</span>
            <span className={`font-medium normal-case flex items-center gap-1 ${isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}`}>
              <Calendar className="w-3.5 h-3.5" />
              {post.publishedDate}
            </span>
          </div>

          <h1 className={`text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-4 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            {post.title}
          </h1>

          <p className={`text-sm sm:text-base leading-relaxed mb-6 font-normal ${
            isDark ? 'text-[#94A3B8]' : 'text-slate-600'
          }`}>
            {post.summary}
          </p>

          <div className={`flex items-center justify-between py-3 border-y text-xs ${
            isDark ? 'border-[#18263E] text-[#8E9CAE]' : 'border-slate-200 text-slate-500'
          }`}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#00C853]/20 text-[#00C853] font-bold flex items-center justify-center text-[10px]">
                GB
              </div>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{post.author}</span>
            </div>
            <span className="text-[11px] text-slate-400">Verified Guide</span>
          </div>
        </header>

        {/* Article Body Content */}
        <article className={`prose max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-p:leading-relaxed prose-p:text-sm sm:prose-p:text-base prose-li:text-sm sm:prose-li:text-base prose-strong:font-bold prose-a:text-[#00C853] prose-a:underline prose-code:text-[#00C853] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded ${
          isDark
            ? 'prose-invert prose-headings:text-white prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-white prose-code:bg-[#09121F]'
            : 'prose-headings:text-slate-900 prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-slate-900 prose-code:bg-slate-100'
        }`}>
          {post.content && (
            <DocumentRenderer
              document={post.content}
            />
          )}
        </article>

        {/* Inline Conversion / Buy Data CTA */}
        <div className={`mt-12 p-6 sm:p-8 rounded-2xl border shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 ${
          isDark
            ? 'bg-gradient-to-br from-[#09121F] to-[#0D1E36] border-[#18263E]'
            : 'bg-gradient-to-br from-emerald-50/50 to-white border-slate-200'
        }`}>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00C853]">
              <ShieldCheck className="w-4 h-4" />
              <span>Instant Automated Fulfillment</span>
            </div>
            <h3 className={`text-lg sm:text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Get cheap non-expiry data sent straight to your SIM
            </h3>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-[#8E9CAE]' : 'text-slate-600'}`}>
              Buy MTN Flexa, Telecel, or AT bundles in Ghana with instant MoMo delivery.
            </p>
          </div>
          <Link
            href="/"
            className="h-12 px-6 bg-[#00C853] hover:bg-[#00B74A] active:bg-[#009E40] text-white font-bold text-sm rounded-xl shadow-lg flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Zap className="w-4 h-4" />
            <span>Top Up Data Now</span>
          </Link>
        </div>
      </main>

      <Footer isDark={isDark} />
    </div>
  );
}
