'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useAudio } from '@/components/AudioProvider';
import { getHistoryById, addHistory } from '@/lib/history';
import type { HistoryRecord } from '@/lib/types';

interface LyricLine {
  time: number;
  text: string;
}

function parseLRC(lrc: string): LyricLine[] {
  const lines: LyricLine[] = [];
  for (const line of lrc.split('\n')) {
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
    if (match) {
      const min = parseInt(match[1]);
      const sec = parseInt(match[2]);
      const ms = parseInt(match[3].padEnd(3, '0'));
      const time = min * 60 + sec + ms / 1000;
      const text = match[4].trim();
      if (text) lines.push({ time, text });
    }
  }
  return lines.sort((a, b) => a.time - b.time);
}

export default function PlayerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state: audioState, play, togglePlay, seek } = useAudio();
  const [data, setData] = useState<HistoryRecord | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = searchParams.get('id');
    const sessionData = sessionStorage.getItem('moodvibe-player-data');

    async function refreshAndPlay(record: HistoryRecord) {
      setData(record);
      if (!record.songId && !record.song) {
        return;
      }
      const params = record.songId
        ? `id=${record.songId}`
        : `keyword=${encodeURIComponent(`${record.song} ${record.artist}`)}`;
      try {
        const res = await fetch(`/api/song-url?${params}`);
        const { url } = await res.json();
        if (url) {
          const updated = { ...record, url };
          setData(updated);
          play(updated);
          return;
        }
      } catch {}
      if (record.url) {
        play(record);
      }
    }

    if (sessionData) {
      const record = JSON.parse(sessionData) as HistoryRecord;
      sessionStorage.removeItem('moodvibe-player-data');
      refreshAndPlay(record);
      return;
    }
    if (id) {
      const record = getHistoryById(id);
      if (record) {
        refreshAndPlay(record);
        return;
      }
    }
    router.push('/home');
  }, [searchParams, router]);

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    if (!audioState.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seek(ratio * audioState.duration);
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  async function handleRegenerate() {
    if (!data) return;
    setRegenerating(true);
    try {
      const res = await fetch('/api/regenerate-bgm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: 'chill',
          excludeSong: data.song,
        }),
      });
      const newBgm = await res.json();
      const newRecord: HistoryRecord = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        date: new Date().toISOString(),
        city: data.city,
        weather: data.weather,
        temp: data.temp,
        aqi: data.aqi,
        statuses: data.statuses,
        song: newBgm.song,
        artist: newBgm.artist,
        cover: newBgm.cover,
        url: newBgm.url,
        lyric: newBgm.lyric,
        gradient: newBgm.gradient || data.gradient,
        quote: data.quote,
      };
      addHistory(newRecord);
      setData(newRecord);
      play(newRecord);
    } catch {}
    setRegenerating(false);
  }

  async function handleShare() {
    setShowShareModal(true);
  }

  async function downloadShareImage() {
    if (!shareCardRef.current || !data) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(shareCardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `MoodVibe-${data.song}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      alert('图片已保存！可以分享到微信了 🎵');
    } catch (e) {
      alert('生成图片失败，请重试');
    }
  }

  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FAFAF8]">
        <div className="animate-spin h-8 w-8 border-2 border-orange-200 border-t-[#F4A47C] rounded-full" />
      </div>
    );
  }

  const isCurrentTrack = audioState.current?.id === data.id;
  const progress = isCurrentTrack ? audioState.progress : 0;
  const duration = isCurrentTrack ? audioState.duration : 0;
  const isPlaying = isCurrentTrack && audioState.isPlaying;

  const lyrics = data.lyric ? parseLRC(data.lyric) : [];
  const activeIndex = lyrics.findIndex((line, i) => {
    const next = lyrics[i + 1];
    return progress >= line.time && (!next || progress < next.time);
  });

  return (
    <main
      className="h-screen flex flex-col transition-[background] duration-1000 overflow-hidden"
      style={{ background: data.gradient?.css || 'linear-gradient(135deg, #f0f4ff, #e8f0fe)' }}
    >
      {/* 顶部导航 */}
      <div className="flex items-center justify-between px-5 pt-12 pb-2">
        <button onClick={() => router.back()} className="text-gray-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <p className="flex-1 text-center text-gray-500 text-xs italic truncate px-4">
          {data.quote ? `「${data.quote}」` : ''}
        </p>
        <div className="w-6" />
      </div>

      {/* 封面区域 */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="w-[280px] h-[280px] rounded-2xl shadow-xl overflow-hidden bg-white/40">
          {data.cover ? (
            <img src={data.cover} alt={data.song} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/60">
              <svg className="w-16 h-16 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <h2 className="text-xl font-bold text-gray-900">{data.song}</h2>
          <p className="text-gray-500 text-sm mt-1">{data.artist}</p>
        </div>

        {/* 歌词区域 */}
        {lyrics.length > 0 && (
          <div className="mt-5 h-[100px] overflow-hidden mask-gradient w-full">
            <div className="flex flex-col items-center" ref={(el) => {
              if (!el || activeIndex < 0) return;
              const child = el.children[activeIndex] as HTMLElement;
              if (child) child.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}>
              {lyrics.map((line, i) => (
                <p
                  key={i}
                  className={`py-1 text-center text-sm transition-all duration-300 ${
                    i < activeIndex
                      ? 'text-gray-700'
                      : i === activeIndex
                        ? 'text-gray-900 font-medium'
                        : 'text-gray-400'
                  }`}
                >
                  {line.text}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 底部控制区 */}
      <div className="px-8 pb-10 space-y-4">
        {data.url && (
          <div className="space-y-1">
            <div className="relative w-full h-1 bg-black/10 rounded-full cursor-pointer" onClick={handleSeek}>
              <div
                className="h-full bg-gray-600 rounded-full transition-all duration-200"
                style={{ width: duration ? `${(progress / duration) * 100}%` : '0%' }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-gray-700 rounded-full shadow-sm transition-all duration-200"
                style={{ left: duration ? `calc(${(progress / duration) * 100}% - 6px)` : '0%' }}
              />
            </div>
            <div className="flex justify-between text-gray-400 text-[10px]">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-8">
          <button
            onClick={handleShare}
            className="text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>

          <button
            onClick={togglePlay}
            disabled={!data.url}
            className="w-14 h-14 rounded-full bg-[#2C2C2C] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform shadow-lg"
          >
            {isPlaying ? (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          <button onClick={handleRegenerate} disabled={regenerating} className="text-gray-500 disabled:opacity-50">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* 分享弹窗 */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">分享到微信</h3>
              <button onClick={() => setShowShareModal(false)} className="text-gray-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 分享卡片预览 */}
            <div ref={shareCardRef} className="relative w-full aspect-square rounded-xl overflow-hidden mb-4" style={{ background: data.gradient?.css || 'linear-gradient(135deg, #f0f4ff, #e8f0fe)' }}>
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                {data.cover && (
                  <img src={data.cover} alt={data.song} className="w-48 h-48 rounded-xl shadow-lg object-cover mb-4" crossOrigin="anonymous" />
                )}
                <h2 className="text-xl font-bold text-gray-900 text-center mb-1">{data.song}</h2>
                <p className="text-gray-600 text-sm mb-3">{data.artist}</p>
                <p className="text-gray-700 text-xs text-center italic px-4 mb-4">「{data.quote}」</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                  <span>MoodVibe</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={downloadShareImage}
                className="w-full bg-[#07C160] text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                保存图片分享到微信
              </button>
              <p className="text-xs text-gray-500 text-center">保存图片后，打开微信选择图片发送</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
