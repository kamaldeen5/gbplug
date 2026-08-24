import React from 'react';

export function GBPlugLogo({ className = '', dark = true }: { className?: string; dark?: boolean }) {
  return (
    <div className={`flex items-center select-none ${className}`}>
      {/* Exact User Uploaded Logo Asset */}
      <img
        src={dark ? '/logo-dark.png' : '/logo-light.png'}
        alt="GB Plug Logo"
        className="h-7 sm:h-8 w-auto object-contain transition-opacity duration-200"
      />
    </div>
  );
}

export function MTNLogo({ className = 'w-14 h-7' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center bg-[#FFCC00] rounded-full px-3 py-1 ${className}`}>
      <span className="text-black font-black text-[13px] tracking-wide font-sans">MTN</span>
    </div>
  );
}

export function TelecelLogo({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center bg-[#E60000] rounded-full ${className}`}>
      <span className="text-white font-extrabold text-[15px] font-sans tracking-tighter leading-none select-none pl-0.5">
        t<span className="text-[#FFCC00] text-[16px] leading-none">.</span>
      </span>
    </div>
  );
}

// Alias for compatibility
export const VodafoneLogo = TelecelLogo;

export function AirtelTigoLogo({ className = 'w-auto h-7' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-1 px-1 ${className}`}>
      <div className="w-2.5 h-2.5 rounded-full bg-[#E02020] shrink-0" />
      <span className="font-bold text-[13px] tracking-tight leading-none">
        <span className="text-[#E02020]">airtel</span>
        <span className="text-[#0052CC]">tigo</span>
      </span>
    </div>
  );
}

export function WhatsAppIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.456h.005c6.554 0 11.89-5.336 11.893-11.893 0-3.177-1.237-6.164-3.488-8.414z" />
    </svg>
  );
}
