// Chart → level. The builder simulates the intended presses with the real physics, then puts the
// world around that path: hazards where *not* pressing kills, clearance where pressing passes.
import { SONGS } from '../content/songs';
import type { Form, InputEvent, Level, Obj, SectionInfo } from './types';
import { BASE_SPEED, BODY_H, BODY_W, NODE_TOUCH, Sim, clonePlayer, type PlayerState } from './physics';

export interface SectionSpec {
  bar: number; // first bar of the section (bars count from the song's first downbeat)
  form?: Form; // form crystal at the start
  speed?: number; // speed gate at the start
  grid?: 8 | 16; // steps per bar
  rows: string[]; // one row per bar
  ceil?: number; // corridor height above the floor (flux, blink)
  clear?: number; // comet tunnel clearance beyond the body
  palette?: number;
}

export interface LevelSpec {
  id: string;
  name: string;
  world: string;
  song: string;
  endBar: number; // the finish line
  fadeBars?: number; // cut levels: the music fades out from the finish
  tolerance: number; // validator window, seconds either way
  sections: SectionSpec[];
  loopBars?: number; // endless runs loop the song every this many bars
}

interface Ev {
  t: number;
  ch: string;
  bar: number;
  step: number;
  si: number;
}

interface FluxMark {
  leaveX: number;
  landX: number;
  fromFloor: boolean;
  t: number;
}

const FAR = 160; // open-ended floors reach this far ahead of the player while building
const TAP = 0.05; // tap length in the intended run

export class ChartError extends Error {}

export function buildLevel(spec: LevelSpec): Level {
  const song = SONGS[spec.song];
  if (!song) throw new ChartError(`${spec.id}: unknown song ${spec.song}`);
  const beat = 60 / song.bpm;
  const barT = (bar: number) => song.bar0 + bar * 4 * beat;
  const objs: Obj[] = [];
  const inputs: InputEvent[] = [];
  const shardInputs: InputEvent[][] = [];
  const sections: SectionInfo[] = [];
  const reserved: [number, number][] = []; // x ranges kept hazard-free for shard routes
  const first = spec.sections[0];

  // ---------------------------------------------------------------- terrain
  let floorH = 0;
  let floor: Obj = { kind: 'solid', x: -40, y: -20, w: 40 + FAR, h: 20 };
  objs.push(floor);
  let ceiling: Obj | null = null;
  let ceilH = 0;

  const level: Level = {
    id: spec.id,
    name: spec.name,
    credit: `${song.title} - Kxrnage`,
    world: spec.world,
    song,
    start: 0,
    end: barT(spec.endBar),
    fadeAt: spec.fadeBars ? barT(spec.endBar) : undefined,
    endX: 1e9,
    objs,
    inputs,
    shardInputs,
    sections,
    beats: [],
    downbeats: [],
    drops: [],
    tolerance: spec.tolerance,
    startForm: first.form ?? 'spark',
    startSpeed: first.speed ?? 1,
  };

  // ---------------------------------------------------------------- the running simulation
  let sim = new Sim(level);
  let pending: InputEvent[] = [];
  const applied = new Set<InputEvent>();
  let cometPath: { x: number; y: number }[] = [];
  const growOpen = (x: number) => {
    const need = x + FAR;
    if (floor.x + floor.w < need) floor.w = need - floor.x;
    if (ceiling && ceiling.x + ceiling.w < need) ceiling.w = need - ceiling.x;
  };
  const rebuild = () => {
    growOpen(sim.p.x);
    sim = new Sim(level, clonePlayer(sim.p));
    pending = inputs.filter((e) => !applied.has(e)).sort((a, b) => a.t - b.t || (a.down ? 1 : -1));
  };
  const runTo = (t: number) => {
    rebuild();
    while (sim.p.t < t - 1e-9) {
      while (pending.length && pending[0].t <= sim.p.t + 1e-9) {
        const e = pending.shift()!;
        applied.add(e);
        if (e.down) sim.press();
        else sim.release();
      }
      sim.step();
      if (sim.p.form === 'comet') cometPath.push({ x: sim.p.x, y: sim.p.y });
      if (sim.p.dead) throw new ChartError(`${spec.id}: the intended run dies (${sim.p.dead}) at ${sim.p.t.toFixed(3)}s, x ${sim.p.x.toFixed(1)}`);
      if (sim.p.x > floor.x + floor.w - 60) rebuild();
    }
  };
  /** Simulate ahead from the current state with extra presses, until `stop`. */
  const predict = (presses: InputEvent[], stop: (p: PlayerState) => boolean, maxT = 3) => {
    growOpen(sim.p.x);
    const s = new Sim(level, clonePlayer(sim.p));
    const q = [...pending, ...presses].sort((a, b) => a.t - b.t || (a.down ? 1 : -1));
    const t0 = s.p.t;
    const path: { t: number; x: number; y: number }[] = [];
    while (s.p.t < t0 + maxT) {
      while (q.length && q[0].t <= s.p.t + 1e-9) {
        const e = q.shift()!;
        if (e.down) s.press();
        else s.release();
      }
      s.step();
      path.push({ t: s.p.t, x: s.p.x, y: s.p.y });
      if (s.p.dead || stop(s.p)) break;
    }
    return { path, end: s.p };
  };
  const tapAt = (t: number): InputEvent[] => [
    { t, down: true },
    { t: t + TAP, down: false },
  ];
  const tap = (t: number) => inputs.push(...tapAt(t));
  /** Ground kept either side of a pit: what an early or late press within the window moves the jump by. */
  const slack = () => sim.p.speed * BASE_SPEED * (spec.tolerance + 0.02) + 0.15;
  const landedAfter = (t: number) => (q: PlayerState) => q.grounded && q.airTime === 0 && q.t > t + 0.08;

  const hazardOk = (x0: number, x1: number, what: string) => {
    for (const [a, b] of reserved) if (x1 > a && x0 < b) throw new ChartError(`${spec.id}: ${what} at ${x0.toFixed(1)} lands on a shard route (${a.toFixed(1)}–${b.toFixed(1)})`);
  };
  const thorn = (cx: number, base: number, dir: 1 | -1, b: number) => {
    hazardOk(cx - 0.5, cx + 0.5, 'a thorn');
    const o: Obj = { kind: 'thorn', x: cx - 0.5, y: dir === 1 ? base : base - 1, w: 1, h: 1, dir, beat: b };
    objs.push(o);
    return o;
  };
  const pit = (a: number, b: number) => {
    hazardOk(a, b, 'a pit');
    floor.w = Math.max(0.5, a - floor.x);
    floor = { kind: 'solid', x: b, y: -20, w: FAR, h: 20 + floorH };
    objs.push(floor);
  };
  const setFloor = (x: number, h: number) => {
    floor.w = Math.max(0.5, x - floor.x);
    floorH = h;
    floor = { kind: 'solid', x, y: -20, w: FAR, h: 20 + h };
    objs.push(floor);
  };
  const setCeiling = (x: number, h: number | null) => {
    if (ceiling) ceiling.w = Math.max(0.5, x - ceiling.x);
    if (h === null) {
      ceiling = null;
      return;
    }
    ceilH = h;
    ceiling = { kind: 'solid', x, y: h, w: FAR, h: 30 };
    objs.push(ceiling);
  };

  // ---------------------------------------------------------------- events
  const events: Ev[] = [];
  spec.sections.forEach((sec, si) => {
    const grid = sec.grid ?? 8;
    const next = spec.sections[si + 1]?.bar ?? spec.endBar;
    sec.rows.forEach((row, r) => {
      const bar = sec.bar + r;
      if (bar >= next) throw new ChartError(`${spec.id}: section at bar ${sec.bar} has more rows than bars`);
      const steps = row.replace(/[|\s]/g, '');
      if (steps.length > grid) throw new ChartError(`${spec.id}: bar ${bar} has ${steps.length} steps on a ${grid}-step grid`);
      [...steps].forEach((ch, k) => {
        if (ch !== '.') events.push({ t: barT(bar) + (k * 4 * beat) / grid, ch, bar, step: k, si });
      });
    });
  });
  events.sort((a, b) => a.t - b.t);

  // ---------------------------------------------------------------- per-form state
  let lastGround: Obj[] = [];
  let lastTakeoff = { t: 0, x: 0 };
  let comet: { clear: number; x0: number; y0: number } | null = null;
  let fluxMarks: FluxMark[] = [];
  let curForm: Form = level.startForm;

  const finishComet = (x1: number) => {
    const c = comet!;
    comet = null;
    const path = cometPath;
    cometPath = [];
    floor.w = Math.max(0.5, c.x0 - floor.x);
    const cols: { x: number; lo: number; hi: number }[] = [];
    for (let x = Math.floor(c.x0); x < Math.ceil(x1); x++) {
      let lo = Infinity;
      let hi = -Infinity;
      for (const s of path) {
        if (s.x + BODY_W + 0.6 < x || s.x - BODY_W - 0.6 > x + 1) continue;
        lo = Math.min(lo, s.y - BODY_H);
        hi = Math.max(hi, s.y + BODY_H);
      }
      if (lo === Infinity) {
        lo = c.y0;
        hi = c.y0 + 1;
      }
      // the floor never drops below the section's base (a hole next to a stretch where the path
      // slides would catch a slightly early runner); under high flight it rises to leave clearance
      const floorTop = Math.max(c.y0, Math.floor((lo - c.clear) * 2) / 2);
      const ceilBottom = Math.ceil((hi + c.clear) * 2) / 2;
      cols.push({ x, lo: floorTop, hi: ceilBottom });
    }
    for (let i = 0; i < cols.length; ) {
      let j = i;
      while (j + 1 < cols.length && cols[j + 1].lo === cols[i].lo) j++;
      objs.push({ kind: 'solid', x: cols[i].x, y: -20, w: j - i + 1, h: 20 + cols[i].lo, style: 1 });
      i = j + 1;
    }
    for (let i = 0; i < cols.length; ) {
      let j = i;
      while (j + 1 < cols.length && cols[j + 1].hi === cols[i].hi) j++;
      objs.push({ kind: 'solid', x: cols[i].x, y: cols[i].hi, w: j - i + 1, h: 30, style: 1 });
      i = j + 1;
    }
    floor = { kind: 'solid', x: Math.ceil(x1), y: -20, w: FAR, h: 20 + floorH };
    objs.push(floor);
  };

  /** Each flux surface is lined with thorns wherever the player is not on it. */
  const flushFlux = (endX: number | null) => {
    while (fluxMarks.length >= (endX === null ? 2 : 1)) {
      const a = fluxMarks.shift()!;
      const b = fluxMarks[0];
      // clear ground after leaving (a late flip) and before landing (an early one)
      const v = sim.p.speed * BASE_SPEED;
      const until = b ? b.landX - (0.9 + v * (spec.tolerance + 0.01)) : (endX ?? a.leaveX) - 2.5;
      const base = a.fromFloor ? floorH : ceilH;
      const dir: 1 | -1 = a.fromFloor ? 1 : -1;
      // a flip starts slowly: allow for the time it takes to rise clear of the thorns
      for (let x = a.leaveX + Math.max(1.9, 0.6 + v * (spec.tolerance + 0.09)); x < until; x += 1) thorn(x, base, dir, a.t);
    }
  };

  const startSection = (si: number) => {
    const sec = spec.sections[si];
    const t = barT(sec.bar);
    // crystals and gates sit a tenth of a second before the downbeat, so a press on the downbeat
    // already belongs to the new form and speed
    runTo(si > 0 ? t - 0.1 : t);
    const x = sim.p.x + (si > 0 ? 0.06 : 0);
    const form = sec.form ?? curForm;
    if (curForm === 'flux') flushFlux(x);
    if (comet) finishComet(x);
    const db = sectionDb(song.barDb, sec.bar, spec.sections[si + 1]?.bar ?? spec.endBar, spec.loopBars);
    sections.push({ t, x, form, speed: sec.speed ?? sim.p.speed, intensity: db, palette: sec.palette ?? 0 });
    if (si > 0 && sec.speed && sec.speed !== sim.p.speed) objs.push({ kind: 'gate', x: x - 0.5, y: floorH, w: 1, h: 4.5, speed: sec.speed, beat: t });
    if (si > 0 && form !== curForm) objs.push({ kind: 'crystal', x: x - 0.5, y: floorH + 0.2, w: 1, h: 2.6, form, beat: t });
    if (form === 'flux' || form === 'blink') setCeiling(x - 1, floorH + (sec.ceil ?? (form === 'flux' ? 6 : 5)));
    else setCeiling(x, null);
    if (form === 'comet') {
      comet = { clear: sec.clear ?? 1.6, x0: x, y0: floorH };
      cometPath = [];
    }
    curForm = form;
    rebuild();
  };

  // ---------------------------------------------------------------- walk the chart
  let si = 0;
  startSection(0);
  let shardIdx = 0;
  for (const e of events) {
    while (si + 1 < spec.sections.length && e.si > si) startSection(++si);
    const where = `bar ${e.bar} step ${e.step + 1} '${e.ch}'`;
    const fail = (msg: string): never => {
      throw new ChartError(`${spec.id} ${where}: ${msg}`);
    };
    runTo(e.t);
    const p = sim.p;
    const x0 = p.x;

    if (curForm === 'comet') {
      if (e.ch === '^') inputs.push({ t: e.t, down: true });
      else if (e.ch === 'v') inputs.push({ t: e.t, down: false });
      else fail('comet charts use ^ (press) and v (release)');
      rebuild();
      continue;
    }

    switch (e.ch) {
      case 'J':
      case 'K':
      case 'L':
      case 'R': {
        if (curForm !== 'spark') fail('jumps need the spark form');
        if (!p.grounded) fail('jump while airborne (the previous jump has not landed)');
        const pr = predict(tapAt(e.t), landedAfter(e.t), 2);
        const mid = (x0 + pr.end.x) / 2;
        const n = e.ch === 'K' ? 2 : e.ch === 'L' ? 3 : 1;
        lastGround = [];
        for (let k = 0; k < n; k++) lastGround.push(thorn(mid + (k - (n - 1) / 2), floorH, 1, e.t));
        lastTakeoff = { t: e.t, x: x0 };
        if (e.ch === 'R') {
          const top = pr.path.reduce((a, s) => (s.y > a.y ? s : a), pr.path[0]);
          objs.push({ kind: 'rotor', x: top.x - 0.9, y: top.y + 1.5, w: 1.8, h: 1.8, r: 0.9, beat: e.t });
        }
        tap(e.t);
        break;
      }
      case 'S': {
        // a node hangs over the path at the top of a jump on this beat: run on and you pass under
        // it; jump on the beat and you fly through it, and it launches you up to the shard
        if (curForm !== 'spark') fail('shard routes need the spark form');
        if (!p.grounded) fail('a shard route starts on the ground');
        const opt = predict(tapAt(e.t), landedAfter(e.t), 2);
        const v = sim.p.speed * BASE_SPEED;
        const touchT = e.t + 0.21; // close to the top of that jump
        const at = (t: number) => opt.path.reduce((a, s) => (Math.abs(s.t - t) < Math.abs(a.t - t) ? s : a), opt.path[0]);
        const c = at(touchT + NODE_TOUCH / v); // centre sits one touch radius on, so contact starts at touchT
        objs.push({ kind: 'node', x: c.x - 0.6, y: c.y - 0.6, w: 1.2, h: 1.2, beat: e.t, style: 1 });
        rebuild();
        const alt = predict(tapAt(e.t), (q) => q.grounded && q.t > touchT + 0.1, 2.5);
        const top = alt.path.reduce((a, s) => (s.y > a.y ? s : a), alt.path[0]);
        if (top.y < c.y + 1) fail('the shard jump does not reach its node');
        objs.push({ kind: 'shard', x: top.x - 0.5, y: top.y - 0.5, w: 1, h: 1, idx: shardIdx });
        reserved.push([x0 - 0.5, alt.end.x + 1.5]);
        shardInputs.push(tapAt(e.t));
        shardIdx++;
        break;
      }
      case 'U': {
        if (curForm !== 'spark') fail('steps need the spark form');
        if (!p.grounded) fail('step up while airborne');
        setFloor(x0 + 2.3, floorH + 1);
        lastGround = [];
        lastTakeoff = { t: e.t, x: x0 };
        tap(e.t);
        break;
      }
      case 'D': {
        setFloor(x0 + 0.6, floorH - 1);
        break;
      }
      case 'G': {
        if (curForm !== 'spark') fail('gaps need the spark form');
        if (!p.grounded) fail('gap while airborne');
        const pr = predict(tapAt(e.t), landedAfter(e.t), 2);
        pit(x0 + slack(), pr.end.x - slack());
        lastGround = [];
        lastTakeoff = { t: e.t, x: x0 };
        tap(e.t);
        break;
      }
      case 'N': {
        // a bounce node in the jump's path: it fires on contact, carrying the runner over a pit
        if (curForm !== 'spark') fail('nodes need the spark form');
        if (p.grounded) fail('a node needs the runner in the air');
        const ahead = predict([], (q) => q.t >= e.t + 0.25, 0.3);
        const v = sim.p.speed * BASE_SPEED;
        const dt = NODE_TOUCH / v; // centre one touch radius on along the path, so contact starts now
        const c = ahead.path.reduce((a, s) => (Math.abs(s.t - (e.t + dt)) < Math.abs(a.t - (e.t + dt)) ? s : a), ahead.path[0]);
        objs.push({ kind: 'node', x: c.x - 0.6, y: c.y - 0.6, w: 1.2, h: 1.2, beat: e.t });
        rebuild();
        const pr = predict([], landedAfter(e.t), 2.5);
        if (!pr.path.some((s) => s.y > c.y + 0.5)) fail('the jump does not reach its node');
        for (const o of lastGround) objs.splice(objs.indexOf(o), 1);
        lastGround = [];
        // the bounce's landing moves with the jump's timing, so the far side gets extra ground
        pit(Math.max(lastTakeoff.x + slack(), floor.x + 0.5), pr.end.x - slack() - 0.75 * sim.p.speed);
        break;
      }
      case 'B': {
        if (curForm !== 'spark') fail('boost plates need the spark form');
        if (!p.grounded) fail('boost plate while airborne');
        objs.push({ kind: 'boost', x: x0 + BODY_W - 0.05, y: floorH, w: 1, h: 0.25, beat: e.t });
        rebuild();
        const pr = predict([], landedAfter(e.t), 2.5);
        pit(x0 + 2.0, pr.end.x - 0.9);
        lastGround = [];
        lastTakeoff = { t: e.t, x: x0 };
        break;
      }
      case 'X': {
        const on: [number, number][] = [];
        for (let b = -6; b <= 6; b++) {
          const bt = e.t + b * beat;
          if (Math.abs(bt - e.t) < beat * 0.75) continue;
          on.push([bt - 0.05, bt + 0.14]);
        }
        const top = ceiling ? ceilH : floorH + 8;
        objs.push({ kind: 'laser', x: x0 - 0.15, y: floorH, w: 0.3, h: top - floorH, on, beat: e.t });
        break;
      }
      case 'F': {
        if (curForm !== 'flux') fail('F outside a flux section');
        if (!p.grounded) fail('flip while airborne');
        const pr = predict(tapAt(e.t), landedAfter(e.t), 2);
        fluxMarks.push({ leaveX: x0, landX: pr.end.x, fromFloor: p.grav === -1, t: e.t });
        tap(e.t);
        rebuild();
        flushFlux(null);
        break;
      }
      case 'W': {
        if (curForm !== 'blink') fail('W outside a blink section');
        const cx = x0 + p.speed * BASE_SPEED * 0.12;
        hazardOk(cx - 0.2, cx + 0.2, 'a phase wall');
        objs.push({ kind: 'phase', x: cx - 0.15, y: floorH, w: 0.3, h: (ceiling ? ceilH : floorH + 5) - floorH, beat: e.t });
        tap(e.t);
        break;
      }
      default:
        fail('unknown chart symbol');
    }
    rebuild();
  }
  while (si + 1 < spec.sections.length) startSection(++si);

  // ---------------------------------------------------------------- finish
  runTo(barT(spec.endBar));
  const xEnd = sim.p.x;
  if (curForm === 'flux') flushFlux(xEnd);
  if (comet) finishComet(xEnd);
  level.endX = xEnd;
  objs.push({ kind: 'finish', x: xEnd - 0.5, y: floorH, w: 1, h: 8 });
  floor.w = xEnd + 40 - floor.x;
  if (ceiling) (ceiling as Obj).w = xEnd + 40 - (ceiling as Obj).x;

  for (let t = song.bar0; t < level.end + 4 * beat; t += beat) level.beats.push(t);
  for (let t = song.bar0; t < level.end + 4 * beat; t += 4 * beat) level.downbeats.push(t);
  for (let i = 1; i < sections.length; i++) if (sections[i].intensity > sections[i - 1].intensity + 0.15) level.drops.push(sections[i].t);
  objs.sort((a, b) => a.x - b.x);
  inputs.sort((a, b) => a.t - b.t || (a.down ? 1 : -1));
  return level;
}

function sectionDb(barDb: number[], a: number, b: number, loop?: number) {
  const seg: number[] = [];
  for (let i = Math.max(0, a); i < Math.max(a + 1, b); i++) {
    const v = barDb[loop ? i % loop : i];
    if (v !== undefined) seg.push(v);
  }
  const mean = seg.reduce((s, v) => s + v, 0) / Math.max(1, seg.length);
  return Math.max(0, Math.min(1, (mean + 30) / 18)); // −30 dB → 0, −12 dB → 1
}
