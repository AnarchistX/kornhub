import type { Ambience, Sfx } from '../engine/audio';
import type { GameState } from '../engine/types';
import type { SceneId } from '../art/scenes';

export interface Shot {
  scene: SceneId | null; // null = black card
  ms: number;
  tag?: string; // dossier reference above the caption
  caption?: string | ((s: GameState) => string);
  title?: string[]; // centred title card lines
  from?: [number, number, number]; // translate x%, y%, scale
  to?: [number, number, number];
  rain?: number;
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
};
