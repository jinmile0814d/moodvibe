'use client';

import { useRouter } from 'next/navigation';
import { useAudio } from './AudioProvider';

export default function MiniPlayer() {
  const router = useRouter();
  const { state, togglePlay } = useAudio();

  if (!state.current) return null;

  const { current, isPlaying, progress, duration } = state;
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 px-3 pb-[env(safe-area-inset-bottom)]">
      <div
        className="max-w-lg mx-auto bg-white/95 backdrop-blur-xl rounded-2xl shadow-md border border-gray-100 overflow-hidden"
      >
        {/* 进度条 */}
        <div className="h-0.5 bg-gray-100">
          <div
            className="h-full bg-[#F4A47C] transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center gap-3 px-3 py-2">
          {/* 封面 */}
          <button
            onClick={() => {
              sessionStorage.setItem('moodvibe-player-data', JSON.stringify(current));
              router.push(`/player?id=${current.id}`);
            }}
            className="w-10 h-10 rounded-xl overflow-hidden bg-[#FFF0E8] flex-shrink-0"
          >
            {current.cover ? (
              <img src={current.cover} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-4 h-4 text-[#F4A47C]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
            )}
          </button>

          {/* 歌曲信息 */}
          <button
            onClick={() => {
              sessionStorage.setItem('moodvibe-player-data', JSON.stringify(current));
              router.push(`/player?id=${current.id}`);
            }}
            className="flex-1 min-w-0 text-left"
          >
            <p className="text-sm font-medium text-gray-800 truncate">{current.song}</p>
            <p className="text-xs text-gray-400 truncate">{current.artist}</p>
          </button>

          {/* 播放/暂停 */}
          <button
            onClick={togglePlay}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-[#F4A47C]/30 bg-[#FFF0E8] flex-shrink-0"
          >
            {isPlaying ? (
              <svg className="w-4 h-4 text-[#F4A47C]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4 text-[#F4A47C] ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
