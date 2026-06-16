'use client';

import { useState, useEffect } from 'react';
import { statusCategories } from '@/lib/status-data';
import type { StatusItem } from '@/lib/types';

const STORAGE_KEY = 'moodvibe-daily-status';

function loadStatuses(): StatusItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const { date, statuses } = JSON.parse(raw);
    if (date === new Date().toISOString().slice(0, 10)) return statuses;
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  return [];
}

function saveStatuses(statuses: StatusItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    date: new Date().toISOString().slice(0, 10),
    statuses,
  }));
}

interface Props {
  selectedStatuses: StatusItem[];
  onStatusChange: (statuses: StatusItem[]) => void;
  onConfirm: (statuses: StatusItem[]) => void;
}

export default function StatusCard({ selectedStatuses, onStatusChange, onConfirm }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState<StatusItem[]>([]);

  useEffect(() => {
    const loaded = loadStatuses();
    if (loaded.length > 0) onStatusChange(loaded);
  }, []);

  function openEditor() {
    setDraft([...selectedStatuses]);
    setExpanded(true);
  }

  function toggleDraft(item: StatusItem) {
    const exists = draft.find(s => s.id === item.id);
    setDraft(exists ? draft.filter(s => s.id !== item.id) : [...draft, item]);
  }

  function handleConfirm() {
    onStatusChange(draft);
    saveStatuses(draft);
    setExpanded(false);
    onConfirm(draft);
  }

  function removeStatus(item: StatusItem) {
    const updated = selectedStatuses.filter(s => s.id !== item.id);
    onStatusChange(updated);
    saveStatuses(updated);
  }

  if (selectedStatuses.length === 0 && !expanded) {
    return (
      <button
        onClick={openEditor}
        className="w-full bg-white rounded-3xl p-5 shadow-sm border border-gray-100 text-center"
      >
        <div className="flex flex-col items-center gap-3 py-4">
          <span className="text-3xl">😊</span>
          <p className="text-sm text-gray-500">你的心情是？</p>
          <span className="inline-block px-6 py-2 bg-[#2C2C2C] text-white text-xs font-medium rounded-full">记录心情</span>
        </div>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
      {/* 标题行 + 操作按钮 */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-base font-bold text-gray-900 font-serif">当前状态</p>
        <button
          onClick={expanded ? () => setExpanded(false) : openEditor}
          className="text-[10px] text-gray-400 hover:text-gray-600"
        >
          {expanded ? '取消' : '修改状态'}
        </button>
      </div>

      {/* 已选状态（非编辑模式） */}
      {!expanded && selectedStatuses.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedStatuses.map(s => (
            <span
              key={s.id}
              onClick={() => removeStatus(s)}
              className="inline-flex items-center gap-1 px-3 py-1 bg-[#FFF0E8] border border-[#F4A47C]/30 rounded-full text-[13px] text-[#D4845C] cursor-pointer active:bg-[#FFE5D6]"
            >
              {s.emoji} {s.label} ×
            </span>
          ))}
        </div>
      )}

      {/* 编辑模式：状态网格 + 确定按钮 */}
      {expanded && (
        <>
          {/* 编辑中已选预览 */}
          {draft.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {draft.map(s => (
                <span
                  key={s.id}
                  onClick={() => toggleDraft(s)}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-[#FFF0E8] border border-[#F4A47C]/30 rounded-full text-[13px] text-[#D4845C] cursor-pointer active:bg-[#FFE5D6]"
                >
                  {s.emoji} {s.label} ×
                </span>
              ))}
            </div>
          )}

          <div className="space-y-4 mt-2 max-h-[50vh] overflow-y-auto">
            {statusCategories.map(category => (
              <div key={category.name}>
                <p className="text-xs text-gray-400 font-medium mb-2">{category.name}</p>
                <div className="grid grid-cols-5 gap-2">
                  {category.items.map(item => {
                    const isSelected = draft.some(s => s.id === item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleDraft(item)}
                        className={`flex flex-col items-center gap-1 py-2.5 rounded-2xl text-xs transition-all ${
                          isSelected
                            ? 'bg-[#FFF0E8] border border-[#F4A47C]/50 text-[#D4845C]'
                            : 'bg-gray-50 border border-transparent text-gray-600 active:bg-gray-100'
                        }`}
                      >
                        <span className="text-xl">{item.emoji}</span>
                        <span className="truncate w-full text-center px-0.5">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* 确定按钮 */}
          <button
            onClick={handleConfirm}
            disabled={draft.length === 0}
            className="w-full mt-4 py-3 rounded-full bg-[#2C2C2C] text-white text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] transition-transform shadow-sm"
          >
            确定
          </button>
        </>
      )}
    </div>
  );
}
