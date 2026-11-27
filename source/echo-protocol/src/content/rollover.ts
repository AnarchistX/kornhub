// Act III · the rollover. A small, pure simulation of the three things that happen at midnight
// (the convoy at Gate 1, RECSYS-Y2K-0047, the B3 air handlers), driven by Night 10's onTick.
// SYSCON applies the player's actions as Effects built here; the ending is resolved from the result.
import type { Effect, GameState } from '../engine/types';

/** Game minutes after 22:00. */
export const T = {
  syscon: 4, // 22:04 the console comes up
  convoy: 90, // 23:30 the convoy asks for Gate 1
  job: 110, // 23:50 RECSYS-Y2K-0047 runs
  rollover: 120, // 00:00
  window: 150, // 00:30 the transfer window closes
  end: 180, // 01:00
};

/** Remote override attempts on a held gate. */
export const OVERRIDES = [100, 108, 116, 124, 132, 141];
export const GRACE = 4; // minutes to deny an override before it goes through
export const PA_START = -42; // B3 differential pressure, pascals (negative = contained)
export const PA_SAFE = -40;
export const PA_WARN = -15;

export type Gate = 'closed' | 'requested' | 'held' | 'released' | 'forced' | 'expired';
export type Job = 'armed' | 'held' | 'purged' | 'rehearsed' | 'archived';
export type Mode = 'PURGE' | 'ARCHIVE' | 'TEST';
export type Hvac = 'ok' | 'fault' | 'stable' | 'lost';

export const SESSIONS = [
  { user: 'kraemer', host: 'WAR-ROOM-01', since: '21:40', who: 'Kraemer, J. · Operations' },
  { user: 'nakamura', host: 'WAR-ROOM-02', since: '21:44', who: 'Nakamura, E. · Systems' },
  { user: 'cboyd', host: 'WAR-ROOM-03', since: '21:31', who: 'Boyd, C. · Network Engineering' },
  { user: 'svc_gate', host: 'WAR-ROOM-03', since: '21:32', who: 'service · gate controller' },
  { user: 'svc_recsys', host: 'RECSYS-01', since: '12/27 04:00', who: 'service · records system' },
  { user: 'odd', host: 'ADM-2F-PC14', since: '22:51', who: 'Office of the Deputy Director' },
] as const;
export type SessionUser = (typeof SESSIONS)[number]['user'];

export const MODES: Record<Mode, string> = {
  PURGE: 'Delete every record older than the archive date. Nothing is kept.',
  ARCHIVE: 'Copy records to tape set D (custodian: Office of the Deputy Director), then purge.',
  TEST: 'Rehearsal for the CAB. Runs every step, writes nothing, and logs SUCCESS.',
};

export interface Roll {
  gate: Gate;
  gateAt: number;
  ov: number; // active override wave (1-based), 0 = none
  ovAt: number;
  ovIdx: number; // next wave index into OVERRIDES, -1 = none left
  denied: number;
  boydOut: boolean;
  job: Job;
  mode: Mode;
  hvac: Hvac;
  pa: number;
  ahu1: 'run' | 'fault' | 'isolated';
  ahu2: 'off' | 'run';
  d2: 'shut' | 'open';
  fax?: string;
}

export function roll(s: GameState): Roll {
  const f = s.flags;
  return {
    gate: (f.r_gate as Gate) ?? 'closed',
    gateAt: Number(f.r_gate_at ?? 0),
    ov: Number(f.r_ov ?? 0),
    ovAt: Number(f.r_ov_at ?? 0),
    ovIdx: f.r_ov_idx === undefined ? -2 : Number(f.r_ov_idx),
    denied: Number(f.r_denied ?? 0),
    boydOut: !!f.r_rev_cboyd,
    job: (f.r_job as Job) ?? 'armed',
    mode: (f.r_mode as Mode) ?? 'PURGE',
    hvac: (f.r_hvac as Hvac) ?? 'ok',
    pa: f.r_pa === undefined ? PA_START : Number(f.r_pa),
    ahu1: (f.r_ahu1 as Roll['ahu1']) ?? 'run',
    ahu2: (f.r_ahu2 as Roll['ahu2']) ?? 'off',
    d2: (f.r_d2 as Roll['d2']) ?? 'shut',
    fax: f.r_fax as string | undefined,
  };
}

export const gone = (g: Gate) => g === 'released' || g === 'forced';
export const recordsSaved = (j: Job) => j === 'held' || j === 'rehearsed';

/** One game minute of the rollover. Pure. */
export function rolloverTick(s: GameState): GameState {
  const m = s.night.minute;
  const r = roll(s);
  const f: Record<string, string | number | boolean> = {};

  // The convoy asks for the gate. Nobody answering is an answer: the war room opens it.
  if (r.gate === 'closed' && m >= T.convoy) f.r_gate = 'requested';
  if (r.gate === 'requested' && m >= OVERRIDES[0]) {
    f.r_gate = 'forced';
    f.r_gate_at = m;
    f.r_unanswered = true;
  }
  if (gone(r.gate) && !r.gateAt) f.r_gate_at = m;

  if (r.gate === 'held') {
    let idx = r.ovIdx;
    if (idx === -2) {
      // first tick after the hold: schedule the overrides still ahead of us
      idx = OVERRIDES.findIndex((t) => t > m);
      f.r_ov_idx = idx;
      f.r_held_at = m;
    }
    if (m >= T.window) {
      f.r_gate = 'expired';
      f.r_ov = 0;
    } else if (r.ov && m >= r.ovAt + GRACE) {
      f.r_gate = 'forced';
      f.r_gate_at = m;
      f.r_ov = 0;
    } else if (!r.ov && !r.boydOut && idx >= 0 && idx < OVERRIDES.length && m >= OVERRIDES[idx]) {
      f.r_ov = idx + 1;
      f.r_ov_at = m;
      f.r_ov_idx = idx + 1 < OVERRIDES.length ? idx + 1 : -1;
    }
  }

  // RECSYS-Y2K-0047, approved on Night 2, runs unattended at 23:50.
  if (r.job === 'armed' && m >= T.job) f.r_job = r.mode === 'TEST' ? 'rehearsed' : r.mode === 'ARCHIVE' ? 'archived' : 'purged';

  // Midnight: the AHU-1 controller reads 01/01/1900 and stops.
  if (r.hvac === 'ok' && m >= T.rollover) {
    f.r_hvac = 'fault';
    f.r_ahu1 = r.ahu1 === 'run' ? 'fault' : r.ahu1;
    f.r_pa = r.pa;
  } else if (r.hvac === 'fault' || r.hvac === 'stable') {
    const stable = r.ahu2 === 'run' && r.d2 === 'open' && r.ahu1 === 'isolated';
    let pa = r.pa;
    if (stable) pa = Math.max(PA_SAFE, pa - 6);
    else pa += r.ahu2 === 'run' && r.d2 === 'open' ? 1 : 3;
    f.r_hvac = stable ? 'stable' : 'fault';
    if (pa >= 0) {
      pa = 0;
      f.r_hvac = 'lost';
    }
    f.r_pa = pa;
  }

  if (!Object.keys(f).length) return s;
  let next: GameState = { ...s, flags: { ...s.flags, ...f } };
  // Keep the queue honest when the gate is decided outside it (SYSCON, a call, the war room).
  const g = next.flags.r_gate as Gate;
  if (g !== 'closed' && g !== 'requested' && !next.night.results.n10x1 && next.night.arrived.includes('n10x1')) {
    next = {
      ...next,
      night: { ...next.night, results: { ...next.night.results, n10x1: { decision: g === 'held' || g === 'expired' ? 'escalate' : 'log', choice: g, correct: true, at: m } } },
    };
  }
  return next;
}

// ------------------------------------------------------------------ player actions (as Effects)

export function holdGate(s: GameState): Effect | null {
  const r = roll(s);
  if (r.gate !== 'requested') return null;
  return { flags: { r_gate: 'held' }, suspicion: 6 };
}

export function releaseGate(s: GameState): Effect | null {
  const r = roll(s);
  if (r.gate !== 'requested' && r.gate !== 'held') return null;
  return { flags: { r_gate: 'released', r_gate_at: s.night.minute, r_ov: 0 } };
}

export function denyOverride(s: GameState): Effect | null {
  const r = roll(s);
  if (!r.ov || r.gate !== 'held') return null;
  return { flags: { r_ov: 0, r_denied: r.denied + 1 } };
}

export function revoke(s: GameState, user: SessionUser): { effect: Effect; line: string } {
  const m = s.night.minute;
  if (user === 'cboyd')
    return {
      effect: { flags: { r_rev_cboyd: true, r_ov: 0 }, suspicion: 6 },
      line: 'cboyd@WAR-ROOM-03 logged off. svc_gate stopped with it: it was running under his session.',
    };
  if (user === 'svc_gate') return { effect: { flags: { r_rev_svc: m } }, line: 'svc_gate stopped… svc_gate restarted automatically on WAR-ROOM-03 (parent session: cboyd).' };
  if (user === 'svc_recsys') return { effect: { flags: { r_rev_recsys: m } }, line: 'svc_recsys stopped… svc_recsys restarted automatically on RECSYS-01. Scheduled jobs are unaffected.' };
  if (user === 'odd') return { effect: { flags: { r_rev_odd: true }, suspicion: 8 }, line: 'odd@ADM-2F-PC14 logged off. The Office of the Deputy Director will notice.' };
  return { effect: { flags: { [`r_rev_${user}`]: true }, suspicion: 8 }, line: `${user} logged off. The war room will notice.` };
}

export function holdJob(s: GameState): Effect | null {
  const r = roll(s);
  if (r.job !== 'armed' || s.night.minute >= T.job) return null;
  return { flags: { r_job: 'held' }, suspicion: 12 };
}

export function setMode(s: GameState, mode: Mode): Effect | null {
  const r = roll(s);
  if (r.job !== 'armed' || s.night.minute >= T.job || r.mode === mode) return null;
  return { flags: { r_mode: mode }, suspicion: 3 };
}

export type HvacCmd = 'ahu2' | 'd2' | 'ahu1';
export function hvac(s: GameState, cmd: HvacCmd): { effect: Effect | null; line: string } {
  const r = roll(s);
  if (r.hvac === 'ok') return { effect: null, line: 'HVAC-CTL is locked by the change freeze. Manual control unlocks on a fault.' };
  if (r.hvac === 'lost') return { effect: null, line: 'B3 CONTAINMENT LOST.' };
  if (cmd === 'ahu2') {
    if (r.ahu2 === 'run') return { effect: null, line: 'AHU-2 is already running.' };
    return { effect: { flags: { r_ahu2: 'run' } }, line: 'AHU-2 START · fan spinning up · 1,840 rpm' };
  }
  if (cmd === 'd2') {
    if (r.d2 === 'open') return { effect: null, line: 'Damper D-2 is already open.' };
    if (r.ahu2 !== 'run') return { effect: { flags: { r_d2: 'open', r_pa: Math.min(0, r.pa + 10) } }, line: 'D-2 OPEN · BACKFLOW: AHU-2 is not running. Pressure jumped.' };
    return { effect: { flags: { r_d2: 'open' } }, line: 'D-2 OPEN · AHU-2 now feeds B3 supply.' };
  }
  if (r.ahu1 === 'isolated') return { effect: null, line: 'AHU-1 is already isolated.' };
  if (r.ahu2 !== 'run' || r.d2 !== 'open') return { effect: { flags: { r_ahu1: 'isolated', r_pa: Math.min(0, r.pa + 12) } }, line: 'AHU-1 ISOLATED · NO SUPPLY AIR. Nothing is feeding B3. Pressure jumped.' };
  return { effect: { flags: { r_ahu1: 'isolated' } }, line: 'AHU-1 ISOLATED · B3 on AHU-2 · pressure recovering.' };
}

export function faxOpen(s: GameState) {
  return s.night.minute >= T.window && !roll(s).fax;
}

export function sendFax(s: GameState, to: 'fbi' | 'press' | 'lantern'): Effect | null {
  if (!faxOpen(s)) return null;
  return { flags: { r_fax: to }, suspicion: to === 'lantern' ? 0 : 4 };
}

// ------------------------------------------------------------------ the ending

export const ENDINGS = ['daylight', 'bureau', 'blackout', 'lantern', 'company', 'route9', 'echo', 'detained', 'terminated'] as const;
export const ENDING_NAMES: Record<string, string> = {
  daylight: 'Daylight',
  bureau: 'The Bureau',
  blackout: 'Blackout',
  lantern: 'Lantern',
  company: 'Company Man',
  route9: 'Route 9',
  echo: 'Echo',
  detained: 'Detained',
  terminated: 'Terminated',
};

export function resolveEnding(s: GameState): string {
  const r = roll(s);
  const f = s.flags;
  const solved = (s.solved ?? []).length;
  if (r.hvac === 'lost') return 'echo';
  const saved = recordsSaved(r.job);
  if (gone(r.gate)) {
    if (f.act2_choice === 'lantern' || f.r_for_lantern) return 'lantern';
    if ((f.act2_choice === 'ashcombe' || f.ashcombe === 'accepted') && r.gate === 'released' && !saved) return 'company';
    return 'blackout';
  }
  // The convoy never left the ridge.
  const press = f.act2_choice === 'press' || r.fax === 'press';
  const fbi = f.act2_choice === 'fbi' || r.fax === 'fbi' || !!f.fbi_contact;
  if (saved && press && solved >= 3) return 'daylight';
  if (fbi) return 'bureau';
  return 'route9';
}

/** "23:41" for a minute of the rollover shift. */
export function hhmm(minute: number) {
  const t = 22 * 60 + Math.floor(minute);
  return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}
