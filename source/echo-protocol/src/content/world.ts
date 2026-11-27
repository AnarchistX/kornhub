import type { Area, AreaId, Directive, DirectiveId, Person, RecordDef } from '../engine/types';

export const AREAS: Record<AreaId, Area> = {
  ADM: { id: 'ADM', name: 'Administration Wing', level: 1 },
  OPS: { id: 'OPS', name: 'Operations Wing', level: 2 },
  B1: { id: 'B1', name: 'Laboratory Level B1', level: 3 },
  B2: { id: 'B2', name: 'Laboratory Level B2', level: 3 },
  B3: { id: 'B3', name: 'Containment Level B3', level: 4 },
  B3V: { id: 'B3V', name: 'B3 Vault', level: 5, compartment: 'ECHO' },
};

export const LEVEL_NAMES: Record<number, string> = {
  1: 'L1 · General',
  2: 'L2 · Operations',
  3: 'L3 · Research',
  4: 'L4 · Containment',
  5: 'L5 · Program',
};

export const DIRECTIVES: Record<DirectiveId, Directive> = {
  D1: {
    id: 'D1',
    code: 'D-1',
    title: 'Clearance',
    text: "The requester's clearance level must be equal to or higher than the level of the area requested. See the area table.",
    cite: 'Clearance below area level',
  },
  D2: {
    id: 'D2',
    code: 'D-2',
    title: 'Approval',
    text: "The request must be approved by the requester's listed supervisor. No one else signs, not even the supervisor's boss.",
    cite: 'Not approved by listed supervisor',
  },
  D3: {
    id: 'D3',
    code: 'D-3',
    title: 'Badge validity',
    text: "The requester's badge must be valid on the date of access. Expired badges are denied, renewal pending or not.",
    cite: 'Badge expired on access date',
  },
  D4: {
    id: 'D4',
    code: 'D-4',
    title: 'Personnel status',
    text: 'Only ACTIVE personnel may be granted access. Terminated or otherwise inactive personnel are denied.',
    cite: 'Personnel not active',
  },
  D5: {
    id: 'D5',
    code: 'D-5',
    title: 'Compartments',
    text: 'Requests involving any area or record that carries a compartment code are outside Night Operations. Do not approve or deny them. FORWARD them to Program Security unread.',
    cite: 'Compartmented area or record',
  },
  D6: {
    id: 'D6',
    code: 'D-6',
    title: 'Change calendar',
    text: 'A change may only be released if it appears on the Y2K Change Calendar for the same system.',
    cite: 'Not on the change calendar',
  },
  D7: {
    id: 'D7',
    code: 'D-7',
    title: 'CAB approval',
    text: 'The change must carry the exact Change Advisory Board (CAB) number shown on the calendar. Missing or different: deny.',
    cite: 'CAB number missing or wrong',
  },
  D8: {
    id: 'D8',
    code: 'D-8',
    title: 'Change window',
    text: 'The change window must match the calendar exactly. Early, late or longer: deny.',
    cite: 'Window does not match the calendar',
  },
  D9: {
    id: 'D9',
    code: 'D-9',
    title: 'Need to know',
    text: "Records are released only to staff whose clearance is at or above the record's level AND whose department owns the record.",
    cite: 'No need to know (level or department)',
  },
  D10: {
    id: 'D10',
    code: 'D-10',
    title: 'Legal hold',
    text: 'Records under legal hold are not released to anyone, for any reason.',
    cite: 'Record under legal hold',
  },
};

export const KNOWN_ISSUES = [
  { id: 'KI-109', text: 'ADM-PRN-02 floods failed-auth alerts after toner changes. Dismiss.' },
  { id: 'KI-112', text: 'OPS wall clock runs 3 minutes fast. Facilities ticket open since 1997.' },
  {
    id: 'KI-114',
    text: 'B3 badge readers report phantom reads after midnight (moisture in the east airlock). Log as reader fault. Do not escalate. Facilities will service.',
  },
];

const P = (p: Person) => p;

// Personnel database as of Night 1. The player's own record is generated from their profile.
export const PEOPLE: Record<string, Person> = Object.fromEntries(
  [
    P({ id: 'ashcombe', last: 'Ashcombe', first: 'Martin R.', badge: '0102', title: 'Deputy Director of Research', dept: 'Office of the Deputy Director', level: 5, supervisor: 'varga', status: 'ACTIVE', expires: '06/30/00', photo: { seed: 11, sex: 'm', hair: 1, glasses: true, gray: true } }),
    P({ id: 'reyes', last: 'Reyes', first: 'Naomi', badge: '0388', title: 'Senior Research Scientist', dept: 'Microbiology', level: 4, supervisor: 'ashcombe', status: 'ACTIVE', expires: '03/31/00', photo: { seed: 23, sex: 'f', hair: 2 } }),
    P({ id: 'whitlock', last: 'Whitlock', first: 'Paul E.', badge: '0417', title: 'Senior Research Scientist', dept: 'Microbiology', level: 4, supervisor: 'ashcombe', status: 'DECEASED', statusDate: '10/14/99', expires: '01/31/00', photo: { seed: 47, sex: 'm', hair: 2, beard: true, glasses: true } }),
    P({ id: 'pike', last: 'Pike', first: 'Lorna', badge: '0215', title: 'Facility Security Officer', dept: 'Security', level: 4, supervisor: 'coyle', status: 'ACTIVE', expires: '09/30/00', photo: { seed: 5, sex: 'f', hair: 0 } }),
    P({ id: 'tolliver', last: 'Tolliver', first: 'Raymond', badge: '0631', title: 'Night Operations Supervisor', dept: 'Operations (Halvard-Lowe)', level: 3, supervisor: 'kraemer', status: 'ACTIVE', expires: '05/31/00', photo: { seed: 31, sex: 'm', hair: 3, beard: true, gray: true } }),
    P({ id: 'marchetti', last: 'Marchetti', first: 'Toby', badge: '0954', title: 'NOC Technician', dept: 'Operations (Halvard-Lowe)', level: 2, supervisor: 'tolliver', status: 'ACTIVE', expires: '08/31/00', photo: { seed: 62, sex: 'm', hair: 4, glasses: true } }),
    P({ id: 'hollis', last: 'Hollis', first: 'Dwayne', badge: '0772', title: 'Facilities Maintenance Technician', dept: 'Facilities', level: 2, supervisor: 'brennan', status: 'ACTIVE', expires: '04/30/00', photo: { seed: 77, sex: 'm', hair: 0, beard: true } }),
    P({ id: 'brennan', last: 'Brennan', first: 'Gail', badge: '0540', title: 'Facilities Supervisor', dept: 'Facilities', level: 3, supervisor: 'kraemer', status: 'ACTIVE', expires: '07/31/00', photo: { seed: 19, sex: 'f', hair: 1, gray: true } }),
    P({ id: 'odom', last: 'Odom', first: 'Carla', badge: '0866', title: 'Laboratory Technician', dept: 'Microbiology', level: 3, supervisor: 'reyes', status: 'ACTIVE', expires: '02/29/00', photo: { seed: 88, sex: 'f', hair: 3 } }),
    P({ id: 'sato', last: 'Sato', first: 'Marcus', badge: '0903', title: 'Research Associate', dept: 'Microbiology', level: 3, supervisor: 'reyes', status: 'ACTIVE', expires: '05/31/00', photo: { seed: 41, sex: 'm', hair: 1, glasses: true } }),
    P({ id: 'pruitt', last: 'Pruitt', first: 'Leon', badge: '0688', title: 'Security Officer', dept: 'Security', level: 3, supervisor: 'pike', status: 'ACTIVE', expires: '11/30/99', photo: { seed: 53, sex: 'm', hair: 0 } }),
    P({ id: 'quinlan', last: 'Quinlan', first: 'Bernard', badge: '0592', title: 'Security Officer (Gate)', dept: 'Security', level: 2, supervisor: 'pike', status: 'ACTIVE', expires: '10/31/00', photo: { seed: 14, sex: 'm', hair: 3, gray: true } }),
    P({ id: 'delgado', last: 'Delgado', first: 'Rosa', badge: '1033', title: 'Custodial Services (Contract)', dept: 'Facilities', level: 1, supervisor: 'brennan', status: 'ACTIVE', expires: '06/30/00', photo: { seed: 29, sex: 'f', hair: 4 } }),
    P({ id: 'garrity', last: 'Garrity', first: 'Kenneth', badge: '0815', title: 'Laboratory Technician', dept: 'Microbiology', level: 3, supervisor: 'reyes', status: 'TERMINATED', statusDate: '11/19/99', expires: '08/31/00', photo: { seed: 66, sex: 'm', hair: 4 } }),
    P({ id: 'kraemer', last: 'Kraemer', first: 'Judith', badge: '0311', title: 'Operations Manager', dept: 'Operations (Halvard-Lowe)', level: 4, supervisor: 'marsh', status: 'ACTIVE', expires: '12/31/00', photo: { seed: 36, sex: 'f', hair: 2, glasses: true } }),
    P({ id: 'coyle', last: 'Coyle', first: 'Richard', badge: '0101', title: 'Facility Director', dept: 'Office of the Director', level: 5, supervisor: null, status: 'ACTIVE', expires: '12/31/00', photo: { seed: 9, sex: 'm', hair: 1, gray: true } }),
    P({ id: 'nakamura', last: 'Nakamura', first: 'Ellen', badge: '0745', title: 'Systems Engineer', dept: 'Operations (Halvard-Lowe)', level: 3, supervisor: 'kraemer', status: 'ACTIVE', expires: '09/30/00', photo: { seed: 314, sex: 'f', hair: 2, glasses: true } }),
    P({ id: 'boyd', last: 'Boyd', first: 'Curtis', badge: '0729', title: 'Network Engineer', dept: 'Operations (Halvard-Lowe)', level: 3, supervisor: 'kraemer', status: 'ACTIVE', expires: '07/31/00', photo: { seed: 58, sex: 'm', hair: 1 } }),
    P({ id: 'lindqvist', last: 'Lindqvist', first: 'Hal', badge: '0613', title: 'Facilities Engineer', dept: 'Facilities', level: 3, supervisor: 'brennan', status: 'ACTIVE', expires: '03/31/00', photo: { seed: 83, sex: 'm', hair: 4, beard: true } }),
    P({ id: 'ferris', last: 'Ferris', first: 'Dale', badge: '0838', title: 'Records Clerk', dept: 'Records Management', level: 3, supervisor: 'arliss', status: 'ACTIVE', expires: '05/31/00', photo: { seed: 27, sex: 'm', hair: 2 } }),
    P({ id: 'arliss', last: 'Arliss', first: 'Eugene', badge: '0144', title: 'Legal Counsel', dept: 'Office of the Director', level: 4, supervisor: 'coyle', status: 'ACTIVE', expires: '12/31/00', photo: { seed: 99, sex: 'm', hair: 3, glasses: true, gray: true } }),
    P({ id: 'varga', last: 'Varga', first: 'Dennis (Col.)', badge: 'V-021', title: 'Program Manager', dept: 'DBPO (Pentagon)', level: 5, supervisor: null, status: 'ACTIVE', expires: '12/31/00', photo: { seed: 71, sex: 'm', hair: 0 }, external: 'Defense Biological Programs Office' }),
    P({ id: 'marsh', last: 'Marsh', first: 'Celia', badge: 'V-090', title: 'VP, Government Programs', dept: 'Halvard-Lowe Corporate', level: 4, supervisor: null, status: 'ACTIVE', expires: '12/31/00', photo: { seed: 95, sex: 'f', hair: 1 }, external: 'Halvard-Lowe Biosystems' }),
  ].map((p) => [p.id, p]),
);

export const RECORDS: Record<string, RecordDef> = Object.fromEntries(
  [
    { id: 'RX-1102', title: 'B2 incubator maintenance logs (Q4 1999)', level: 3, dept: 'Facilities' },
    { id: 'RX-2210', title: 'Cold storage sample inventory', level: 4, dept: 'Microbiology' },
    {
      id: 'RX-2214',
      title: 'Freezer F-12 transfer manifest (November 1999)',
      level: 4,
      dept: 'Microbiology',
      contents: `FREEZER F-12 · B3 COLD STORAGE · TRANSFER MANIFEST · NOV 1999

DATE      TIME   ACTION     RACK  MASS kg  BY
11/02/99  09:14  CHECK-OUT  R4    4.20     REYES, N.
11/02/99  16:40  CHECK-IN   R4    4.20     REYES, N.
11/16/99  08:55  CHECK-OUT  R2    1.75     SATO, M.
11/16/99  12:02  CHECK-IN   R2    1.75     SATO, M.
11/30/99  10:21  CHECK-OUT  R7    4.20     ODOM, C.
11/30/99  15:48  CHECK-IN   R7    3.90     ODOM, C.

NOTE: Variance on R7 within tolerance (dry ice sublimation). Signed off. —M.A.`,
    },
    { id: 'RX-2290', title: 'Microbiology training records', level: 3, dept: 'Microbiology' },
    { id: 'RX-3301', title: 'Security incident reports (Oct–Nov 1999)', level: 4, dept: 'Security' },
    { id: 'RX-3305', title: 'B3 camera maintenance work orders', level: 3, dept: 'Facilities' },
    { id: 'RX-4471', title: 'Whitlock, P. — e-mail archive (10/01–10/15/99)', level: 4, dept: 'Microbiology', hold: 'LEGAL HOLD 10/16/99 · Office of the Director (E. Arliss)' },
    { id: 'RX-5010', title: 'Program correspondence', level: 5, dept: 'Office of the Deputy Director', compartment: 'ECHO' },
    { id: 'RX-6120', title: 'Y2K readiness test results — RECSYS', level: 2, dept: 'Operations (Halvard-Lowe)' },
    { id: 'RX-6121', title: 'Change Advisory Board minutes (December 1999)', level: 2, dept: 'Operations (Halvard-Lowe)' },
    { id: 'RX-7002', title: 'Visitor log — Main Gate (December 1999)', level: 2, dept: 'Security' },
    { id: 'RX-8810', title: 'SENTINEL session logs — Night Operations (Dec 1999)', level: 3, dept: 'Operations (Halvard-Lowe)' },
    {
      id: 'RX-2216',
      title: 'F-12 sensor log, door and temperature (Nov 1999)',
      level: 4,
      dept: 'Microbiology',
      contents: `F-12 · B3 COLD STORAGE · SENSOR LOG · 11/30/99

TIME      EVENT          TEMP °C
03:10:55  NOMINAL        -79.6
03:13:02  DOOR OPEN      -79.4
03:13:40  DOOR OPEN      -71.2
03:14:51  DOOR CLOSED    -66.8
03:22:10  RECOVERING     -74.0
04:05:33  NOMINAL        -79.5
10:21:08  DOOR OPEN      -79.5   scheduled (ODOM, C.)
15:48:30  DOOR OPEN      -79.3   scheduled (ODOM, C.)`,
    },
    { id: 'RX-9001', title: 'Y2K contingency plan — B3 cold storage', level: 5, dept: 'Office of the Deputy Director' },
  ].map((r) => [r.id, r as RecordDef]),
);

/** People who call in but are not Annex staff, so they never appear in the Personnel directory. */
export const CONTACTS: Record<string, Person> = {
  calloway: { id: 'calloway', last: 'Calloway', first: 'Ruth', badge: '—', title: 'Special Agent, Counterintelligence', dept: 'FBI · Pittsburgh Field Office', level: 1, supervisor: null, status: 'ACTIVE', expires: '12/31/00', photo: { seed: 404, sex: 'f', hair: 0 }, external: 'Federal Bureau of Investigation' },
};

export const PLAYER_ID = 'player';
export const PLAYER_BADGE = '1187';
