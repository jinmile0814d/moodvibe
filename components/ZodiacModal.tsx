'use client';

import { useState } from 'react';
import { zodiacList } from '@/lib/fortune';
import type { ZodiacSign } from '@/lib/types';

interface Props {
  isOpen: boolean;
  onSelect: (zodiac: ZodiacSign) => void;
  onClose: () => void;
}

const rowColors = [
  'bg-[#FFF0E8]',
  'bg-[#F0F8EE]',
  'bg-[#EEF4FF]',
  'bg-[#FFF8E8]',
];

export default function ZodiacModal({ isOpen, onSelect, onClose }: Props) {
  const [selected, setSelected] = useState<ZodiacSign | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl w-full max-w-sm shadow-xl overflow-hidden">
        {/* Header */}
        <div className="pt-6 pb-4 px-6 text-center">
          <h2 className="text-lg font-bold text-gray-800">选择你的星座</h2>
          <p className="text-xs text-gray-600 mt-1">用于生成每日专属运势</p>
        </div>

        {/* Grid */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-2.5">
            {zodiacList.map((z, i) => {
              const rowIndex = Math.floor(i / 3);
              const isSelected = selected === z.id;
              return (
                <button
                  key={z.id}
                  onClick={() => setSelected(z.id)}
                  className={`relative flex flex-col items-center justify-center gap-0.5 py-3.5 rounded-2xl transition-all ${
                    isSelected
                      ? 'bg-[#FFF0E8] ring-2 ring-[#F4A47C]'
                      : `${rowColors[rowIndex]} active:scale-95`
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#F4A47C] rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                  <span className="text-base font-bold text-gray-800">{z.emoji}</span>
                  <span className="text-[11px] font-medium text-gray-700">{z.label}</span>
                  <span className="text-[10px] text-gray-600">{z.dateRange}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Confirm button */}
        <div className="px-4 pb-5">
          <button
            onClick={() => { if (selected) onSelect(selected); }}
            disabled={!selected}
            className={`w-full py-3 rounded-full text-sm font-semibold transition-colors ${
              selected
                ? 'bg-[#2C2C2C] text-white active:bg-[#1a1a1a]'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
