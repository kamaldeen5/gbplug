import React from 'react';

interface HeroProps {
  isDark: boolean;
}

export function Hero({ isDark }: HeroProps) {
  return (
    <>
      {/* Mobile: Prominent Left-Aligned Headline (Strictly Preserved - Untouched) */}
      <div className="block md:hidden text-left pt-0 pb-1 mb-3">
        <h1 className="text-[24px] xs:text-[26px] sm:text-[30px] font-black tracking-tight leading-[1.15]">
          <span className={isDark ? 'text-white' : 'text-[#0F172A]'}>Fast, affordable data bundles for </span>
          <span className="text-[#00C853] drop-shadow-[0_0_16px_rgba(0,200,83,0.35)]">all networks</span>
        </h1>
      </div>

      {/* Desktop: Full Marketing Hero */}
      <div className="hidden md:block pt-6 pb-4 px-0 text-left">
        <h1 className="text-[48px] lg:text-[58px] xl:text-[64px] font-black leading-[1.04] tracking-[-0.035em]">
          <span className={isDark ? 'text-white' : 'text-[#0F172A]'}>Buy Data</span>
          <br />
          <span className="text-[#00C853] drop-shadow-[0_0_24px_rgba(0,200,83,0.25)]">Online.</span>
          <br />
          <span className={isDark ? 'text-white' : 'text-[#0F172A]'}>Stay Connected.</span>
        </h1>
        <p
          className={`mt-5 text-[16.5px] lg:text-[18px] font-normal leading-relaxed max-w-lg ${
            isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
          }`}
        >
          Affordable data bundles for all networks in Ghana.
        </p>
      </div>
    </>
  );
}
