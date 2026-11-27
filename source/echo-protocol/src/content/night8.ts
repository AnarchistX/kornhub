import type { NightDef } from '../engine/types';
import { RECORDS } from './world';
import { CALENDAR2 } from './night5';

const N = '12/21/99';

export const NIGHT8: NightDef = {
  n: 8,
  weekday: 'Monday',
  date: '12/20/99',
  nextDate: N,
  longDate: 'December 20, 1999',
  daysLeft: 11,
  minuteMs: 1300,
  sticky: "11 days.\nThe Deputy Director asked me your name today.\nI said I didn't know it. Was that right??\n\n— T",
  directives: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10'],
  calendar: CALENDAR2,
  records: Object.keys(RECORDS),
  tickets: [
    {
      kind: 'change',
      id: 'n8c1',
      ref: 'CR-1220-01',
      at: 8,
      change: 'OPS-Y2K-0058',
      system: 'LOGISTICS',
      title: 'Y2K contingency transfer: B3 cold storage → HL-OFFSITE',
      requester: 'ashcombe',
      window: '12/31/99 23:30–00:30',
      cab: 'CAB-1299-11',
      description: 'Relocate B3 cold storage (freezers F-10 to F-12) to the Halvard-Lowe offsite facility during the rollover, as a Y2K contingency. Escort: H-L Security. Vehicle at Gate 1, 23:30.',
    },
    { kind: 'access', id: 'n8a1', ref: 'AR-1220-01', at: 40, requester: 'marsh', area: 'ADM', date: N, window: '09:00–17:00', purpose: 'Y2K transition planning', approver: 'coyle' },
    { kind: 'records', id: 'n8r1', ref: 'RQ-1221-01', at: 75, requester: 'ferris', record: 'RX-6121', purpose: 'Archive copy for Records Management' },
    { kind: 'access', id: 'n8a2', ref: 'AR-1221-02', at: 120, requester: 'reyes', area: 'B3', date: N, window: '02:00–04:00', purpose: 'Pack F-12 for transfer', approver: 'ashcombe' },
    { kind: 'records', id: 'n8r2', ref: 'RQ-1221-02', at: 170, requester: 'boyd', record: 'RX-8810', purpose: 'Session cleanup before Y2K' },
    { kind: 'change', id: 'n8c2', ref: 'CR-1221-02', at: 220, change: 'OPS-Y2K-0064', system: 'RECSYS', title: 'RECSYS archive purge (pre-Y2K)', requester: 'ashcombe', window: '12/21/99 03:00–04:00', cab: 'CAB-1299-16', description: 'Purge RECSYS archive partitions older than 90 days ahead of the rollover.' },
    { kind: 'access', id: 'n8a3', ref: 'AR-1221-03', at: 280, requester: 'pruitt', area: 'B2', date: N, window: '04:00–08:00', purpose: 'Patrol relief, lab corridors', approver: 'pike', remark: 'THEY LOST MY RENEWAL. AGAIN. —L.P.' },
    { kind: 'records', id: 'n8r3', ref: 'RQ-1221-03', at: 340, requester: 'quinlan', record: 'RX-7002', purpose: 'Holiday visitor list' },
    { kind: 'access', id: 'n8a4', ref: 'AR-1221-04', at: 400, requester: 'hollis', area: 'OPS', date: N, window: '06:00–07:00', purpose: 'Generator test prep', approver: 'brennan' },
  ],
  mails: [
    {
      id: 'n8m1',
      at: 0,
      from: 'Judith Kraemer',
      addr: 'jkraemer@mcra.hlts.com',
      subject: 'Rollover staffing',
      body: `You are on the rollover shift: 12/31 22:00 to 01/01 06:00, as night lead.

Dr. Ashcombe's office will coordinate the Y2K contingency transfer (OPS-Y2K-0058) at 23:30. Facilities and Halvard-Lowe Security will be on site. Your role is to keep gate, badge and records systems stable through midnight.

— J. Kraemer`,
    },
    {
      id: 'n8m2',
      at: 452,
      from: 'Toby Marchetti',
      addr: 'tmarchetti@mcra.hlts.com',
      subject: 'rollover',
      body: `Saw the rollover roster. You and me and half of Halvard-Lowe Security, who I have never seen before in my life. They look like linebackers.

Why do we need linebackers for Y2K.

11 days.

— T`,
    },
  ],
  netsends: [
    {
      id: 'n8ns1',
      at: 478,
      from: 'LANTERN',
      body: (s) =>
        [
          s.flags.ashcombe === 'accepted' ? 'He offered you something, and you said yes.' : 'He offered you something.',
          'He offered Teodor something too, in 1994.',
          '',
          'Three nights. Then you choose.',
          '— L',
        ].join('\n'),
    },
  ],
  calls: [
    {
      id: 'n8call_ashcombe',
      at: 90,
      from: 'ashcombe',
      place: 'Office of the Deputy Director',
      start: 'a',
      nodes: {
        a: { who: 'them', text: "{first}. May I call you {first}? Martin Ashcombe. I run research up here. I'm told you're the best night operator we've had in years.", next: 'b' },
        b: { who: 'them', text: "I also know you've been reading things that aren't yours to read. Paul Whitlock's things. I'm not angry. Paul was a brilliant man, and a frightened one, near the end. He believed things.", next: 'c' },
        c: { who: 'them', text: "What we do here keeps people alive, {first}. Deterrence is an ugly word for a beautiful idea: nobody ever uses the thing, because everybody knows we have it.", next: 'd' },
        d: {
          who: 'them',
          text: "I need someone I trust on nights over the rollover. Permanent lead. Level four. A raise your father wouldn't believe. All you do on the thirty-first is keep the systems quiet.",
          choices: [
            { text: "I'll do it.", to: 'e1', effect: { flags: { ashcombe: 'accepted' } } },
            { text: 'I need to think about it.', to: 'e2', effect: { flags: { ashcombe: 'stalled' } } },
            { text: "Whitlock wasn't confused. He was scared of you.", to: 'e3', effect: { flags: { ashcombe: 'refused' }, suspicion: 10 } },
          ],
        },
        e1: { who: 'them', text: 'Good. I knew you would understand. Merry Christmas, {first}.', end: true },
        e2: { who: 'them', text: 'Think quickly. The year is ending.', end: true },
        e3: { who: 'them', text: "...I'm sorry you feel that way. Drive carefully on Route 9, {first}. It ices over this time of year.", end: true },
      },
    },
    {
      id: 'n8call_reyes',
      at: 262,
      from: 'reyes',
      place: 'Home · Hollins Gap',
      start: 'a',
      nodes: {
        a: { who: 'them', text: "It's Naomi. They're packing my freezer for the thirty-first. I'm supposed to help them.", next: 'b' },
        b: {
          who: 'them',
          text: "There's a reporter. Simon Hale, at the Washington Ledger. He's done stories on the Pentagon before. He'll run it, if we give him enough.",
          effect: { flags: { reyes_press: true } },
          choices: [
            { text: 'Give me his fax number.', to: 'c1', effect: { flags: { reyes_press_eager: true } } },
            { text: 'Not yet. Let me think.', to: 'c2' },
          ],
        },
        c1: { who: 'them', text: "I'll put it in your mail slot. I'm leaving after Christmas, {first}. I can't stay here.", next: 'z' },
        c2: { who: 'them', text: "Don't think too long. I'm leaving after Christmas. I can't stay here.", next: 'z' },
        z: { who: 'them', text: 'Goodnight.', end: true },
      },
    },
  ],
};
