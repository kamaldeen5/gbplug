'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Zap, ChevronRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

interface PostCard {
  slug: string;
  title: string;
  publishedDate: string;
  author: string;
  category: string;
  summary: string;
  coverImage: string | null;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  mtn: { label: 'MTN Data', color: 'bg-[#FFCC00]/15 text-[#FFCC00] border-[#FFCC00]/30' },
  telecel: { label: 'Telecel Ghana', color: 'bg-[#E60000]/15 text-[#FF4D4D] border-[#E60000]/30' },
  airteltigo: { label: 'AirtelTigo', color: 'bg-[#003399]/15 text-[#60A5FA] border-[#003399]/30' },
  tips: { label: 'Data Saving Tips', color: 'bg-[#00C853]/15 text-[#00C853] border-[#00C853]/30' },
  tech: { label: 'Tech & Internet', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
};

const INITIAL_POSTS: PostCard[] = [
  {
    slug: 'how-to-buy-cheap-mtn-data-ghana',
    title: 'How to Buy Cheap MTN Data Bundles in Ghana (Without Paying High Retail Rates)',
    publishedDate: '2026-09-01',
    author: 'Kamal Deen',
    category: 'mtn',
    summary: 'Stop spending huge amounts on daily MTN bundles. Here is the practical guide to getting affordable non-expiry data and Flexa bundles sent straight to your SIM.',
    coverImage: null,
  },
  {
    slug: 'how-to-stop-data-from-finishing-fast-ghana',
    title: 'Why Your Phone Data Finishes So Fast in Ghana (And 5 Easy Settings to Fix It)',
    publishedDate: '2026-09-01',
    author: 'Kamal Deen',
    category: 'tips',
    summary: 'Wondering why your 5GB bundle finished in just 2 days? Here are 5 practical smartphone settings you can change right now to save your mobile data on MTN and Telecel.',
    coverImage: null,
  },
  {
    slug: 'telecel-ghana-non-expiry-data-bundles-guide',
    title: 'Telecel Ghana Non-Expiry Data Bundles: Full Price List and How to Top Up',
    publishedDate: '2026-09-01',
    author: 'Kamal Deen',
    category: 'telecel',
    summary: 'Everything you need to know about Telecel Ghana data bundles. Check the full pricing breakdown, balance check shortcodes, and how to get non-expiry gigabytes delivered instantly.',
    coverImage: null,
  },
];

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function BlogIndexPage() {
  const [isDark, setIsDark] = useState<boolean>(true);
  const [posts, setPosts] = useState<PostCard[]>(INITIAL_POSTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#070D18';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#F8FAFC';
    }
  }, [isDark]);

  const categories = [
    { id: 'all', label: 'All Articles' },
    { id: 'mtn', label: 'MTN Data' },
    { id: 'telecel', label: 'Telecel Ghana' },
    { id: 'tips', label: 'Data Saving Tips' },
  ];

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`min-h-screen transition-colors duration-200 flex flex-col justify-between ${
      isDark ? 'bg-[#070D18] text-white' : 'bg-[#F8FAFC] text-slate-900'
    }`}>
      <Header isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />

      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className={`inline-flex items-center gap-1.5 text-xs font-semibold tracking-tight transition-colors ${
              isDark ? 'text-[#8E9CAE] hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Articles &amp; <span className="text-[#00C853]">Guides.</span>
          </h1>
          <p className={`text-xs sm:text-sm max-w-xl ${isDark ? 'text-[#94A3B8]' : 'text-slate-600'}`}>
            Practical guides on mobile internet, bundle prices, shortcodes, and saving data in Ghana.
          </p>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center mb-7">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-tight transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#00C853] text-white shadow-sm'
                    : isDark
                    ? 'bg-[#0B1322] border border-[#18263E] text-slate-300 hover:text-white hover:bg-white/5'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className={`w-full h-9 px-3 pl-8 rounded-xl border text-xs font-medium outline-none transition-all ${
                isDark
                  ? 'bg-[#0B1322] border-[#18263E] text-white placeholder-slate-500 focus:border-[#00C853]'
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#00C853]'
              }`}
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Blog Post Grid */}
        {filteredPosts.length === 0 ? (
          <div className={`p-10 text-center rounded-2xl border ${isDark ? 'bg-[#09121F] border-[#15233A]' : 'bg-white border-slate-200'}`}>
            <p className={`text-xs ${isDark ? 'text-[#8E9CAE]' : 'text-slate-500'}`}>
              No articles found matching your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPosts.map((post) => {
              const catMeta = CATEGORY_LABELS[post.category] || CATEGORY_LABELS.tips;
              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className={`group rounded-2xl p-5 border transition-all flex flex-col justify-between hover:scale-[1.01] ${
                    isDark
                      ? 'bg-[#09121F] border-[#15233A] hover:border-[#00C853]/40 shadow-lg'
                      : 'bg-white border-slate-200 hover:border-[#00C853]/40 shadow-xs'
                  }`}
                >
                  <div>
                    {/* Category & Date */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${catMeta.color}`}>
                        {catMeta.label}
                      </span>
                      <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {formatDate(post.publishedDate)}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className={`text-sm sm:text-base font-bold tracking-tight mb-2 group-hover:text-[#00C853] transition-colors line-clamp-2 ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {post.title}
                    </h2>

                    {/* Summary Excerpt */}
                    <p className={`text-xs leading-relaxed line-clamp-3 mb-4 ${
                      isDark ? 'text-[#8E9CAE]' : 'text-slate-600'
                    }`}>
                      {post.summary}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className={`pt-3 border-t flex items-center justify-between text-xs font-semibold ${
                    isDark ? 'border-[#15233A] text-[#00C853]' : 'border-slate-100 text-[#00C853]'
                  }`}>
                    <span>Read Article</span>
                    <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Footer isDark={isDark} />
    </div>
  );
}
