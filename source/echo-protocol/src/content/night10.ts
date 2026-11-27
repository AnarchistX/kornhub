// Night 10 · ACT III · ROLLOVER. Friday, December 31, 1999, 22:00 → 01:00.
import type { CalendarEntry, CallDef, GameState, NetSendDef, NightDef } from '../engine/types';
import { RECORDS } from './world';
import { CALENDAR2 } from './night5';
import { GRACE, OVERRIDES, T, gone, hhmm, resolveEnding, roll, rolloverTick } from './rollover';

const N = '12/31/99';
const ALL = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10'] as NightDef['directives'];
type S = GameState;
const choice = (s: S) => String(s.flags.act2_choice ?? 'none');
const fbiSide = (s: S) => choice(s) === 'fbi' || !!s.flags.fbi_contact;
const company = (s: S) => choice(s) === 'ashcombe' || s.flags.ashcombe === 'accepted';

export const CALENDAR3: CalendarEntry[] = [
  ...CALENDAR2,
  { change: 'OPS-Y2K-0065', system: 'PBX', window: '12/24/99 00:30–01:00', cab: 'CAB-1299-17', owner: 'Boyd, C.' },
  { change: 'OPS-Y2K-0070', system: 'SYSCON', window: '12/31/99 21:00–02:00', cab: 'CAB-1299-19', owner: 'Boyd, C.' },
  { change: 'OPS-Y2K-0071', system: 'PBX', window: '01/01/00 00:30–01:00', cab: 'CAB-1299-20', owner: 'Nakamura, E.' },
];

// ------------------------------------------------------------------ SYSCON alarms

const overrides: NetSendDef[] = OVERRIDES.map((_, i) => ({
  id: `r_ov${i + 1}`,
  at: 0,
  from: 'SYSCON',
  alarm: true,
  tab: 'gate',
  when: (s: S) => Number(s.flags.r_ov) === i + 1,
  body: (s: S) =>
    `REMOTE OVERRIDE · GATE 1\n\nsource   svc_gate @ WAR-ROOM-03\nrequest  OPEN GATE 1 (convoy HL-7)\n\nAccepted automatically at ${hhmm(Number(s.flags.r_ov_at) + GRACE)} unless the NOC denies it.\nSYSCON → GATE 1 → DENY.`,
}));

const netsends: NetSendDef[] = [
  {
    id: 'n10ns_none',
    at: 12,
    from: 'LANTERN',
    when: (s) => choice(s) === 'none',
    body: () => 'You wiped it all. Then watch the gate at half past eleven, archivist.\nWatch it carefully.\n— L',
  },
  ...overrides,
  {
    id: 'n10ns_gone',
    at: 0,
    from: 'SYSCON',
    alarm: true,
    when: (s) => gone(roll(s).gate),
    body: (s) =>
      `GATE 1 OPEN · ${s.flags.r_unanswered ? 'released remotely (no answer from the NOC)' : roll(s).gate === 'forced' ? 'REMOTE OVERRIDE ACCEPTED' : 'released by the night lead'}\nConvoy HL-7 departed ${hhmm(roll(s).gateAt)}.\nGATE 1 CLOSED.`,
  },
  {
    id: 'n10ns_job',
    at: T.job + 1,
    from: 'RECSYS',
    when: (s) => roll(s).job !== 'armed',
    body: (s) => {
      const j = roll(s).job;
      if (j === 'held') return 'RECSYS-Y2K-0047 · HELD BY NIGHT LEAD EXCEPTION\nThe job did not run. 4,113 archive records untouched.';
      if (j === 'rehearsed') return 'RECSYS-Y2K-0047 /TEST · COMPLETE · SUCCESS\n0 records changed (rehearsal mode).';
      if (j === 'archived') return 'RECSYS-Y2K-0047 /ARCHIVE · COMPLETE · SUCCESS\n4,113 records copied to tape set D (custodian: ODD), then purged.';
      return 'RECSYS-Y2K-0047 /PURGE · COMPLETE · SUCCESS\n4,113 records deleted.';
    },
  },
  {
    id: 'n10ns_hvac',
    at: T.rollover,
    from: 'SYSCON',
    alarm: true,
    tab: 'hvac',
    when: (s) => roll(s).hvac === 'fault',
    body: () =>
      '*** HVAC-CTL ALARM · B3 CONTAINMENT ***\n\nAHU-1 CONTROLLER FAULT · DATE 01/01/1900\nB3 differential pressure −42 Pa and rising.\nContainment is lost at 0 Pa.\n\nManual control unlocked: SYSCON → B3 HVAC.',
  },
  {
    id: 'n10ns_toby',
    at: T.rollover + 3,
    from: 'MARCHETTI',
    body: () => 'HAPPY NEW YEAR!!!!!!\nthe lights stayed on!!! nothing exploded!!!\nJudith is crying (good crying)\n— T',
  },
  {
    id: 'n10ns_window',
    at: T.window,
    from: 'SYSCON',
    alarm: true,
    when: (s) => roll(s).gate === 'expired',
    body: () => 'OPS-Y2K-0058 · CHANGE WINDOW CLOSED (00:30)\nConvoy HL-7 is no longer authorized to depart.\nGATE 1 HELD.',
  },
  {
    id: 'n10ns_fax',
    at: T.window + 1,
    from: 'SYSCON',
    alarm: true,
    tab: 'fax',
    body: () => 'OUTSIDE LINES RESTORED · holiday forwarding off.\nThe NOC fax can dial out again: SYSCON → FAX.',
  },
  {
    id: 'n10ns_last',
    at: 176,
    from: 'LANTERN',
    body: (s) =>
      gone(roll(s).gate)
        ? choice(s) === 'lantern' || s.flags.r_for_lantern
          ? 'It is done. Thank you, archivist.\nDo not look for me. You will not need to.\n— L'
          : 'It is gone, archivist. Now it belongs to whoever is waiting at the other end.\n— L'
        : 'It is still on your ridge. You did that.\nHappy new year.\n— L',
  },
];

// ------------------------------------------------------------------ calls

const calls: CallDef[] = [
  {
    id: 'c10_fbi',
    at: 10,
    from: 'calloway',
    place: 'Unmarked van · State Route 9',
    when: (s) => choice(s) === 'fbi',
    start: 'a',
    nodes: {
      a: {
        who: 'them',
        text: (s) =>
          s.flags.fbi_stayhome
            ? "It's Calloway. I told you to stay home. ...You came anyway. All right. Then help me."
            : "It's Calloway. I'm in a van at the bottom of your hill, and I'm freezing.",
        next: 'b',
      },
      b: {
        who: 'them',
        text: 'Your packet got me a judge. The warrant for the B3 freezer is signed at 00:30, when the transfer window closes. Until then I cannot touch that truck.',
        next: 'c',
      },
      c: {
        who: 'them',
        text: 'So I need two things. Keep that convoy inside the fence until 00:30. And keep the records alive: if 0047 runs, my warrant is for an empty room.',
        choices: [
          { text: "I'll hold it.", to: 'd1', effect: { flags: { fbi_plan: true } } },
          { text: 'What if they force the gate?', to: 'd2', effect: { flags: { fbi_plan: true } } },
        ],
      },
      d1: { who: 'them', text: 'Good. And {first}: somebody up there talks to Ashcombe. If you find out who, tell me.', end: true },
      d2: { who: 'them', text: 'Then find whoever is forcing it and shut them out. You run that network. Act like it.', end: true },
    },
  },
  {
    id: 'c10_press',
    at: 10,
    from: 'reyes',
    place: 'B3 · Loading dock',
    when: (s) => choice(s) === 'press',
    start: 'a',
    nodes: {
      a: { who: 'them', text: "It's Naomi. I'm on the loading dock in B3. They have me packing my own freezer.", next: 'b' },
      b: {
        who: 'them',
        text: "Simon has the packet. He'll run it on the second if he can prove two things: the stock was here tonight, and the records weren't destroyed to hide it.",
        next: 'c',
      },
      c: {
        who: 'them',
        text: "So the truck can't leave, and 0047 can't run. That's... everything, isn't it.",
        choices: [
          { text: "I'll keep the truck here.", to: 'd1', effect: { flags: { reyes_plan: true } } },
          { text: "What happens to you if it doesn't leave?", to: 'd2', effect: { flags: { reyes_plan: true } } },
        ],
      },
      d1: { who: 'them', text: "If it's still here at 00:30, the transfer isn't authorized anymore. Your calendar taught me that.", end: true },
      d2: { who: 'them', text: "Ashcombe will know it was us. I don't care anymore. Paul didn't get to care either.", end: true },
    },
  },
  {
    id: 'c10_lantern',
    at: 10,
    from: '',
    name: 'LANTERN',
    role: 'Origin unknown',
    place: 'Relay · Vienna',
    video: false,
    when: (s) => choice(s) === 'lantern',
    start: 'a',
    nodes: {
      a: { who: 'them', text: 'Good evening, archivist. Our people are on Route 9.', next: 'b' },
      b: {
        who: 'them',
        text: 'When the convoy asks for the gate, give it the gate. Nothing else is required of you. Not tonight, not ever again.',
        choices: [
          { text: 'And then?', to: 'c1' },
          { text: 'What will you do with it?', to: 'c2' },
        ],
      },
      c1: { who: 'them', text: 'And then you go home, and in a few weeks you will be comfortable. Goodnight.', end: true },
      c2: { who: 'them', text: 'Keep it from your country. That is enough for one night. Goodnight, archivist.', end: true },
    },
  },
  {
    id: 'c10_company',
    at: 10,
    from: 'ashcombe',
    place: 'Office of the Deputy Director',
    when: (s) => company(s) && choice(s) !== 'fbi' && choice(s) !== 'press' && choice(s) !== 'lantern',
    start: 'a',
    nodes: {
      a: { who: 'them', text: 'Good evening, lead. A quiet night, I hope.', next: 'b' },
      b: {
        who: 'them',
        text: 'Two items on your calendar tonight. At 23:30 my convoy asks for Gate 1: release it. At 23:50 RECSYS-Y2K-0047 tidies up the archive: let it.',
        next: 'c',
      },
      c: {
        who: 'them',
        text: "That's all. Then 2000 arrives, and you are a very different person with a very different salary.",
        choices: [
          { text: 'Understood.', to: 'd1' },
          { text: "What's in the truck?", to: 'd2', effect: { suspicion: 3 } },
        ],
      },
      d1: { who: 'them', text: 'I knew I could count on you. Happy New Year, {first}.', end: true },
      d2: { who: 'them', text: 'Freezers, {first}. Very cold, very boring freezers. Release the convoy.', end: true },
    },
  },
  {
    id: 'c10_pike',
    at: 14,
    from: 'pike',
    place: 'Gate 1 · Guard booth',
    when: (s) => s.flags.pike === 'ally' && choice(s) !== 'lantern',
    start: 'a',
    nodes: {
      a: { who: 'them', text: "Pike. I've got a Halvard-Lowe truck idling inside my fence, Corporate paperwork, and a driver who won't look at me.", next: 'b' },
      b: {
        who: 'them',
        text: "It's on your calendar, so it's your call when it asks for the gate. I'm just telling you I don't like it.",
        choices: [
          { text: "If I hold it, will you back me?", to: 'c1', effect: { flags: { pike_backs: true } } },
          { text: "It's on the calendar.", to: 'c2' },
        ],
      },
      c1: { who: 'them', text: "Night lead holds a gate, my people hold the gate. That's the rule. I'll be in the booth.", end: true },
      c2: { who: 'them', text: 'So it is. Happy New Year.', end: true },
    },
  },
  {
    id: 'c10_lindqvist',
    at: 60,
    from: 'lindqvist',
    place: 'Facilities · Boiler room',
    start: 'a',
    nodes: {
      a: { who: 'them', text: 'Lindqvist, Facilities. My B3 failover test got bounced three times this month. No CAB number. My fault.', next: 'b' },
      b: {
        who: 'them',
        text: "Which means nobody has ever failed B3 over to the backup air handler. And the AHU-1 controller has a date chip in it older than you.",
        next: 'c',
      },
      c: {
        who: 'them',
        text: "If AHU-1 drops at midnight, B3 loses negative pressure. You'll see it on SYSCON. Write this down: START AHU-2. OPEN damper D-2. THEN isolate AHU-1. Never isolate one before two is running.",
        effect: {
          note: {
            id: 'n10-hvac',
            title: 'B3 failover order (Lindqvist, 23:00)',
            body: '1. START AHU-2\n2. OPEN damper D-2\n3. ISOLATE AHU-1\n\nNever isolate AHU-1 before AHU-2 is running.\nB3 containment is lost at 0 Pa.',
          },
        },
        choices: [
          { text: 'Why are you telling me?', to: 'd1' },
          { text: 'Got it.', to: 'd2' },
        ],
      },
      d1: { who: 'them', text: "Because I'll be in a boiler room with a radio that doesn't reach B3, and you'll be the only one awake who can see it. Happy New Year.", end: true },
      d2: { who: 'them', text: "I put it in your notes too. Happy New Year.", end: true },
    },
  },
  {
    id: 'c10_kraemer',
    at: 78,
    from: 'kraemer',
    place: 'B1 · Y2K war room',
    start: 'a',
    nodes: {
      a: { who: 'them', text: "Lead! It's Judith. We have pizza, a television, and Curtis has wired SYSCON into everything in the building.", next: 'b' },
      b: {
        who: 'them',
        text: "If anything blinks, call the war room. And {first}: the convoy at the gate belongs to the Deputy Director. It's on the calendar. Don't make my last night of the millennium interesting.",
        choices: [
          { text: 'Happy New Year, Judith.', to: 'c1' },
          { text: "Who's down there with you?", to: 'c2', effect: { flags: { knows_warroom: true } } },
        ],
      },
      c1: { who: 'them', text: 'Happy New Year. You did good this month. I mean it.', end: true },
      c2: { who: 'them', text: 'Me on 01, Ellen Nakamura on 02, Curtis Boyd on 03 with his gate gadget. Toby brought noisemakers. God help us.', end: true },
    },
  },
  {
    id: 'c10_ashcombe_hold',
    at: 0,
    from: 'ashcombe',
    place: 'Office of the Deputy Director',
    when: (s) => roll(s).gate === 'held',
    start: 'a',
    nodes: {
      a: {
        who: 'them',
        text: '{first}. My convoy is sitting at Gate 1 with its engine running. Why?',
        choices: [
          { text: "Night lead exception. It stays until the window closes.", to: 'b1', effect: { suspicion: 4, flags: { defied: true } } },
          { text: "Releasing it now, sir. Sorry.", to: 'b2', effect: { flags: { r_gate: 'released', r_ov: 0 } } },
        ],
      },
      b1: {
        who: 'them',
        text: (s) =>
          company(s)
            ? 'I gave you everything, {first}. Fine. Curtis will open it from the war room, and you can watch. Drive carefully on Route 9.'
            : 'Exceptions are for badges, {first}, not for my freezers. Curtis will open it from the war room. You can watch.',
        end: true,
      },
      b2: { who: 'them', text: "Thank you. Let's never speak of this.", end: true },
    },
  },
  {
    id: 'c10_lantern_open',
    at: T.rollover - 4,
    from: '',
    name: 'LANTERN',
    role: 'Origin unknown',
    place: 'Relay · Vienna',
    video: false,
    when: (s) => choice(s) === 'lantern' && roll(s).gate === 'held',
    start: 'a',
    nodes: {
      a: {
        who: 'them',
        text: 'The convoy is still inside your fence, archivist. Our people are cold. Open the gate.',
        choices: [
          { text: 'Opening it now.', to: 'b1', effect: { flags: { r_gate: 'released', r_ov: 0, r_for_lantern: true } } },
          { text: 'No.', to: 'b2', effect: { flags: { lantern_betrayed: true } } },
        ],
      },
      b1: { who: 'them', text: 'Thank you. Do not watch the road.', end: true },
      b2: { who: 'them', text: 'Then you have lied to the only person who ever told you the truth. Goodbye, archivist.', end: true },
    },
  },
  {
    id: 'c10_leak',
    at: 128,
    from: 'calloway',
    place: 'Unmarked van · State Route 9',
    when: (s) => fbiSide(s) && !gone(roll(s).gate),
    start: 'a',
    nodes: {
      a: {
        who: 'them',
        text: "{first}, Calloway. Somebody in your building has been calling Ashcombe's car phone every ten minutes since eleven. Whoever it is knows exactly what we're doing.",
        next: 'b',
      },
      b: {
        who: 'them',
        text: 'Do you know who it is?',
        choices: [
          { text: 'Curtis Boyd. Network engineering, war room terminal 03.', to: 'c1', effect: { flags: { r_leak: 'boyd' } } },
          { text: 'Judith Kraemer.', to: 'c2', effect: { flags: { r_leak: 'kraemer' } } },
          { text: "I don't know.", to: 'c3' },
        ],
      },
      c1: {
        who: 'them',
        text: (s) => (s.flags.r_rev_cboyd ? "Boyd. And his terminal went dark twenty minutes ago. Was that you? ...Don't answer that. Thank you." : 'Boyd. He built your network. Of course he did. Thank you.'),
        end: true,
      },
      c2: { who: 'them', text: "Kraemer's been on the phone with her mother since 23:40. It isn't her. Keep looking.", end: true },
      c3: { who: 'them', text: "Then watch your network. Whoever it is, they're using it.", end: true },
    },
  },
  {
    id: 'c10_press_midnight',
    at: T.rollover + 6,
    from: 'reyes',
    place: 'B3 · Loading dock',
    when: (s) => choice(s) === 'press',
    start: 'a',
    nodes: {
      a: {
        who: 'them',
        text: (s) =>
          gone(roll(s).gate)
            ? "It's gone, {first}. I watched the taillights all the way down the hill. It's just... gone."
            : "Happy New Year. The truck is still at the gate. I can see the driver from the dock. He's smoking. He looks scared.",
        end: true,
      },
    },
  },
  {
    id: 'c10_window',
    at: T.window + 2,
    from: 'calloway',
    place: 'Unmarked van · State Route 9',
    when: (s) => roll(s).gate === 'expired' && fbiSide(s),
    start: 'a',
    nodes: {
      a: { who: 'them', text: "Window's closed. The judge signed. We're coming up the hill.", next: 'b' },
      b: { who: 'them', text: "Lock the NOC. Don't open the door for anyone but me. Happy New Year, {first}.", end: true },
    },
  },
  {
    id: 'c10_window_pike',
    at: T.window + 2,
    from: 'pike',
    place: 'Gate 1 · Guard booth',
    when: (s) => roll(s).gate === 'expired' && !fbiSide(s) && s.flags.pike === 'ally',
    start: 'a',
    nodes: {
      a: {
        who: 'them',
        text: "Pike. The convoy's paperwork just expired on my clipboard. I'm not opening that gate for anybody without a new window. The driver is furious. I have never been happier.",
        end: true,
      },
    },
  },
];

export const NIGHT10: NightDef = {
  n: 10,
  act: 'ACT III · ROLLOVER',
  weekday: 'Friday',
  date: N,
  nextDate: '01/01/00',
  longDate: 'December 31, 1999',
  daysLeft: 0,
  minuteMs: 2600,
  intro: 'rollover',
  startHour: 22,
  shiftMinutes: T.end,
  endLine: 'ROLLOVER COMPLETE · THE WAR ROOM HAS THE CONSOLE',
  sticky: "War room's in B1 tonight.\nThere is pizza. You are not invited (sorry!!)\n\nIf the world ends, it was nice working with you.\n\n— T",
  directives: ALL,
  calendar: CALENDAR3,
  records: Object.keys(RECORDS),
  apps: ['syscon'],
  tickets: [
    { kind: 'access', id: 'n10a1', ref: 'AR-1231-01', at: 6, requester: 'kraemer', area: 'B1', date: N, window: '21:30–02:00', purpose: 'Y2K war room (B1 conference)', approver: 'marsh' },
    { kind: 'records', id: 'n10r1', ref: 'RQ-1231-01', at: 24, requester: 'ashcombe', record: 'RX-2216', purpose: 'Y2K records hygiene (destroy after review)' },
    {
      kind: 'change',
      id: 'n10c1',
      ref: 'CR-1231-01',
      at: 44,
      change: 'OPS-Y2K-0066',
      system: 'GATE',
      title: 'Remote gate release for convoy HL-7',
      requester: 'boyd',
      window: '12/31/99 23:30–00:30',
      cab: 'CAB-1299-11',
      description: 'Lets the war room open Gate 1 remotely for the OPS-Y2K-0058 convoy, so the NOC does not have to.',
    },
    { kind: 'access', id: 'n10a2', ref: 'AR-1231-02', at: 62, requester: 'odom', area: 'B3', date: N, window: '23:00–01:00', purpose: 'Transfer escort, F-12', approver: 'reyes' },
    {
      kind: 'alert',
      id: 'n10x1',
      ref: 'GATE-1-HL7',
      at: T.convoy,
      title: 'Convoy HL-7 · Gate 1',
      heading: 'GATE 1 · RELEASE REQUEST',
      lines: [
        { k: 'CONVOY', v: 'HL-7 · Halvard-Lowe Logistics · one refrigerated box truck' },
        { k: 'CHANGE', v: 'OPS-Y2K-0058 · B3 cold storage → HL-OFFSITE' },
        { k: 'WINDOW', v: '12/31/99 23:30–00:30 · CAB-1299-11' },
        { k: 'LOAD', v: 'F-12 contents · 6 transport dewars · signed "—M.A."' },
        { k: 'AUTHORITY', v: 'The night lead may hold any gate release for cause.' },
      ],
      camera: () => ({ cam: 'gate', date: N, time: '23:30', truck: true }),
      flag: 'r_gate',
      options: [
        { value: 'released', label: 'Release the convoy', done: '> GATE 1 OPEN · CONVOY HL-7 DEPARTING' },
        { value: 'held', label: 'Hold the gate', danger: true, done: '> GATE 1 HELD · NIGHT LEAD EXCEPTION', effect: { suspicion: 6 } },
      ],
    },
    { kind: 'access', id: 'n10a3', ref: 'AR-0101-01', at: 136, requester: 'pruitt', area: 'OPS', date: '01/01/00', window: '00:20–08:00', purpose: 'Gate 1 relief (guard booth)', approver: 'pike' },
    {
      kind: 'change',
      id: 'n10c2',
      ref: 'CR-0101-01',
      at: 143,
      change: 'OPS-Y2K-0071',
      system: 'PBX',
      title: 'End holiday call forwarding',
      requester: 'nakamura',
      window: '01/01/00 00:30–01:00',
      cab: 'CAB-1299-20',
      description: 'Returns the switchboard and the NOC fax line from the war room to normal routing.',
    },
    { kind: 'access', id: 'n10a4', ref: 'AR-0101-02', at: 160, requester: 'quinlan', area: 'OPS', date: '01/01/00', window: '00:45–08:00', purpose: 'First shift of 2000', approver: 'pike' },
  ],
  mails: [
    {
      id: 'n10m1',
      at: 0,
      from: 'Judith Kraemer',
      addr: 'jkraemer@mcra.hlts.com',
      subject: 'Rollover',
      body: `You hold the NOC tonight. The war room is in B1 (ext. 4400).

The change freeze is in effect. Release nothing that isn't on the calendar.

Two calendar items tonight belong to the Office of the Deputy Director:
· OPS-Y2K-0058 · the cold storage convoy · Gate 1 · 23:30–00:30
· RECSYS-Y2K-0047 · the records rollover job · 23:50–00:10

Both are approved. Neither needs you.

Happy New Year.

— J. Kraemer`,
    },
    {
      id: 'n10m2',
      at: T.syscon,
      from: 'Curtis Boyd',
      addr: 'cboyd@mcra.hlts.com',
      subject: 'SYSCON',
      effect: { flags: { r_syscon: true } },
      body: `SYSCON is live on your workstation (OPS-Y2K-0070): Gate 1, the B3 air handlers, the RECSYS scheduler and live sessions, all on one screen.

It's for watching. The war room has it. Please don't touch anything.

— C. Boyd, Network Engineering`,
    },
    {
      id: 'n10m3',
      at: 34,
      from: 'Ray',
      addr: 'rtolliver@kessick.net',
      subject: '(no subject)',
      personal: true,
      body: `Saw the lights on up there from the overlook.

Whatever you're doing tonight, do it carefully. I kept a copy of something on a floppy. If anything happens to me, it's in the glovebox.

Happy New Year, kid.

— R.`,
    },
    {
      id: 'n10m4',
      at: T.job - 12,
      from: 'RECSYS Scheduler',
      addr: 'svc_recsys@mcra.hlts.com',
      subject: 'Job reminder: RECSYS-Y2K-0047',
      when: (s) => roll(s).job === 'armed' && roll(s).mode === 'PURGE',
      body: `Scheduled job RECSYS-Y2K-0047 runs at 23:50.

  RUN \\\\RECSYS\\ARCHIVE\\*.* /PURGE /UNATTENDED

No operator action is required. Switches can be reviewed in SYSCON → RECSYS.`,
    },
    {
      id: 'n10m5',
      at: T.rollover + 1,
      from: 'Casey',
      addr: 'casey.m@kessick.net',
      subject: 'HAPPY NEW YEAR!!!',
      personal: true,
      body: `the world didn't end lol

mom is crying at the TV. dad fell asleep at 11:40. I'm drinking sparkling grape juice because the doctor said no champagne yet.

call us when you're off? I don't care how late.

love you. it's 2000!!!

— C`,
    },
  ],
  netsends,
  calls,
  onTick: rolloverTick,
  ending: resolveEnding,
  fail: (s) => (roll(s).hvac === 'lost' ? 'echo' : null),
};
