import type { NightDef } from '../engine/types';
import { RECORDS } from './world';
import { CALENDAR2 } from './night5';

const N = '12/18/99';

export const NIGHT7: NightDef = {
  n: 7,
  weekday: 'Friday',
  date: '12/17/99',
  nextDate: N,
  longDate: 'December 17, 1999',
  daysLeft: 14,
  minuteMs: 1300,
  sticky: "Christmas party tomorrow.\nNights aren't invited.\nI'll save you a cookie. Probably.\n\n— T",
  directives: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10'],
  calendar: CALENDAR2,
  records: Object.keys(RECORDS),
  tickets: [
    { kind: 'access', id: 'n7a1', ref: 'AR-1217-01', at: 8, requester: 'quinlan', area: 'OPS', date: N, window: '00:00–00:30', purpose: 'Radio check, NOC', approver: 'pike' },
    { kind: 'records', id: 'n7r1', ref: 'RQ-1217-01', at: 30, requester: 'pike', record: 'RX-3305', purpose: 'Who requests the B3 camera work orders?' },
    { kind: 'change', id: 'n7c1', ref: 'CR-1218-01', at: 60, change: 'OPS-Y2K-0063', system: 'GATE', title: 'Gate controller Y2K patch', requester: 'boyd', window: '12/24/99 01:00–02:00', cab: 'CAB-1299-15', description: 'Patch the Gate 1 barrier controller clock. Barrier held open manually during the window.' },
    { kind: 'access', id: 'n7a2', ref: 'AR-1218-02', at: 95, requester: 'odom', area: 'B3', date: N, window: '01:00–03:00', purpose: 'F-12 inventory for Y2K transfer', approver: 'reyes' },
    { kind: 'records', id: 'n7r2', ref: 'RQ-1218-02', at: 150, requester: 'nakamura', record: 'RX-6121', purpose: 'CAB minutes for the change record' },
    { kind: 'access', id: 'n7a3', ref: 'AR-1218-03', at: 220, requester: 'ashcombe', area: 'B3V', date: N, window: '03:00–04:00', purpose: 'Scheduled maintenance per SAP roster', approver: 'varga' },
    { kind: 'change', id: 'n7c2', ref: 'CR-1218-02', at: 280, change: 'OPS-Y2K-0061', system: 'HVAC-CTL', title: 'B3 HVAC failover test', requester: 'lindqvist', window: '12/21/99 02:00–03:00', cab: 'CAB-1299-14', description: 'Fail B3 air handling over to the backup unit and back. Containment pressure monitored.' },
    { kind: 'records', id: 'n7r3', ref: 'RQ-1218-03', at: 340, requester: 'reyes', record: 'RX-9001', purpose: 'Where is my freezer going on the 31st?' },
    { kind: 'access', id: 'n7a4', ref: 'AR-1218-04', at: 400, requester: 'brennan', area: 'B1', date: N, window: '06:00–07:00', purpose: 'War room setup, B1 conference', approver: 'kraemer' },
  ],
  mails: [
    {
      id: 'n7fax',
      at: 125,
      fax: true,
      from: 'RELAY · VIENNA',
      addr: 'RELAY VIENNA +43 1 ••• ••••',
      subject: 'FOR THE ARCHIVIST',
      photo: { seed: 47, sex: 'm', hair: 1 },
      effect: { flags: { n7_fax: true } },
      body: `KALNITSA INSTITUTE OF APPLIED MICROBIOLOGY
REPUBLIC OF ORVESSA · PERSONNEL CARD (TRANSLATED)

NAME       VLASKO, Teodor Andreyevich
BORN       04/03/1951, Kalnitsa
POSITION   Senior Researcher, Laboratory 31
PROGRAM    STRAIN 31 (closed)
STATUS     DEFECTED 11/09/1993, Vienna

INVENTORY NOTE · LABORATORY 31 · 14/09/1993
  Strain 31, master stock: 4 ampoules MISSING.

[handwritten, in English:]
You asked who he was. Now you know.
— L`,
    },
    {
      id: 'n7m2',
      at: 262,
      from: 'Casey',
      addr: 'kc_{last}@hotmail.com',
      subject: 'home',
      personal: true,
      body: `home. thanks for the ride, zombie.

denise is still in the ICU. somebody said people from the CDC came to campus. the CDC. for a flu.

mom is boiling everything. the house smells like a hospital.

— C`,
    },
    {
      id: 'n7m3',
      at: 452,
      from: 'Toby Marchetti',
      addr: 'tmarchetti@mcra.hlts.com',
      subject: 'cookie',
      body: `I saved you a cookie. I ate the cookie. I'm sorry. It was a long party.

Ashcombe gave a toast about "a new chapter for Marrow Creek." Everybody clapped. Nobody knew what he meant.

14 days.

— T`,
    },
  ],
  netsends: [
    {
      id: 'n7ns1',
      at: 478,
      from: 'LANTERN',
      body: () => 'Now you know whose he was. And now you know whose I am.\n\nSix nights. Then you choose.\n— L',
    },
  ],
  calls: [
    {
      id: 'n7call_lantern',
      at: 190,
      from: '',
      name: 'LANTERN',
      role: 'Origin unknown',
      place: 'Relay · Vienna',
      video: false,
      start: 'a',
      nodes: {
        a: { who: 'them', text: 'Do not hang up. You have seen his face now.', next: 'b' },
        b: { who: 'them', text: 'Teodor was a son of my country, once. Then he took something that belonged to us and carried it to yours. And your people made it worse.', next: 'c' },
        c: {
          who: 'them',
          text: 'We want the same thing, you and I. We want ECHO to stop existing. On the twenty-third you will give me what you have. The letter. The manifest. The work orders. I will make it disappear.',
          choices: [
            { text: 'Who are you?', to: 'd1', effect: { flags: { lantern_asked: true } } },
            { text: 'Why should I trust you?', to: 'd2', effect: { flags: { lantern_asked: true } } },
            { text: 'No.', to: 'd3', effect: { flags: { lantern_refused: true } } },
          ],
        },
        d1: { who: 'them', text: 'Someone who writes the date correctly.', next: 'z' },
        d2: { who: 'them', text: 'You should not. Trust only that I want it gone more than he wants to keep it.', next: 'z' },
        d3: { who: 'them', text: 'Then on the last night of the year, you will watch it leave through Gate 1. Think about it.', next: 'z' },
        z: { who: 'them', text: 'Goodnight, archivist.', end: true },
      },
    },
    {
      id: 'n7call_fbi',
      at: 320,
      from: 'calloway',
      place: 'FBI · Pittsburgh Field Office',
      when: (s) => !!s.flags.fbi_contact,
      start: 'a',
      nodes: {
        a: { who: 'them', text: "It's Calloway. I'll be quick. Has your contact made an approach? Asked you for anything?", choices: [
          { text: 'They called tonight. They want everything on the 23rd.', to: 'b1', effect: { flags: { fbi_knows_23: true } } },
          { text: 'Nothing yet.', to: 'b2' },
        ] },
        b1: { who: 'them', text: "Stall them. Don't hand over anything. If you have documents, they come to me. On the 23rd I'll give you a fax number that only I read.", next: 'z' },
        b2: { who: 'them', text: 'If they do, stall. And call me.', next: 'z' },
        z: { who: 'them', text: 'Goodnight.', end: true },
      },
    },
  ],
};
