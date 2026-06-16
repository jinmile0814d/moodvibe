import type { Mood } from './gradient';

export interface StatusItem {
  id: string;
  emoji: string;
  label: string;
  baseMood: Mood;
}

export interface StatusCategory {
  name: string;
  items: StatusItem[];
}

export interface MusicPreference {
  genres: string[];
  language: string;
  emotionMode: 'match' | 'contrast';
}

export interface HistoryRecord {
  id: string;
  type?: 'music' | 'place';
  date: string;
  city: string;
  weather: string;
  temp: number;
  aqi?: string;
  statuses: { emoji: string; label: string }[];
  song: string;
  artist: string;
  cover: string | null;
  gradient: { css: string };
  quote: string;
  url: string | null;
  lyric: string | null;
  songId?: number;
  // 地点相关字段
  placeName?: string;
  placeAddress?: string;
  placePhoto?: string | null;
  placeLat?: number;
  placeLng?: number;
}

export type ZodiacSign =
  | 'aries' | 'taurus' | 'gemini' | 'cancer'
  | 'leo' | 'virgo' | 'libra' | 'scorpio'
  | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

export interface ZodiacInfo {
  id: ZodiacSign;
  label: string;
  emoji: string;
  dateRange: string;
}

export interface FortuneDimensions {
  emotion: number;
  social: number;
  creativity: number;
  wealth: number;
  love: number;
}

export interface LuckyElements {
  color: string;
  colorHex: string;
  musicGenre: string;
  timeSlot: string;
  food: string;
  number: number;
}

export interface FortuneData {
  zodiac: ZodiacSign;
  date: string;
  totalScore: number;
  summary: string;
  dimensions: FortuneDimensions;
  insight: string;
  doList: string[];
  avoidList: string[];
  lucky: LuckyElements;
}
