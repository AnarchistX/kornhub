import type { NightDef } from '../engine/types';
import { RECORDS } from './world';
import { CALENDAR2 } from './night5';

const N = '12/24/99';
const chose = (id: string) => (s: { flags: Record<string, unknown> }) => s.flags.act2_choice === id;

export const NIGHT9: NightDef = {
  n: 9,
  weekday: 'Thursday',
  date: '12/23/99',
  nextDate: N,
  longDate: 'December 23, 1999',
  daysLeft: 8,
  minuteMs: 1300,
  sticky: "Last shift before Christmas.\nI'm off till the 31st. War room.\nDon't do anything I wouldn't do.\n\n— T",
  directives: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10'],
  calendar: CALENDAR2,
  records: Object.keys(RECORDS),
  tickets: [
    { kind: 'access', id: 'n9a1', ref: 'AR-1223-01', at: 10, requester: 'delgado', area: 'ADM', date: N, window: '00:30–02:30', purpose: 'Holiday deep clean', approver: 'brennan' },
    { kind: 'change', id: 'n9c1', ref: 'CR-1224-01', at: 40, change: 'OPS-Y2K-0065', system: 'PBX', title: 'Holiday call forwarding', requester: 'boyd', window: '12/24/99 00:30–01:00', cab: 'CAB-1299-17', description: 'Forward the main switchboard to the Y2K war room over the holidays.' },
    { kind: 'records', id: 'n9r1', ref: 'RQ-1224-01', at: 80, requester: 'sato', record: 'RX-2210', purpose: 'Inventory before the transfer' },
    { kind: 'access', id: 'n9a2', ref: 'AR-1224-02', at: 200, requester: 'ashcombe', area: 'B3V', date: N, window: '03:00–04:00', purpose: 'Scheduled maintenance per SAP roster', approver: 'varga' },
    { kind: 'records', id: 'n9r2', ref: 'RQ-1224-02', at: 260, requester: 'pike', record: 'RX-7002', purpose: 'Rollover night visitor list' },
    { kind: 'access', id: 'n9a3', ref: 'AR-1224-03', at: 330, requester: 'quinlan', area: 'OPS', date: N, window: '06:00–06:30', purpose: 'Shift handover', approver: 'pike' },
  ],
  mails: [
    {
      id: 'n9m1',
      at: 0,
      from: 'Judith Kraemer',
      addr: 'jkraemer@mcra.hlts.com',
      subject: 'Change freeze in effect',
      body: `The Y2K change freeze starts at midnight. Release nothing that isn't already on the calendar.

Merry Christmas.

— J. Kraemer`,
    },
    {
      id: 'n9m2',
      at: 90,
      from: 'Naomi Reyes',
      addr: 'nreyes@mcra.hlts.com',
      subject: '(no subject)',
      when: (s) => !!s.flags.reyes_press,
      body: `Simon Hale says he can run it on the 31st if he has it tonight.

His newsroom fax is (202) 555-0148. He'll know it's from us.

I'm sorry I'm making you do this. I'm sorry for a lot of things.

— N.`,
    },
    {
      id: 'n9m3',
      at: 110,
      from: 'Office of the Deputy Director',
      addr: 'odd@mcra.hlts.com',
      subject: 'Your lead appointment',
      when: (s) => !!s.flags.ashcombe,
      body: `Congratulations on your appointment as Night Operations Lead, effective 01/01/2000.

As part of Y2K records hygiene, please bring any personal copies of Annex records to this office on 12/31 for secure destruction. You may also transmit them to us electronically.

— Office of the Deputy Director, for Dr. M. Ashcombe`,
    },
  ],
  netsends: [
    {
      id: 'n9ns1',
      at: 150,
      from: 'LANTERN',
      effect: { flags: { outbox_open: true } },
      body: () => 'It is the twenty-third.\n\nOpen your BOARD. There is an OUTBOX now. Choose who gets what you know.\nChoose carefully. Everyone is listening tonight.\n— L',
    },
    { id: 'n9ns_lantern', at: 0, from: 'LANTERN', when: chose('lantern'), body: () => 'Received. All of it. Thank you, archivist.\n\nGo to work on the thirty-first as usual. Do not be surprised by anything you see.\n— L' },
    { id: 'n9ns_none', at: 0, from: 'LANTERN', when: chose('none'), body: () => 'You wiped it. Then you will watch.\n— L' },
    {
      id: 'n9ns2',
      at: 478,
      from: 'LANTERN',
      body: (s) => (s.flags.act2_choice ? 'Eight days.\n— L' : 'You chose no one. That is also a choice.\n\nEight days.\n— L'),
    },
  ],
  calls: [
    {
      id: 'n9call_fbi',
      at: 100,
      from: 'calloway',
      place: 'FBI · Pittsburgh Field Office',
      when: (s) => !!s.flags.fbi_contact,
      start: 'a',
      nodes: {
        a: { who: 'them', text: "It's the twenty-third. If you have documents, fax them to (412) 555-0193 tonight. Only I read that machine.", effect: { flags: { fbi_fax: true } }, next: 'z' },
        z: { who: 'them', text: "Whatever you decide, don't tell me on this line. Goodnight.", end: true },
      },
    },
    {
      id: 'n9call_fbi_got',
      at: 0,
      from: 'calloway',
      place: 'FBI · Pittsburgh Field Office',
      when: chose('fbi'),
      start: 'a',
      nodes: {
        a: { who: 'them', text: "I have it. All of it. I've read the letter twice.", next: 'b' },
        b: {
          who: 'them',
          text: "Listen to me carefully. Don't go to work on the thirty-first. Call in sick. Go see your family.",
          choices: [
            { text: "I'm the night lead. If I'm not there, they'll know.", to: 'c1', effect: { flags: { fbi_inside: true } } },
            { text: 'Okay.', to: 'c2', effect: { flags: { fbi_stayhome: true } } },
          ],
        },
        c1: { who: 'them', text: 'Then I will see you there. Don\'t look for me. Merry Christmas.', end: true },
        c2: { who: 'them', text: 'Good. Merry Christmas.', end: true },
      },
    },
    {
      id: 'n9call_press_got',
      at: 0,
      from: 'reyes',
      place: 'Home · Hollins Gap',
      when: chose('press'),
      start: 'a',
      nodes: {
        a: { who: 'them', text: "Simon has it. He says it runs on January second. Front page.", next: 'b' },
        b: { who: 'them', text: 'If there is a January second. ...I keep thinking about that truck at the gate. Goodnight.', end: true },
      },
    },
    {
      id: 'n9call_ashcombe_got',
      at: 0,
      from: 'ashcombe',
      place: 'Office of the Deputy Director',
      when: chose('ashcombe'),
      start: 'a',
      nodes: {
        a: { who: 'them', text: "Thank you, {first}. Truly. That can't have been easy.", next: 'b' },
        b: { who: 'them', text: "I'll see you on the thirty-first, lead. Bring a coat. It gets cold at the gate.", end: true },
      },
    },
  ],
};
