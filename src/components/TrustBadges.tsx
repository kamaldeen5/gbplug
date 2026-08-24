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
      label: 'Instant\nDelivery',
    },
    {
      icon: ShieldCheck,
      label: 'Secure\nPayments',
    },
    {
      icon: Headphones,
      label: '24/7\nSupport',
    },
  ];

  return (
    <div className={`grid grid-cols-3 gap-2 sm:gap-6 ${className}`}>
      {badges.map((badge, idx) => {
        const Icon = badge.icon;
        return (
          <div key={idx} className="flex flex-col items-center sm:items-start text-center sm:text-left group select-none">
            {/* Crisp green outline badge */}
            <div className="w-11 h-11 rounded-full border-[1.5px] border-[#00C853] bg-[#00C853]/[0.05] flex items-center justify-center mb-2.5 transition-all shadow-[0_0_12px_rgba(0,200,83,0.12)] group-hover:bg-[#00C853]/[0.09] active:scale-95">
              <Icon className="w-5 h-5 text-[#00C853] stroke-[2.2]" />
            </div>
            <span
              className={`text-[12px] font-semibold leading-snug whitespace-pre-line tracking-tight ${
                isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
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
