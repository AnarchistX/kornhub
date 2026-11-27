import type { CalendarEntry, GameState, NightDef } from '../engine/types';

const N = '12/08/99';

/** The Y2K change calendar for December. Same document all of Act I. */
export const CALENDAR: CalendarEntry[] = [
  { change: 'OPS-Y2K-0031', system: 'MAILSRV', window: '12/08/99 01:00–02:00', cab: 'CAB-1199-14', owner: 'Nakamura, E.' },
  { change: 'OPS-Y2K-0032', system: 'BADGESYS', window: '12/08/99 02:00–02:30', cab: 'CAB-1199-15', owner: 'Boyd, C.' },
  { change: 'OPS-Y2K-0036', system: 'HVAC-CTL', window: '12/08/99 04:00–05:00', cab: 'CAB-1199-18', owner: 'Lindqvist, H.' },
  { change: 'OPS-Y2K-0040', system: 'PAYROLL', window: '12/09/99 01:00–03:00', cab: 'CAB-1199-21', owner: 'Nakamura, E.' },
  { change: 'OPS-Y2K-0042', system: 'FIREWALL', window: '12/10/99 00:30–01:00', cab: 'CAB-1199-22', owner: 'Boyd, C.' },
  { change: 'OPS-Y2K-0049', system: 'CCTV-NVR', window: '12/14/99 02:00–03:00', cab: 'CAB-1299-05', owner: 'Lindqvist, H.' },
  { change: 'OPS-Y2K-0050', system: 'PBX', window: '12/15/99 01:00–02:00', cab: 'CAB-1299-06', owner: 'Boyd, C.' },
  { change: 'RECSYS-Y2K-0047', system: 'RECSYS', window: '12/31/99 23:50–00:10', cab: 'CAB-1299-03', owner: 'Office of the Deputy Director' },
];

const cameraOff = (s: GameState) => s.night.results.n2c5?.decision === 'approve' || s.flags.n2_cam_off === true;

export const NIGHT2: NightDef = {
  n: 2,
  weekday: 'Tuesday',
  date: '12/07/99',
  nextDate: N,
  longDate: 'December 7, 1999',
  daysLeft: 24,
  minuteMs: 1300,
  sticky: 'Y2K season starts tonight.\nThe calendar is in your binder.\nIt is NOT optional.\n\n— R.T.',
  directives: ['D1', 'D2', 'D3', 'D4', 'D5'],
  calendar: CALENDAR,
  records: [],
  tickets: [
    { kind: 'change', id: 'n2c1', ref: 'CR-1207-01', at: 6, change: 'OPS-Y2K-0031', system: 'MAILSRV', title: 'Y2K date patch, mail server', requester: 'nakamura', window: '12/08/99 01:00–02:00', cab: 'CAB-1199-14', description: 'Apply vendor Y2K patch 4.2b to the mail server. Service restart required.', tutorial: 'change' },
    { kind: 'access', id: 'n2a1', ref: 'AR-1207-01', at: 20, requester: 'hollis', area: 'OPS', date: N, window: '00:00–01:00', purpose: 'Server room HVAC check', approver: 'brennan' },
    { kind: 'change', id: 'n2c2', ref: 'CR-1207-02', at: 34, change: 'OPS-Y2K-0032', system: 'BADGESYS', title: 'Badge system rollover test', requester: 'boyd', window: '12/08/99 02:00–03:00', cab: 'CAB-1199-15', description: 'Advance the badge controller clock to 12/31/99 23:59 and observe rollover. Readers may reject swipes during the test.', tutorial: 'window' },
    { kind: 'change', id: 'n2c3', ref: 'CR-1207-03', at: 55, change: 'OPS-Y2K-0036', system: 'HVAC-CTL', title: 'HVAC controller firmware (Y2K)', requester: 'lindqvist', window: '12/08/99 04:00–05:00', cab: 'CAB-1199-81', description: 'Flash Y2K-compliant firmware to the building HVAC controllers. Brief loss of climate data.' },
    { kind: 'access', id: 'n2a2', ref: 'AR-1207-02', at: 75, requester: 'pruitt', area: 'B2', date: N, window: '00:30–04:00', purpose: 'Patrol relief, lab corridors', approver: 'pike', remark: 'RENEWAL IS IN PROCESS. —L.P.' },
    { kind: 'change', id: 'n2c4', ref: 'CR-1207-04', at: 95, change: 'OPS-Y2K-0038', system: 'DNS', title: 'DNS resolver cache flush', requester: 'boyd', window: '12/08/99 03:00–03:15', cab: 'CAB-1199-17', description: 'Flush resolver caches ahead of Y2K testing.' },
    { kind: 'access', id: 'n2a3', ref: 'AR-1208-03', at: 118, requester: 'ashcombe', area: 'B3V', date: N, window: '02:30–03:30', purpose: 'Scheduled maintenance per SAP roster', approver: 'varga' },
    { kind: 'change', id: 'n2c5', ref: 'CR-1208-05', at: 140, change: 'OPS-Y2K-0051', system: 'CCTV-NVR', title: 'Disable B3-EAST-CAM-2 recording (firmware)', requester: 'hollis', window: '12/08/99 03:00–03:20', cab: '', description: 'Suspend recording on B3-EAST-CAM-2 for a firmware update. Camera returns automatically at 03:20.', remark: "Per the Deputy Director's office. Urgent. —D.H." },
    { kind: 'change', id: 'n2c6', ref: 'CR-1208-06', at: 165, change: 'RECSYS-Y2K-0047', system: 'RECSYS', title: 'Records System date-rollover patch', requester: 'ashcombe', window: '12/31/99 23:50–00:10', cab: 'CAB-1299-03', description: 'Replaces the date-rollover routine in the RECSYS archival module. Purges temporary tables at rollover. Runs unattended.' },
    { kind: 'access', id: 'n2a4', ref: 'AR-1208-04', at: 190, requester: 'sato', area: 'B3', date: N, window: '03:00–05:00', purpose: 'Assist Dr. Reyes, cold storage', approver: 'reyes' },
    { kind: 'change', id: 'n2c7', ref: 'CR-1208-07', at: 215, change: 'OPS-Y2K-0040', system: 'PAYROLL', title: 'Payroll date-field expansion', requester: 'nakamura', window: '12/09/99 01:00–03:00', cab: 'CAB-1199-21', description: 'Expand two-digit year fields in the payroll export to four digits.' },
    {
      kind: 'alert',
      id: 'n2x1',
      ref: 'SEN-0314-B3E2',
      at: 254,
      title: 'Reader fault · B3-EAST-2',
      heading: 'SENTINEL SECURITY EVENT',
      lines: [
        { k: 'EVENT', v: 'READER FAULT (SUSPECTED)' },
        { k: 'READER', v: 'B3-EAST-2 · Containment B3, east airlock' },
        { k: 'TIME', v: '12/08/99 03:14:07' },
        { k: 'BADGE', v: '0417', link: 'person' },
        { k: 'RESULT', v: 'ACCESS GRANTED · door-open event recorded 03:14:09' },
        { k: 'MATCHES', v: 'KI-114 (B3 phantom reads after midnight)' },
      ],
      badge: '0417',
      person: 'whitlock',
      camera: (s) =>
        cameraOff(s)
          ? { cam: 'b3east', date: N, time: '03:14:07', unavailable: 'RECORDING DISABLED 03:00–03:20\nOPS-Y2K-0051 · RELEASED BY NIGHT OPERATIONS' }
          : { cam: 'b3east', date: N, time: '03:14:07', figure: true },
      flag: 'n2_whitlock',
      options: [
        { value: 'log', label: 'Log as reader fault' },
        { value: 'escalate', label: 'Escalate to Security' },
      ],
      done: { log: '> LOGGED AS READER FAULT · KI-114 · CLOSED', escalate: '> ESCALATED TO SECURITY · SEC-4498 · AWAITING REVIEW' },
    },
    { kind: 'access', id: 'n2a5', ref: 'AR-1208-05', at: 290, requester: 'nakamura', area: 'OPS', date: N, window: '06:00–14:00', purpose: 'Mail server patch verification', approver: 'kraemer' },
    { kind: 'change', id: 'n2c8', ref: 'CR-1208-08', at: 330, change: 'OPS-Y2K-0049', system: 'CCTV-NVR', title: 'Camera recorder Y2K firmware', requester: 'lindqvist', window: '12/14/99 02:00–03:00', cab: 'CAB-1299-05', description: 'Y2K firmware for the network video recorder. All cameras pause for up to 10 minutes.' },
    { kind: 'access', id: 'n2a6', ref: 'AR-1208-06', at: 370, requester: 'delgado', area: 'B1', date: N, window: '05:00–06:30', purpose: 'Floor care, B1 conference (Y2K war room)', approver: 'brennan' },
    { kind: 'change', id: 'n2c9', ref: 'CR-1208-09', at: 410, change: 'OPS-Y2K-0050', system: 'PBX', title: 'Phone switch Y2K patch', requester: 'boyd', window: '12/15/99 01:00–02:00', cab: 'CAB-1299-06', description: 'Patch the PBX call-detail recorder for four-digit years.' },
  ],
  mails: [
    {
      id: 'n2m1',
      at: 0,
      from: 'Ray Tolliver',
      addr: 'rtolliver@mcra.hlts.com',
      subject: 'Y2K season',
      unlocks: ['D6', 'D7', 'D8'],
      body: `{first} —

Y2K changes start tonight. You'll get CHANGE tickets: patches the engineers want released into their maintenance windows.

Three rules, all in your directives now:
 D-6  It's on the Y2K CHANGE CALENDAR, for that system.
 D-7  The CAB number matches the calendar. Exactly.
 D-8  The window matches the calendar. Exactly.

The calendar is in your binder. If it isn't on the calendar, it doesn't happen. I don't care who's asking.

— Ray`,
    },
    {
      id: 'n2m2',
      at: 0,
      from: 'Security Operations',
      addr: 'secops@mcra.hlts.com',
      subject: 'SEC-4498 received',
      when: (s) => s.flags.n2_whitlock === 'escalated',
      body: `Your report has been logged as SEC-4498 (READER FAULT, B3-EAST-2, 03:14).

A Security Officer will review it at the start of day shift.

This is an automated message. Do not reply.`,
    },
    {
      id: 'n2m3',
      at: 262,
      from: 'Mom',
      addr: 'lorraine.{last}@mtnstate.net',
      subject: 'casserole',
      personal: true,
      body: `Honey,

I left a casserole on your porch. Tuna. Put it in the fridge before the raccoons get it.

Casey says you work all night now. Your father says that's how they get you, the night shifts. He worked nights at the plant for nine years and look at his back.

Are you sleeping? Are you eating? Call your mother.

Love,
Mom

P.S. Casey has the flu. Everybody has the flu.`,
    },
    {
      id: 'n2m4',
      at: 452,
      from: 'Toby Marchetti',
      addr: 'tmarchetti@mcra.hlts.com',
      subject: 'war room',
      body: `The Y2K war room is set up in the B1 conference room. We have a fax machine, a ham radio, and two hundred packets of instant noodles. Your desk is the one next to the radio.

Also Curtis thinks you hate him because of the DNS thing. I told him you hate everyone equally. That's what nights does to a person.

23 days.

— T`,
    },
  ],
  netsends: [
    {
      id: 'n2ns1',
      at: 478,
      from: 'LANTERN',
      body: (s) => {
        const lines: string[] = [];
        if (cameraOff(s)) lines.push('03:14. You switched the camera off for him. Read who asked.');
        else if (s.flags.n2x1_cam) lines.push('03:14. The camera was on. You saw him. Gray hair. Glasses. He believes the camera was off.');
        else lines.push('03:14. The camera was on tonight. You did not look.');
        lines.push('', 'Two nights in a row now. Before, it was every two weeks. He is in a hurry. Ask yourself why.', '— L');
        return lines.join('\n');
      },
    },
  ],
  calls: [
    {
      id: 'n2call_ray',
      at: 12,
      from: 'tolliver',
      place: 'Home · Hollins Gap',
      start: 'a',
      nodes: {
        a: { who: 'them', text: "Rookie. It's Ray. Relax, nothing's on fire. I'm calling everybody on the Y2K rotation.", next: 'b' },
        b: {
          who: 'them',
          text: "Starting tonight you get CHANGE tickets. Y2K patches. Every one has to be on the change calendar, carry the right CAB number, and match the window to the minute. The calendar's in your binder.",
          next: (s) => (s.flags.n1_whitlock === 'escalated' ? 'c1' : 'c2'),
        },
        c1: {
          who: 'them',
          text: 'And Pike called me at home yesterday. Six in the morning. Over a reader fault.',
          choices: [
            { text: "It was a dead man's badge, Ray.", to: 'd1', effect: { flags: { ray_told: true } } },
            { text: "Sorry. It won't happen again.", to: 'd2' },
          ],
        },
        d1: { who: 'them', text: "...I know whose badge it is. Everybody on nights knows. Log the faults. That's the job.", next: 'z' },
        d2: { who: 'them', text: "Good. KI-114 exists for a reason. Don't make me learn the reason.", next: 'z' },
        c2: { who: 'them', text: 'Saw your report. Clean log. Keep it that way.', next: 'z' },
        z: { who: 'them', text: 'Twenty-four days. Then we all go back to sleeping at night. Ray out.', end: true },
      },
    },
    {
      id: 'n2call_pike',
      at: 100,
      from: 'pike',
      place: 'Security Office · Annex',
      when: (s) => s.flags.n1_whitlock === 'escalated',
      start: 'a',
      nodes: {
        a: { who: 'them', text: '{mr} {last}. Captain Pike, Facility Security. You filed SEC-4471.', next: 'b' },
        b: {
          who: 'them',
          text: 'A reader fault on B3-EAST-2. A known issue. Ray says he briefed you. So why is it on my desk?',
          choices: [
            { text: "The badge belongs to Dr. Whitlock. He's dead.", to: 'c1' },
            { text: 'I was following procedure.', to: 'c2', effect: { flags: { pike: 'cold' } } },
          ],
        },
        c1: { who: 'them', text: "I'm aware of Dr. Whitlock's status.", next: 'c1b' },
        c1b: {
          who: 'them',
          text: 'Did you look at the access log again, after you filed?',
          choices: [
            { text: 'Yes. The entry is gone.', to: 'd1', effect: { flags: { pike: 'ally' } } },
            { text: 'No. Why?', to: 'd2', effect: { flags: { pike: 'curious' } } },
          ],
        },
        d1: { who: 'them', text: "Then you understand why I'm calling on this line and not one SENTINEL records. Anything else on B3 comes to me. Not to Ray. Not to anyone.", next: 'z' },
        d2: { who: 'them', text: 'Look. Then decide whether you want to keep filing things.', next: 'z' },
        c2: { who: 'them', text: 'Procedure says you log it as a fault. Read your known issues list, {mr} {last}.', next: 'z' },
        z: { who: 'them', text: 'Goodnight.', end: true },
      },
    },
  ],
};
