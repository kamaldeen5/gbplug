'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      type="button"
      aria-label="Toggle dark/light mode"
      className={`relative flex items-center justify-between w-14 h-7 rounded-full p-1 transition-all duration-300 ${
        isDark
          ? 'bg-[#101A2B] border border-[#1E2E48]'
          : 'bg-[#F1F5F9] border border-[#CBD5E1]'
      }`}
    >
      {/* Active knob */}
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 transform ${
          isDark
            ? 'translate-x-7 bg-[#0B1320] text-yellow-400'
            : 'translate-x-0 bg-white text-slate-800 shadow-sm'
        }`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        )}
      </div>

      {/* Opposite passive icon */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none text-xs">
        <Sun className={`w-3.5 h-3.5 text-amber-500/40 transition-opacity ${isDark ? 'opacity-40' : 'opacity-0'}`} />
        <Moon className={`w-3.5 h-3.5 text-yellow-400/40 transition-opacity ${isDark ? 'opacity-0' : 'opacity-40'}`} />
      </div>
    </button>
  );
}
