export type Weather = 'sunny' | 'cloudy' | 'rainy' | 'snowy';
export type Mood = 'energetic' | 'overtime' | 'lazy' | 'inlove' | 'chill' | 'sad';

export interface GradientResult {
  from: string;
  to: string;
  css: string;
}

const gradientMap: Record<Weather, Record<Mood, [string, string]>> = {
  sunny: {
    energetic: ['#FFF3E0', '#FFECD2'],
    overtime: ['#E8F5E9', '#FFF8E1'],
    lazy: ['#E3F2FD', '#F1F8E9'],
    inlove: ['#FCE4EC', '#F3E5F5'],
    chill: ['#FFF8E1', '#E8F5E9'],
    sad: ['#ECEFF1', '#E3F2FD'],
  },
  cloudy: {
    energetic: ['#E8EAF6', '#F3E5F5'],
    overtime: ['#ECEFF1', '#E3F2FD'],
    lazy: ['#F5F5F5', '#ECEFF1'],
    inlove: ['#F3E5F5', '#FCE4EC'],
    chill: ['#E3F2FD', '#E8F5E9'],
    sad: ['#ECEFF1', '#F5F5F5'],
  },
  rainy: {
    energetic: ['#E8EAF6', '#E0F7FA'],
    overtime: ['#ECEFF1', '#E8EAF6'],
    lazy: ['#E3F2FD', '#EDE7F6'],
    inlove: ['#EDE7F6', '#FCE4EC'],
    chill: ['#E0F7FA', '#E8F5E9'],
    sad: ['#ECEFF1', '#E3F2FD'],
  },
  snowy: {
    energetic: ['#E3F2FD', '#FFFFFF'],
    overtime: ['#ECEFF1', '#E8EAF6'],
    lazy: ['#F5F5F5', '#FFFFFF'],
    inlove: ['#FCE4EC', '#FFF3E0'],
    chill: ['#E0F7FA', '#F5F5F5'],
    sad: ['#ECEFF1', '#E3F2FD'],
  },
};

export function getGradient(weather: Weather, mood: Mood): GradientResult {
  const [from, to] = gradientMap[weather][mood];
  return {
    from,
    to,
    css: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
  };
}

export function buildGradientFromPair(colors: [string, string]): GradientResult {
  return {
    from: colors[0],
    to: colors[1],
    css: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`,
  };
}
