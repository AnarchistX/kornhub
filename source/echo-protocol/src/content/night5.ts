import type { CalendarEntry, NightDef } from '../engine/types';
import { RECORDS } from './world';
import { CALENDAR } from './night2';

const N = '12/14/99';
const ALL = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10'] as NightDef['directives'];

/** December calendar after the CAB's 12/10 meeting. */
export const CALENDAR2: CalendarEntry[] = [
  ...CALENDAR,
  { change: 'OPS-Y2K-0055', system: 'BADGESYS', window: '12/14/99 01:00–02:00', cab: 'CAB-1299-08', owner: 'Boyd, C.' },
  { change: 'OPS-Y2K-0056', system: 'MAILSRV', window: '12/16/99 00:00–03:00', cab: 'CAB-1299-10', owner: 'Nakamura, E.' },
  { change: 'OPS-Y2K-0058', system: 'LOGISTICS', window: '12/31/99 23:30–00:30', cab: 'CAB-1299-11', owner: 'Office of the Deputy Director' },
  { change: 'OPS-Y2K-0061', system: 'HVAC-CTL', window: '12/21/99 02:00–03:00', cab: 'CAB-1299-14', owner: 'Lindqvist, H.' },
  { change: 'OPS-Y2K-0063', system: 'GATE', window: '12/24/99 01:00–01:30', cab: 'CAB-1299-15', owner: 'Boyd, C.' },
];

export const NIGHT5: NightDef = {
  n: 5,
  act: 'ACT II · COMPARTMENT',
  weekday: 'Monday',
  date: '12/13/99',
  nextDate: N,
  longDate: 'December 13, 1999',
  daysLeft: 18,
  minuteMs: 1300,
  sticky: "Ray's on leave. Nobody will say why.\nYou're night lead now. Congrats??\nHis mug is still here.\n\n— T",
  directives: ALL,
  calendar: CALENDAR2,
  records: Object.keys(RECORDS),
  tickets: [
    { kind: 'access', id: 'n5a1', ref: 'AR-1213-01', at: 8, requester: 'hollis', area: 'OPS', date: N, window: '00:00–01:00', purpose: 'UPS battery swap, server room', approver: 'brennan' },
    {
      kind: 'alert',
      id: 'n5x1',
      ref: 'EXC-1213-0688',
      at: 30,
      title: 'Lead exception · badge 0688',
      heading: 'NIGHT LEAD · EXCEPTION REQUEST',
      lines: [
        { k: 'FROM', v: 'Capt. L. Pike, Facility Security' },
        { k: 'SUBJECT', v: 'Pruitt, Leon · badge 0688 · expired 11/30/99' },
        { k: 'REQUEST', v: '72-hour exception for B2 patrol access' },
        { k: 'REASON', v: 'Badge renewal lost twice by HR. Short-staffed through Y2K.' },
        { k: 'AUTHORITY', v: 'Night lead (you). Directives do not apply to exceptions.' },
      ],
      flag: 'n5_exception',
      options: [
        { value: 'granted', label: 'Grant the exception', done: '> EXCEPTION GRANTED · 0688 · 72 HOURS' },
        { value: 'denied', label: 'Deny it', danger: true, done: '> EXCEPTION DENIED · 0688' },
      ],
    },
    { kind: 'change', id: 'n5c1', ref: 'CR-1214-01', at: 55, change: 'OPS-Y2K-0055', system: 'BADGESYS', title: 'Badge database Y2K reindex', requester: 'boyd', window: '12/14/99 01:00–02:00', cab: 'CAB-1299-08', description: 'Rebuild badge database indexes with four-digit years. Readers cache locally for the hour.' },
    { kind: 'records', id: 'n5r1', ref: 'RQ-1214-01', at: 85, requester: 'sato', record: 'RX-2216', purpose: 'Temperature excursion review, F-12' },
    { kind: 'access', id: 'n5a2', ref: 'AR-1214-02', at: 115, requester: 'reyes', area: 'B3', date: N, window: '02:00–04:00', purpose: 'Cold storage audit', approver: 'ashcombe' },
    { kind: 'change', id: 'n5c2', ref: 'CR-1214-02', at: 150, change: 'OPS-Y2K-0056', system: 'MAILSRV', title: 'Mail archive Y2K migration', requester: 'nakamura', window: '12/16/99 00:00–02:00', cab: 'CAB-1299-10', description: 'Migrate the mail archive to the Y2K-certified store. Archive read-only during the window.' },
    { kind: 'records', id: 'n5r2', ref: 'RQ-1214-02', at: 190, requester: 'arliss', record: 'RX-8810', purpose: 'Personnel matter (Tolliver, R.)' },
    { kind: 'access', id: 'n5a3', ref: 'AR-1214-03', at: 230, requester: 'ashcombe', area: 'B3V', date: N, window: '03:00–04:00', purpose: 'Scheduled maintenance per SAP roster', approver: 'varga' },
    { kind: 'records', id: 'n5r3', ref: 'RQ-1214-03', at: 270, requester: 'boyd', record: 'RX-6120', purpose: 'Y2K test evidence for CAB' },
    { kind: 'change', id: 'n5c3', ref: 'CR-1214-03', at: 320, change: 'OPS-Y2K-0061', system: 'HVAC-CTL', title: 'B3 HVAC failover test', requester: 'lindqvist', window: '12/21/99 02:00–03:00', cab: 'CAB-1299-41', description: 'Fail B3 air handling over to the backup unit and back. Containment pressure monitored.' },
    { kind: 'access', id: 'n5a4', ref: 'AR-1214-04', at: 380, requester: 'pike', area: 'B3', date: N, window: '05:00–06:00', purpose: 'Walk-through, east airlock', approver: 'coyle' },
  ],
  mails: [
    {
      id: 'n5m1',
      at: 0,
      from: 'Judith Kraemer',
      addr: 'jkraemer@mcra.hlts.com',
      subject: 'Night lead',
      effect: { flags: { lead: true } },
      body: `Effective immediately, Raymond Tolliver is on administrative leave.

You will act as Night Operations Lead until further notice. Your SENTINEL profile now includes lead access: the session audit (LOGS → SESSIONS) and exception authority.

Questions come to me. Do not contact Mr. Tolliver.

— J. Kraemer, Operations Manager`,
    },
    {
      id: 'n5m2',
      at: 205,
      from: 'Ray',
      addr: 'ray.tolliver@mtnstate.net',
      subject: "don't reply",
      personal: true,
      body: `Don't reply to this. Don't print it.

I looked where you looked. Twenty years I never asked a question on that ridge, and the first week I ask one they put me on leave.

I took a copy of the 0417 log home on a floppy. They know. Two men came to my house Sunday and asked for it nicely. I gave it to them. They weren't Security. They weren't anybody I've ever seen on the ridge.

Burn your notes. Or don't. I'm not your boss anymore.

— Ray`,
    },
    {
      id: 'n5m3',
      at: 440,
      from: 'Toby Marchetti',
      addr: 'tmarchetti@mcra.hlts.com',
      subject: '(no subject)',
      body: `Kraemer says not to talk about Ray. So I'm not talking about Ray.

I'm talking about how Ray's truck has been in his driveway for three days and he doesn't answer the door.

18 days.

— T`,
    },
  ],
  netsends: [
    {
      id: 'n5ns1',
      at: 478,
      from: 'LANTERN',
      body: () =>
        [
          'Your supervisor asked the right questions of the wrong people. Do not make his mistake.',
          '',
          'Pin what you know. The BOARD will show you what you cannot see yet.',
          '— L',
        ].join('\n'),
    },
  ],
  calls: [
    {
      id: 'n5call_reyes',
      at: 80,
      from: 'reyes',
      place: 'Microbiology · Lab B2-4',
      start: 'a',
      nodes: {
        a: { who: 'them', text: "It's Naomi Reyes. I heard about Ray. I'm so sorry.", next: 'b' },
        b: {
          who: 'them',
          text: 'He came to my lab last week. He asked about Paul. About the freezer. I told him what I told you.',
          choices: [
            { text: 'Did you tell anyone that Ray was asking?', to: 'c1' },
            { text: 'Did Paul ever talk about where he came from?', to: 'c2' },
          ],
        },
        c1: {
          who: 'them',
          text: 'Only Dr. Ashcombe. On Friday he asked me if anyone had been asking about Paul. I said Ray. I said Ray. Oh God.',
          effect: { flags: { reyes_guilt: true } },
          next: 'z',
        },
        c2: {
          who: 'them',
          text: "Once. He said he still got letters from 'home' and he burned them without opening them. He said home was a country that didn't exist anymore.",
          effect: { flags: { reyes_home: true } },
          next: 'z',
        },
        z: { who: 'them', text: 'Please be careful. I mean it.', end: true },
      },
    },
  ],
};
