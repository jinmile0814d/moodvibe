'use client';

import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import type { HistoryRecord } from '@/lib/types';

interface AudioState {
  current: HistoryRecord | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
}

interface AudioContextValue {
  state: AudioState;
  play: (record: HistoryRecord) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  stop: () => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
}

export default function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioState>({
    current: null,
    isPlaying: false,
    progress: 0,
    duration: 0,
  });

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => {
      setState(prev => ({ ...prev, progress: audio.currentTime }));
    });
    audio.addEventListener('loadedmetadata', () => {
      setState(prev => ({ ...prev, duration: audio.duration }));
    });
    audio.addEventListener('ended', () => {
      setState(prev => ({ ...prev, isPlaying: false }));
    });
    audio.addEventListener('play', () => {
      setState(prev => ({ ...prev, isPlaying: true }));
    });
    audio.addEventListener('pause', () => {
      setState(prev => ({ ...prev, isPlaying: false }));
    });

    return () => { audio.pause(); audio.src = ''; };
  }, []);

  const play = useCallback((record: HistoryRecord) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (state.current?.id === record.id && state.current?.url === record.url && audio.src) {
      audio.play().catch(() => {});
      return;
    }

    audio.pause();
    audio.currentTime = 0;
    if (record.url) {
      audio.src = record.url;
      audio.play().catch(() => {});
    }
    setState(prev => ({ ...prev, current: record, progress: 0, duration: 0 }));
  }, [state.current?.id, state.current?.url]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play();
    else audio.pause();
  }, []);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.src = '';
    setState({ current: null, isPlaying: false, progress: 0, duration: 0 });
  }, []);

  return (
    <AudioContext value={{ state, play, togglePlay, seek, stop }}>
      {children}
    </AudioContext>
  );
}
