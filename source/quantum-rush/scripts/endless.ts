// npx tsx scripts/endless.ts — builds endless runs for every song over several seeds and validates them.
import { endlessSpec } from '../src/content/endless';
import { LEVELS } from '../src/content/levels';
import { buildLevel } from '../src/engine/build';
import { validate } from '../src/engine/validate';

let bad = 0;
for (const spec of LEVELS) {
  const res: string[] = [];
  for (let seed = 1; seed <= 6; seed++) {
    try {
      const lvl = buildLevel(endlessSpec(spec.song, seed * 7919, 160, spec.world));
      const r = validate(lvl);
      res.push(r.ok ? '✓' : '✗');
      if (!r.ok) {
        bad++;
        console.log(`  ${spec.song} seed ${seed}: ${r.lines.slice(1, 3).join(' | ')}`);
      }
    } catch (e) {
      res.push('E');
      bad++;
      console.log(`  ${spec.song} seed ${seed}: ${(e as Error).message}`);
    }
  }
  console.log(`${spec.song.padEnd(16)} ${res.join(' ')}`);
}
console.log(bad ? `${bad} failures` : 'all endless runs ok');
