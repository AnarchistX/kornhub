// The ten levels, written as charts. One row per bar; a step is an eighth note unless grid is 16.
// Spark: J jump a thorn · K two · L three · U step up · D step down · G gap · N tap a node mid-air
//        B boost plate · S shard route (jump + node + shard) · R jump under a rotor · X beat laser
// Flux: F flip · Comet: ^ press, v release · Blink: W phase wall · . nothing
import type { LevelSpec } from '../engine/build';

export const LEVELS: LevelSpec[] = [
  {
    id: 'lumen',
    name: 'Lumen Deep',
    world: 'deep',
    song: 'bioluminescence',
    endBar: 32,
    fadeBars: 2,
    tolerance: 0.09,
    sections: [
      {
        bar: 0,
        rows: [
          '........',
          '........',
          'J.......',
          'J...J...',
          'J...J...',
          'J...U...',
          'J...J...',
          'D...J...',
        ],
      },
      {
        bar: 8,
        palette: 1,
        rows: [
          'J.J.J...',
          'K...J...',
          'J.J.U...',
          'J...D...',
          'J.J.J.J.',
          'K...K...',
          'G...J...',
          'S.......',
          '....J.J.',
          'U...J.J.',
          'J...D...',
          'G...G...',
          'J.J.K...',
          'J...J...',
          'B.......',
          '....J...',
          'J.J.J...',
          'K...J...',
          'S.......',
          '....J...',
        ],
      },
      {
        bar: 28,
        palette: 2,
        rows: ['J...J...', 'G.......', 'J...J...', 'S.......'],
      },
    ],
  },
];

/** A test track that touches every form and object, used while building the engine. */
export const LAB: LevelSpec = {
  id: 'lab',
  name: 'Lab',
  world: 'deep',
  song: 'astral',
  endBar: 30,
  tolerance: 0.05,
  sections: [
    { bar: 0, rows: ['........', 'J...J...', 'K...U...', 'J...D...', 'G...J...', 'B.......', '....JN..', '....S...'] },
    { bar: 8, form: 'flux', palette: 1, rows: ['........', 'F...F...', 'F.......', 'F...F...', 'F...F...', 'F.......'] },
    { bar: 14, form: 'comet', palette: 2, rows: ['^...v...', '^.v.^.v.', '^...v...', '....^.v.', '^.v.....', '........'] },
    { bar: 20, form: 'blink', speed: 1.24, rows: ['........', 'W...W...', 'W.W.W...', 'W...W.W.', 'W.......', '........'] },
    { bar: 26, form: 'spark', speed: 1, rows: ['........', 'J...R...', 'X...J...', 'J.......'] },
  ],
};
