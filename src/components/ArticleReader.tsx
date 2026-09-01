'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Zap, Share2, Check } from 'lucide-react';
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

const CATEGORY_NAMES: Record<string, string> = {
  mtn: 'MTN Data',
  telecel: 'Telecel Ghana',
  airteltigo: 'AirtelTigo',
  tips: 'Data Saving Tips',
  tech: 'Tech & Internet',
};

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function ArticleReader({ post }: ArticleReaderProps) {
  const [isDark, setIsDark] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#070D18';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#F8FAFC';
    }
  }, [isDark]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      if (navigator.share) {
        navigator.share({
          title: post.title,
          text: post.summary,
          url: window.location.href,
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const categoryName = CATEGORY_NAMES[post.category] || 'Guides';

  return (
    <div className={`min-h-screen transition-colors duration-200 flex flex-col justify-between ${
      isDark ? 'bg-[#070D18] text-white' : 'bg-[#F8FAFC] text-slate-900'
    }`}>
      <Header isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />

      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-10 md:py-14 flex-1">
        {/* Back Link */}
        <div className="mb-6 md:mb-8">
          <Link
            href="/blog"
            className={`inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold tracking-tight transition-colors ${
              isDark ? 'text-[#8E9CAE] hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span>All Articles</span>
          </Link>
        </div>

        {/* Article Header */}
        <header className="mb-8 md:mb-12">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <span className="text-[11px] md:text-xs font-bold uppercase tracking-wider text-[#00C853] bg-[#00C853]/10 px-2.5 md:px-3 py-0.5 md:py-1 rounded-full border border-[#00C853]/20">
              {categoryName}
            </span>
          </div>

          <h1 className={`text-2xl sm:text-3.5xl md:text-4xl lg:text-[44px] font-extrabold tracking-tight leading-[1.2] md:leading-[1.18] mb-4 md:mb-6 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            {post.title}
          </h1>

          <p className={`text-sm sm:text-base md:text-lg leading-relaxed mb-6 md:mb-8 font-normal ${
            isDark ? 'text-[#94A3B8]' : 'text-slate-600'
          }`}>
            {post.summary}
          </p>

          {/* Clean Article Date & Share Bar */}
          <div className={`flex items-center justify-between py-3.5 md:py-4 border-y text-xs md:text-sm ${
            isDark ? 'border-[#18263E] text-[#8E9CAE]' : 'border-slate-200 text-slate-500'
          }`}>
            <span className="font-medium">
              Published on {formatDate(post.publishedDate)}
            </span>

            <button
              onClick={handleShare}
              className={`p-1.5 md:p-2 px-3 md:px-4 rounded-xl border text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#0B1322] border-[#18263E] text-slate-300 hover:text-white hover:bg-white/5'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#00C853]" /> : <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4" />}
              <span className="hidden sm:inline">{copied ? 'Link Copied' : 'Share'}</span>
            </button>
          </div>
        </header>

        {/* Article Body Content */}
        <article className={`article-content max-w-none text-[15px] sm:text-[16.5px] md:text-[18px] leading-[1.8] md:leading-[1.85] ${
          isDark ? 'text-slate-300' : 'text-slate-700'
        }`}>
          <style jsx global>{`
            .article-content h2 {
              font-size: 1.35rem;
              font-weight: 800;
              letter-spacing: -0.02em;
              margin-top: 2.25rem;
              margin-bottom: 0.85rem;
              color: ${isDark ? '#FFFFFF' : '#0F172A'};
            }
            @media (min-width: 768px) {
              .article-content h2 {
                font-size: 1.65rem;
                margin-top: 2.75rem;
                margin-bottom: 1rem;
              }
            }
            .article-content h3 {
              font-size: 1.15rem;
              font-weight: 700;
              letter-spacing: -0.01em;
              margin-top: 1.75rem;
              margin-bottom: 0.6rem;
              color: ${isDark ? '#F1F5F9' : '#1E293B'};
            }
            @media (min-width: 768px) {
              .article-content h3 {
                font-size: 1.35rem;
                margin-top: 2rem;
                margin-bottom: 0.75rem;
              }
            }
            .article-content p {
              margin-bottom: 1.4rem;
              line-height: 1.85;
            }
            .article-content ul, .article-content ol {
              margin-top: 0.85rem;
              margin-bottom: 1.4rem;
              padding-left: 1.5rem;
            }
            .article-content ul {
              list-style-type: disc;
            }
            .article-content ol {
              list-style-type: decimal;
            }
            .article-content li {
              margin-bottom: 0.6rem;
              line-height: 1.75;
            }
            .article-content strong {
              font-weight: 700;
              color: ${isDark ? '#FFFFFF' : '#0F172A'};
            }
            .article-content a {
              color: #00C853;
              font-weight: 600;
              text-decoration: underline;
              text-underline-offset: 3px;
            }
            .article-content code {
              background-color: ${isDark ? '#0F172A' : '#E2E8F0'};
              color: ${isDark ? '#00E676' : '#00873D'};
              padding: 0.2rem 0.5rem;
              border-radius: 0.4rem;
              font-size: 0.9em;
              font-family: ui-monospace, monospace;
            }
          `}</style>
          {post.content && (
            <DocumentRenderer
              document={post.content}
            />
          )}
        </article>

        {/* Inline Buy Data CTA Card */}
        <div className={`mt-12 md:mt-16 p-6 md:p-8 rounded-2xl md:rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-5 md:gap-8 ${
          isDark
            ? 'bg-gradient-to-r from-[#09121F] to-[#0D1B2A] border-[#15233A]'
            : 'bg-gradient-to-r from-slate-50 to-emerald-50/40 border-slate-200'
        }`}>
          <div>
            <div className="text-[11px] md:text-xs font-bold uppercase tracking-wider text-[#00C853]">Instant Delivery</div>
            <h3 className={`text-base sm:text-lg md:text-xl font-bold tracking-tight mt-0.5 mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Buy cheap data bundles for MTN, Telecel, and AT
            </h3>
            <p className={`text-xs md:text-sm ${isDark ? 'text-[#8E9CAE]' : 'text-slate-600'}`}>
              Top up instantly with Mobile Money on GB Plug.
            </p>
          </div>
          <Link
            href="/"
            className="h-10 md:h-12 px-5 md:px-7 bg-[#00C853] hover:bg-[#00B74A] active:bg-[#009E40] text-white font-bold text-xs md:text-sm tracking-tight rounded-xl shadow-md flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Zap className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span>Buy Data</span>
          </Link>
        </div>
      </main>

      <Footer isDark={isDark} />
    </div>
  );
}
