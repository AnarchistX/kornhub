import { useSyncExternalStore } from 'react';
import type { AccessTicket, Decision, DirectiveId, GameState, NightDef, NightState, NoteItem, Profile, Screen, Settings } from './types';
import { FREE_ERRORS, LAST_BUILT_NIGHT, MAX_WRITEUPS, NIGHTS, SHIFT_MINUTES } from '../content/nights';
import { judgeAccess } from './rules';
import { audio, type Sfx } from './audio';
import { clearSaves, loadCheckpoint, loadSave, loadSettings, writeCheckpoint, writeSave, writeSettings } from './persist';

// ---------------------------------------------------------------- state

function freshNight(def: NightDef): NightState {
  return {
    n: def.n,
    minute: 0,
    started: false,
    ended: false,
    arrived: [],
    results: {},
    mails: [],
    read: [],
    directives: [...def.directives],
    newDirectives: [],
    errors: 0,
    netsends: [],
    popup: null,
    notices: [],
    introDone: false,
  };
}

function initialState(profile: Profile | null = null): GameState {
  return {
    v: 1,
    screen: 'title',
    cutscene: null,
    next: null,
    profile,
    night: freshNight(NIGHTS[1]),
    writeups: 0,
    suspicion: 0,
    flags: {},
    notes: [],
    scratch: '',
    reports: [],
    ending: null,
  };
}

const saved = typeof window !== 'undefined' ? loadSave() : null;
let state: GameState = saved ?? initialState();
export const hadSave = !!saved;

const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export const getState = () => state;

function set(next: GameState) {
  if (next === state) return;
  state = next;
  listeners.forEach((l) => l());
  scheduleSave();
}

export function useGame<T>(select: (s: GameState) => T): T {
  return useSyncExternalStore(subscribe, () => select(state), () => select(state));
}

export const nightDef = (s: GameState = state) => NIGHTS[s.night.n];

// ---------------------------------------------------------------- persistence

let saveTimer: number | null = null;
function scheduleSave() {
  if (!state.profile) return;
  if (saveTimer) window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(flushSave, 400);
}
export function flushSave() {
  if (saveTimer) {
    window.clearTimeout(saveTimer);
    saveTimer = null;
  }
  if (state.profile) writeSave(state);
}

// ---------------------------------------------------------------- settings

let settings: Settings = typeof window !== 'undefined' ? loadSettings() : loadSettingsFallback();
function loadSettingsFallback(): Settings {
  return { master: 0.8, music: 0.7, sfx: 0.8, ambience: 0.7, crt: 1, textSpeed: 1 };
}
const settingListeners = new Set<() => void>();
audio.apply(settings);

export function useSettings(): Settings {
  return useSyncExternalStore(
    (l) => {
      settingListeners.add(l);
      return () => {
        settingListeners.delete(l);
      };
    },
    () => settings,
    () => settings,
  );
}
export const getSettings = () => settings;
export function setSettings(patch: Partial<Settings>) {
  settings = { ...settings, ...patch };
  writeSettings(settings);
  audio.apply(settings);
  settingListeners.forEach((l) => l());
}

// ---------------------------------------------------------------- helpers

const sfx = (...names: Sfx[]) => names.forEach((n, i) => window.setTimeout(() => audio.play(n), i * 140));

function patchNight(s: GameState, patch: Partial<NightState>): GameState {
  return { ...s, night: { ...s.night, ...patch } };
}

/** Deliver everything due at the current minute: tickets, mail, messenger popups. */
function deliver(s: GameState): { s: GameState; sounds: Sfx[] } {
  const def = nightDef(s);
  const n = s.night;
  const sounds: Sfx[] = [];
  let arrived = n.arrived;
  let mails = n.mails;
  let directives = n.directives;
  let newDirectives = n.newDirectives;
  let popup = n.popup;
  let netsends = n.netsends;
  for (const t of def.tickets) {
    if (t.at <= n.minute && !arrived.includes(t.id)) {
      arrived = [...arrived, t.id];
      sounds.push('ticket');
    }
  }
  for (const m of def.mails) {
    if (m.at <= n.minute && !mails.includes(m.id) && (!m.when || m.when(s))) {
      mails = [...mails, m.id];
      sounds.push('mail');
      for (const d of m.unlocks ?? []) {
        if (!directives.includes(d)) {
          directives = [...directives, d];
          newDirectives = [...newDirectives, d];
        }
      }
    }
  }
  if (!popup) {
    const due = def.netsends.find((x) => x.at <= n.minute && !netsends.includes(x.id));
    if (due) {
      netsends = [...netsends, due.id];
      popup = due.id;
      sounds.push('netsend');
    }
  }
  if (arrived === n.arrived && mails === n.mails && popup === n.popup) return { s, sounds };
  return { s: patchNight(s, { arrived, mails, directives, newDirectives, popup, netsends }), sounds };
}

// ---------------------------------------------------------------- flow actions

export function go(screen: Screen) {
  set({ ...state, screen });
}

export function playCutscene(id: string, next: Screen) {
  set({ ...state, screen: 'cutscene', cutscene: id, next });
}

export function cutsceneDone() {
  set({ ...state, screen: state.next ?? 'title', cutscene: null, next: null });
}

/** Wipe the current run (used by "New game" when a save exists). */
export function resetGame() {
  clearSaves();
  state = initialState();
  listeners.forEach((l) => l());
}

export function newGame(profile: Profile) {
  const s = initialState(profile);
  set({ ...s, screen: 'cutscene', cutscene: 'prologue', next: 'card' });
  writeCheckpoint(state);
  flushSave();
}

export function beginNight(n: number) {
  const def = NIGHTS[n];
  const s = { ...state, night: freshNight(def), screen: 'card' as Screen };
  set(s);
  writeCheckpoint(s);
}

export function restartNight() {
  const cp = loadCheckpoint();
  if (!cp) return;
  set({ ...cp, screen: 'card' });
}

export function dismissIntro() {
  set(patchNight(state, { introDone: true, started: true }));
  const r = deliver(state);
  set(r.s);
}

export function tick() {
  const n = state.night;
  if (!n.started || n.ended || n.popup) return;
  let s = patchNight(state, { minute: n.minute + 1 });
  const r = deliver(s);
  s = r.s;
  if (s.night.minute >= SHIFT_MINUTES && !s.night.popup) {
    s = patchNight(s, { ended: true });
  }
  set(s);
  sfx(...r.sounds);
}

export function closePopup() {
  let s = patchNight(state, { popup: null });
  if (s.night.minute >= SHIFT_MINUTES) s = patchNight(s, { ended: true });
  set(s);
  audio.play('click');
}

export function finishShift() {
  const def = nightDef();
  const n = state.night;
  const counted = def.tickets.filter((t) => t.kind === 'access' && !t.tutorial);
  const processed = def.tickets.filter((t) => n.results[t.id]).length;
  const correct = counted.filter((t) => n.results[t.id]?.correct).length;
  const report = {
    n: n.n,
    processed,
    total: def.tickets.length,
    correct,
    errors: n.errors,
    writeups: n.notices.filter((x) => x.kind === 'writeup').length,
  };
  set({ ...state, reports: [...state.reports.filter((r) => r.n !== n.n), report], screen: 'report' });
  flushSave();
}

export function afterReport() {
  const n = state.night.n;
  if (n >= LAST_BUILT_NIGHT) {
    playCutscene('dawn', 'tbc');
    return;
  }
  beginNight(n + 1);
  playCutscene('dawn', 'card');
}

export function endGame(ending: string) {
  set({ ...state, ending, screen: 'ending' });
  flushSave();
}

// ---------------------------------------------------------------- desk actions

export function decideAccess(id: string, decision: Decision, cite?: DirectiveId) {
  const def = nightDef();
  const t = def.tickets.find((x) => x.id === id) as AccessTicket | undefined;
  if (!t || state.night.results[id]) return;
  const j = judgeAccess(t, state.profile, decision, cite);
  const n = state.night;
  let errors = n.errors;
  let writeups = state.writeups;
  let notices = n.notices;
  if (!j.correct && !t.tutorial) {
    errors += 1;
    const kind = errors > FREE_ERRORS ? 'writeup' : 'warning';
    if (kind === 'writeup') writeups += 1;
    notices = [...notices, { id: `${t.id}-notice`, kind, ref: t.ref, text: j.error ?? 'Procedural error.' }];
  }
  const results = { ...n.results, [id]: { decision, cite, correct: j.correct, error: j.error, at: n.minute } };
  set({ ...state, writeups, night: { ...n, errors, notices, results } });
  audio.play('stamp');
  if (!j.correct && !t.tutorial) window.setTimeout(() => audio.play('printer'), 450);
}

export function dismissNotice(id: string) {
  set(patchNight(state, { notices: state.night.notices.filter((x) => x.id !== id) }));
  if (state.writeups >= MAX_WRITEUPS) endGame('terminated');
}

export function resolveAlert(id: string, choice: 'log' | 'escalate') {
  if (state.night.results[id]) return;
  const n = state.night;
  const results = { ...n.results, [id]: { decision: choice, correct: true, at: n.minute } };
  const flags = { ...state.flags, n1_whitlock: choice === 'log' ? 'logged' : 'escalated' };
  const r = deliver({ ...state, flags, night: { ...n, results } });
  set(r.s);
  audio.play(choice === 'log' ? 'beep' : 'stamp');
  sfx(...r.sounds);
}

export function markRead(id: string) {
  if (state.night.read.includes(id)) return;
  set(patchNight(state, { read: [...state.night.read, id] }));
}

export function seenDirectives() {
  if (state.night.newDirectives.length) set(patchNight(state, { newDirectives: [] }));
}

export function setFlag(key: string, value: string | number | boolean) {
  if (state.flags[key] === value) return;
  set({ ...state, flags: { ...state.flags, [key]: value } });
}

export function addSuspicion(amount: number) {
  set({ ...state, suspicion: Math.max(0, Math.min(100, state.suspicion + amount)) });
}

export function addNote(note: Omit<NoteItem, 'night'>) {
  if (state.notes.some((x) => x.id === note.id)) return false;
  set({ ...state, notes: [...state.notes, { ...note, night: state.night.n }] });
  return true;
}

export function setScratch(text: string) {
  set({ ...state, scratch: text });
}

// ---------------------------------------------------------------- lifecycle

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flushSave);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) flushSave();
  });
}
