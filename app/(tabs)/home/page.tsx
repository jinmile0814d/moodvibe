'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import WeatherCard from '@/components/WeatherCard';
import StatusCard from '@/components/StatusCard';
import FortuneCard from '@/components/FortuneCard';
import { addHistory } from '@/lib/history';
import { getTodayFortune } from '@/lib/fortune';
import type { StatusItem, HistoryRecord, MusicPreference } from '@/lib/types';

const CITY_KEY = 'moodvibe-city';
const LATEST_KEY = 'moodvibe-latest';
const PREF_KEY = 'moodvibe-music-pref';
const COOLDOWN = 30000;

export default function HomePage() {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<StatusItem[]>([]);
  const [generating, setGenerating] = useState(false);
  const lastGenTime = useRef(0);

  useEffect(() => {
    const savedCity = localStorage.getItem(CITY_KEY);
    if (savedCity) setCity(savedCity);
  }, []);

  const doGenerate = useCallback(async (currentCity: string, statuses: StatusItem[]) => {
    if (Date.now() - lastGenTime.current < COOLDOWN) return;
    setGenerating(true);

    const primaryMood = statuses[0].baseMood;
    const statusLabels = statuses.map(s => `${s.emoji} ${s.label}`);
    const statusIds = statuses.map(s => s.id);

    let musicPref: MusicPreference | undefined;
    try {
      const saved = localStorage.getItem(PREF_KEY);
      if (saved) musicPref = JSON.parse(saved);
    } catch {}

    let luckyMusicGenre: string | undefined;
    const fortune = getTodayFortune();
    if (fortune) {
      luckyMusicGenre = fortune.lucky.musicGenre;
    }

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: currentCity, mood: primaryMood, statusLabels, musicPref, statusIds, luckyMusicGenre }),
      });
      const data = await res.json();

      const record: HistoryRecord = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        date: new Date().toISOString(),
        city: currentCity,
        weather: data.weather,
        temp: data.temp,
        aqi: data.aqi,
        statuses: statuses.map(s => ({ emoji: s.emoji, label: s.label })),
        song: data.bgm.song,
        artist: data.bgm.artist,
        cover: data.bgm.cover,
        gradient: data.gradient,
        quote: data.quote,
        url: data.bgm.url,
        lyric: data.bgm.lyric,
        songId: data.bgm.songId,
      };

      addHistory(record);
      localStorage.setItem(LATEST_KEY, JSON.stringify(record));
      lastGenTime.current = Date.now();
      setGenerating(false);
      router.push('/music');
      return;
    } catch {}
    setGenerating(false);
  }, [router]);

  function handleConfirmStatus(statuses: StatusItem[]) {
    if (!city || statuses.length === 0) return;
    doGenerate(city, statuses);
  }

  function handleCityChange(newCity: string) {
    setCity(newCity);
    if (newCity) localStorage.setItem(CITY_KEY, newCity);
  }


  return (
    <main className="px-5 pt-14 max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">MoodVibe</h1>
      </div>

      <div className="space-y-5">
        {/* 天气卡片 */}
        <WeatherCard city={city} onCityChange={handleCityChange} />

        {/* 状态卡片 */}
        <StatusCard selectedStatuses={selectedStatuses} onStatusChange={setSelectedStatuses} onConfirm={handleConfirmStatus} />
      </div>

      {/* 生成提示 */}
      {generating && (
        <div className="mt-5 flex items-center justify-center gap-2 px-5 py-3 bg-[#2C2C2C] rounded-full mx-auto w-fit">
          <div className="animate-spin h-3.5 w-3.5 border-2 border-gray-600 border-t-white rounded-full" />
          <span className="text-xs text-white">正在为你生成今日歌曲...</span>
        </div>
      )}

      {/* 今日运势 */}
      <div className="mt-5">
        <FortuneCard />
      </div>
    </main>
  );
}
