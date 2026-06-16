import type { HistoryRecord } from './types';

const STORAGE_KEY = 'moodvibe-history';
const MAX_RECORDS = 100;

export function getHistory(): HistoryRecord[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as HistoryRecord[];
  } catch {
    return [];
  }
}

export function addHistory(record: HistoryRecord): void {
  const history = getHistory();
  history.unshift(record);
  if (history.length > MAX_RECORDS) history.length = MAX_RECORDS;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function getHistoryById(id: string): HistoryRecord | undefined {
  return getHistory().find(r => r.id === id);
}

export function updateHistoryRecord(id: string, updates: Partial<HistoryRecord>): void {
  const history = getHistory();
  const index = history.findIndex(r => r.id === id);
  if (index >= 0) {
    history[index] = { ...history[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }
}

export function deleteHistoryRecord(id: string): void {
  const history = getHistory().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}
