'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import SongItem from '@/components/SongItem';
import { useAudio } from '@/components/AudioProvider';
import { getHistory, addHistory, deleteHistoryRecord } from '@/lib/history';
import type { HistoryRecord } from '@/lib/types';

interface Playlist {
  id: number;
  name: string;
  cover: string;
  playCount: number;
  trackCount: number;
}

interface Track {
  id: number;
  song: string;
  artist: string;
  cover: string | null;
  url: string | null;
  lyric: string | null;
}

export default function MusicPage() {
  const router = useRouter();
  const { play } = useAudio();
  const [songs, setSongs] = useState<HistoryRecord[]>(() => getHistory());
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);

  const PLAYLIST_CACHE_KEY = 'moodvibe-playlists-cache';
  const lastLatestId = useRef('');
  const lastStatusKey = useRef('');
  const initializedRef = useRef(false);
  const autoGenerateRef = useRef<(() => Promise<void>) | null>(null);

  autoGenerateRef.current = async () => {
    setRegenerating(true);
    try {
      let city = '';
      let mood = 'chill';
      let statusLabels: string[] = [];
      let statusIds: string[] = [];
      try {
        city = localStorage.getItem('moodvibe-city') || '';
        const statusRaw = localStorage.getItem('moodvibe-daily-status');
        if (statusRaw) {
          const { statuses } = JSON.parse(statusRaw);
          if (statuses?.length > 0) {
            statusLabels = statuses.map((s: { label: string }) => s.label);
            statusIds = statuses.map((s: { id: string }) => s.id);
            mood = statuses[0].baseMood || 'chill';
          }
        }
      } catch {}

      if (city && statusLabels.length > 0) {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ city, mood, statusLabels, statusIds }),
        });
        const data = await res.json();
        if (data.bgm) {
          const newRecord: HistoryRecord = {
            id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            date: new Date().toISOString(),
            city,
            weather: data.weather,
            temp: data.temp,
            statuses: statusLabels.map((label: string) => ({ emoji: '', label })),
            song: data.bgm.song,
            artist: data.bgm.artist,
            cover: data.bgm.cover,
            gradient: data.gradient,
            quote: data.quote || '',
            url: data.bgm.url,
            lyric: data.bgm.lyric,
            songId: data.bgm.songId,
          };
          addHistory(newRecord);
          setSongs(getHistory());
        }
      }
    } catch {}
    setRegenerating(false);
  };

  const autoGenerate = () => autoGenerateRef.current?.();

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // 当前状态关键词
    let keyword = '';
    try {
      const statusRaw = localStorage.getItem('moodvibe-daily-status');
      if (statusRaw) {
        const { statuses } = JSON.parse(statusRaw);
        if (statuses?.length > 0) {
          keyword = statuses.map((s: { label: string }) => s.label).join(' ');
        }
      }
    } catch {}
    lastStatusKey.current = keyword;

    try {
      const latest = localStorage.getItem('moodvibe-latest');
      if (latest) {
        const record = JSON.parse(latest);
        lastLatestId.current = record.id || '';
      }
    } catch {}

    // 未设置状态时不请求歌单
    if (!keyword) {
      setPlaylists([]);
      setLoadingPlaylists(false);
      return;
    }

    // 检查缓存是否匹配当前状态
    let needFetch = true;
    try {
      const cached = localStorage.getItem(PLAYLIST_CACHE_KEY);
      if (cached) {
        const { playlists: cachedPlaylists, keyword: cachedKeyword } = JSON.parse(cached);
        if (cachedPlaylists?.length > 0 && cachedKeyword === keyword) {
          setPlaylists(cachedPlaylists);
          setLoadingPlaylists(false);
          needFetch = false;
        }
      }
    } catch {}

    if (needFetch) {
      fetchPlaylists(keyword);
    }

    // 如果用户已设置状态但今天没有推荐歌曲，自动生成一首
    const today = new Date().toISOString().slice(0, 10);
    const history = getHistory();
    const todaySongs = history.filter(r => r.type !== 'place' && r.date.slice(0, 10) === today);
    if (todaySongs.length === 0 && keyword) {
      autoGenerate();
    }
  }, []);

  function fetchPlaylists(keyword: string) {
    setLoadingPlaylists(true);
    setActivePlaylist(null);
    setPlaylistTracks([]);
    fetch(`/api/playlists?keyword=${encodeURIComponent(keyword)}`)
      .then(res => res.json())
      .then(data => {
        const result = data.playlists || [];
        setPlaylists(result);
        localStorage.setItem(PLAYLIST_CACHE_KEY, JSON.stringify({ playlists: result, keyword }));
      })
      .catch(() => {})
      .finally(() => setLoadingPlaylists(false));
  }

  // 监听状态变化和新生成来刷新歌单
  useEffect(() => {
    const interval = setInterval(() => {
      // 检查状态是否变化
      try {
        const statusRaw = localStorage.getItem('moodvibe-daily-status');
        let currentKey = '';
        if (statusRaw) {
          const { statuses } = JSON.parse(statusRaw);
          if (statuses?.length > 0) {
            currentKey = statuses.map((s: { label: string }) => s.label).join(' ');
          }
        }
        if (currentKey !== lastStatusKey.current) {
          lastStatusKey.current = currentKey;
          if (currentKey) {
            fetchPlaylists(currentKey);
          } else {
            setPlaylists([]);
          }
        }
      } catch {}

      // 检查是否有新生成的歌曲
      try {
        const latest = localStorage.getItem('moodvibe-latest');
        if (latest) {
          const record = JSON.parse(latest);
          if (record.id && record.id !== lastLatestId.current) {
            lastLatestId.current = record.id;
            setSongs(getHistory());
          }
        }
      } catch {}
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  function handlePlayRecord(record: HistoryRecord) {
    sessionStorage.setItem('moodvibe-player-data', JSON.stringify(record));
    router.push(`/player?id=${record.id}`);
  }

  const [regenerating, setRegenerating] = useState(false);

  async function handleDeleteSong(record: HistoryRecord) {
    deleteHistoryRecord(record.id);
    const updated = getHistory();
    setSongs(updated);

    const today = new Date().toISOString().slice(0, 10);
    const remaining = updated.filter(r => r.type !== 'place' && r.date.slice(0, 10) === today);
    if (remaining.length === 0) {
      autoGenerate();
    }
  }

  async function handlePlayTrack(track: Track) {
    let city = '';
    let weather = 'cloudy';
    let temp = 0;
    let statuses: { emoji: string; label: string }[] = [];
    try {
      const cache = localStorage.getItem('moodvibe-weather-cache');
      if (cache) {
        const { data } = JSON.parse(cache);
        city = data.city || '';
        weather = data.weather || 'cloudy';
        temp = data.temp || 0;
      }
      const statusRaw = localStorage.getItem('moodvibe-daily-status');
      if (statusRaw) {
        const { statuses: s } = JSON.parse(statusRaw);
        statuses = (s || []).map((item: { emoji: string; label: string }) => ({ emoji: item.emoji, label: item.label }));
      }
    } catch {}

    // 提取封面色
    let gradient = { css: 'linear-gradient(135deg, #f0f4ff, #e8f0fe)' };
    if (track.cover) {
      try {
        const res = await fetch(`/api/extract-colors?url=${encodeURIComponent(track.cover)}`);
        const data = await res.json();
        if (data.gradient) gradient = data.gradient;
      } catch {}
    }

    const record: HistoryRecord = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      date: new Date().toISOString(),
      city,
      weather,
      temp,
      statuses,
      song: track.song,
      artist: track.artist,
      cover: track.cover,
      gradient,
      quote: '',
      url: track.url,
      lyric: track.lyric,
      songId: track.id,
    };
    addHistory(record);
    setSongs(getHistory());
    play(record);
    sessionStorage.setItem('moodvibe-player-data', JSON.stringify(record));
    router.push(`/player?id=${record.id}`);
  }

  async function handleOpenPlaylist(pl: Playlist) {
    if (activePlaylist?.id === pl.id) {
      setActivePlaylist(null);
      setPlaylistTracks([]);
      return;
    }
    setActivePlaylist(pl);
    setLoadingTracks(true);
    try {
      const res = await fetch(`/api/playlist-tracks?id=${pl.id}`);
      const data = await res.json();
      setPlaylistTracks(data.tracks || []);
    } catch {
      setPlaylistTracks([]);
    }
    setLoadingTracks(false);
  }

  return (
    <main className="px-5 pt-14 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">音乐</h1>

      {/* 推荐歌单 */}
      <section className="mb-8">
        <h2 className="text-base font-bold text-gray-900 mb-3">推荐歌单</h2>
        {loadingPlaylists ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-36 flex-shrink-0 rounded-2xl bg-white border border-gray-100 p-3 animate-pulse">
                <div className="w-full aspect-square rounded-xl bg-gray-100 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : playlists.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {playlists.map(pl => (
              <button
                key={pl.id}
                onClick={() => handleOpenPlaylist(pl)}
                className={`w-36 flex-shrink-0 rounded-2xl border p-3 text-left transition-all ${
                  activePlaylist?.id === pl.id
                    ? 'bg-[#FFF0E8] border-[#F4A47C]/30'
                    : 'bg-white border-gray-100'
                }`}
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-50 mb-2">
                  <img src={pl.cover} alt={pl.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-xs text-gray-700 line-clamp-2 leading-tight">{pl.name}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-xl mb-2">🎵</p>
            <p className="text-sm text-gray-600">尚未设置状态</p>
            <p className="text-xs text-gray-500 mt-1">在首页设置状态后，为你推荐相关歌单</p>
          </div>
        )}

        {/* 歌单内歌曲 */}
        {activePlaylist && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">{activePlaylist.name}</p>
            {loadingTracks ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white animate-pulse">
                    <div className="w-12 h-12 rounded-xl bg-gray-100" />
                    <div className="flex-1">
                      <div className="h-3.5 bg-gray-100 rounded w-1/2 mb-1.5" />
                      <div className="h-3 bg-gray-100 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {playlistTracks.map(track => (
                  <SongItem
                    key={track.id}
                    song={track.song}
                    artist={track.artist}
                    cover={track.cover}
                    onClick={() => handlePlayTrack(track)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 推荐歌曲 */}
      <section>
        <h2 className="text-base font-bold text-gray-900 mb-3">推荐歌曲</h2>
        {(() => {
          const today = new Date().toISOString().slice(0, 10);
          const musicSongs = songs.filter(r => r.type !== 'place' && r.date.slice(0, 10) === today);
          return musicSongs.length === 0 ? (
            regenerating ? (
              <div className="flex items-center justify-center gap-2 py-12">
                <div className="animate-spin h-5 w-5 border-2 border-gray-200 border-t-gray-500 rounded-full" />
                <span className="text-sm text-gray-500">正在为你生成推荐歌曲...</span>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-2xl mb-2">🎶</p>
                <p className="text-sm text-gray-600">还没有推荐歌曲</p>
                <p className="text-xs text-gray-500 mt-1">在首页设置状态后自动生成</p>
              </div>
            )
          ) : (
            <div className="space-y-2">
              {musicSongs.map(record => (
                <SongItem
                  key={record.id}
                  song={record.song}
                  artist={record.artist}
                  cover={record.cover}
                  onClick={() => handlePlayRecord(record)}
                  onDelete={() => handleDeleteSong(record)}
                />
              ))}
              {regenerating && (
                <div className="flex items-center justify-center gap-2 py-3">
                  <div className="animate-spin h-4 w-4 border-2 border-gray-200 border-t-gray-500 rounded-full" />
                  <span className="text-xs text-gray-400">正在为你重新推荐...</span>
                </div>
              )}
            </div>
          );
        })()}
      </section>
    </main>
  );
}
