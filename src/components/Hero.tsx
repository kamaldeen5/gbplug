import React from 'react';

interface HeroProps {
  isDark: boolean;
}

export function Hero({ isDark }: HeroProps) {
  return (
    <>
      {/* Mobile: Big & Bold Double-Line Headline */}
      <div className="block md:hidden text-center pt-0 pb-1 mb-3">
        <h1 className="text-[24px] xs:text-[27px] sm:text-[32px] font-black tracking-tight leading-[1.12]">
          <span className={isDark ? 'text-white' : 'text-[#0F172A]'}>Buy Data Online.</span>
          <br />
          <span className="text-[#00C853] drop-shadow-[0_0_16px_rgba(0,200,83,0.35)]">Stay Connected.</span>
        </h1>
      </div>

      {/* Desktop: Full Marketing Hero */}
      <div className="hidden md:block pt-4 pb-2 px-0 text-left">
        <h1 className="text-[44px] lg:text-[52px] xl:text-[56px] font-black leading-[1.06] tracking-[-0.035em]">
          <span className={isDark ? 'text-white' : 'text-[#0F172A]'}>Buy Data</span>
          <br />
          <span className="text-[#00C853]">Online.</span>
          <br />
          <span className={isDark ? 'text-white' : 'text-[#0F172A]'}>Stay Connected.</span>
        </h1>
        <p
          className={`mt-4 text-[15px] font-normal leading-relaxed max-w-md ${
            isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
          }`}
        >
          Affordable data bundles for all networks in Ghana.
        </p>
      </div>
    </>
  );
}
