import React from 'react';
import { Zap, ShieldCheck, Headphones } from 'lucide-react';

interface TrustBadgesProps {
  isDark: boolean;
  className?: string;
}

export function TrustBadges({ isDark, className = '' }: TrustBadgesProps) {
  const badges = [
    {
      icon: Zap,
      label: 'Fast Delivery',
    },
    {
      icon: ShieldCheck,
      label: 'Secure Payments',
    },
    {
      icon: Headphones,
      label: '24/7 Support',
    },
  ];

  return (
    <div className={`flex flex-wrap items-center justify-center gap-4 sm:gap-8 ${className}`}>
      {badges.map((badge, idx) => {
        const Icon = badge.icon;
        return (
          <div key={idx} className="flex items-center gap-2 select-none opacity-85 hover:opacity-100 transition-opacity">
            <div className="w-6 h-6 rounded-full bg-[#00C853]/10 border border-[#00C853]/30 flex items-center justify-center shrink-0">
              <Icon className="w-3.5 h-3.5 text-[#00C853] stroke-[2.2]" />
            </div>
            <span
              className={`text-[12.5px] sm:text-[13px] font-semibold tracking-tight whitespace-nowrap ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              {badge.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
