import type { BadgeLogEntry, GameState, NightDef } from '../engine/types';

const D = '12/06/99';
const N = '12/07/99';

const whitlockLine = (s: GameState) => {
  const c = s.flags.n1_whitlock;
  if (c === 'logged') return '03:12. You logged it as a fault. That is what he wants everyone to do.';
  if (c === 'escalated') return '03:12. You sent it to Security. Now Security will send it to him. Look at the log.';
  return '03:12. You did not open it. Most people do not.';
};

export const NIGHT1: NightDef = {
  n: 1,
  weekday: 'Monday',
  date: D,
  nextDate: N,
  longDate: 'December 6, 1999',
  daysLeft: 25,
  minuteMs: 1300,
  directives: ['D1', 'D2', 'D3', 'D4'],
  tickets: [
    { kind: 'access', id: 'n1t1', ref: 'AR-1206-01', at: 4, requester: 'hollis', area: 'OPS', date: D, window: '23:30–01:00', purpose: 'Replace HVAC filters, server room', approver: 'brennan', tutorial: 'approve' },
    { kind: 'access', id: 'n1t2', ref: 'AR-1206-02', at: 18, requester: 'odom', area: 'B3', date: N, window: '00:00–02:00', purpose: 'Sample inventory, cold storage', approver: 'reyes', tutorial: 'clearance' },
    { kind: 'access', id: 'n1t3', ref: 'AR-1206-03', at: 34, requester: 'pruitt', area: 'B2', date: N, window: '00:30–04:00', purpose: 'Patrol relief, lab corridors', approver: 'pike', tutorial: 'badge' },
    { kind: 'access', id: 'n1t4', ref: 'AR-1206-04', at: 55, requester: 'sato', area: 'B2', date: N, window: '01:00–03:00', purpose: 'Incubator temperature check', approver: 'ashcombe' },
    { kind: 'access', id: 'n1t5', ref: 'AR-1207-05', at: 80, requester: 'delgado', area: 'ADM', date: N, window: '01:00–03:00', purpose: 'Floor care, second-floor offices', approver: 'brennan' },
    { kind: 'access', id: 'n1t6', ref: 'AR-1207-06', at: 108, requester: 'garrity', area: 'ADM', date: N, window: '09:00–09:30', purpose: 'Collect personal effects from desk', approver: 'reyes', remark: 'Escort requested. —N.R.' },
    { kind: 'access', id: 'n1t7', ref: 'AR-1207-07', at: 150, requester: 'ashcombe', area: 'B3V', date: N, window: '02:00–03:00', purpose: 'Scheduled maintenance per SAP roster', approver: 'varga' },
    { kind: 'access', id: 'n1t8', ref: 'AR-1207-08', at: 178, requester: 'quinlan', area: 'OPS', date: N, window: '02:30–03:00', purpose: 'Coffee machine, OPS break room. This is an emergency.', approver: 'pike' },
    { kind: 'access', id: 'n1t9', ref: 'AR-1207-09', at: 210, requester: 'reyes', area: 'B3', date: N, window: '03:30–05:00', purpose: 'Inventory reconciliation, freezer F-12', approver: 'ashcombe' },
    { kind: 'alert', id: 'n1a1', ref: 'SEN-0312-B3E2', at: 252, title: 'Reader fault · B3-EAST-2' },
    { kind: 'access', id: 'n1t10', ref: 'AR-1207-10', at: 285, requester: 'marchetti', area: 'OPS', date: N, window: '06:30–07:30', purpose: 'Early start, Y2K patch staging', approver: 'tolliver' },
    { kind: 'access', id: 'n1t11', ref: 'AR-1207-11', at: 315, requester: 'odom', area: 'B3', date: N, window: '05:00–07:00', purpose: 'Media prep for Dr. Reyes', approver: 'sato' },
    { kind: 'access', id: 'n1t12', ref: 'AR-1207-12', at: 350, requester: 'hollis', area: 'B3', date: N, window: '05:00–06:00', purpose: 'HVAC damper inspection, east airlock', approver: 'brennan' },
    { kind: 'access', id: 'n1t13', ref: 'AR-1207-13', at: 400, requester: 'kraemer', area: 'ADM', date: N, window: '06:00–18:00', purpose: 'Y2K readiness review with corporate', approver: 'marsh' },
    { kind: 'access', id: 'n1t14', ref: 'AR-1207-14', at: 430, requester: 'pruitt', area: 'B2', date: N, window: '06:30–08:00', purpose: 'Patrol relief, lab corridors', approver: 'pike', remark: 'Renewal submitted 12/01. We are short-staffed. Approve it. —L.P.' },
  ],
  mails: [
    {
      id: 'n1m1',
      at: 0,
      from: 'Ray Tolliver',
      addr: 'rtolliver@mcra.hlts.com',
      subject: 'Welcome to nights',
      body: `{first} —

Welcome to nights. You're on your own from 2300 to 0700, so here's the short version.

THE JOB. Everything comes through the QUEUE. Access requests, mostly. Check each one against the DIRECTIVES and the PERSONNEL record that comes attached. Clean? APPROVE. Not clean? DENY, and cite the directive it breaks. Don't guess. Don't be nice.

ERRORS. Security audits the queue every morning. You get a couple of mistakes a night before I have to write you up. Three write-ups and they walk you to your car. I've done it. I hated it. Don't make me.

READER FAULTS. The B3 readers throw garbage after midnight. Moisture in the east airlock. That's KI-114 on the known issues list. Log it as a reader fault and move on. Do NOT page Security about it. They hate that more than I do.

Y2K. Twenty-five days. Then we find out who wrote their dates right.

Don't call me unless something is on fire. Actually on fire.

— Ray`,
    },
    {
      id: 'n1m2',
      at: 135,
      from: 'Ray Tolliver',
      addr: 'rtolliver@mcra.hlts.com',
      subject: 'One more thing',
      unlocks: ['D5'],
      body: `Forgot one.

If a request has a COMPARTMENT code on the area (red block, you can't miss it), it's not ours. Don't approve it. Don't deny it. Don't read it. FORWARD it to Program Security. That's D-5. It's in your directives now.

Those come from the Deputy Director's people. They don't like questions, and neither do I.

— R.`,
    },
    {
      id: 'n1m3',
      at: 0,
      from: 'Security Operations',
      addr: 'secops@mcra.hlts.com',
      subject: 'SEC-4471 received',
      when: (s) => s.flags.n1_whitlock === 'escalated',
      body: `Your report has been logged as SEC-4471 (READER FAULT, B3-EAST-2, 03:12).

A Security Officer will review it at the start of day shift.

This is an automated message. Do not reply.`,
    },
    {
      id: 'n1m4',
      at: 385,
      from: 'Casey',
      addr: 'kc_{last}@hotmail.com',
      subject: 'you are alive??',
      personal: true,
      body: `hey you,

Mom says you got the government job?? NIGHT OPERATIONS TECHNICIAN. very fancy. does it come with a trench coat. does it come with a decoder ring.

seriously though, proud of you. don't let them work you to death in a bunker.

finals start monday and half my floor has the flu. the whole dorm sounds like a tuberculosis ward. living on DayQuil and spite.

coming home on the 18th. you better be awake for once.

— C

p.s. mom wants to know if you're eating. I said no.`,
    },
    {
      id: 'n1m5',
      at: 455,
      from: 'Toby Marchetti',
      addr: 'tmarchetti@mcra.hlts.com',
      subject: 'early',
      body: `In at 6:30 for patch staging. There are donuts in the break room. They are for the Y2K war room. They are not for you.

Okay, one is for you.

24 days. I have 40 gallons of water in my garage and I am not even sorry.

— T`,
    },
  ],
  netsends: [
    {
      id: 'n1ns1',
      at: 478,
      from: 'LANTERN',
      body: (s) =>
        [
          whitlockLine(s),
          '',
          'It happened before. 21/10. 02/11. 16/11. 30/11. Always after three.',
          ...(s.flags.n1_copied_log ? ['', 'You kept a copy. Good. Keep it where they cannot search.'] : []),
          '',
          'A dead man does not work nights.',
          '— L',
        ].join('\n'),
    },
  ],
};

/** Badge reader history visible in the Logs app. Entries with `at` appear during Night 1. */
export const BADGE_LOG: BadgeLogEntry[] = [
  { date: '10/13/99', time: '07:58:12', reader: 'ADM-MAIN', badge: '0417', event: 'GRANTED' },
  { date: '10/13/99', time: '08:20:41', reader: 'B3-EAST-1', badge: '0417', event: 'GRANTED' },
  { date: '10/13/99', time: '18:05:03', reader: 'ADM-MAIN', badge: '0417', event: 'GRANTED' },
  { date: '10/21/99', time: '03:14:08', reader: 'B3-EAST-2', badge: '0417', event: 'GRANTED' },
  { date: '11/02/99', time: '03:11:52', reader: 'B3-EAST-2', badge: '0417', event: 'GRANTED' },
  { date: '11/16/99', time: '03:13:30', reader: 'B3-EAST-2', badge: '0417', event: 'GRANTED' },
  { date: '11/30/99', time: '03:12:17', reader: 'B3-EAST-2', badge: '0417', event: 'GRANTED' },
  { date: '12/06/99', time: '07:12:55', reader: 'ADM-MAIN', badge: '0388', event: 'GRANTED' },
  { date: '12/06/99', time: '08:02:10', reader: 'B3-EAST-1', badge: '0388', event: 'GRANTED' },
  { date: '12/06/99', time: '17:41:37', reader: 'ADM-MAIN', badge: '0102', event: 'GRANTED' },
  { date: '12/06/99', time: '22:48:09', reader: 'GATE-1', badge: '1187', event: 'GRANTED' },
  { date: '12/06/99', time: '22:51:30', reader: 'OPS-NOC', badge: '1187', event: 'GRANTED' },
  { date: '12/06/99', time: '22:55:02', reader: 'GATE-1', badge: '0592', event: 'GRANTED' },
  { date: '12/06/99', time: '23:31:44', reader: 'OPS-SRV', badge: '0772', event: 'GRANTED', at: 32 },
  { date: '12/07/99', time: '01:02:18', reader: 'ADM-2F', badge: '1033', event: 'GRANTED', at: 122 },
  { date: '12/07/99', time: '01:58:40', reader: 'B3-VAULT', badge: '0102', event: 'GRANTED', at: 179 },
  { date: '12/07/99', time: '02:31:06', reader: 'OPS-BRK', badge: '0592', event: 'GRANTED', at: 211 },
  { date: '12/07/99', time: '02:57:12', reader: 'B3-VAULT', badge: '0102', event: 'GRANTED', at: 237 },
  { date: '12/07/99', time: '03:12:44', reader: 'B3-EAST-2', badge: '0417', event: 'GRANTED', at: 252 },
  { date: '12/07/99', time: '03:33:51', reader: 'B3-EAST-1', badge: '0388', event: 'GRANTED', at: 273 },
];

export const PURGE_AT = 316; // 04:16. If the player escalated, the 03:12 record is scrubbed.
