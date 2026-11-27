// The run: music clock, input timestamps, the fixed-step simulation, deaths, restarts, practice, camera, effects.
import type { InputEvent, Level } from '../engine/types';
import { Sim, TICK, clonePlayer, freshPlayer, type PlayerState } from '../engine/physics';
import { audio } from '../engine/audio';
import { Renderer } from './render';
import type { Skin, Trail } from './skins';
import { lighten } from './worlds';

export type Mode = 'normal' | 'practice' | 'demo' | 'endless';

export interface RunResult {
  done: boolean;
  progress: number; // 0..1 furthest point this attempt
  shards: number; // bitmask collected this attempt (normal mode only counts on a clear)
  attempts: number;
  beats: number; // endless: beats survived
}

export interface GameOptions {
  mode: Mode;
  skin: Skin;
  trail: Trail;
  reduced: boolean;
  shardsSaved: number;
  startAt?: number; // song time (debug)
  onAttemptEnd?: (r: RunResult) => void;
  onComplete?: (r: RunResult) => void;
  onPauseRequest?: () => void;
}

interface Checkpoint {
  p: PlayerState;
  x: number;
  y: number;
}

export class Game {
  sim: Sim;
  renderer: Renderer;
  private raf = 0;
  private last = 0;
  private buf: AudioBuffer | null = null;
  private queue: InputEvent[] = [];
  private paused = false;
  private stopped = false;
  private deadAt = 0;
  private doneAt = 0;
  private squash = 0;
  private camX = -4;
  private camY = -2.6;
  private demoClock = 0;
  private best = 0;
  private checkpoints: Checkpoint[] = [];
  private lastCheckpointT = -1;
  private botInputs: InputEvent[] = [];
  attempts = 1;
  private startT: number;
  private shardsRun = 0;

  constructor(
    public canvas: HTMLCanvasElement,
    public level: Level,
    public opt: GameOptions,
  ) {
    this.renderer = new Renderer(canvas);
    this.renderer.setLevel(level);
    this.startT = opt.startAt ?? level.start;
    this.sim = new Sim(level, this.startState());
    this.botInputs = opt.mode === 'demo' ? [...level.inputs] : [];
  }

  private startState(): PlayerState {
    const p = freshPlayer(this.level);
    if (this.startT > this.level.start) {
      // debug start mid-level: fast-forward the intended run silently
      const s = new Sim(this.level);
      const q = [...this.level.inputs];
      while (s.p.t < this.startT && !s.p.dead) {
        while (q.length && q[0].t <= s.p.t + 1e-9) {
          const e = q.shift()!;
          if (e.down) s.press();
          else s.release();
        }
        s.step();
      }
      return clonePlayer(s.p);
    }
    return p;
  }

  /** Load the music (if any) and start. */
  async start() {
    if (this.opt.mode !== 'demo') {
      this.buf = await audio.load(this.level.song);
      if (this.stopped) return;
      this.playMusic(this.sim.p.t);
    } else {
      this.demoClock = this.sim.p.t;
    }
    this.snapCamera();
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  destroy() {
    this.stopped = true;
    cancelAnimationFrame(this.raf);
    if (this.opt.mode !== 'demo') audio.stop();
  }

  private playMusic(at: number) {
    if (!this.buf) return;
    const song = this.level.song;
    if (this.opt.mode === 'endless') {
      const bar = (4 * 60) / song.bpm;
      const bars = Math.floor((song.duration - song.bar0 - 0.5) / bar);
      audio.play(this.buf, at, { start: song.bar0, end: song.bar0 + bars * bar });
    } else audio.play(this.buf, at);
  }

  /** Song time now, as the player hears it. */
  private now(): number {
    if (this.opt.mode === 'demo') return this.demoClock;
    return audio.time();
  }

  // ---------------------------------------------------------------- input
  press() {
    if (this.paused || this.opt.mode === 'demo') return;
    if (this.sim.p.dead || this.sim.p.done) return;
    this.queue.push({ t: Math.max(this.now(), this.sim.p.t), down: true });
  }
  release() {
    if (this.opt.mode === 'demo') return;
    this.queue.push({ t: Math.max(this.now(), this.sim.p.t), down: false });
  }

  pause() {
    if (this.paused || this.opt.mode === 'demo') return;
    this.paused = true;
    audio.pause();
    this.sim.release();
  }
  resume() {
    if (!this.paused) return;
    this.paused = false;
    this.queue = [];
    if (!this.sim.p.dead && !this.sim.p.done) this.playMusic(this.sim.p.t);
    this.last = performance.now();
  }
  get isPaused() {
    return this.paused;
  }

  setPractice(on: boolean) {
    this.opt.mode = on ? 'practice' : 'normal';
    this.checkpoints = [];
    this.lastCheckpointT = -1;
    this.restart(true);
  }

  restart(fromStart = false) {
    if (this.opt.mode === 'practice' && !fromStart && this.checkpoints.length) {
      const cp = this.checkpoints[this.checkpoints.length - 1];
      this.sim = new Sim(this.level, cp.p);
    } else {
      this.sim = new Sim(this.level, this.startState());
      this.checkpoints = [];
      this.lastCheckpointT = -1;
      this.shardsRun = 0;
    }
    if (this.opt.mode !== 'practice') this.attempts++;
    this.queue = [];
    this.deadAt = 0;
    this.doneAt = 0;
    this.faded = false;
    this.renderer.resetTrail();
    this.botInputs = this.opt.mode === 'demo' ? this.level.inputs.filter((e) => e.t >= this.sim.p.t) : [];
    if (this.opt.mode === 'demo') this.demoClock = this.sim.p.t;
    else this.playMusic(this.sim.p.t);
    this.snapCamera();
  }

  // ---------------------------------------------------------------- loop
  private frame = (ms: number) => {
    if (this.stopped) return;
    this.raf = requestAnimationFrame(this.frame);
    const dt = Math.min(0.1, (ms - this.last) / 1000);
    this.last = ms;
    if (this.paused) {
      this.draw(0);
      return;
    }
    const p = this.sim.p;
    if (this.opt.mode === 'demo') this.demoClock += dt;

    if (p.dead) {
      if (performance.now() - this.deadAt > (this.opt.mode === 'endless' ? 900 : 620)) {
        if (this.opt.mode === 'demo') {
          this.restart(true);
        } else {
          this.opt.onAttemptEnd?.(this.result(false));
          this.restart();
        }
      }
      this.draw(dt);
      return;
    }

    const target = this.now();
    let steps = 0;
    while (this.sim.p.t + TICK <= target + 1e-9 && steps < 480) {
      const q = this.opt.mode === 'demo' ? this.botInputs : this.queue;
      while (q.length && q[0].t <= this.sim.p.t + 1e-9) {
        const e = q.shift()!;
        if (e.down) this.sim.press();
        else this.sim.release();
      }
      this.sim.step();
      steps++;
      this.handleEvents();
      if (this.sim.p.dead || this.sim.p.done) break;
      this.maybeCheckpoint();
    }
    if (this.sim.p.done && !this.doneAt) this.finish();
    if (this.doneAt) {
      // keep running past the line
      this.sim.p.x += this.sim.p.speed * 10.4 * dt;
      if (performance.now() - this.doneAt > 1600 && this.opt.mode !== 'demo') {
        const r = this.result(true);
        this.opt.onComplete?.(r);
        this.doneAt = Infinity;
      }
      if (this.opt.mode === 'demo' && performance.now() - this.doneAt > 1200) this.restart(true);
    }
    // cut levels fade out at the finish
    if (this.level.fadeAt && this.sim.p.t >= this.level.fadeAt - 0.02 && !this.faded && this.opt.mode !== 'demo') {
      this.faded = true;
      audio.fadeOut((60 / this.level.song.bpm) * 4 * 2);
    }
    this.draw(dt);
  };
  private faded = false;

  private finish() {
    this.doneAt = performance.now();
    audio.sfx('clear');
    const r = this.renderer;
    r.addFlash(this.opt.reduced ? 0.2 : 0.7);
    for (let i = 0; i < 4; i++) r.burst(this.sim.p.x, this.sim.p.y, lighten(this.opt.skin.glow, i * 0.2), 30, 'shard', 14, -6);
  }

  private result(done: boolean): RunResult {
    const p = this.sim.p;
    const beat = 60 / this.level.song.bpm;
    return {
      done,
      progress: Math.max(this.best, Math.min(1, p.x / this.level.endX)),
      shards: this.shardsRun,
      attempts: this.attempts,
      beats: Math.max(0, Math.floor((p.t - this.level.song.bar0) / beat)),
    };
  }

  private maybeCheckpoint() {
    if (this.opt.mode !== 'practice') return;
    const p = this.sim.p;
    const bar = (4 * 60) / this.level.song.bpm;
    if (p.t - this.lastCheckpointT < bar * 2 || p.t < this.level.song.bar0) return;
    const safe = p.form === 'comet' ? Math.abs(p.vy) < 3 : p.grounded;
    if (!safe) return;
    this.lastCheckpointT = p.t;
    this.checkpoints.push({ p: clonePlayer(p), x: p.x, y: p.y + 1.1 * (p.grav === 1 ? -1 : 1) });
    audio.sfx('checkpoint');
  }

  private handleEvents() {
    const p = this.sim.p;
    const r = this.renderer;
    const sk = this.opt.skin;
    const feet = p.y - 0.45 * (p.grav === 1 ? -1 : 1);
    for (const e of this.sim.events) {
      switch (e.type) {
        case 'jump':
          this.squash = -0.3;
          r.burst(p.x - 0.2, feet, lighten(sk.glow, 0.3), 5, 'dot', 3, 0);
          audio.sfx('jump');
          break;
        case 'node':
          this.squash = -0.35;
          r.ring(p.x, p.y, sk.glow, 1.8);
          audio.sfx('node');
          break;
        case 'boost':
          this.squash = -0.4;
          r.burst(p.x, feet, lighten(sk.glow, 0.4), 14, 'spark', 7, -10);
          audio.sfx('boost');
          break;
        case 'land':
          this.squash = 0.3;
          r.burst(p.x, feet, lighten(sk.glow, 0.2), 4, 'dot', 2.5, 0);
          audio.sfx('land');
          break;
        case 'flip':
          r.ring(p.x, p.y, sk.glow, 1.4);
          audio.sfx('flip');
          break;
        case 'phase':
          r.ring(p.x, p.y, sk.glow, 1.2);
          audio.sfx('phase');
          break;
        case 'form':
          r.burst(p.x, p.y, lighten(sk.glow, 0.5), 26, 'shard', 10, -4);
          r.addFlash(this.opt.reduced ? 0.1 : 0.3);
          audio.sfx('form');
          break;
        case 'speed':
          r.ring(p.x, p.y, sk.glow, 2.2);
          audio.sfx('speed');
          break;
        case 'shard':
          this.shardsRun |= 1 << e.idx;
          r.burst(p.x, p.y, [255, 214, 90], 24, 'spark', 8, -6);
          r.ring(p.x, p.y, [255, 214, 90], 2);
          audio.sfx('shard');
          break;
        case 'die':
          this.deadAt = performance.now();
          this.best = Math.max(this.best, Math.min(1, p.x / this.level.endX));
          r.burst(p.x, p.y, sk.body, 36, 'shard', 12, -18);
          r.burst(p.x, p.y, lighten(sk.glow, 0.5), 18, 'spark', 8, -6);
          r.ring(p.x, p.y, sk.glow, 2.4);
          r.addShake(this.opt.reduced ? 0.4 : 1);
          if (this.opt.mode !== 'demo') {
            audio.stop();
            audio.sfx('die');
          }
          break;
        default:
          break;
      }
    }
  }

  private snapCamera() {
    const vh = this.renderer.viewHeight();
    const vw = (this.renderer.W / this.renderer.H) * vh;
    this.camX = this.sim.p.x - vw * 0.3;
    this.camY = Math.min(this.sim.p.y - 3.2, this.sim.p.y - vh * 0.3);
  }

  private updateCamera(dt: number) {
    const p = this.sim.p;
    const vh = this.renderer.viewHeight();
    const vw = (this.renderer.W / this.renderer.H) * vh;
    this.camX = p.x - vw * 0.3;
    // dead-zone vertical follow
    const lo = this.camY + 2.4;
    const hi = this.camY + vh - 3.2;
    let target = this.camY;
    if (p.y < lo) target = p.y - 2.4;
    else if (p.y > hi) target = p.y - vh + 3.2;
    this.camY += (target - this.camY) * (1 - Math.exp(-dt * 6));
  }

  private draw(dt: number) {
    const p = this.sim.p;
    if (!p.dead && !this.paused) this.updateCamera(dt);
    this.squash *= Math.exp(-dt * 12);
    this.renderer.draw(
      {
        level: this.level,
        x: p.x,
        y: p.y,
        vy: p.vy,
        form: p.form,
        grav: p.grav,
        phase: p.phase,
        speed: p.speed,
        t: p.dead ? p.t : Math.max(p.t, this.now() - 0.05),
        dead: !!p.dead,
        deathAge: p.dead ? (performance.now() - this.deadAt) / 1000 : 0,
        done: p.done,
        nodesUsed: p.nodes,
        shardsRun: this.shardsRun,
        shardsSaved: this.opt.shardsSaved,
        attempt: this.attempts,
        practice: this.opt.mode === 'practice',
        checkpoints: this.checkpoints.map((c) => ({ x: c.x, y: c.y })),
        skin: this.opt.skin,
        trail: this.opt.trail,
        camX: this.camX,
        camY: this.camY,
        squash: this.squash,
        reduced: this.opt.reduced,
        progress: Math.min(1, Math.max(0, p.x / this.level.endX)),
        showHud: this.opt.mode !== 'demo',
        demo: this.opt.mode === 'demo',
      },
      dt,
    );
  }
}
