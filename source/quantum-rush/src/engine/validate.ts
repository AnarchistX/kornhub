// Replays a level's intended run: exact, shifted early/late, with random jitter, and along each shard route.
import type { InputEvent, Level } from './types';
import { Sim } from './physics';

export interface RunResult {
  done: boolean;
  dead: string | null;
  t: number;
  x: number;
  shards: number;
}

export function replay(level: Level, inputs: InputEvent[], shift = 0, jitter = 0, seed = 1): RunResult {
  let s = seed;
  const rnd = () => ((s = (s * 1103515245 + 12345) >>> 0) / 4294967296) * 2 - 1;
  // jitter moves each press (and its release) together
  const q: InputEvent[] = [];
  for (let i = 0; i < inputs.length; i++) {
    const e = inputs[i];
    if (e.down) {
      const d = shift + (jitter ? rnd() * jitter : 0);
      q.push({ t: e.t + d, down: true });
      const up = inputs.slice(i + 1).find((u) => !u.down);
      if (up) q.push({ t: up.t + d, down: false });
    }
  }
  q.sort((a, b) => a.t - b.t || (a.down ? 1 : -1));
  const sim = new Sim(level);
  const limit = level.end + 5;
  while (!sim.p.dead && !sim.p.done && sim.p.t < limit) {
    while (q.length && q[0].t <= sim.p.t + 1e-9) {
      const e = q.shift()!;
      if (e.down) sim.press();
      else sim.release();
    }
    sim.step();
  }
  return { done: sim.p.done, dead: sim.p.dead, t: sim.p.t, x: sim.p.x, shards: sim.p.shards };
}

export interface Report {
  id: string;
  ok: boolean;
  lines: string[];
}

export function validate(level: Level): Report {
  const lines: string[] = [];
  let ok = true;
  const tol = level.tolerance;
  const check = (label: string, r: RunResult, wantShard?: number) => {
    const good = r.done && !r.dead && (wantShard === undefined || (r.shards & (1 << wantShard)) !== 0);
    if (!good) {
      ok = false;
      lines.push(`  ✗ ${label}: ${r.dead ? `died (${r.dead})` : r.done ? 'missed the shard' : 'did not finish'} at ${r.t.toFixed(2)}s x ${r.x.toFixed(1)}`);
    }
    return good;
  };
  check('exact', replay(level, level.inputs));
  check(`early ${Math.round(tol * 1000)}ms`, replay(level, level.inputs, -tol));
  check(`late ${Math.round(tol * 1000)}ms`, replay(level, level.inputs, tol));
  for (let i = 0; i < 12; i++) check(`jitter #${i + 1}`, replay(level, level.inputs, 0, tol, 7 + i * 31));
  level.shardInputs.forEach((extra, idx) => {
    const merged = [...level.inputs, ...extra].sort((a, b) => a.t - b.t || (a.down ? 1 : -1));
    check(`shard ${idx + 1} route`, replay(level, merged), idx);
  });
  // the window each press really has, for the report
  let lo = 0;
  let hi = 0;
  for (let d = 0.005; d <= 0.3; d += 0.005) {
    if (replay(level, level.inputs, -d).done) lo = d;
    else break;
  }
  for (let d = 0.005; d <= 0.3; d += 0.005) {
    if (replay(level, level.inputs, d).done) hi = d;
    else break;
  }
  const presses = level.inputs.filter((e) => e.down).length;
  lines.unshift(`${ok ? '✓' : '✗'} ${level.id}  ${presses} presses, ${level.shardInputs.length} shards, ${level.objs.length} objects, ${(level.end - level.start).toFixed(1)}s · whole-run window −${Math.round(lo * 1000)}/+${Math.round(hi * 1000)}ms`);
  return { id: level.id, ok, lines };
}
