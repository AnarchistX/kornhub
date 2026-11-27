import type { NightDef } from '../engine/types';
import { RECORDS } from './world';
import { CALENDAR2 } from './night5';

const N = '12/16/99';

export const NIGHT6: NightDef = {
  n: 6,
  weekday: 'Wednesday',
  date: '12/15/99',
  nextDate: N,
  longDate: 'December 15, 1999',
  daysLeft: 16,
  minuteMs: 1300,
  sticky: "Pike's people were in here at 6 a.m.\nThey took Ray's mug.\nWHO TAKES A MUG.\n\n— T",
  directives: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10'],
  calendar: CALENDAR2,
  records: Object.keys(RECORDS),
  tickets: [
    { kind: 'access', id: 'n6a1', ref: 'AR-1215-01', at: 8, requester: 'delgado', area: 'ADM', date: N, window: '00:30–02:30', purpose: 'Floor care, executive suite', approver: 'brennan' },
    { kind: 'records', id: 'n6r1', ref: 'RQ-1215-01', at: 30, requester: 'reyes', record: 'RX-2216', purpose: 'Why did F-12 warm up on 11/30?' },
    { kind: 'change', id: 'n6c1', ref: 'CR-1216-01', at: 60, change: 'OPS-Y2K-0056', system: 'MAILSRV', title: 'Mail archive Y2K migration', requester: 'nakamura', window: '12/16/99 00:00–03:00', cab: 'CAB-1299-10', description: 'Migrate the mail archive to the Y2K-certified store. Archive read-only during the window.' },
    { kind: 'records', id: 'n6r2', ref: 'RQ-1216-02', at: 95, requester: 'ashcombe', record: 'RX-8810', purpose: 'Y2K audit of Night Operations', remark: 'For the Y2K audit. Thank you. —M.A.' },
    { kind: 'access', id: 'n6a2', ref: 'AR-1216-02', at: 130, requester: 'sato', area: 'B2', date: N, window: '02:00–04:00', purpose: 'Incubator check', approver: 'reyes' },
    {
      kind: 'alert',
      id: 'n6x1',
      ref: 'SEN-0155-LOGON',
      at: 175,
      title: 'Logon failures · your account',
      heading: 'SENTINEL ACCOUNT EVENT',
      lines: [
        { k: 'EVENT', v: 'FAILED LOGON × 3 · account {login}' },
        { k: 'HOST', v: 'ADM-2F-PC14 · Administration, 2nd floor' },
        { k: 'TIME', v: '12/16/99 01:55:10' },
        { k: 'NOTE', v: 'You are logged on at OPS-NOC-01.' },
        { k: 'MATCHES', v: 'none' },
      ],
      flag: 'n6_intrusion',
      options: [
        { value: 'locked', label: 'Lock my account & reset', done: '> PASSWORD RESET · SESSION ADM-2F-PC14 REFUSED' },
        { value: 'escalated', label: 'Escalate to Security', danger: true, done: '> ESCALATED TO SECURITY · SEC-4603 · AWAITING REVIEW' },
      ],
    },
    { kind: 'change', id: 'n6c2', ref: 'CR-1216-02', at: 220, change: 'OPS-Y2K-0063', system: 'GATE', title: 'Gate controller Y2K patch', requester: 'boyd', window: '12/24/99 01:00–01:30', cab: 'CAB-1299-15', description: 'Patch the Gate 1 barrier controller clock. Barrier held open manually for 30 minutes.' },
    { kind: 'records', id: 'n6r3', ref: 'RQ-1216-03', at: 270, requester: 'garrity', record: 'RX-2290', purpose: 'Training certificates (second request)' },
    { kind: 'access', id: 'n6a3', ref: 'AR-1216-03', at: 330, requester: 'hollis', area: 'B3', date: N, window: '04:00–05:00', purpose: 'Check F-12 compressor', approver: 'lindqvist' },
    { kind: 'change', id: 'n6c3', ref: 'CR-1216-03', at: 390, change: 'OPS-Y2K-0061', system: 'HVAC-CTL', title: 'B3 HVAC failover test', requester: 'lindqvist', window: '12/21/99 02:00–03:00', cab: 'CAB-1299-14', description: 'Fail B3 air handling over to the backup unit and back. Containment pressure monitored.' },
  ],
  mails: [
    {
      id: 'n6m1',
      at: 0,
      from: 'Judith Kraemer',
      addr: 'jkraemer@mcra.hlts.com',
      subject: 'Change freeze',
      body: `Reminder: the Y2K change freeze begins 12/24 at 00:00. Nothing is released after that date except calendar items already approved.

— J. Kraemer`,
    },
    {
      id: 'n6m2',
      at: 0,
      from: 'Security Operations',
      addr: 'secops@mcra.hlts.com',
      subject: 'SEC-4603 received',
      when: (s) => s.flags.n6_intrusion === 'escalated',
      body: `Your report has been logged as SEC-4603 (FAILED LOGON, ADM-2F-PC14).

Note: ADM-2F-PC14 is assigned to the Office of the Deputy Director.

This is an automated message. Do not reply.`,
    },
    {
      id: 'n6m3',
      at: 300,
      from: 'Casey',
      addr: 'kc_{last}@hotmail.com',
      subject: 'coming home early',
      personal: true,
      body: `denise is in the ICU. they keep saying "unusual presentation." they closed the third floor of our dorm.

I'm coming home on the 17th instead of the 18th. mom is making up the guest room like I'm a hotel guest.

can you pick me up from the bus? 4pm. you'll be asleep. I know. pick me up anyway.

— C`,
    },
    {
      id: 'n6m4',
      at: 450,
      from: 'Toby Marchetti',
      addr: 'tmarchetti@mcra.hlts.com',
      subject: 'mug update',
      body: `I asked Pike about the mug. She said "what mug." Then she said "go home, Toby."

I am going home. 16 days.

— T`,
    },
  ],
  netsends: [
    {
      id: 'n6ns1',
      at: 478,
      from: 'LANTERN',
      body: (s) =>
        [
          s.flags.fbi_told_lantern
            ? 'You told the woman from the Bureau about me. I am not angry. In your place I would have done the same.'
            : 'The woman from the Bureau called you. Be careful what you give her.',
          'Not everyone in her building works only for her building.',
          '',
          s.night.results.n6r2?.decision === 'approve' ? 'And you gave him your session logs. Now he knows what you have read.' : 'He asked for your session logs tonight. You said no. Good.',
          '— L',
        ].join('\n'),
    },
  ],
  calls: [
    {
      id: 'n6call_fbi',
      at: 62,
      from: 'calloway',
      place: 'FBI · Pittsburgh Field Office',
      start: 'a',
      nodes: {
        a: { who: 'them', text: "{mr} {last}? Special Agent Ruth Calloway, FBI. This line is secure on my end. I'll be brief.", effect: { flags: { fbi_contact: true } }, next: 'b' },
        b: {
          who: 'them',
          text: "We track foreign intelligence officers. One has been seen in Kessick County twice this month. We think they're cultivating someone at the Annex. Has anyone contacted you? Anyone you don't know?",
          choices: [
            { text: "Someone who signs 'L' messages me at night.", to: 'c1', effect: { flags: { fbi_told_lantern: true } } },
            { text: 'No one.', to: 'c2', effect: { flags: { fbi_lied: true } } },
            { text: 'Why would they want me?', to: 'c3' },
          ],
        },
        c1: { who: 'them', text: "Thank you. Keep talking to them. Don't give them anything. And don't tell anyone at the Annex about this call. Including Security.", next: 'z' },
        c2: { who: 'them', text: 'All right. If that changes, you call this number. Day or night.', next: 'z' },
        c3: { who: 'them', text: "Because night operators see everything and nobody ever looks at them. Think about it. Call me if anyone reaches out.", next: 'z' },
        z: { who: 'them', text: 'Goodnight.', end: true },
      },
    },
  ],
};
