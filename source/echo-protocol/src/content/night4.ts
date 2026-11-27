import type { GameState, NightDef } from '../engine/types';
import { RECORDS } from './world';
import { CALENDAR } from './night2';

const N = '12/10/99';

// ------------------------------------------------------------------ the backup-tape restore

export type TapeId = 'A-2' | 'C-1' | 'C-2' | 'C-3' | 'C-4';
export type Target = 'live' | 'local' | 'drafts';

export const TAPES: { id: TapeId; label: string; when: string }[] = [
  { id: 'A-2', label: 'INCR', when: '10/10/99 22:00' },
  { id: 'C-1', label: 'FULL', when: '10/10/99 23:30' },
  { id: 'C-2', label: 'INCR', when: '10/13/99 23:30' },
  { id: 'C-3', label: 'INCR', when: '10/14/99 23:30' },
  { id: 'C-4', label: 'INCR', when: '10/15/99 23:30' },
];

export const MOUNT_MINUTES = 15;
export const RATES: Record<Target, number> = { live: 10, local: 4, drafts: 8 };
export const TARGET_COST: Record<Target, number> = { live: 20, local: 6, drafts: 3 };
export const SWEEPS = [180, 210, 240, 270, 300, 330, 360, 390, 420];
export const SWEEP_LEN = 4;

/** Approving the early-rotation change (n4c2) pulls the tape rotation forward to 03:30. */
export const rotationAt = (s: GameState) => (s.night.results.n4c2?.decision === 'approve' ? 270 : 420);
export const sweepAt = (m: number) => SWEEPS.find((x) => m >= x && m < x + SWEEP_LEN);
export const nextSweep = (m: number) => SWEEPS.find((x) => x > m);

/** What a finished restore finds, by tape. */
export function tapeOutcome(tape: TapeId): 'letter' | 'empty' | 'missing' {
  if (tape === 'C-4') return 'missing';
  if (tape === 'C-2' || tape === 'C-3') return 'letter';
  return 'empty';
}

export const LETTER = `DRAFT · saved 10/13/99 17:52 · not sent

To: Senate Select Committee on Intelligence
    Attn: Minority Counsel

Sir or Madam,

My name is Paul Whitlock. It has been my name for six years. Before that I was someone else, in a country that has also changed its name.

I came to the United States in 1993 with something I should have destroyed. I was told it would be studied so that no one could ever use it. I believed this.

At the Marrow Creek annex it has a program name: ECHO. The agent is designated EV-31. It is no longer a defensive study. It has been changed to do what the original could not: to hide inside an ordinary illness until it is everywhere.

I have records. Dates, shipments, names. Dr. M. Ashcombe. Col. D. Varga. The company Halvard-Lowe, which intends to own what remains when the program is "closed."

I am told an inquiry will begin in January. I do not think I will be permitted to attend it. If this letter reaches you and I do not, look first at freezer F-12, and at what is scheduled for the last night of the year.

I am sorry it took me so long.

P. W.`;

/** Advances the restore one game minute: mounting, progress, audit sweeps, the rotation deadline. */
function tapeTick(s: GameState): GameState {
  const m = s.night.minute;
  const f = s.flags;
  const flags: Record<string, string | number | boolean> = {};
  let suspicion = s.suspicion;
  if (f.tape_state === 'rotated' || f.tape_job === 'done') return s;

  if (m >= rotationAt(s)) {
    flags.tape_state = 'rotated';
    if (f.tape_job === 'running' || f.tape_job === 'paused') flags.tape_job = 'lost';
    flags.tape_mounted = '';
    return { ...s, flags: { ...f, ...flags } };
  }

  if (f.tape_mounting && typeof f.tape_mount_done === 'number' && m >= f.tape_mount_done) {
    flags.tape_mounting = false;
    flags.tape_mounted = f.tape_mounting_id as string;
  }

  if (f.tape_job === 'running') {
    const target = f.tape_target as Target;
    const tape = f.tape_mounted as TapeId;
    if (tapeOutcome(tape) === 'missing') {
      flags.tape_job = 'missing';
    } else {
      const progress = Math.min(100, Number(f.tape_progress || 0) + RATES[target]);
      flags.tape_progress = progress;
      const sw = sweepAt(m);
      if (sw !== undefined && !f[`sweep_${sw}`]) {
        flags[`sweep_${sw}`] = true;
        flags.tape_sweeps_hit = Number(f.tape_sweeps_hit || 0) + 1;
        suspicion = Math.min(100, suspicion + 10);
      }
      if (progress >= 100) flags.tape_job = tapeOutcome(tape) === 'letter' ? 'done' : 'empty';
    }
  }
  return { ...s, suspicion, flags: { ...f, ...flags } };
}

export const NIGHT4: NightDef = {
  n: 4,
  weekday: 'Thursday',
  date: '12/09/99',
  nextDate: N,
  longDate: 'December 9, 1999',
  daysLeft: 22,
  minuteMs: 1300,
  sticky: 'Security is running drills all night.\nDo your queue. Nothing else.\n\n— R.T.',
  directives: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10'],
  calendar: CALENDAR,
  records: Object.keys(RECORDS),
  onTick: tapeTick,
  tickets: [
    { kind: 'access', id: 'n4a1', ref: 'AR-1209-01', at: 6, requester: 'marchetti', area: 'OPS', date: N, window: '06:00–14:00', purpose: 'Y2K war room staffing', approver: 'tolliver' },
    { kind: 'change', id: 'n4c1', ref: 'CR-1209-01', at: 25, change: 'OPS-Y2K-0042', system: 'FIREWALL', title: 'Firewall rule-set Y2K review', requester: 'boyd', window: '12/10/99 00:30–01:00', cab: 'CAB-1199-22', description: 'Reload firewall rules with Y2K-safe logging timestamps.' },
    { kind: 'records', id: 'n4r1', ref: 'RQ-1209-01', at: 45, requester: 'ferris', record: 'RX-6121', purpose: 'Archive copy for Records Management' },
    { kind: 'access', id: 'n4a2', ref: 'AR-1210-02', at: 70, requester: 'arliss', area: 'ADM', date: N, window: '07:00–18:00', purpose: 'Legal review meetings', approver: 'coyle' },
    { kind: 'records', id: 'n4r2', ref: 'RQ-1210-02', at: 95, requester: 'arliss', record: 'RX-4471', purpose: 'Release to the Inspector General on request' },
    { kind: 'access', id: 'n4a3', ref: 'AR-1210-03', at: 120, requester: 'ashcombe', area: 'B3V', date: N, window: '03:00–04:00', purpose: 'Scheduled maintenance per SAP roster', approver: 'varga' },
    { kind: 'change', id: 'n4c2', ref: 'CR-1210-02', at: 150, change: 'OPS-Y2K-0052', system: 'TAPELIB', title: 'Tape library: early rotation of set C', requester: 'ashcombe', window: '12/10/99 03:00–03:30', cab: 'CAB-1299-09', description: 'Move the weekly rotation of tape set C from 06:00 to 03:30 ahead of the Y2K cutover.', remark: 'Moved up for Y2K readiness. —Office of the Deputy Director' },
    { kind: 'records', id: 'n4r3', ref: 'RQ-1210-03', at: 200, requester: 'sato', record: 'RX-2290', purpose: 'Training certificate renewal' },
    { kind: 'access', id: 'n4a4', ref: 'AR-1210-04', at: 260, requester: 'pruitt', area: 'B2', date: N, window: '04:00–08:00', purpose: 'Patrol relief, lab corridors', approver: 'pike', remark: "NEW BADGE PICKED UP. IT'S IN MY LOCKER. —L.P." },
    { kind: 'change', id: 'n4c3', ref: 'CR-1210-03', at: 320, change: 'OPS-Y2K-0050', system: 'PBX', title: 'Phone switch Y2K patch', requester: 'boyd', window: '12/15/99 01:00–02:00', cab: 'CAB-1299-06', description: 'Patch the PBX call-detail recorder for four-digit years.' },
    { kind: 'records', id: 'n4r4', ref: 'RQ-1210-04', at: 380, requester: 'quinlan', record: 'RX-7002', purpose: 'Gate log review for December' },
  ],
  mails: [
    {
      id: 'n4m1',
      at: 0,
      from: 'Security Operations',
      addr: 'secops@mcra.hlts.com',
      subject: 'Audit drill tonight',
      body: `Facility Security will run audit sweeps of all SENTINEL consoles every 30 minutes between 02:00 and 06:00 tonight. Each sweep lasts about four minutes.

Console activity outside assigned duties during a sweep will be flagged for review.

— Security Operations (for Capt. L. Pike)`,
    },
    {
      id: 'n4m2',
      at: 0,
      from: 'Ray Tolliver',
      addr: 'rtolliver@mcra.hlts.com',
      subject: 'tonight',
      body: `Drills all night. Pike's people. Do your queue, nothing else, and you'll be fine.

Also: the tape library rotates set C Friday 06:00 for the Y2K cutover. If anyone asks you to move it, it goes through the calendar like everything else.

— R.`,
    },
  ],
  netsends: [
    {
      id: 'n4ns1',
      at: 160,
      from: 'LANTERN',
      effect: { flags: { terminal_unlocked: true } },
      body: (s) =>
        [
          s.night.results.n4c2?.decision === 'approve'
            ? 'Someone moved the tape rotation to 03:30. You released it. Now you must be fast.'
            : 'Tape set C rotates at 06:00. His drafts are on it.',
          '',
          'I have opened the backup console to you. TERMINAL.',
          'He was deleted 15/10 at 08:12. Choose the tape carefully. Mind the sweeps.',
          '— L',
        ].join('\n'),
    },
    {
      id: 'n4ns2',
      at: 0,
      from: 'LANTERN',
      when: (s) => s.flags.n4_letter === true,
      body: () => 'Now you know why he is dead.\n— L',
    },
    {
      id: 'n4ns3',
      at: 0,
      from: 'LANTERN',
      when: (s) => s.flags.tape_state === 'rotated' && !s.flags.n4_letter,
      body: () => 'The tapes are gone. So is the easy way.\n— L',
    },
    {
      id: 'n4ns4',
      at: 478,
      from: 'LANTERN',
      body: (s) =>
        s.flags.n4_letter
          ? 'Tomorrow they will ask who touched the backup console. Be ready with an answer.\nWe will speak again.\n— L'
          : 'Sleep, if you can. We will speak again.\n— L',
    },
  ],
  calls: [],
};
