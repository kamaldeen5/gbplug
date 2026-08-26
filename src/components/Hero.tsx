import React from 'react';

interface HeroProps {
  isDark: boolean;
}

export function Hero({ isDark }: HeroProps) {
  return (
    <div className="pt-2 sm:pt-4 pb-2 px-1 sm:px-0">
      <h1 className="text-[36px] sm:text-[44px] lg:text-[52px] xl:text-[56px] font-extrabold sm:font-black leading-[1.06] tracking-[-0.035em]">
        <span className={isDark ? 'text-white' : 'text-[#0F172A]'}>Buy Data</span>
        <br />
        <span className="text-[#00C853]">Online.</span>
        <br />
        <span className={isDark ? 'text-white' : 'text-[#0F172A]'}>Stay Connected.</span>
      </h1>
      <p
        className={`mt-3 sm:mt-4 text-[13.5px] sm:text-[15px] font-normal leading-relaxed max-w-md ${
          isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
        }`}
      >
        Affordable data bundles for all networks in Ghana.
      </p>
    </div>
  );
}
