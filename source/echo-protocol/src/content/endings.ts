// What happened after. Each ending: a line under the title, a few paragraphs, and where everyone ended up.
import type { GameState } from '../engine/types';
import { ENDING_NAMES, hhmm, recordsSaved, roll } from './rollover';

export interface Epilogue {
  name: string;
  kicker: string;
  lines: string[];
  fates: [string, string][];
}

const pick = <T,>(s: GameState, by: Record<string, T>, fallback: T) => by[String(s.flags.act2_choice ?? 'none')] ?? fallback;

export function epilogue(id: string, s: GameState): Epilogue {
  const f = s.flags;
  const r = roll(s);
  const saved = recordsSaved(r.job);
  const name = ENDING_NAMES[id] ?? id;
  const fbiKnown = !!f.fbi_contact;

  const reyes: Record<string, string> = {
    daylight: 'Testified in closed session in February. Her paper on EV-31 decontamination is dedicated to Teodor Vlasko.',
    bureau: 'Took a post at a university in Oregon. A card arrives every Christmas with no return address.',
    blackout: 'Left the Annex after Christmas. You never asked where she went.',
    lantern: 'Questioned by the FBI for eleven hours in March, then released. She never called you again.',
    company: 'Left the Annex after Christmas. You never asked where she went.',
    route9: 'Read about you in the Kessick Ledger and drove to Washington that same afternoon.',
    echo: 'Was on the B3 loading dock at midnight.',
  };
  const ashcombe: Record<string, string> = {
    daylight: 'Arrested at Dulles on January 5th, holding a one-way ticket to Lisbon.',
    bureau: 'Retired in March "for health reasons." Lives in Annapolis now. Sails.',
    blackout: 'Promoted to Director of Research in February.',
    lantern: 'Retired in February. Nobody ever told him where his truck went.',
    company: 'Sends you a card every Christmas. It always says the same thing: Drive carefully.',
    route9: 'Sent flowers.',
    echo: 'Told a closed hearing that the HVAC controller was Y2K-certified. It was not.',
  };
  const fates: [string, string][] = [];
  if (reyes[id]) fates.push(['Dr. Naomi Reyes', reyes[id]]);
  if (ashcombe[id]) fates.push(['Dr. Martin Ashcombe', ashcombe[id]]);
  if (id !== 'detained' && id !== 'terminated') {
    fates.push([
      'Ray Tolliver',
      id === 'daylight'
        ? 'Got his job back, then quit it. Sends a postcard from Myrtle Beach every December.'
        : id === 'bureau'
          ? 'Gave the FBI the floppy from his glovebox. Got a pension out of it.'
          : 'Never came back to the ridge. The floppy is still in his glovebox.',
    ]);
    fates.push([
      'Casey',
      id === 'echo' ? 'Her hospital floor filled up again on January 3rd. She worked every shift of it.' : 'Back at work on January 10th. Her floor reopened. She still calls after every night shift you never work again.',
    ]);
    if (fbiKnown)
      fates.push([
        'Special Agent Ruth Calloway',
        id === 'daylight' ? 'Made Assistant Special Agent in Charge in 2001.' : id === 'bureau' ? 'Calls on your birthday. Never says from where.' : 'Kept the file open until 2002. Then someone closed it for her.',
      ]);
    fates.push([
      'LANTERN',
      id === 'lantern' ? 'Sent one more message, on 01/01/01: "Thank you, archivist. Now it is ours to keep from everyone."' : id === 'daylight' ? 'Never wrote again. You like to think that was relief.' : 'Silent.',
    ]);
    fates.push(['Toby Marchetti', id === 'echo' ? 'Was in the war room in B1. He made it out. He does not talk about it.' : 'Runs the NOC now. Still owes you a cookie.']);
  }

  switch (id) {
    case 'daylight':
      return {
        name,
        kicker: 'ECHO in the light. The stock on the ridge. You, alive.',
        lines: [
          'The Washington Ledger ran it on January 2nd, above the fold: the F-12 manifest, the sensor log, the camera work orders, and Paul Whitlock’s letter.',
          'FBI evidence technicians catalogued 4.2 kilograms of EV-31 master stock in freezer F-12 on January 3rd, 2000.',
          'Halvard-Lowe lost every government contract it held by March. Colonel Varga’s program was “restructured” out of existence.',
          'You never worked nights again. Some nights you still wake up at 3:12.',
        ],
        fates,
      };
    case 'bureau':
      return {
        name,
        kicker: 'Stopped. Sealed. Classified.',
        lines: [
          'The FBI took everything: the stock, the archive, your notes, a floppy from Ray’s glovebox. By February it was classified above anything you will ever be cleared to read.',
          'There was no trial and no story. Halvard-Lowe’s contract was “not renewed.”',
          f.r_leak === 'boyd' ? 'Curtis Boyd pleaded guilty to obstruction of justice. Eighteen months.' : 'Whoever called Ashcombe’s car phone that night was never named.',
          'You have a new name now, in a new state. It took you a year to answer to it.',
        ],
        fates,
      };
    case 'blackout':
      return {
        name,
        kicker: 'Nothing proven. Nothing stopped.',
        lines: [
          r.job === 'purged'
            ? 'RECSYS-Y2K-0047 completed at 23:51. SUCCESS. Four thousand records went out with the year.'
            : r.job === 'archived'
              ? 'The records went to tape set D, and tape set D went wherever the Deputy Director’s office keeps things.'
              : 'The records survived 0047. Without the stock, they were only paper, and paper can be called a forgery.',
          `The convoy cleared Gate 1 at ${hhmm(r.gateAt || 100)}. HL-OFFSITE signed for six dewars at 06:40.`,
          pick(
            s,
            { press: 'The Ledger ran something on page A14. Halvard-Lowe called it a disgruntled contractor’s fantasy.', fbi: 'Calloway called once in February. “Without the stock it’s your word against theirs,” she said. Then she stopped calling.' },
            'Nobody ever printed a word.',
          ),
          'On January 10th, Night Operations was outsourced. You were let go with two weeks’ pay and a reminder about your nondisclosure agreement.',
        ],
        fates,
      };
    case 'lantern':
      return {
        name,
        kicker: 'It left your country. It did not stop existing.',
        lines: [
          'The convoy left State Route 9 at mile 14 and was never seen again.',
          'Six weeks later a bank in Vienna opened an account in your name. You never touched it. It is still there.',
          'In September 2000, a two-inch item on page A19: an Orvessan ministry announced a breakthrough in “respiratory vaccine research.”',
          'The FBI asked you about Teodor Vlasko and a relay in Vienna for six hours in March. You said you were only the night operator. That was even true, once.',
        ],
        fates,
      };
    case 'company':
      return {
        name,
        kicker: 'Everything quiet, as requested.',
        lines: [
          'You were Night Operations Lead until 2001, then Operations Manager, then something with “Director” in it.',
          'In 2003 the Annex was renamed, and so was ECHO. You signed for the new freezer yourself.',
          saved ? 'The archive survived 0047. You never looked at it again.' : 'Nobody ever found out what was in RECSYS. You made sure of that at 23:50.',
          'You drive Route 9 every day. Carefully.',
        ],
        fates,
      };
    case 'route9':
      return {
        name,
        kicker: 'Paul Whitlock’s ending.',
        lines: [
          'The Kessick Ledger ran it on page 6: “Second Marrow Creek employee killed on Route 9 in three months.”',
          'Your notes were never found. Neither was your car’s glovebox.',
          saved ? 'The records you kept from 0047 sat on RECSYS for two more years before anyone read them.' : 'RECSYS kept nothing. 0047 made sure.',
          'The convoy never left the ridge that night. It left on January 4th, in daylight, with an escort.',
        ],
        fates,
      };
    case 'echo':
      return {
        name,
        kicker: 'Containment lost.',
        lines: [
          'B3 lost negative pressure at 00:14 with six transport dewars open on the loading dock.',
          'The Annex was sealed at 00:30. Kessick County was quarantined on January 2nd “as a precaution against a seasonal influenza cluster.”',
          'Officially, nobody died of anything but the flu. Unofficially, nobody on the ridge saw the sun for forty days.',
          'Lindqvist had told you the order. It was in your notes.',
        ],
        fates,
      };
    default:
      return { name, kicker: '', lines: [], fates };
  }
}
