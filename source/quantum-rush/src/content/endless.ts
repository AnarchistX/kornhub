// Endless mode: a seeded chart generator that respects the physics, getting denser as it goes.
import type { LevelSpec, SectionSpec } from '../engine/build';
import type { Form } from '../engine/types';
import { SONGS } from './songs';

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/** Steps (eighths) that one action occupies at this tempo. */
const stepsFor = (secs: number, eighth: number) => Math.max(1, Math.ceil(secs / eighth - 1e-6));

export function endlessSpec(songId: string, seed: number, bars = 64, worldOf = 'deep'): LevelSpec {
  const song = SONGS[songId];
  const eighth = 60 / song.bpm / 2;
  const r = rng(seed);
  const sections: SectionSpec[] = [];
  const order: Form[] = ['spark', 'spark', 'flux', 'spark', 'comet', 'spark', 'blink', 'spark'];
  const sectionBars = 8;
  let height = 0;
  for (let s = 0; s * sectionBars < bars; s++) {
    const form = s === 0 ? 'spark' : order[s % order.length];
    const level = Math.min(1, s / 7); // difficulty ramps over ~56 bars
    const rows: string[] = [];
    for (let b = 0; b < sectionBars; b++) {
      const cells = Array(8).fill('.');
      if (s === 0 && b < 2) {
        rows.push(cells.join(''));
        continue;
      }
      if (b === sectionBars - 1 && form !== 'spark') {
        // land before the form changes back
        if (form === 'comet') cells[0] = 'v';
        rows.push(cells.join(''));
        continue;
      }
      let k = 0;
      switch (form) {
        case 'spark': {
          const gap = stepsFor(0.54, eighth);
          while (k < 8) {
            const roll = r();
            const density = 0.45 + level * 0.4;
            if (roll < density) {
              let ch = 'J';
              const pick = r();
              if (pick < 0.15 + level * 0.15) ch = 'K';
              else if (pick < 0.25 + level * 0.15) ch = 'G';
              else if (pick < 0.32 && height < 2) ch = 'U';
              else if (pick < 0.38 && height > 0) ch = 'D';
              else if (pick < 0.44 && level > 0.3) ch = 'L';
              if (ch === 'U') height++;
              if (ch === 'D') height--;
              cells[k] = ch;
              if (ch === 'J' && level > 0.4 && r() < 0.25 && k + 1 < 8) {
                cells[k + 1] = 'N';
                k += 1 + gap + 1;
                continue;
              }
              k += ch === 'D' ? 2 : gap;
            } else k += 2;
          }
          break;
        }
        case 'flux': {
          const gap = stepsFor(0.46, eighth);
          let flips = 0;
          while (k < 8) {
            if (r() < 0.5 + level * 0.35) {
              cells[k] = 'F';
              flips++;
              k += gap + (r() < 0.5 ? 1 : 0);
            } else k += 2;
          }
          // finish the bar on the floor: an even number of flips per bar
          if (flips % 2 === 1) {
            for (let j = 7; j >= 0; j--)
              if (cells[j] === 'F') {
                cells[j] = '.';
                break;
              }
          }
          break;
        }
        case 'comet': {
          let up = false;
          while (k < 8) {
            cells[k] = up ? 'v' : '^';
            up = !up;
            k += up ? 1 + Math.floor(r() * 2) : 1 + Math.floor(r() * (3 - level));
          }
          if (up && cells.lastIndexOf('^') > cells.lastIndexOf('v')) {
            const i = cells.lastIndexOf('^');
            if (i + 1 < 8) cells[i + 1] = 'v';
          }
          break;
        }
        case 'blink': {
          const gap = stepsFor(0.3, eighth);
          while (k < 8) {
            if (r() < 0.55 + level * 0.3) {
              cells[k] = 'W';
              k += gap;
            } else k += 2;
          }
          break;
        }
      }
      rows.push(cells.join(''));
    }
    // step back down at the end of spark sections so forms start on the base floor
    if (form === 'spark' && height > 0) {
      for (let h = height; h > 0; h--) rows[sectionBars - h] = 'D.......';
      height = 0;
    }
    sections.push({ bar: s * sectionBars, form: s === 0 ? undefined : form, rows, palette: s % 3, clear: 1.5, speed: s >= 4 && form === 'spark' && level > 0.6 ? 1.24 : 1 });
  }
  return { id: `endless-${songId}`, name: 'Endless', world: worldOf, song: songId, endBar: bars, tolerance: 0.07, sections };
}
