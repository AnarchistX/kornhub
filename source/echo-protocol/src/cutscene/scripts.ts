import type { Ambience, Sfx } from '../engine/audio';
import type { GameState } from '../engine/types';
import type { SceneId } from '../art/scenes';
import { hhmm, roll } from '../content/rollover';

export interface Shot {
  scene: SceneId | null; // null = black card
  ms: number;
  tag?: string | ((s: GameState) => string); // dossier reference above the caption
  caption?: string | ((s: GameState) => string);
  title?: string[]; // centred title card lines
  from?: [number, number, number]; // translate x%, y%, scale
  to?: [number, number, number];
  rain?: number;
  snow?: number;
  ambience?: Ambience;
  sfx?: Sfx;
}

export const CUTSCENES: Record<string, Shot[]> = {
  prologue: [
    {
      scene: null,
      ms: 5600,
      title: ['KESSICK COUNTY, WEST VIRGINIA', 'MONDAY, DECEMBER 6, 1999', '25 DAYS UNTIL THE MILLENNIUM'],
      ambience: 'rain',
    },
    {
      scene: 'road',
      ms: 10000,
      tag: 'STATE ROUTE 9 · 22:31',
      caption: 'The ad in the Kessick Ledger said NIGHT OPERATIONS TECHNICIAN. Government contract. Full benefits. It said nothing about what they do up on the ridge.',
      from: [0, 1, 1.04],
      to: [0, -2, 1.2],
      rain: 1,
    },
    {
      scene: 'ridgeCar',
      ms: 10000,
      tag: 'MARROW CREEK ANNEX · 22:44',
      caption: 'Marrow Creek. Built in 1958 to study crop blight. Officially. Nobody in town says what it studies now, and nobody asks.',
      from: [0, 2, 1.28],
      to: [0, -1, 1.08],
      rain: 0.6,
    },
    {
      scene: 'gate',
      ms: 8500,
      tag: 'GATE 1 · 22:48',
      caption: 'Your badge photo was taken this morning. You already look tired in it.',
      from: [2, 0, 1.08],
      to: [-1, -1, 1.2],
      rain: 0.8,
      sfx: 'beep',
    },
    {
      scene: 'noc',
      ms: 8000,
      tag: 'OPERATIONS WING · NOC · 22:56',
      caption: 'Night shift. Eleven to seven. You will be alone until morning.',
      from: [0, 0, 1],
      to: [0, -5, 2.3],
      ambience: 'noc',
    },
  ],
  dawn: [
    {
      scene: 'dawn',
      ms: 7500,
      tag: 'STATE ROUTE 9 · 07:12',
      caption: (s) => DAWN[s.night.n]?.[0](s) ?? 'You drive down the mountain with the heater on high and the radio off.',
      from: [0, -2, 1.18],
      to: [0, 0, 1.06],
      ambience: 'wind',
    },
    {
      scene: 'dawn',
      ms: 8500,
      tag: 'STATE ROUTE 9 · 07:19',
      caption: (s) => DAWN[s.night.n]?.[1](s) ?? 'The sun comes up over the ridge like nothing happened.',
      from: [3, 1, 1.3],
      to: [0, 2, 1.42],
    },
  ],
  // Act III: the drive up on December 31st.
  rollover: [
    {
      scene: null,
      ms: 5600,
      title: ['FRIDAY, DECEMBER 31, 1999', 'KESSICK COUNTY, WEST VIRGINIA', 'TWO HOURS UNTIL THE MILLENNIUM'],
      ambience: 'wind',
    },
    {
      scene: 'road',
      ms: 9500,
      tag: 'STATE ROUTE 9 · 21:38',
      caption: (s) =>
        ({
          fbi: s.flags.fbi_stayhome
            ? 'Calloway told you to stay home and see your family. You told her okay. Then you got in the car.'
            : 'Somewhere below the gate, in a van with the engine off, Special Agent Calloway is waiting for midnight.',
          press: 'Simon Hale has everything you had. It runs on the second, he says. If there is a second.',
          lantern: 'LANTERN said: go to work as usual. Do not be surprised by anything you see.',
          ashcombe: 'Night Operations Lead, effective tomorrow. The new badge is in your coat pocket. It still smells like the laminator.',
          none: 'You wiped everything. Nobody knows what you know. You drove up anyway.',
        })[String(s.flags.act2_choice ?? 'none')] ?? 'You drove up anyway.',
      from: [0, 1, 1.06],
      to: [0, -2, 1.22],
      snow: 0.7,
    },
    {
      scene: 'convoy',
      ms: 9000,
      tag: 'GATE 1 · 21:52',
      caption: 'The truck is already inside the fence with its engine running. HALVARD-LOWE LOGISTICS, stenciled on the side like it means nothing.',
      from: [-2, 0, 1.1],
      to: [1, -1, 1.24],
      snow: 0.5,
      sfx: 'beep',
    },
    {
      scene: 'noc',
      ms: 8000,
      tag: 'OPERATIONS WING · NOC · 21:58',
      caption: 'The war room is in B1 tonight, with pizza and a television. The NOC is yours. Two hours until midnight.',
      from: [0, 0, 1],
      to: [0, -5, 2.3],
      ambience: 'noc',
    },
  ],
  end_daylight: [
    {
      scene: 'midnight',
      ms: 9000,
      tag: 'MARROW CREEK · 00:31',
      caption: "At 00:31 the convoy's paperwork expired with the truck still inside the fence. Down in Kessick, people were still setting off fireworks.",
      from: [0, 2, 1.05],
      to: [0, -1, 1.18],
      ambience: 'wind',
      snow: 0.3,
    },
    {
      scene: 'ledger',
      ms: 10000,
      tag: 'SUNDAY, JANUARY 2, 2000',
      caption: "Simon Hale ran it above the fold. Inside, on A6, was Paul Whitlock's letter, under both of his names.",
      from: [0, 0, 1.25],
      to: [0, 2, 1.05],
      sfx: 'paper',
    },
  ],
  end_bureau: [
    {
      scene: 'raid',
      ms: 9500,
      tag: 'GATE 1 · 00:34',
      caption: 'Special Agent Calloway came up the hill at 00:34 with a warrant, two sedans and nine agents. The convoy never moved.',
      from: [0, 1, 1.08],
      to: [0, -1, 1.2],
      snow: 0.5,
      ambience: 'wind',
    },
    {
      scene: 'dawn',
      ms: 8500,
      tag: 'STATE ROUTE 9 · 07:40',
      caption: 'They drove you down the mountain in the back seat of a government sedan. You never drove Route 9 again.',
      from: [0, -2, 1.18],
      to: [0, 0, 1.06],
    },
  ],
  end_blackout: [
    {
      scene: 'blackout',
      ms: 9000,
      tag: (s: GameState) => `GATE 1 · ${hhmm(roll(s).gateAt || 100)}`,
      caption: (s) => `The convoy cleared Gate 1 at ${hhmm(roll(s).gateAt || 100)}. Nobody stopped it. By the time Kessick set off its fireworks, it was on the interstate.`,
      from: [0, 2, 1.05],
      to: [0, -1, 1.16],
      ambience: 'wind',
      snow: 0.4,
    },
    {
      scene: 'dawn',
      ms: 8500,
      tag: 'STATE ROUTE 9 · 07:12',
      caption: (s) =>
        roll(s).job === 'purged'
          ? 'RECSYS-Y2K-0047 reported SUCCESS at 23:51. Four thousand records went out with the year.'
          : 'You drove down into the first morning of 2000. Nothing on the radio about Marrow Creek. There never would be.',
      from: [3, 1, 1.3],
      to: [0, 2, 1.42],
    },
  ],
  end_lantern: [
    {
      scene: 'intercept',
      ms: 9500,
      tag: 'STATE ROUTE 9 · MILE 14 · 00:41',
      caption: 'At 00:41 the convoy stopped for a sedan with its hazards on. The driver was found at dawn, unhurt, zip-tied to a mile marker.',
      from: [0, 1, 1.06],
      to: [0, -1, 1.2],
      snow: 0.4,
      ambience: 'wind',
    },
    {
      scene: 'dawn',
      ms: 8500,
      tag: 'STATE ROUTE 9 · 07:12',
      caption: 'The truck was never found. Neither was LANTERN.',
      from: [0, -2, 1.18],
      to: [0, 0, 1.06],
    },
  ],
  end_company: [
    {
      scene: 'midnight',
      ms: 9000,
      tag: 'MARROW CREEK · 00:00',
      caption: "At midnight the war room cheered, and the Deputy Director's convoy was forty miles away. Everything was quiet, as requested.",
      from: [0, 2, 1.05],
      to: [0, -1, 1.18],
      ambience: 'wind',
    },
    {
      scene: 'dawn',
      ms: 8500,
      tag: 'STATE ROUTE 9 · 07:12',
      caption: 'Night Operations Lead, level four. You turned the radio on for the first time in a month.',
      from: [3, 1, 1.3],
      to: [0, 2, 1.42],
    },
  ],
  end_route9: [
    {
      scene: 'road',
      ms: 9000,
      tag: 'STATE ROUTE 9 · 01:16',
      caption: 'You held the gate until the window closed. Nobody came to help. Nobody was coming. At one, you clocked out.',
      from: [0, 1, 1.06],
      to: [0, -2, 1.22],
      snow: 0.6,
      ambience: 'wind',
    },
    {
      scene: 'mirror',
      ms: 9500,
      tag: 'STATE ROUTE 9 · 01:24',
      caption: "Headlights in your mirror since the Annex gate. They kept their distance on the straight. On the curve above the overlook, they didn't.",
      from: [0, 2, 1.02],
      to: [0, 1, 1.12],
      snow: 0.6,
    },
  ],
  end_echo: [
    {
      scene: 'sealed',
      ms: 9000,
      tag: 'B3 · 00:14',
      caption: 'At 00:14 on the first day of the year 2000, B3 lost negative pressure with six transport dewars open on the loading dock.',
      from: [0, 0, 1.02],
      to: [0, 1, 1.14],
      ambience: 'none',
      sfx: 'error',
    },
    {
      scene: 'blackout',
      ms: 9000,
      tag: 'MARROW CREEK · 00:30',
      caption: 'The Annex was sealed at 00:30. Nobody on the ridge went home that week.',
      from: [0, 2, 1.05],
      to: [0, -1, 1.16],
      ambience: 'wind',
    },
  ],
};

/** Two dawn captions per night, reacting to what the player did. */
const DAWN: Record<number, [(s: GameState) => string, (s: GameState) => string]> = {
  1: [
    () => 'You drive down the mountain with the heater on high and the radio off.',
    (s) =>
      s.flags.n1_saw_deceased
        ? 'Dr. Paul Whitlock died on this road on October 14th. His badge opened a door at 3:12 this morning.'
        : 'The sun comes up over the ridge like nothing happened. Maybe nothing did.',
  ],
  2: [
    () => 'Two nights. Two 3 a.m. visits from a dead man’s badge.',
    (s) =>
      s.flags.n2x1_cam && s.night.results.n2c5?.decision !== 'approve'
        ? 'You keep seeing the figure on the camera. Gray hair. Glasses. You have seen that face in the directory.'
        : 'The ridge looks smaller in daylight. It isn’t.',
  ],
  3: [
    () => 'Casey’s RA got better, then worse. You tell yourself it is just a bad flu year.',
    (s) => (s.flags.reyes_hint ? '“Read his drafts.” You turn the words over all the way down the mountain.' : 'Twenty-two days until the millennium. It feels closer.'),
  ],
  4: [
    (s) => (s.flags.n4_letter ? 'You read it twice in the parking lot with the engine running.' : 'The tapes rotated. Whatever Whitlock left behind is gone.'),
    (s) =>
      s.flags.n4_letter
        ? 'Paul Whitlock did not die in an accident. And somebody on that ridge knows you know.'
        : 'But LANTERN is still out there. And so is whatever Whitlock was afraid of.',
  ],
  5: [
    () => "Ray's truck is in his driveway. The curtains are closed.",
    (s) => (s.flags.reyes_guilt ? 'Naomi told Ashcombe that Ray was asking questions. Now Ray is gone.' : 'Somebody read your notes on Saturday morning. You keep thinking about that.'),
  ],
  6: [
    () => 'The FBI knows your name now. So does whoever tried to log in as you.',
    () => 'Casey is coming home early. They closed her floor.',
  ],
  7: [
    () => 'Teodor Vlasko. Born in Kalnitsa, in a country that changed its name.',
    () => 'LANTERN has a country now. Six nights until you have to choose.',
  ],
  8: [
    (s) =>
      s.flags.ashcombe === 'accepted'
        ? "Level four. Permanent lead. A raise your father wouldn't believe."
        : s.flags.ashcombe === 'refused'
          ? 'You said no to the man who runs ECHO. You watch your mirrors all the way down Route 9.'
          : 'Think quickly, he said. The year is ending.',
    () => 'On the thirty-first, a truck will be waiting at Gate 1.',
  ],
  9: [
    (s) =>
      ({
        fbi: 'Somewhere in Pittsburgh, a fax machine is still warm.',
        press: 'Somewhere in Washington, a reporter is reading Paul Whitlock’s letter.',
        lantern: 'Somewhere, LANTERN has everything you had.',
        ashcombe: 'You handed it back. The promotion letter is on your passenger seat.',
        none: 'You wiped your notes. Nobody knows what you know. Not even you, anymore.',
      })[String(s.flags.act2_choice)] ?? 'You chose no one. Eight days.',
    () => 'Christmas Eve. Eight days until the millennium.',
  ],
};
