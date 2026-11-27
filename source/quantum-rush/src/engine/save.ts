// Progress and settings in localStorage. Everything still works if storage is unavailable.
import { SKINS, TRAILS, type Need } from '../game/skins';

export interface LevelProgress {
  cleared: boolean;
  best: number; // 0..1
  practiceBest: number;
  attempts: number;
  shards: number; // bitmask of shards ever collected on a clear
  endless: number; // best beats in endless
}

export interface SaveData {
  v: 1;
  levels: Record<string, LevelProgress>;
  skin: string;
  trail: string;
  seenUnlocks: string[];
}

export interface Settings {
  music: number;
  sfx: number;
  reduced: boolean;
  offsetMs: number;
}

const SAVE = 'kxrnage.qr.save.v1';
const SETTINGS = 'kxrnage.qr.settings.v1';

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function write(key: string, v: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* private mode */
  }
}

export const emptyProgress = (): LevelProgress => ({ cleared: false, best: 0, practiceBest: 0, attempts: 0, shards: 0, endless: 0 });

export function loadSave(): SaveData {
  const s = read<SaveData>(SAVE);
  if (s && s.v === 1 && s.levels) return { ...s, seenUnlocks: s.seenUnlocks ?? [] };
  return { v: 1, levels: {}, skin: 'volt', trail: 'ribbon', seenUnlocks: [] };
}
export const storeSave = (s: SaveData) => write(SAVE, s);

export const DEFAULT_SETTINGS: Settings = { music: 0.85, sfx: 0.7, reduced: false, offsetMs: 0 };
export const loadSettings = (): Settings => ({ ...DEFAULT_SETTINGS, ...(read<Partial<Settings>>(SETTINGS) ?? {}) });
export const storeSettings = (s: Settings) => write(SETTINGS, s);

export const progressOf = (s: SaveData, id: string): LevelProgress => s.levels[id] ?? emptyProgress();
export const clears = (s: SaveData) => Object.values(s.levels).filter((l) => l.cleared).length;
export const shardCount = (s: SaveData) => Object.values(s.levels).reduce((n, l) => n + popcount(l.shards), 0);
export const popcount = (n: number) => ((n & 1) + ((n >> 1) & 1) + ((n >> 2) & 1)) | 0;

export function meets(s: SaveData, need: Need): boolean {
  switch (need.kind) {
    case 'free':
      return true;
    case 'clears':
      return clears(s) >= need.n;
    case 'shards':
      return shardCount(s) >= need.n;
    case 'level':
      return !!s.levels[need.id]?.cleared;
  }
}

/** Items unlocked now that weren't announced before. */
export function newUnlocks(s: SaveData): string[] {
  const out: string[] = [];
  for (const k of SKINS) if (meets(s, k.need) && k.need.kind !== 'free' && !s.seenUnlocks.includes(`skin:${k.id}`)) out.push(`skin:${k.id}`);
  for (const t of TRAILS) if (meets(s, t.need) && t.need.kind !== 'free' && !s.seenUnlocks.includes(`trail:${t.id}`)) out.push(`trail:${t.id}`);
  return out;
}
