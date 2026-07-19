'use client';

import { useState, useEffect } from 'react';
import { cities } from '@/lib/status-data';

interface WeatherInfo {
  weather: string;
  temp: number;
  description: string;
  city: string;
  aqi?: string;
  aqiValue?: number;
  humidity?: number;
  windScale?: string;
  windDir?: string;
  feelsLike?: number;
}

const CITY_KEY = 'moodvibe-city';
const CACHE_KEY = 'moodvibe-weather-cache';
const CACHE_TTL = 30 * 60 * 1000;

type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';

function getTimeOfDay(): TimeOfDay {
  const h = new Date().getHours();
  if (h >= 6 && h < 10) return 'morning';
  if (h >= 10 && h < 17) return 'day';
  if (h >= 17 && h < 20) return 'evening';
  return 'night';
}

function getCurrentDate(): string {
  const now = new Date();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${(now.getMonth() + 1)}月${now.getDate()}日 ${weekdays[now.getDay()]}`;
}

const gradientMap: Record<string, Record<TimeOfDay, string>> = {
  sunny: {
    morning: 'linear-gradient(135deg, #FDF6EE 0%, #FAE8D4 100%)',
    day: 'linear-gradient(135deg, #FEF0E3 0%, #FDDCBC 100%)',
    evening: 'linear-gradient(135deg, #E8CDB5 0%, #C4A68A 100%)',
    night: 'linear-gradient(135deg, #3B4856 0%, #2C3441 100%)',
  },
  cloudy: {
    morning: 'linear-gradient(135deg, #EEF4F8 0%, #DFEAF2 100%)',
    day: 'linear-gradient(135deg, #E4EDF5 0%, #D0DDE9 100%)',
    evening: 'linear-gradient(135deg, #98A8B8 0%, #6E8090 100%)',
    night: 'linear-gradient(135deg, #3A4350 0%, #2A3140 100%)',
  },
  rainy: {
    morning: 'linear-gradient(135deg, #E8F0F8 0%, #D4E4F0 100%)',
    day: 'linear-gradient(135deg, #DCE8F4 0%, #C2D6E8 100%)',
    evening: 'linear-gradient(135deg, #7A92A8 0%, #56707E 100%)',
    night: 'linear-gradient(135deg, #2E3A48 0%, #1E2832 100%)',
  },
  snowy: {
    morning: 'linear-gradient(135deg, #F5F0F8 0%, #EAE2F0 100%)',
    day: 'linear-gradient(135deg, #EDE6F4 0%, #DDD4EA 100%)',
    evening: 'linear-gradient(135deg, #8E86A0 0%, #6A6280 100%)',
    night: 'linear-gradient(135deg, #343042 0%, #262238 100%)',
  },
};

function getGradient(weather: string, time: TimeOfDay): string {
  return gradientMap[weather]?.[time] || gradientMap.cloudy[time];
}

function isDarkBg(time: TimeOfDay): boolean {
  return time === 'night' || time === 'evening';
}

function getWeatherIcon(description: string): string {
  if (description.includes('晴')) return '☀️';
  if (description.includes('云') || description.includes('阴')) return '☁️';
  if (description.includes('雨')) return '🌧️';
  if (description.includes('雪')) return '❄️';
  if (description.includes('雾') || description.includes('霾')) return '🌫️';
  return '🌤️';
}

function getCachedWeather(city: string): WeatherInfo | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (cached.city === city && Date.now() - cached.timestamp < CACHE_TTL && cached.data.humidity !== undefined) {
      return cached.data;
    }
  } catch {}
  return null;
}

function setCachedWeather(city: string, data: WeatherInfo) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ city, data, timestamp: Date.now() }));
}

interface Props {
  city: string;
  onCityChange: (city: string) => void;
}

export default function WeatherCard({ city, onCityChange }: Props) {
  const [weather, setWeather] = useState<WeatherInfo | null>(() => {
    if (typeof window !== 'undefined' && city) {
      return getCachedWeather(city);
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [filter, setFilter] = useState('');
  const timeOfDay = getTimeOfDay();
  const currentDate = getCurrentDate();

  useEffect(() => {
    if (!city) return;

    const cached = getCachedWeather(city);
    if (cached) return;

    setLoading(true);
    fetch(`/api/weather?city=${encodeURIComponent(city)}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setWeather(data);
          setCachedWeather(city, data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [city]);

  const filteredCities = filter
    ? cities.filter(c => c.includes(filter))
    : cities;

  function confirmCity(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCityChange(trimmed);
    localStorage.setItem(CITY_KEY, trimmed);
    setShowPicker(false);
    setFilter('');
  }

  if (!city) {
    return (
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
        <p className="text-sm text-gray-500 mb-3">选择你的城市</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setShowPicker(true); }}
            onFocus={() => setShowPicker(true)}
            onKeyDown={(e) => { if (e.key === 'Enter') confirmCity(filter); }}
            placeholder="输入城市名..."
            className="flex-1 px-4 py-2.5 bg-gray-50 rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F4A47C]/30"
          />
          {filter.trim() && (
            <button
              onClick={() => confirmCity(filter)}
              className="px-4 py-2.5 bg-[#2C2C2C] text-white text-sm rounded-2xl"
            >
              确定
            </button>
          )}
        </div>
        {showPicker && filteredCities.length > 0 && (
          <div className="mt-2 max-h-40 overflow-y-auto rounded-2xl bg-white shadow-lg border border-gray-100">
            {filteredCities.map(c => (
              <button
                key={c}
                onClick={() => confirmCity(c)}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#FFF0E8]"
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const weatherType = weather?.weather || 'cloudy';
  const gradient = getGradient(weatherType, timeOfDay);
  const dark = isDarkBg(timeOfDay);

  const txt = dark ? 'text-white' : 'text-gray-800';
  const txtSub = dark ? 'text-white/80' : 'text-gray-800';
  const txtMuted = dark ? 'text-white/60' : 'text-gray-600';
  const border = dark ? 'border-white/10' : 'border-gray-800/10';

  return (
    <div
      className="rounded-3xl px-5 py-4 shadow-sm relative overflow-hidden transition-all duration-700"
      style={{ background: gradient }}
    >
      {loading ? (
        <div className="animate-pulse space-y-2">
          <div className={`h-4 w-24 rounded ${dark ? 'bg-white/20' : 'bg-gray-300/30'}`} />
          <div className={`h-10 w-24 rounded ${dark ? 'bg-white/20' : 'bg-gray-300/30'}`} />
        </div>
      ) : weather ? (
        <>
          {/* Row 1: weather + description (left) | date (right) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-lg">{getWeatherIcon(weather.description)}</span>
              <span className={`text-sm font-serif font-bold ${txt}`}>{weather.description}</span>
            </div>
            <span className={`text-sm font-serif font-bold ${txtSub}`}>{currentDate}</span>
          </div>

          {/* Row 2: Temperature (left) | city (right) */}
          <div className="flex items-end justify-between mt-1">
            <p className={`text-4xl font-extralight leading-none tracking-tight ${txt}`}>
              {weather.temp}<span className="text-xl align-top">°</span>
            </p>
            <div className="flex items-center gap-1.5 pb-1">
              <p className={`text-sm font-serif font-bold ${txtSub}`}>{city}</p>
              <button
                onClick={() => { onCityChange(''); localStorage.removeItem(CITY_KEY); setWeather(null); }}
                className={`text-[10px] ${txtMuted} hover:opacity-80`}
              >
                切换
              </button>
            </div>
          </div>

          {/* Bottom indicators */}
          <div className={`flex justify-between mt-3 pt-2.5 border-t ${border} ${txtSub}`}>
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m-3-3h6m5.5 2.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
              </svg>
              <span className="text-xs">体感 {weather.feelsLike !== undefined ? `${weather.feelsLike}°` : '--'}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0L12 2.69z" />
              </svg>
              <span className="text-xs">{weather.humidity !== undefined ? `湿度${weather.humidity}%` : '--'}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h13a3 3 0 100-3M3 12h9a3 3 0 110 3H3m0 4h13a3 3 0 110 3" />
              </svg>
              <span className="text-xs">{weather.windDir || ''}{weather.windScale ? `${weather.windScale}级` : '--'}</span>
            </div>
          </div>
        </>
      ) : (
        <p className={`text-sm ${txtMuted}`}>天气加载失败</p>
      )}
    </div>
  );
}
