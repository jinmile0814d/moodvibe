'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ShareData {
  song: string;
  artist: string;
  cover: string | null;
  url: string | null;
  quote: string;
  gradient?: { css?: string };
  city: string;
  weather: string;
  statuses: Array<{ label: string }>;
}

export default function SharePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [data, setData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从localStorage读取分享的歌曲数据
    try {
      const history = localStorage.getItem('moodvibe-history');
      if (history) {
        const records = JSON.parse(history);
        const record = records.find((r: any) => r.id === params.id);
        if (record) {
          setData(record);
        }
      }
    } catch (e) {
      console.error('Failed to load share data', e);
    }
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">分享内容不存在</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: data.gradient?.css || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
    >
      <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6">
        {/* 专辑封面 */}
        {data.cover && (
          <img
            src={data.cover}
            alt={data.song}
            className="w-full aspect-square object-cover rounded-xl mb-4 shadow-lg"
          />
        )}

        {/* 歌曲信息 */}
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{data.song}</h1>
        <p className="text-gray-600 mb-3">{data.artist}</p>

        {/* 金句 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-gray-700 italic text-sm">「{data.quote}」</p>
        </div>

        {/* 氛围标签 */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
            {data.city}
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
            {data.weather}
          </span>
          {data.statuses.slice(0, 2).map((s, i) => (
            <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
              {s.label}
            </span>
          ))}
        </div>

        {/* 操作按钮 */}
        <div className="space-y-3">
          {data.url && (
            <button
              onClick={() => router.push(`/player?id=${params.id}`)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              立即播放
            </button>
          )}

          <button
            onClick={() => router.push('/')}
            className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium"
          >
            生成我的氛围音乐
          </button>
        </div>

        {/* MoodVibe标识 */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
            <span>MoodVibe</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">基于情绪的音乐氛围生成器</p>
        </div>
      </div>
    </div>
  );
}
