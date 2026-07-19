'use client';

import { useState } from 'react';
import ZodiacModal from './ZodiacModal';
import { zodiacList, getUserZodiac, setUserZodiac, getTodayFortune, clearFortuneCache } from '@/lib/fortune';
import type { ZodiacSign, FortuneData } from '@/lib/types';

const dimensionLabels: { key: keyof FortuneData['dimensions']; label: string; barColor: string }[] = [
  { key: 'emotion', label: '情绪', barColor: 'bg-gradient-to-t from-[#F4A47C] to-[#FFCDB2]' },
  { key: 'social', label: '社交', barColor: 'bg-gradient-to-t from-[#E8A598] to-[#FFD4CC]' },
  { key: 'creativity', label: '创造', barColor: 'bg-gradient-to-t from-[#C9A9D4] to-[#E8D5F0]' },
  { key: 'wealth', label: '财富', barColor: 'bg-gradient-to-t from-[#A8C9A4] to-[#D4E8D2]' },
  { key: 'love', label: '爱情', barColor: 'bg-gradient-to-t from-[#E8A4B8] to-[#FFD4E0]' },
];

export default function FortuneCard() {
  const [zodiac, setZodiac] = useState<ZodiacSign | null>(() => getUserZodiac());
  const [fortune, setFortune] = useState<FortuneData | null>(() => {
    const saved = getUserZodiac();
    return saved ? getTodayFortune() : null;
  });
  const [showModal, setShowModal] = useState(false);

  function handleSelectZodiac(z: ZodiacSign) {
    setUserZodiac(z);
    clearFortuneCache();
    setZodiac(z);
    setFortune(getTodayFortune());
    setShowModal(false);
  }

  const zodiacInfo = zodiac ? zodiacList.find((z) => z.id === zodiac) : null;

  if (!zodiac || !fortune) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-white rounded-3xl p-5 shadow-sm border border-gray-100 text-center"
        >
          <div className="flex flex-col items-center gap-3 py-4">
            <span className="text-3xl">🔮</span>
            <p className="text-sm text-gray-500">你的星座是？</p>
            <span className="inline-block px-6 py-2 bg-[#2C2C2C] text-white text-xs font-medium rounded-full">选择星座</span>
          </div>
        </button>
        <ZodiacModal isOpen={showModal} onSelect={handleSelectZodiac} onClose={() => setShowModal(false)} />
      </>
    );
  }

  return (
    <>
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">今日运势</h3>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{zodiacInfo?.emoji}</span>
            <span className="text-sm font-serif font-bold text-gray-700 -ml-1">{zodiacInfo?.label}</span>
            <button
              onClick={() => setShowModal(true)}
              className="text-[10px] text-gray-400 hover:text-gray-600"
            >
              切换
            </button>
          </div>
        </div>

        {/* Score Section */}
        <div className="flex items-stretch">
          {/* Left half: label → score → summary */}
          <div className="flex-1 flex flex-col justify-between">
            <h4 className="text-sm font-bold text-gray-900">综合分数</h4>
            <div className="flex items-baseline gap-0.5 -mt-3">
              <span className="text-[2.5rem] font-bold bg-gradient-to-r from-[#F4A47C] to-[#E8A598] bg-clip-text text-transparent leading-none">{fortune.totalScore}</span>
              <span className="text-lg text-gray-400">分</span>
            </div>
            <p className="text-[13px] text-gray-500 -mt-3">{fortune.summary}</p>
          </div>
          {/* Right half: 5 dimension columns */}
          <div className="flex-1 flex items-stretch justify-evenly">
            {dimensionLabels.map(({ key, label, barColor }) => {
              const val = fortune.dimensions[key];
              return (
                <div key={key} className="flex flex-col items-center">
                  <div className="w-[14px] h-14 bg-gray-50 rounded-sm overflow-hidden flex items-end">
                    <div
                      className={`w-full rounded-sm ${barColor}`}
                      style={{ height: `${val}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-700 mt-1">{val}</span>
                  <span className="text-xs text-gray-400 mt-0.5">{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insight */}
        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-2">今日洞察</h4>
          <div className="border-l-[3px] border-[#F4A47C]/40 pl-3 py-1 bg-[#FFF8F3] rounded-r-xl">
            <p className="text-[13px] font-serif text-gray-700 leading-relaxed italic">{fortune.insight}</p>
          </div>
        </div>

        {/* Do & Avoid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#F0F8EE] rounded-2xl p-3">
            <p className="text-[13px] font-bold text-green-700 mb-1.5">建议</p>
            <ul className="space-y-1">
              {fortune.doList.map((item, i) => (
                <li key={i} className="text-[13px] text-gray-600 flex items-start gap-1.5">
                  <span className="text-green-500 mt-0.5 shrink-0">&#10003;</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#FFF0E8] rounded-2xl p-3">
            <p className="text-[13px] font-bold text-[#D4845C] mb-1.5">避免</p>
            <ul className="space-y-1">
              {fortune.avoidList.map((item, i) => (
                <li key={i} className="text-[13px] text-gray-600 flex items-start gap-1.5">
                  <span className="text-[#F4A47C] mt-0.5 shrink-0">&#10007;</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Lucky Elements */}
        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-3">幸运元素</h4>
          <div className="flex justify-between">
            <LuckyItem icon={<span className="w-5 h-5 rounded-full" style={{ backgroundColor: fortune.lucky.colorHex }} />} label="幸运色" value={fortune.lucky.color} />
            <LuckyItem icon={<span className="text-base">🎵</span>} label="音乐风格" value={fortune.lucky.musicGenre} />
            <LuckyItem icon={<span className="text-base">⏰</span>} label="幸运时段" value={fortune.lucky.timeSlot} />
            <LuckyItem icon={<span className="text-base">🍽️</span>} label="幸运食物" value={fortune.lucky.food} />
            <LuckyItem icon={<span className="text-base font-bold text-[#F4A47C]">{fortune.lucky.number}</span>} label="幸运数字" value={String(fortune.lucky.number)} />
          </div>
        </div>
      </div>

      <ZodiacModal isOpen={showModal} onSelect={handleSelectZodiac} onClose={() => setShowModal(false)} />
    </>
  );
}

function LuckyItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 min-w-[72px] bg-[#FAFAF8] rounded-xl px-3 py-2.5">
      <div className="w-8 h-8 flex items-center justify-center">{icon}</div>
      <span className="text-xs text-gray-600 font-medium">{label}</span>
      <span className="text-[11px] text-gray-600 text-center leading-tight">{value}</span>
    </div>
  );
}
