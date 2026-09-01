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

      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/blog"
            className={`inline-flex items-center gap-1.5 text-xs font-semibold tracking-tight transition-colors ${
              isDark ? 'text-[#8E9CAE] hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Articles</span>
          </Link>
        </div>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#00C853] bg-[#00C853]/10 px-2.5 py-0.5 rounded-full border border-[#00C853]/20">
              {categoryName}
            </span>
          </div>

          <h1 className={`text-2xl sm:text-3.5xl font-extrabold tracking-tight leading-[1.25] mb-4 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            {post.title}
          </h1>

          <p className={`text-sm sm:text-base leading-relaxed mb-6 font-normal ${
            isDark ? 'text-[#94A3B8]' : 'text-slate-600'
          }`}>
            {post.summary}
          </p>

          {/* Clean Article Date & Share Bar (No author box/badge) */}
          <div className={`flex items-center justify-between py-3 border-y text-xs ${
            isDark ? 'border-[#18263E] text-[#8E9CAE]' : 'border-slate-200 text-slate-500'
          }`}>
            <span className="font-medium">
              Published on {formatDate(post.publishedDate)}
            </span>

            <button
              onClick={handleShare}
              className={`p-1.5 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#0B1322] border-[#18263E] text-slate-300 hover:text-white hover:bg-white/5'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#00C853]" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Link Copied' : 'Share'}</span>
            </button>
          </div>
        </header>

        {/* Article Body Content */}
        <article className={`article-content max-w-none text-[15px] sm:text-[16.5px] leading-[1.8] ${
          isDark ? 'text-slate-300' : 'text-slate-700'
        }`}>
          <style jsx global>{`
            .article-content h2 {
              font-size: 1.35rem;
              font-weight: 800;
              letter-spacing: -0.02em;
              margin-top: 2rem;
              margin-bottom: 0.75rem;
              color: ${isDark ? '#FFFFFF' : '#0F172A'};
            }
            .article-content h3 {
              font-size: 1.15rem;
              font-weight: 700;
              letter-spacing: -0.01em;
              margin-top: 1.5rem;
              margin-bottom: 0.5rem;
              color: ${isDark ? '#F1F5F9' : '#1E293B'};
            }
            .article-content p {
              margin-bottom: 1.25rem;
              line-height: 1.8;
            }
            .article-content ul, .article-content ol {
              margin-top: 0.75rem;
              margin-bottom: 1.25rem;
              padding-left: 1.25rem;
            }
            .article-content ul {
              list-style-type: disc;
            }
            .article-content ol {
              list-style-type: decimal;
            }
            .article-content li {
              margin-bottom: 0.5rem;
              line-height: 1.7;
            }
            .article-content strong {
              font-weight: 700;
              color: ${isDark ? '#FFFFFF' : '#0F172A'};
            }
            .article-content a {
              color: #00C853;
              font-weight: 600;
              text-decoration: underline;
              text-underline-offset: 2px;
            }
            .article-content code {
              background-color: ${isDark ? '#0F172A' : '#E2E8F0'};
              color: ${isDark ? '#00E676' : '#00873D'};
              padding: 0.15rem 0.4rem;
              border-radius: 0.375rem;
              font-size: 0.875em;
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
        <div className={`mt-10 p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-5 ${
          isDark
            ? 'bg-gradient-to-r from-[#09121F] to-[#0D1B2A] border-[#15233A]'
            : 'bg-gradient-to-r from-slate-50 to-emerald-50/40 border-slate-200'
        }`}>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#00C853]">Instant Delivery</div>
            <h3 className={`text-base sm:text-lg font-bold tracking-tight mt-0.5 mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Buy cheap data bundles for MTN, Telecel, and AT
            </h3>
            <p className={`text-xs ${isDark ? 'text-[#8E9CAE]' : 'text-slate-600'}`}>
              Top up instantly with Mobile Money on GB Plug.
            </p>
          </div>
          <Link
            href="/"
            className="h-10 px-5 bg-[#00C853] hover:bg-[#00B74A] active:bg-[#009E40] text-white font-bold text-xs tracking-tight rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Buy Data</span>
          </Link>
        </div>
      </main>

      <Footer isDark={isDark} />
    </div>
  );
}
