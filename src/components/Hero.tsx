import React from 'react';

interface HeroProps {
  isDark: boolean;
}

export function Hero({ isDark }: HeroProps) {
  return (
    <div className="pt-0 sm:pt-4 pb-1 sm:pb-2 px-1 sm:px-0 text-center md:text-left">
      <h1 className="text-[26px] xs:text-[28px] sm:text-[44px] lg:text-[52px] xl:text-[56px] font-extrabold sm:font-black leading-[1.1] sm:leading-[1.06] tracking-[-0.03em] sm:tracking-[-0.035em]">
        <span className={isDark ? 'text-white' : 'text-[#0F172A]'}>Buy Data </span>
        <span className="text-[#00C853]">Online.</span>{' '}
        <span className={isDark ? 'text-white' : 'text-[#0F172A]'}><br className="hidden sm:inline" />Stay Connected.</span>
      </h1>
      <p
        className={`mt-1.5 sm:mt-4 text-xs sm:text-[15px] font-normal leading-normal sm:leading-relaxed max-w-md mx-auto md:mx-0 ${
          isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
        }`}
      >
        Affordable data bundles for all networks in Ghana.
      </p>
    </div>
  );
}
