'use client';

import { useState } from 'react';
import type { HistoryRecord } from '@/lib/types';

function getWeatherEmoji(weather: string): string {
  if (weather === 'sunny') return '☀️';
  if (weather === 'rainy') return '🌧️';
  if (weather === 'snowy') return '❄️';
  return '☁️';
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

interface StatusGroup {
  time: string;
  statuses: { emoji: string; label: string }[];
  records: HistoryRecord[];
}

function groupByStatus(records: HistoryRecord[]): StatusGroup[] {
  const groups: StatusGroup[] = [];
  for (const r of records) {
    const statusKey = r.statuses.map(s => s.emoji + s.label).join(',');
    const last = groups[groups.length - 1];
    if (last && last.statuses.map(s => s.emoji + s.label).join(',') === statusKey) {
      last.records.push(r);
    } else {
      groups.push({ time: formatTime(r.date), statuses: r.statuses, records: [r] });
    }
  }
  return groups;
}

export interface DayGroup {
  date: string;
  records: HistoryRecord[];
}

export function groupByDate(records: HistoryRecord[]): DayGroup[] {
  const map = new Map<string, HistoryRecord[]>();
  for (const r of records) {
    const day = r.date.slice(0, 10);
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(r);
  }
  return Array.from(map.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, records]) => ({ date, records }));
}

interface Props {
  group: DayGroup;
  onPlayRecord: (record: HistoryRecord) => void;
  onDeleteRecord: (record: HistoryRecord) => void;
  onViewPlace?: (record: HistoryRecord) => void;
}

export default function HistoryCard({ group, onPlayRecord, onDeleteRecord, onViewPlace }: Props) {
  const [expanded, setExpanded] = useState(false);
  const sorted = [...group.records].sort((a, b) => b.date.localeCompare(a.date));
  const latest = sorted[0];
  const allStatuses = Array.from(
    new Map(sorted.flatMap(r => r.statuses).map(s => [`${s.emoji}${s.label}`, s])).values()
  );

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
      {/* 聚合卡片头部 */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 flex items-center gap-3"
      >
        {/* 封面堆叠 */}
        <div className="relative w-12 h-12 flex-shrink-0">
          {sorted.slice(0, 3).map((r, i) => (
            <div
              key={r.id}
              className="absolute w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-white shadow-sm"
              style={{ left: i * 4, top: i * 4, zIndex: 3 - i }}
            >
              {r.cover ? (
                <img src={r.cover} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-bold text-gray-700 font-serif">{formatDate(latest.date)}</span>
            <span className="text-sm">{getWeatherEmoji(latest.weather)}</span>
            <span className="text-xs text-gray-400">{latest.temp}°</span>
          </div>
          <div className="flex items-center gap-1 mt-1 flex-wrap">
            {allStatuses.slice(0, 3).map((s, i) => (
              <span key={i} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full text-gray-500">
                {s.emoji} {s.label}
              </span>
            ))}
            {allStatuses.length > 3 && (
              <span className="text-xs text-gray-400">+{allStatuses.length - 3}</span>
            )}
          </div>
        </div>

        {/* 记录数 + 展开箭头 */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-xs text-gray-400">
            {(() => {
              const songs = group.records.filter(r => r.type !== 'place').length;
              const places = group.records.filter(r => r.type === 'place').length;
              const parts: string[] = [];
              if (songs > 0) parts.push(`${songs}首`);
              if (places > 0) parts.push(`${places}地`);
              return parts.join(' ') || '0首';
            })()}
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* 展开的详细列表：按时间+状态聚合 */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-4">
          {groupByStatus(sorted).map((seg, idx) => (
            <div key={idx}>
              {/* 时间 + 状态（只显示一次） */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs text-gray-400 font-mono">{seg.time}</span>
                <div className="flex items-center gap-1 flex-wrap">
                  {seg.statuses.map((s, i) => (
                    <span key={i} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full text-gray-500">
                      {s.emoji} {s.label}
                    </span>
                  ))}
                </div>
              </div>
              {/* 该组下的记录 */}
              <div className="space-y-1 pl-10">
                {seg.records.map(record => (
                  <div key={record.id} className="flex items-center gap-1">
                    {record.type === 'place' ? (
                      <button
                        onClick={() => onViewPlace?.(record)}
                        className="flex-1 flex items-center gap-2.5 py-1.5 px-2 rounded-xl active:bg-gray-100 transition-colors min-w-0"
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#E8F5F0] flex-shrink-0 flex items-center justify-center">
                          {record.placePhoto ? (
                            <img src={record.placePhoto} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-3.5 h-3.5 text-[#6BB5A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm text-gray-700 truncate">{record.placeName}</p>
                          <p className="text-[10px] text-gray-400 truncate">{record.placeAddress}</p>
                        </div>
                        <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={() => onPlayRecord(record)}
                        className="flex-1 flex items-center gap-2.5 py-1.5 px-2 rounded-xl active:bg-gray-100 transition-colors min-w-0"
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {record.cover ? (
                            <img src={record.cover} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-3.5 h-3.5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm text-gray-700 truncate">{record.song} - {record.artist}</p>
                        </div>
                        <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteRecord(record); }}
                      className="p-1.5 text-gray-300 hover:text-red-400 flex-shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
