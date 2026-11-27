// npx tsx scripts/diagnose.ts <levelId> — where shifted/jittered runs die, in bars and steps.
import { LEVELS } from '../src/content/levels';
import { buildLevel } from '../src/engine/build';
import { Sim } from '../src/engine/physics';
import type { InputEvent, Level } from '../src/engine/types';

const id = process.argv[2];
const spec = LEVELS.find((l) => l.id === id)!;
const level = buildLevel(spec);
const song = level.song;
const beat = 60 / song.bpm;

function where(t: number) {
  const bars = (t - song.bar0) / (4 * beat);
  const bar = Math.floor(bars);
  const step = (bars - bar) * 8;
  const sec = [...spec.sections].reverse().find((s) => s.bar <= bar)!;
  const row = sec.rows[bar - sec.bar] ?? '';
  return `bar ${bar} step ${step.toFixed(2)} [${sec.form ?? '·'} ${sec.speed ?? ''}] '${row}'`;
}

function run(inputs: InputEvent[], shift: number, jitter: number, seed: number) {
  let s = seed;
  const rnd = () => ((s = (s * 1103515245 + 12345) >>> 0) / 4294967296) * 2 - 1;
  const q: InputEvent[] = [];
  const offs: number[] = [];
  for (let i = 0; i < inputs.length; i++) {
    const e = inputs[i];
    if (e.down) {
      const d = shift + (jitter ? rnd() * jitter : 0);
      offs.push(d);
      q.push({ t: e.t + d, down: true });
      const up = inputs.slice(i + 1).find((u) => !u.down);
      if (up) q.push({ t: up.t + d, down: false });
    }
  }
  q.sort((a, b) => a.t - b.t || (a.down ? 1 : -1));
  const sim = new Sim(level);
  let lastPress = -1;
  while (!sim.p.dead && !sim.p.done && sim.p.t < level.end + 5) {
    while (q.length && q[0].t <= sim.p.t + 1e-9) {
      const e = q.shift()!;
      if (e.down) {
        sim.press();
        lastPress = e.t;
      } else sim.release();
    }
    sim.step();
  }
  return { p: sim.p, lastPress };
}

const tol = level.tolerance;
const seen = new Map<string, string[]>();
const add = (label: string, r: ReturnType<typeof run>) => {
  if (!r.p.dead) return;
  const k = where(r.p.t);
  if (!seen.has(k)) seen.set(k, []);
  seen.get(k)!.push(`${label}:${r.p.dead}`);
};
add('early', run(level.inputs, -tol, 0, 1));
add('late', run(level.inputs, tol, 0, 1));
for (let i = 0; i < 40; i++) add(`j${i}`, run(level.inputs, 0, tol * 0.75, 7 + i * 31));
for (const [k, v] of [...seen.entries()].sort()) console.log(`${k}   ← ${v.slice(0, 6).join(' ')}${v.length > 6 ? ` +${v.length - 6}` : ''}`);
// whole-run window
for (const sign of [-1, 1]) {
  let ok = 0;
  for (let d = 0.005; d <= 0.2; d += 0.005) {
    const r = run(level.inputs, sign * d, 0, 1);
    if (r.p.done) ok = d;
    else {
      console.log(`${sign < 0 ? 'early' : 'late'} limit ${Math.round(ok * 1000)}ms — first death ${where(r.p.t)} ${r.p.dead}`);
      break;
    }
  }
}
void ({} as Level);
