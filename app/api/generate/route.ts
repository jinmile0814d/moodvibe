import { NextRequest, NextResponse } from 'next/server';
import { getWeather } from '@/lib/weather';
import { getGradient, buildGradientFromPair, Mood, Weather } from '@/lib/gradient';
import { getQuote } from '@/lib/quote';
import { getBGM } from '@/lib/bgm';

interface MusicPreference {
  genres: string[];
  language: string;
  emotionMode: 'match' | 'contrast';
}

export async function POST(request: NextRequest) {
  const { city, mood, statusLabels, musicPref, statusIds, luckyMusicGenre } = await request.json() as {
    city: string;
    mood: Mood;
    statusLabels?: string[];
    musicPref?: MusicPreference;
    statusIds?: string[];
    luckyMusicGenre?: string;
  };

  if (!city || !mood) {
    return NextResponse.json({ error: '缺少参数' }, { status: 400 });
  }

  const weatherData = await getWeather(city);
  const quote = await getQuote(weatherData.weather, mood, statusLabels);
  const bgm = await getBGM(mood, musicPref, statusIds, luckyMusicGenre);

  const gradient = bgm.coverColors
    ? buildGradientFromPair(bgm.coverColors)
    : getGradient(weatherData.weather, mood);

  return NextResponse.json({
    city: weatherData.city,
    weather: weatherData.weather,
    temp: weatherData.temp,
    description: weatherData.description,
    gradient,
    quote,
    bgm,
    mood,
  });
}
