'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HistoryCard, { groupByDate } from '@/components/HistoryCard';
import { getHistory, deleteHistoryRecord } from '@/lib/history';
import type { HistoryRecord } from '@/lib/types';

export default function RecordsPage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  function handlePlayRecord(record: HistoryRecord) {
    sessionStorage.setItem('moodvibe-player-data', JSON.stringify(record));
    router.push(`/player?id=${record.id}`);
  }

  function handleDeleteRecord(record: HistoryRecord) {
    deleteHistoryRecord(record.id);
    setHistory(getHistory());
  }

  function handleViewPlace(record: HistoryRecord) {
    if (record.placeName) {
      sessionStorage.setItem('moodvibe-highlight-place', record.placeName);
      if (record.placeAddress) {
        sessionStorage.setItem('moodvibe-highlight-place-address', record.placeAddress);
      }
      if (record.placePhoto) {
        sessionStorage.setItem('moodvibe-highlight-place-photo', record.placePhoto);
      }
      if (record.placeLat && record.placeLng) {
        sessionStorage.setItem('moodvibe-highlight-place-location', JSON.stringify({
          lat: record.placeLat,
          lng: record.placeLng,
        }));
      }
      router.push('/explore');
    }
  }

  return (
    <main className="px-5 pt-14 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">记录</h1>

      {history.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-2xl mb-2">🎵</p>
          <p className="text-sm text-gray-600">还没有记录</p>
          <p className="text-xs text-gray-500 mt-1">设个状态，生成你的第一首歌吧</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groupByDate(history).map(group => (
            <HistoryCard
              key={group.date}
              group={group}
              onPlayRecord={handlePlayRecord}
              onDeleteRecord={handleDeleteRecord}
              onViewPlace={handleViewPlace}
            />
          ))}
        </div>
      )}
    </main>
  );
}
