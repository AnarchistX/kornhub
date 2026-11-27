// Session-only UI state (windows, selections). Not saved: the game state lives in engine/store.
import { useSyncExternalStore } from 'react';
import type { AppId } from '../engine/types';
import { audio } from '../engine/audio';

export interface Win {
  app: AppId;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
}

interface UiState {
  wins: Win[];
  active: AppId | null; // focused window (desktop) or visible app (compact)
  personnel: string | null; // selected person id
  logFilter: string;
  logTab: 'badge' | 'cams' | 'sessions';
  queueSel: string | null;
  mailSel: string | null;
  menu: boolean;
  confirm: { title: string; text: string; ok: string; onOk: () => void } | null;
  eyeFlash: number;
  title: boolean; // showing the title screen (the saved game stays loaded underneath)
  sysconTab: string | null; // panel an alarm asked SYSCON to show
}

let ui: UiState = {
  title: true,
  sysconTab: null,
  wins: [],
  active: null,
  personnel: null,
  logFilter: '',
  logTab: 'badge',
  queueSel: null,
  mailSel: null,
  menu: false,
  confirm: null,
  eyeFlash: 0,
};

const ls = new Set<() => void>();
const sub = (l: () => void) => {
  ls.add(l);
  return () => {
    ls.delete(l);
  };
};
export const getUi = () => ui;
export function setUi(patch: Partial<UiState>) {
  ui = { ...ui, ...patch };
  ls.forEach((l) => l());
}
export function useUi<T>(sel: (u: UiState) => T): T {
  return useSyncExternalStore(sub, () => sel(ui), () => sel(ui));
}

function defaultGeom(app: AppId, index: number): Omit<Win, 'app' | 'z'> {
  const W = window.innerWidth;
  const H = window.innerHeight - 76; // banners + taskbar
  const clampW = (w: number) => Math.min(w, W - 120);
  const clampH = (h: number) => Math.min(h, H - 30);
  const off = (index % 4) * 26;
  switch (app) {
    case 'queue':
      return { x: 104, y: 14, w: clampW(1040), h: clampH(660) };
    case 'directives':
      return { x: Math.max(104, W - 560 - 20), y: 24 + off, w: clampW(540), h: clampH(600) };
    case 'mail':
      return { x: 150 + off, y: 40 + off, w: clampW(760), h: clampH(520) };
    case 'logs':
      return { x: 170 + off, y: 50 + off, w: clampW(820), h: clampH(540) };
    case 'personnel':
      return { x: 200 + off, y: 36 + off, w: clampW(820), h: clampH(560) };
    case 'notes':
      return { x: Math.max(104, W - 520 - 30), y: 60 + off, w: clampW(500), h: clampH(520) };
    case 'terminal':
      return { x: 130 + off, y: 30 + off, w: clampW(860), h: clampH(600) };
    case 'board':
      return { x: 120 + off, y: 20 + off, w: clampW(900), h: clampH(660) };
    case 'syscon':
      return { x: Math.max(104, W - 760 - 24), y: 14, w: clampW(760), h: clampH(700) };
  }
}

/** Bring `app` to the top and renumber z from 1 so window layers never climb over popups. */
function raised(wins: Win[], app: AppId): Win[] {
  const order = [...wins].sort((a, b) => a.z - b.z).filter((w) => w.app !== app);
  const top = wins.find((w) => w.app === app);
  const stack = top ? [...order, top] : order;
  return wins.map((w) => ({ ...w, z: stack.findIndex((x) => x.app === w.app) + 1 }));
}

export function openApp(app: AppId, extra?: Partial<UiState>) {
  const existing = ui.wins.find((w) => w.app === app);
  if (existing) {
    setUi({ ...extra, wins: raised(ui.wins, app), active: app });
    return;
  }
  audio.play('open');
  const win: Win = { app, z: ui.wins.length + 1, ...defaultGeom(app, ui.wins.length) };
  setUi({ ...extra, wins: raised([...ui.wins, win], app), active: app });
}

export function closeApp(app: AppId) {
  audio.play('close');
  const wins = ui.wins.filter((w) => w.app !== app);
  const top = [...wins].sort((a, b) => b.z - a.z)[0];
  setUi({ wins, active: top ? top.app : null });
}

export function focusApp(app: AppId) {
  const top = Math.max(0, ...ui.wins.map((w) => w.z));
  if (ui.active === app && ui.wins.find((w) => w.app === app)?.z === top) return;
  setUi({ wins: raised(ui.wins, app), active: app });
}

export function moveWin(app: AppId, patch: Partial<Win>) {
  setUi({ wins: ui.wins.map((w) => (w.app === app ? { ...w, ...patch } : w)) });
}

export function confirmDialog(title: string, text: string, ok: string, onOk: () => void) {
  audio.play('beep');
  setUi({ confirm: { title, text, ok, onOk } });
}

export function flashEye() {
  setUi({ eyeFlash: ui.eyeFlash + 1 });
}

export function resetUi() {
  setUi({ wins: [], active: null, personnel: null, logFilter: '', queueSel: null, mailSel: null, menu: false, confirm: null });
}
