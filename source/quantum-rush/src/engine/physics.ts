// Deterministic runner simulation, shared by the game, the level builder and the validator.
// Fixed 1/240 s steps; positions in tiles, y up. The player's (x, y) is the centre of its body.
import type { Form, Level, Obj } from './types';

export const TICK = 1 / 240;
export const BASE_SPEED = 10.4; // tiles per second at 1×

// Spark: a fixed arc so skill carries between songs (apex 2.1 tiles, 0.44 s in the air: one jump per
// beat fits up to 130 BPM).
export const SPARK_G = 86;
export const SPARK_V0 = 19;
export const NODE_V = 19;
export const BOOST_V = 28;
// Flux: gravity flips toward the other surface.
export const FLUX_G = 80;
export const FLUX_KICK = 4;
// Comet: hold to climb, release to dive.
export const COMET_ACC = 62;
export const COMET_VMAX = 8.6;
// Blink: a short phase window.
export const PHASE_TIME = 0.24;

export const BODY_W = 0.4; // half-width against solids
export const BODY_H = 0.5; // half-height against solids
export const HIT = 0.31; // half-size against hazards
export const BUFFER = 0.14; // a press this early before landing still counts
export const COYOTE = 0.06;
export const STEP_SNAP = 0.2; // ledges lower than this are climbed instead of crashed into
export const NODE_TOUCH = 1.0; // a pulse node fires when the runner's centre comes this close (art + body)
export const NODE_RISE = (NODE_V * NODE_V) / (2 * SPARK_G); // a node always lifts you this high above it
export const SHARD_R = 0.85;

export type DeathCause = 'thorn' | 'wall' | 'fall' | 'rotor' | 'laser' | 'phase';

export interface PlayerState {
  t: number;
  x: number;
  y: number;
  vy: number;
  form: Form;
  grav: -1 | 1; // -1 pulls down
  grounded: boolean;
  speed: number; // multiplier
  held: boolean;
  buffer: number;
  coyote: number;
  phase: number;
  dead: DeathCause | null;
  done: boolean;
  nodes: number[]; // pulse nodes already used
  passed: number[]; // crystals, gates and boosts already triggered (object indices)
  shards: number; // bitmask
  airTime: number;
  jumps: number;
}

export type SimEvent =
  | { type: 'jump' | 'node' | 'boost' | 'flip' | 'phase' | 'land' }
  | { type: 'form'; form: Form }
  | { type: 'speed'; speed: number }
  | { type: 'shard'; idx: number }
  | { type: 'die'; cause: DeathCause }
  | { type: 'done' };

const G: Record<Form, number> = { spark: SPARK_G, flux: FLUX_G, comet: 0, blink: SPARK_G };

/** Objects bucketed by tile column for quick lookups. */
export class Index {
  private buckets: number[][] = [];
  private minX = 0;
  private stamp: Uint32Array;
  private round = 1;
  constructor(public objs: Obj[]) {
    let lo = Infinity;
    let hi = -Infinity;
    for (const o of objs) {
      lo = Math.min(lo, o.x);
      hi = Math.max(hi, o.x + o.w);
    }
    if (!objs.length) lo = hi = 0;
    this.minX = Math.floor(lo) - 1;
    const n = Math.ceil(hi) - this.minX + 2;
    this.buckets = Array.from({ length: Math.max(1, n) }, () => []);
    objs.forEach((o, i) => {
      const a = Math.floor(o.x) - this.minX;
      const b = Math.floor(o.x + o.w) - this.minX;
      for (let k = Math.max(0, a); k <= Math.min(this.buckets.length - 1, b); k++) this.buckets[k].push(i);
    });
    this.stamp = new Uint32Array(objs.length);
  }
  /** Indices of objects that may overlap [x0, x1]. */
  near(x0: number, x1: number, out: number[]): number[] {
    out.length = 0;
    this.round++;
    const a = Math.max(0, Math.floor(x0) - this.minX);
    const b = Math.min(this.buckets.length - 1, Math.floor(x1) - this.minX);
    for (let k = a; k <= b; k++) {
      for (const i of this.buckets[k]) {
        if (this.stamp[i] !== this.round) {
          this.stamp[i] = this.round;
          out.push(i);
        }
      }
    }
    return out;
  }
}

/** Thorn hitbox: narrow and short, centred on the art. */
export function thornBox(o: Obj) {
  const w = 0.36 * o.w;
  const h = 0.58 * o.h;
  const x = o.x + (o.w - w) / 2;
  return o.dir === -1 ? { x, y: o.y + o.h - h, w, h } : { x, y: o.y, w, h };
}

const overlap = (ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number) =>
  ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;

export function freshPlayer(lvl: Level): PlayerState {
  return {
    t: lvl.start,
    x: 0,
    y: BODY_H,
    vy: 0,
    form: lvl.startForm,
    grav: -1,
    grounded: true,
    speed: lvl.startSpeed,
    held: false,
    buffer: 0,
    coyote: 0,
    phase: 0,
    dead: null,
    done: false,
    nodes: [],
    passed: [],
    shards: 0,
    airTime: 0,
    jumps: 0,
  };
}

export const clonePlayer = (p: PlayerState): PlayerState => ({ ...p, nodes: [...p.nodes], passed: [...p.passed] });

export class Sim {
  p: PlayerState;
  index: Index;
  events: SimEvent[] = [];
  private near: number[] = [];
  private pressed = false;

  constructor(public lvl: Level, start?: PlayerState) {
    this.index = new Index(lvl.objs);
    this.p = start ? clonePlayer(start) : freshPlayer(lvl);
  }

  press() {
    this.pressed = true;
    this.p.held = true;
  }
  release() {
    this.p.held = false;
  }

  /** Advance one tick. Events from this tick are in `events`. */
  step() {
    const p = this.p;
    this.events.length = 0;
    if (p.dead || p.done) return;
    const dt = TICK;
    const objs = this.lvl.objs;
    if (this.pressed) {
      p.buffer = BUFFER;
      this.pressed = false;
    }
    const near = this.index.near(p.x - 2, p.x + 2, this.near);

    // ---------------------------------------------------------------- actions
    if (p.form === 'spark') {
      if (p.buffer > 0 && (p.grounded || p.coyote > 0)) this.jump(SPARK_V0, 'jump');
      else if (p.held && p.grounded) this.jump(SPARK_V0, 'jump');
    } else if (p.form === 'flux') {
      if ((p.buffer > 0 || p.held) && p.grounded) {
        p.grav = p.grav === -1 ? 1 : -1;
        p.vy = p.grav * FLUX_KICK;
        p.grounded = false;
        p.coyote = 0;
        p.buffer = 0;
        p.jumps++;
        this.events.push({ type: 'flip' });
      }
    } else if (p.form === 'blink') {
      if (p.buffer > 0 && p.phase <= 0) {
        p.phase = PHASE_TIME;
        p.buffer = 0;
        p.jumps++;
        this.events.push({ type: 'phase' });
      }
    }
    p.buffer = Math.max(0, p.buffer - dt);
    p.coyote = Math.max(0, p.coyote - dt);
    p.phase = Math.max(0, p.phase - dt);

    // ---------------------------------------------------------------- forces
    if (p.form === 'comet') {
      p.vy += (p.held ? COMET_ACC : -COMET_ACC) * dt;
      p.vy = Math.max(-COMET_VMAX, Math.min(COMET_VMAX, p.vy));
    } else {
      p.vy += p.grav * G[p.form] * dt;
      p.vy = Math.max(-40, Math.min(40, p.vy));
    }

    // ---------------------------------------------------------------- horizontal
    p.x += p.speed * BASE_SPEED * dt;
    for (const i of near) {
      const o = objs[i];
      if (o.kind !== 'solid') continue;
      if (!overlap(p.x - BODY_W, p.y - BODY_H, BODY_W * 2, BODY_H * 2, o.x, o.y, o.w, o.h)) continue;
      const top = o.y + o.h;
      const bottom = o.y;
      if (p.form !== 'comet' && p.grav === -1 && p.y - BODY_H >= top - STEP_SNAP && p.vy <= 0.5) {
        p.y = top + BODY_H;
        p.vy = 0;
      } else if (p.form !== 'comet' && p.grav === 1 && p.y + BODY_H <= bottom + STEP_SNAP && p.vy >= -0.5) {
        p.y = bottom - BODY_H;
        p.vy = 0;
      } else if (p.form === 'comet' && p.y - BODY_H >= top - 0.12) {
        p.y = top + BODY_H;
        p.vy = Math.max(0, p.vy);
      } else if (p.form === 'comet' && p.y + BODY_H <= bottom + 0.12) {
        p.y = bottom - BODY_H;
        p.vy = Math.min(0, p.vy);
      } else return this.die('wall');
    }

    // ---------------------------------------------------------------- vertical
    const prevY = p.y;
    p.y += p.vy * dt;
    let landed = false;
    for (const i of near) {
      const o = objs[i];
      if (o.kind !== 'solid') continue;
      if (!overlap(p.x - BODY_W, p.y - BODY_H, BODY_W * 2, BODY_H * 2, o.x, o.y, o.w, o.h)) continue;
      const top = o.y + o.h;
      const bottom = o.y;
      if (p.y < prevY && prevY - BODY_H >= top - 1e-4) {
        // moving down onto a top surface
        p.y = top + BODY_H;
        if (p.grav === -1 || p.form === 'comet') landed = p.grav === -1 && p.form !== 'comet';
        p.vy = p.form === 'comet' ? Math.max(0, p.vy) : 0;
      } else if (p.y > prevY && prevY + BODY_H <= bottom + 1e-4) {
        // moving up into an underside
        p.y = bottom - BODY_H;
        if (p.grav === 1 && p.form !== 'comet') landed = true;
        p.vy = p.form === 'comet' ? Math.min(0, p.vy) : 0;
      } else {
        // embedded: resolve along the smaller axis, sideways means a crash
        const up = top - (p.y - BODY_H);
        const down = p.y + BODY_H - bottom;
        if (Math.min(up, down) <= 0.25) {
          if (up < down) p.y = top + BODY_H;
          else p.y = bottom - BODY_H;
          p.vy = 0;
        } else return this.die('wall');
      }
    }

    // ---------------------------------------------------------------- support
    const wasGrounded = p.grounded;
    if (p.form === 'comet') p.grounded = false;
    else {
      let support = false;
      for (const i of near) {
        const o = objs[i];
        if (o.kind !== 'solid') continue;
        if (p.x + BODY_W <= o.x || p.x - BODY_W >= o.x + o.w) continue;
        if (p.grav === -1 && Math.abs(p.y - BODY_H - (o.y + o.h)) < 0.02) support = true;
        if (p.grav === 1 && Math.abs(p.y + BODY_H - o.y) < 0.02) support = true;
      }
      p.grounded = support && (landed || wasGrounded || Math.abs(p.vy) < 0.01);
      if (wasGrounded && !p.grounded && p.vy * p.grav >= 0) p.coyote = COYOTE;
      if (!wasGrounded && p.grounded) {
        p.airTime = 0;
        this.events.push({ type: 'land' });
        // holding re-jumps on landing
        if (p.form === 'spark' && p.held) this.jump(SPARK_V0, 'jump');
      }
    }
    if (!p.grounded) p.airTime += dt;

    // ---------------------------------------------------------------- hazards and triggers
    const hx = p.x - HIT;
    const hy = p.y - HIT;
    for (const i of near) {
      const o = objs[i];
      switch (o.kind) {
        case 'thorn': {
          const b = thornBox(o);
          if (overlap(hx, hy, HIT * 2, HIT * 2, b.x, b.y, b.w, b.h)) return this.die('thorn');
          break;
        }
        case 'rotor': {
          const r = (o.r ?? o.w / 2) * 0.78;
          const cx = o.x + o.w / 2;
          const cy = o.y + o.h / 2;
          const nx = Math.max(hx, Math.min(cx, hx + HIT * 2));
          const ny = Math.max(hy, Math.min(cy, hy + HIT * 2));
          if ((nx - cx) ** 2 + (ny - cy) ** 2 < r * r) return this.die('rotor');
          break;
        }
        case 'laser': {
          if (o.on?.some(([a, b]) => p.t >= a && p.t < b) && overlap(hx, hy, HIT * 2, HIT * 2, o.x + 0.1, o.y + 0.1, o.w - 0.2, o.h - 0.2)) return this.die('laser');
          break;
        }
        case 'phase': {
          if (p.form !== 'blink' || p.phase <= 0) {
            if (overlap(hx, hy, HIT * 2, HIT * 2, o.x, o.y, o.w, o.h)) return this.die('phase');
          }
          break;
        }
        case 'node': {
          // pulse nodes are bounce pads in the air: flying through one launches you, no tap
          if (p.form === 'spark' && !p.grounded && !p.nodes.includes(i)) {
            const cx = o.x + o.w / 2;
            const cy = o.y + o.h / 2;
            if (Math.hypot(p.x - cx, p.y - cy) <= NODE_TOUCH) {
              p.nodes.push(i);
              // always lifts you to the same height above the node, however you arrive
              const climb = Math.max(0, (cy + NODE_RISE - p.y) * -p.grav);
              p.vy = -p.grav * Math.max(NODE_V, Math.sqrt(2 * SPARK_G * climb));
              p.grounded = false;
              p.coyote = 0;
              p.jumps++;
              this.events.push({ type: 'node' });
            }
          }
          break;
        }
        case 'shard': {
          const idx = o.idx ?? 0;
          if (!(p.shards & (1 << idx)) && Math.hypot(p.x - (o.x + o.w / 2), p.y - (o.y + o.h / 2)) < SHARD_R + HIT) {
            p.shards |= 1 << idx;
            this.events.push({ type: 'shard', idx });
          }
          break;
        }
        case 'boost': {
          if (p.form !== 'comet' && !p.passed.includes(i) && overlap(p.x - BODY_W, p.y - BODY_H - 0.05, BODY_W * 2, BODY_H * 2 + 0.1, o.x, o.y, o.w, o.h)) {
            p.passed.push(i);
            p.vy = -p.grav * BOOST_V;
            p.grounded = false;
            p.coyote = 0;
            this.events.push({ type: 'boost' });
          }
          break;
        }
        case 'crystal': {
          if (!p.passed.includes(i) && p.x >= o.x + o.w / 2) {
            p.passed.push(i);
            this.setForm(o.form ?? 'spark');
          }
          break;
        }
        case 'gate': {
          if (!p.passed.includes(i) && p.x >= o.x + o.w / 2) {
            p.passed.push(i);
            p.speed = o.speed ?? 1;
            this.events.push({ type: 'speed', speed: p.speed });
          }
          break;
        }
        default:
          break;
      }
    }

    if (p.y < -8 || p.y > 60) return this.die('fall');
    p.t += dt;
    if (p.x >= this.lvl.endX) {
      p.done = true;
      this.events.push({ type: 'done' });
    }
  }

  private jump(v: number, type: 'jump' | 'node') {
    const p = this.p;
    p.vy = -p.grav * v;
    p.grounded = false;
    p.coyote = 0;
    p.buffer = 0;
    p.jumps++;
    this.events.push({ type });
  }

  private setForm(form: Form) {
    const p = this.p;
    if (p.form === form) return;
    p.form = form;
    if (form !== 'flux') p.grav = -1;
    if (form === 'comet') p.vy = Math.max(-2, Math.min(2, p.vy));
    p.phase = 0;
    this.events.push({ type: 'form', form });
  }

  private die(cause: DeathCause) {
    this.p.dead = cause;
    this.events.push({ type: 'die', cause });
  }
}
