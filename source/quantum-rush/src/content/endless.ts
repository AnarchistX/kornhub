// Endless mode: a seeded chart generator that respects the physics, getting denser as it goes.
// It works on one continuous timeline of eighth notes, so spacing holds across bar lines, and every
// section opens with an empty bar so form changes always have room.
import type { LevelSpec, SectionSpec } from '../engine/build';
import type { Form } from '../engine/types';
import { SONGS } from './songs';

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

const SECTION_BARS = 8;
const ORDER: Form[] = ['spark', 'spark', 'flux', 'spark', 'comet', 'spark', 'blink', 'spark'];

export function endlessSpec(songId: string, seed: number, bars = 160, worldOf = 'deep'): LevelSpec {
  const song = SONGS[songId];
  const eighth = 60 / song.bpm / 2;
  const r = rng(seed);
  /** Eighths needed for `secs` to pass. */
  const need = (secs: number) => Math.max(1, Math.ceil(secs / eighth - 1e-6));
  const JUMP = need(0.5); // a jump lands before the next ground action
  const AFTER_NODE = need(0.62); // a node launches from mid-air, so that jump lands later
  const AFTER_BOOST = need(0.74);
  const AFTER_DROP = need(0.26);
  const FLIP = need(0.36);
  const WALL = need(0.26);
  const songBars = Math.floor((song.duration - song.bar0 - 0.5) / ((4 * 60) / song.bpm));

  const sections: SectionSpec[] = [];
  for (let s = 0; s * SECTION_BARS < bars; s++) {
    const form: Form = s === 0 ? 'spark' : ORDER[s % ORDER.length];
    const level = Math.min(1, s / 9); // difficulty ramps over the first ~72 bars
    const n = SECTION_BARS * 8;
    const cells: string[] = Array(n).fill('.');
    let k = s === 0 ? 16 : 8; // opening bar(s) stay empty
    const last = form === 'spark' ? n - 4 : n - 8; // other forms leave the closing bar empty
    switch (form) {
      case 'spark': {
        let height = 0;
        const stop = last - 2 * AFTER_DROP - 1; // room to step back down to the base floor
        while (k < stop) {
          if (r() > 0.5 + level * 0.35) {
            k += 2;
            continue;
          }
          const pick = r();
          let ch = 'J';
          if (pick < 0.12 + level * 0.12) ch = 'K';
          else if (pick < 0.2 + level * 0.12) ch = 'G';
          else if (pick < 0.27 && height < 2) ch = 'U';
          else if (pick < 0.33 && height > 0) ch = 'D';
          else if (pick < 0.37 && level > 0.5) ch = 'B';
          cells[k] = ch;
          if (ch === 'U') height++;
          if (ch === 'D') height--;
          if (ch === 'J' && level > 0.3 && r() < 0.22 && k + 1 < stop) {
            cells[k + 1] = 'N';
            k += 1 + AFTER_NODE;
          } else k += ch === 'D' ? AFTER_DROP : ch === 'B' ? AFTER_BOOST : JUMP;
        }
        k = Math.max(k, stop);
        for (; height > 0; height--) {
          cells[k] = 'D';
          k += AFTER_DROP;
        }
        break;
      }
      case 'flux': {
        let flips = 0;
        while (k < last) {
          if (r() < 0.45 + level * 0.35) {
            cells[k] = 'F';
            flips++;
            k += FLIP + (r() < 0.5 ? 1 : 0);
          } else k += 2;
        }
        // end on the floor: an even number of flips
        if (flips % 2 === 1) cells[cells.lastIndexOf('F')] = '.';
        break;
      }
      case 'comet': {
        const hold = need(0.3);
        while (k + hold * 2 < last) {
          const h = hold + Math.floor(r() * 2);
          cells[k] = '^';
          cells[k + h] = 'v';
          k += h + hold + Math.floor(r() * (3 - level * 1.5));
        }
        break;
      }
      case 'blink': {
        while (k < last) {
          if (r() < 0.5 + level * 0.35) {
            cells[k] = 'W';
            k += WALL + (r() < 0.6 - level * 0.4 ? 1 : 0);
          } else k += 2;
        }
        break;
      }
    }
    const rows: string[] = [];
    for (let b = 0; b < SECTION_BARS; b++) rows.push(cells.slice(b * 8, b * 8 + 8).join(''));
    const fast = s >= 4 && form === 'spark' && level > 0.6;
    sections.push({ bar: s * SECTION_BARS, form: s === 0 ? undefined : form, rows, palette: s % 3, speed: fast ? 1.24 : 1 });
  }
  return { id: `endless-${songId}`, name: 'Endless', world: worldOf, song: songId, endBar: bars, tolerance: 0.07, sections, loopBars: songBars };
}
