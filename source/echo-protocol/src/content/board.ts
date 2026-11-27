// The evidence board: five case files. Each question is a sentence with blanks; each blank is
// filled from a pool of nouns. A case confirms only when every blank in it is right, so
// guessing one blank at a time does not work.
import type { GameState } from '../engine/types';

export interface Noun {
  id: string;
  label: string;
  kind: 'person' | 'place' | 'thing' | 'date' | 'org';
}

export const NOUNS: Record<string, Noun> = Object.fromEntries(
  (
    [
      ['p_whitlock', 'Dr. Paul Whitlock', 'person'],
      ['p_ashcombe', 'Dr. Martin Ashcombe', 'person'],
      ['p_reyes', 'Dr. Naomi Reyes', 'person'],
      ['p_pike', 'Capt. Lorna Pike', 'person'],
      ['p_tolliver', 'Ray Tolliver', 'person'],
      ['p_hollis', 'Dwayne Hollis', 'person'],
      ['p_varga', 'Col. Dennis Varga', 'person'],
      ['p_odom', 'Carla Odom', 'person'],
      ['p_marsh', 'Celia Marsh', 'person'],
      ['p_vlasko', 'Teodor Vlasko', 'person'],
      ['p_sato', 'Marcus Sato', 'person'],
      ['d_1014', '10/14/99', 'date'],
      ['d_1021', '10/21/99', 'date'],
      ['d_1130', '11/30/99', 'date'],
      ['d_1207', '12/07/99', 'date'],
      ['d_1993', '1993', 'date'],
      ['d_1999', '1999', 'date'],
      ['l_b3east', 'the B3 east airlock', 'place'],
      ['l_vault', 'the B3 Vault', 'place'],
      ['l_gate', 'Gate 1', 'place'],
      ['l_f12', 'freezer F-12', 'place'],
      ['l_kalnitsa', 'the Kalnitsa Institute', 'place'],
      ['l_offsite', "Halvard-Lowe's offshore lab", 'place'],
      ['l_reston', 'Halvard-Lowe corporate, Reston', 'place'],
      ['t_3am', 'about 3 a.m.', 'thing'],
      ['t_midnight', 'midnight', 'thing'],
      ['t_workorders', 'camera "maintenance" work orders', 'thing'],
      ['t_ki114', 'KI-114 reader faults', 'thing'],
      ['t_y2k', 'routine Y2K changes', 'thing'],
      ['t_ev31', 'a weaponized agent, EV-31', 'thing'],
      ['t_vaccine', 'a vaccine program', 'thing'],
      ['t_blight', 'crop blight research', 'thing'],
      ['t_300g', '300 grams', 'thing'],
      ['t_4kg', '4.2 kilograms', 'thing'],
      ['t_testify', 'testify to the Senate', 'thing'],
      ['t_sell', 'sell the strain', 'thing'],
      ['t_quit', 'quit his job', 'thing'],
      ['t_ddmm', 'day first (21/10)', 'thing'],
      ['t_mmdd', 'month first (10/21)', 'thing'],
      ['t_stock', 'the EV-31 stock', 'thing'],
      ['t_money', 'money', 'thing'],
      ['t_letter', "Whitlock's letter", 'thing'],
      ['t_wipe', 'wipe the records system', 'thing'],
      ['t_patch', 'patch the date fields', 'thing'],
      ['o_directorate', 'the Orvessan Directorate', 'org'],
      ['o_fbi', 'the FBI', 'org'],
      ['o_hl', 'Halvard-Lowe', 'org'],
      ['c_0047', 'RECSYS-Y2K-0047', 'thing'],
      ['c_0058', 'OPS-Y2K-0058', 'thing'],
      ['c_0051', 'OPS-Y2K-0051', 'thing'],
    ] as const
  ).map(([id, label, kind]) => [id, { id, label, kind }]),
);

export interface Slot {
  answer: string;
  options: string[];
}

export interface Question {
  id: string;
  /** Text with {0}, {1}… where the blanks go. */
  text: string;
  slots: Slot[];
  unordered?: boolean; // blanks may be filled in any order
}

export interface Case {
  id: string;
  title: string;
  unlock: (s: GameState) => boolean;
  questions: Question[];
}

const PEOPLE = ['p_whitlock', 'p_ashcombe', 'p_reyes', 'p_pike', 'p_tolliver', 'p_hollis', 'p_varga', 'p_odom', 'p_sato'];

export const CASES: Case[] = [
  {
    id: 'badge',
    title: 'Case 1 · The Badge',
    unlock: (s) => s.night.n >= 5,
    questions: [
      { id: 'badge1', text: 'Badge 0417 belongs to {0}, who died on {1}.', slots: [{ answer: 'p_whitlock', options: PEOPLE }, { answer: 'd_1014', options: ['d_1014', 'd_1021', 'd_1130', 'd_1207'] }] },
      {
        id: 'badge2',
        text: 'Since then it opens {0} at {1}, each time covered by {2}.',
        slots: [
          { answer: 'l_b3east', options: ['l_b3east', 'l_vault', 'l_gate', 'l_f12'] },
          { answer: 't_3am', options: ['t_3am', 't_midnight'] },
          { answer: 't_workorders', options: ['t_workorders', 't_ki114', 't_y2k'] },
        ],
      },
      { id: 'badge3', text: 'The person using the badge is {0}.', slots: [{ answer: 'p_ashcombe', options: PEOPLE }] },
    ],
  },
  {
    id: 'program',
    title: 'Case 2 · The Program',
    unlock: (s) => s.night.n >= 6,
    questions: [
      { id: 'prog1', text: 'ECHO is not {0}. It is {1}.', slots: [{ answer: 't_vaccine', options: ['t_vaccine', 't_blight', 't_ev31'] }, { answer: 't_ev31', options: ['t_vaccine', 't_blight', 't_ev31'] }] },
      { id: 'prog2', text: 'The stock is kept in {0}.', slots: [{ answer: 'l_f12', options: ['l_f12', 'l_vault', 'l_b3east', 'l_offsite'] }] },
      {
        id: 'prog3',
        text: 'At 3:13 a.m. on {0}, {1} left the freezer. The "variance" was signed off by {2}.',
        slots: [
          { answer: 'd_1130', options: ['d_1014', 'd_1021', 'd_1130', 'd_1207'] },
          { answer: 't_300g', options: ['t_300g', 't_4kg'] },
          { answer: 'p_ashcombe', options: PEOPLE },
        ],
      },
    ],
  },
  {
    id: 'defector',
    title: 'Case 3 · The Defector',
    unlock: (s) => !!s.flags.n7_fax,
    questions: [
      { id: 'def1', text: 'Paul Whitlock was born {0}.', slots: [{ answer: 'p_vlasko', options: ['p_vlasko', 'p_whitlock', 'p_varga', 'p_ashcombe'] }] },
      { id: 'def2', text: 'He defected in {0} from {1}, bringing the strain with him.', slots: [{ answer: 'd_1993', options: ['d_1993', 'd_1999'] }, { answer: 'l_kalnitsa', options: ['l_kalnitsa', 'l_reston', 'l_offsite'] }] },
      { id: 'def3', text: 'He died because he was about to {0}.', slots: [{ answer: 't_testify', options: ['t_testify', 't_sell', 't_quit'] }] },
    ],
  },
  {
    id: 'lantern',
    title: 'Case 4 · LANTERN',
    unlock: (s) => !!s.flags.n7_fax,
    questions: [
      { id: 'lan1', text: 'LANTERN writes dates {0}.', slots: [{ answer: 't_ddmm', options: ['t_ddmm', 't_mmdd'] }] },
      { id: 'lan2', text: 'LANTERN works for {0}.', slots: [{ answer: 'o_directorate', options: ['o_directorate', 'o_fbi', 'o_hl'] }] },
      { id: 'lan3', text: 'What LANTERN really wants is {0}.', slots: [{ answer: 't_stock', options: ['t_stock', 't_money', 't_letter'] }] },
    ],
  },
  {
    id: 'rollover',
    title: 'Case 5 · Rollover',
    unlock: (s) => s.night.n >= 8,
    questions: [
      { id: 'roll1', text: 'At {0} on 12/31, {1} will {2}.', slots: [{ answer: 't_midnight', options: ['t_midnight', 't_3am'] }, { answer: 'c_0047', options: ['c_0047', 'c_0058', 'c_0051'] }, { answer: 't_wipe', options: ['t_wipe', 't_patch'] }] },
      { id: 'roll2', text: 'Under cover of Y2K, {0} moves {1} to {2}.', slots: [{ answer: 'c_0058', options: ['c_0047', 'c_0058', 'c_0051'] }, { answer: 'l_f12', options: ['l_f12', 'l_vault', 'l_gate'] }, { answer: 'l_offsite', options: ['l_offsite', 'l_reston', 'l_kalnitsa'] }] },
      { id: 'roll3', text: 'The people who signed it are {0} and {1}.', unordered: true, slots: [{ answer: 'p_ashcombe', options: PEOPLE }, { answer: 'p_varga', options: PEOPLE }] },
    ],
  },
];

export const caseSolved = (s: GameState, id: string) => (s.solved ?? []).includes(id);

/** True when every blank in the question holds the right noun. */
export function questionRight(q: Question, picks: string[] | undefined): boolean {
  if (!picks || q.slots.some((_, i) => !picks[i])) return false;
  if (q.unordered) {
    const want = q.slots.map((x) => x.answer).sort();
    return [...picks].sort().every((p, i) => p === want[i]);
  }
  return q.slots.every((slot, i) => picks[i] === slot.answer);
}
