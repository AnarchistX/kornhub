import type { NightDef } from '../engine/types';
import { RECORDS } from './world';
import { CALENDAR } from './night2';

const N = '12/09/99';

export const NIGHT3: NightDef = {
  n: 3,
  weekday: 'Wednesday',
  date: '12/08/99',
  nextDate: N,
  longDate: 'December 8, 1999',
  daysLeft: 23,
  minuteMs: 1300,
  sticky: 'Records requests start tonight.\nLegal hold means NO.\nNo exceptions. Not even for doctors.\n\n— R.T.',
  directives: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'],
  calendar: CALENDAR,
  records: Object.keys(RECORDS),
  tickets: [
    { kind: 'records', id: 'n3r1', ref: 'RQ-1208-01', at: 6, requester: 'quinlan', record: 'RX-7002', purpose: 'Gate log review for December', tutorial: 'records' },
    { kind: 'records', id: 'n3r2', ref: 'RQ-1208-02', at: 22, requester: 'odom', record: 'RX-2210', purpose: 'Inventory audit, cold storage', tutorial: 'need' },
    { kind: 'access', id: 'n3a1', ref: 'AR-1208-01', at: 40, requester: 'delgado', area: 'ADM', date: N, window: '00:30–02:30', purpose: 'Floor care, first floor', approver: 'brennan' },
    { kind: 'records', id: 'n3r3', ref: 'RQ-1208-03', at: 60, requester: 'brennan', record: 'RX-1102', purpose: 'Quarterly maintenance review' },
    { kind: 'change', id: 'n3c1', ref: 'CR-1209-01', at: 80, change: 'OPS-Y2K-0040', system: 'PAYROLL', title: 'Payroll date-field expansion', requester: 'nakamura', window: '12/09/99 01:00–03:00', cab: 'CAB-1199-21', description: 'Expand two-digit year fields in the payroll export to four digits.' },
    { kind: 'records', id: 'n3r4', ref: 'RQ-1209-04', at: 100, requester: 'reyes', record: 'RX-4471', purpose: "Handover of a deceased colleague's open experiments", remark: 'Please. —N.R.' },
    { kind: 'records', id: 'n3r5', ref: 'RQ-1209-05', at: 125, requester: 'ashcombe', record: 'RX-5010', purpose: 'Program review' },
    { kind: 'access', id: 'n3a2', ref: 'AR-1209-02', at: 150, requester: 'pruitt', area: 'B2', date: N, window: '01:00–05:00', purpose: 'Patrol relief, lab corridors', approver: 'pike', remark: 'I AM GOING TO LOSE MY MIND. —L.P.' },
    { kind: 'records', id: 'n3r6', ref: 'RQ-1209-06', at: 175, requester: 'reyes', record: 'RX-2214', purpose: 'Reconcile the R7 variance on 11/30' },
    {
      kind: 'alert',
      id: 'n3x1',
      ref: 'SEN-0220-XFER',
      at: 200,
      title: 'Transfer event · RECSYS',
      heading: 'SENTINEL TRANSFER EVENT',
      lines: [
        { k: 'EVENT', v: 'SCHEDULED EXPORT (UNREGISTERED)' },
        { k: 'SOURCE', v: 'RECSYS · archive partition 2' },
        { k: 'DEST', v: 'HL-CORP-XFER · Halvard-Lowe Corporate, Reston VA' },
        { k: 'SIZE', v: '14.2 MB' },
        { k: 'OWNER', v: 'svc_recsys (Office of the Deputy Director)' },
        { k: 'MATCHES', v: 'none' },
      ],
      flag: 'n3_xfer',
      options: [
        { value: 'log', label: 'Log as scheduled job' },
        { value: 'escalate', label: 'Escalate to Security' },
      ],
      done: { log: '> LOGGED AS SCHEDULED JOB · CLOSED', escalate: '> ESCALATED TO SECURITY · SEC-4512 · AWAITING REVIEW' },
    },
    { kind: 'records', id: 'n3r7', ref: 'RQ-1209-07', at: 230, requester: 'hollis', record: 'RX-3305', purpose: 'Work order cleanup' },
    { kind: 'change', id: 'n3c2', ref: 'CR-1209-02', at: 260, change: 'OPS-Y2K-0042', system: 'FIREWALL', title: 'Firewall rule-set Y2K review', requester: 'boyd', window: '12/10/99 00:30–01:30', cab: 'CAB-1199-22', description: 'Reload firewall rules with Y2K-safe logging timestamps.' },
    { kind: 'records', id: 'n3r8', ref: 'RQ-1209-08', at: 290, requester: 'pike', record: 'RX-3301', purpose: 'Incident review' },
    { kind: 'records', id: 'n3r9', ref: 'RQ-1209-09', at: 330, requester: 'garrity', record: 'RX-2290', purpose: 'Training certificates for a new job' },
    { kind: 'access', id: 'n3a3', ref: 'AR-1209-03', at: 370, requester: 'reyes', area: 'B3', date: N, window: '05:00–07:00', purpose: 'Cold storage, R7', approver: 'ashcombe' },
    { kind: 'records', id: 'n3r10', ref: 'RQ-1209-10', at: 410, requester: 'nakamura', record: 'RX-6120', purpose: 'Y2K readiness sign-off' },
  ],
  mails: [
    {
      id: 'n3m1',
      at: 0,
      from: 'Ray Tolliver',
      addr: 'rtolliver@mcra.hlts.com',
      subject: 'Records',
      unlocks: ['D9', 'D10'],
      body: `{first} —

Records requests start tonight. Somebody asks for a file, you check:
 D-9   Their clearance is at or above the record's level AND their
       department owns the record. Both. Not one.
 D-10  Legal hold means NO. For anyone. Doctors included.
       Especially doctors.

Compartmented records (ECHO and friends) get FORWARDED, same as the compartmented areas. The Records Index is in your binder.

— Ray`,
    },
    {
      id: 'n3m2',
      at: 0,
      from: 'Security Operations',
      addr: 'secops@mcra.hlts.com',
      subject: 'SEC-4512 received',
      when: (s) => s.flags.n3_xfer === 'escalated',
      body: `Your report has been logged as SEC-4512 (TRANSFER EVENT, RECSYS → HL-CORP-XFER).

A Security Officer will review it at the start of day shift.

This is an automated message. Do not reply.`,
    },
    {
      id: 'n3m3',
      at: 300,
      from: 'Casey',
      addr: 'kc_{last}@hotmail.com',
      subject: 'ok this is weird',
      personal: true,
      body: `remember my RA, Denise? she had the flu like everyone. got better. went to class for like two weeks. then out of nowhere she got WAY worse. like hospital worse.

the health center says it's "a bad year." mom says pray. I say I'm wearing a scarf over my face like a bandit until christmas.

you're not around sick people up there right? it's a LAB. they have masks probably.

— C`,
    },
    {
      id: 'n3m4',
      at: 448,
      from: 'Toby Marchetti',
      addr: 'tmarchetti@mcra.hlts.com',
      subject: 'rumor mill',
      body: `Heard Ray got a call from the Deputy Director's office yesterday. About nights. Ray wouldn't tell me what it was.

Ray has never not told me something in nine years. Ray told me about his colonoscopy.

22 days.

— T`,
    },
  ],
  netsends: [
    {
      id: 'n3ns1',
      at: 478,
      from: 'LANTERN',
      body: (s) =>
        [
          'His mailbox was deleted 15/10 at 08:12. One day after he died.',
          'The backup tapes rotate Friday at 06:00. That is tomorrow night.',
          s.flags.reyes_hint ? 'She told you about his drafts. Good.' : 'He kept drafts.',
          '— L',
        ].join('\n'),
    },
  ],
  calls: [
    {
      id: 'n3call_reyes',
      at: 112,
      from: 'reyes',
      place: 'Microbiology · Lab B2-4',
      start: 'a',
      nodes: {
        a: { who: 'them', text: "Hello? Is this Night Operations? This is Dr. Naomi Reyes, Microbiology. I'm sorry, I know it's late.", next: 'b' },
        b: {
          who: 'them',
          text: "I put in a request for Paul Whitlock's e-mail archive. It'll be in your queue. It's going to say legal hold.",
          choices: [
            { text: "I can't discuss records requests, Dr. Reyes.", to: 'c1', effect: { flags: { reyes: 'cold' } } },
            { text: "I'll see what I can do.", to: 'c2', effect: { flags: { reyes: 'warm' } } },
            { text: 'Who was Paul to you?', to: 'c3', effect: { flags: { reyes: 'asked' } } },
          ],
        },
        c1: { who: 'them', text: "Of course. I'm sorry. I shouldn't have called.", next: 'd' },
        c2: { who: 'them', text: 'Thank you. Please be careful. Paul used to say the computers here remember everything.', next: 'd' },
        c3: { who: 'them', text: "A colleague. A friend. He wasn't from here, originally. He never talked about before. I never asked.", next: 'd' },
        d: {
          who: 'them',
          text: "He stayed late on the 13th. The night before... He was writing something. He told me that if anything ever happened, I should 'read his drafts.' I don't even know what that means.",
          effect: { flags: { reyes_hint: true } },
          next: 'z',
        },
        z: { who: 'them', text: 'Goodnight. And thank you for picking up.', end: true },
      },
    },
  ],
};
