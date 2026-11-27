// Builds levels on demand and caches them.
import { buildLevel, type LevelSpec } from '../engine/build';
import type { Level } from '../engine/types';
import { LEVELS } from './levels';
import { endlessSpec } from './endless';

const cache = new Map<string, Level>();

export const levelSpec = (id: string) => LEVELS.find((l) => l.id === id);

export function getLevel(id: string): Level {
  let l = cache.get(id);
  if (!l) {
    const spec = levelSpec(id);
    if (!spec) throw new Error(`no level ${id}`);
    l = buildLevel(spec);
    cache.set(id, l);
  }
  return l;
}

/** An endless run on a level's song, in its world. Retries a few seeds if a generated chart is impossible. */
export function getEndless(id: string, seed: number): Level {
  const spec = levelSpec(id)!;
  for (let i = 0; i < 8; i++) {
    try {
      const e: LevelSpec = endlessSpec(spec.song, seed + i * 7919, 64, spec.world);
      e.name = `${spec.name} · Endless`;
      return buildLevel(e);
    } catch {
      /* try another seed */
    }
  }
  return getLevel(id);
}
