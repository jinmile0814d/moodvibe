import { NextRequest, NextResponse } from 'next/server';
import { Mood, buildGradientFromPair } from '@/lib/gradient';
import { getBGM, getBGMFromPlaylist } from '@/lib/bgm';

interface MusicPreference {
  genres: string[];
  language: string;
  emotionMode: 'match' | 'contrast';
}

export async function POST(request: NextRequest) {
  const { mood, excludeSong, musicPref, statusIds, playlistId } = await request.json() as {
    mood: Mood;
    excludeSong?: string;
    musicPref?: MusicPreference;
    statusIds?: string[];
    playlistId?: number;
  };

  if (!mood) {
    return NextResponse.json({ error: '缺少参数' }, { status: 400 });
  }

  if (playlistId) {
    const bgm = await getBGMFromPlaylist(playlistId, excludeSong);
    if (bgm) {
      const gradient = bgm.coverColors ? buildGradientFromPair(bgm.coverColors) : null;
      return NextResponse.json({ ...bgm, gradient });
    }
  }

  const maxAttempts = 3;
  for (let i = 0; i < maxAttempts; i++) {
    const bgm = await getBGM(mood, musicPref, statusIds);
    if (!excludeSong || bgm.song !== excludeSong || i === maxAttempts - 1) {
      const gradient = bgm.coverColors ? buildGradientFromPair(bgm.coverColors) : null;
      return NextResponse.json({ ...bgm, gradient });
    }
  }
}
