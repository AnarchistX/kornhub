import { useSyncExternalStore } from 'react';
import type { CallDef, Decision, DirectiveId, Effect, GameState, MailDef, NightDef, NightState, NoteItem, Profile, Screen, Settings } from './types';
import { FREE_ERRORS, LAST_BUILT_NIGHT, MAX_WRITEUPS, NIGHTS, SHIFT_MINUTES } from '../content/nights';
import { GLOBAL_CALLS, GLOBAL_MAILS } from '../content/global';
import { judge } from './rules';
import { thresholds, withEffect } from './effects';
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
    calls: [],
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

/** Saves from before Night 2 existed lack newer fields; fill them in. */
function migrate(s: GameState): GameState {
  const m = { ...s, night: { ...freshNight(NIGHTS[s.night.n] ?? NIGHTS[1]), ...s.night, calls: s.night.calls ?? [] } };
  // A save parked on the old "end of build" screen continues into the next night instead.
  if (m.screen === 'tbc' && m.night.n < LAST_BUILT_NIGHT) return { ...m, screen: 'card', night: { ...m.night, ended: true } };
  return m;
}

const saved = typeof window !== 'undefined' ? loadSave() : null;
let state: GameState = saved ? migrate(saved) : initialState();
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
export const allMails = (def: NightDef): MailDef[] => [...def.mails, ...GLOBAL_MAILS];
export const allCalls = (def: NightDef): CallDef[] => [...def.calls, ...GLOBAL_CALLS];

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

let settings: Settings = typeof window !== 'undefined' ? loadSettings() : { master: 0.8, music: 0.7, sfx: 0.8, ambience: 0.7, crt: 1, textSpeed: 1 };
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

// ---------------------------------------------------------------- pure helpers

const sfx = (...names: Sfx[]) => names.forEach((n, i) => window.setTimeout(() => audio.play(n), i * 140));

function patchNight(s: GameState, patch: Partial<NightState>): GameState {
  return { ...s, night: { ...s.night, ...patch } };
}

/** Deliver everything due at the current minute: tickets, mail, messenger popups, calls. */
function deliver(s: GameState): { s: GameState; sounds: Sfx[] } {
  const def = nightDef(s);
  let cur = s;
  const sounds: Sfx[] = [];
  const n0 = cur.night;
  let arrived = n0.arrived;
  for (const t of def.tickets) {
    if (t.at <= n0.minute && !arrived.includes(t.id)) {
      arrived = [...arrived, t.id];
      sounds.push('ticket');
    }
  }
  if (arrived !== n0.arrived) cur = patchNight(cur, { arrived });

  for (const m of allMails(def)) {
    const n = cur.night;
    if (m.at <= n.minute && !n.mails.includes(m.id) && (!m.when || m.when(cur))) {
      let directives = n.directives;
      let newDirectives = n.newDirectives;
      for (const d of m.unlocks ?? []) {
        if (!directives.includes(d)) {
          directives = [...directives, d];
          newDirectives = [...newDirectives, d];
        }
      }
      cur = withEffect(patchNight(cur, { mails: [...n.mails, m.id], directives, newDirectives }), m.effect);
      sounds.push('mail');
    }
  }

  if (!cur.night.popup) {
    const n = cur.night;
    const ns = def.netsends.find((x) => x.at <= n.minute && !n.netsends.includes(x.id) && (!x.when || x.when(cur)));
    const call = allCalls(def).find((c) => c.at <= n.minute && !n.calls.includes(c.id) && (!c.when || c.when(cur)));
    if (ns && (!call || ns.at <= call.at)) {
      cur = withEffect(patchNight(cur, { netsends: [...n.netsends, ns.id], popup: ns.id }), ns.effect);
      sounds.push('netsend');
    } else if (call) {
      cur = patchNight(cur, { calls: [...n.calls, call.id], popup: call.id });
      sounds.push('ring');
    }
  }
  return { s: cur, sounds };
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
  set({ ...migrate(cp), screen: 'card' });
}

export function dismissIntro() {
  const r = deliver(patchNight(state, { introDone: true, started: true }));
  set(r.s);
  sfx(...r.sounds);
}

export function tick() {
  const n = state.night;
  if (!n.started || n.ended || n.popup) return;
  let s = patchNight(state, { minute: n.minute + 1 });
  const def = nightDef(s);
  if (def.onTick) s = thresholds(def.onTick(s));
  const r = deliver(s);
  s = r.s;
  if (s.night.minute >= SHIFT_MINUTES && !s.night.popup) s = patchNight(s, { ended: true });
  set(s);
  sfx(...r.sounds);
  if (s.suspicion >= 100 && s.screen === 'desktop') endGame('detained');
}

export function closePopup() {
  let s = patchNight(state, { popup: null });
  if (s.night.minute >= SHIFT_MINUTES) s = patchNight(s, { ended: true });
  const r = deliver(s);
  set(r.s);
  audio.play('click');
  sfx(...r.sounds);
  if (state.suspicion >= 100) endGame('detained');
}

/** Apply a story effect right now (call choices, copying evidence, terminal actions). */
export function applyEffect(e: Effect) {
  const r = deliver(withEffect(state, e));
  set(r.s);
  sfx(...r.sounds);
  if (state.suspicion >= 100 && !state.night.popup) endGame('detained');
}

export function finishShift() {
  const def = nightDef();
  const n = state.night;
  const counted = def.tickets.filter((t) => t.kind !== 'alert' && !t.tutorial);
  const report = {
    n: n.n,
    processed: def.tickets.filter((t) => n.results[t.id]).length,
    total: def.tickets.length,
    correct: counted.filter((t) => n.results[t.id]?.correct).length,
    counted: counted.length,
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
  // Keep the finished night on screen for the dawn cutscene, then start the next one.
  playCutscene('dawn', 'card');
}

/** Called when the dawn cutscene hands over to the next night's card. */
export function advanceNight() {
  const n = state.night.n;
  if (n < LAST_BUILT_NIGHT && state.screen === 'card' && state.night.ended) beginNight(n + 1);
}

export function endGame(ending: string) {
  set({ ...state, ending, screen: 'ending' });
  flushSave();
}

// ---------------------------------------------------------------- desk actions

export function decide(id: string, decision: Decision, cite?: DirectiveId) {
  const def = nightDef();
  const t = def.tickets.find((x) => x.id === id);
  if (!t || t.kind === 'alert' || state.night.results[id]) return;
  const j = judge(t, state.profile, def, decision, cite);
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
  const r = deliver({ ...state, writeups, night: { ...n, errors, notices, results } });
  set(r.s);
  audio.play('stamp');
  if (!j.correct && !t.tutorial) window.setTimeout(() => audio.play('printer'), 450);
  sfx(...r.sounds);
}

export function dismissNotice(id: string) {
  set(patchNight(state, { notices: state.night.notices.filter((x) => x.id !== id) }));
  if (state.writeups >= MAX_WRITEUPS) endGame('terminated');
}

export function resolveAlert(id: string, choice: 'log' | 'escalate') {
  const t = nightDef().tickets.find((x) => x.id === id);
  if (!t || t.kind !== 'alert' || state.night.results[id]) return;
  const n = state.night;
  const results = { ...n.results, [id]: { decision: choice, correct: true, at: n.minute } };
  const flags = { ...state.flags, [t.flag]: choice === 'log' ? 'logged' : 'escalated' };
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
