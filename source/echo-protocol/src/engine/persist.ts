import type { GameState, Settings } from './types';

const SAVE = 'kxrnage.echo.save.v1';
const CHECKPOINT = 'kxrnage.echo.checkpoint.v1';
const SETTINGS = 'kxrnage.echo.settings.v1';

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode or storage full: the game still runs, it just won't persist */
  }
}

function valid(s: GameState | null): s is GameState {
  return !!s && s.v === 1 && !!s.profile && !!s.night;
}

export const loadSave = () => {
  const s = read<GameState>(SAVE);
  return valid(s) ? s : null;
};
export const writeSave = (s: GameState) => write(SAVE, s);
export const loadCheckpoint = () => {
  const s = read<GameState>(CHECKPOINT);
  return valid(s) ? s : null;
};
export const writeCheckpoint = (s: GameState) => write(CHECKPOINT, s);
/** A second, longer-lived checkpoint at a night that matters (the Act II choice), for replays. */
export const writeCheckpointAt = (n: number, s: GameState) => write(`${CHECKPOINT}.n${n}`, s);
export const loadCheckpointAt = (n: number) => {
  const s = read<GameState>(`${CHECKPOINT}.n${n}`);
  return valid(s) ? s : null;
};

const ENDINGS = 'kxrnage.echo.endings.v1';
/** Endings seen on this device, across playthroughs. */
export const foundEndings = (): string[] => read<string[]>(ENDINGS) ?? [];
export const recordEnding = (id: string) => {
  const all = foundEndings();
  if (!all.includes(id)) write(ENDINGS, [...all, id]);
};
export function clearSaves() {
  try {
    window.localStorage.removeItem(SAVE);
    window.localStorage.removeItem(CHECKPOINT);
    window.localStorage.removeItem(`${CHECKPOINT}.n9`);
  } catch {
    /* ignore */
  }
}

export const DEFAULT_SETTINGS: Settings = { master: 0.8, music: 0.7, sfx: 0.8, ambience: 0.7, crt: 1, textSpeed: 1 };
export const loadSettings = (): Settings => ({ ...DEFAULT_SETTINGS, ...(read<Partial<Settings>>(SETTINGS) ?? {}) });
export const writeSettings = (s: Settings) => write(SETTINGS, s);
