// npx tsx scripts/validate.ts [levelId...]  — builds and validates every level (or the ones named).
import { LEVELS } from '../src/content/levels';
import { buildLevel, ChartError } from '../src/engine/build';
import { validate } from '../src/engine/validate';

const only = process.argv.slice(2);
let failed = 0;
for (const spec of LEVELS) {
  if (only.length && !only.includes(spec.id)) continue;
  const t0 = Date.now();
  try {
    const level = buildLevel(spec);
    const r = validate(level);
    console.log(r.lines.join('\n') + `  (${Date.now() - t0}ms)`);
    if (!r.ok) failed++;
  } catch (e) {
    failed++;
    console.log(`✗ ${spec.id}  ${e instanceof ChartError ? e.message : (e as Error).stack}`);
  }
}
process.exit(failed ? 1 : 0);
