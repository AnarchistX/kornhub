// Canvas renderer: world backdrop, terrain, objects, the runner, particles, beat effects, HUD bits.
import type { Form, Level, Obj } from '../engine/types';
import { BASE_SPEED } from '../engine/physics';
import { lighten, mix, mixPalette, rgb, worldFor, type Frame, type Palette, type RGB, type View, type World } from './worlds';
import type { Skin, Trail } from './skins';

export interface DrawState {
  level: Level;
  x: number;
  y: number;
  vy: number;
  form: Form;
  grav: -1 | 1;
  phase: number;
  speed: number;
  t: number;
  dead: boolean;
  deathAge: number;
  done: boolean;
  nodesUsed: number[];
  shardsRun: number; // collected this attempt
  shardsSaved: number; // collected before
  attempt: number;
  practice: boolean;
  checkpoints: { x: number; y: number }[];
  skin: Skin;
  trail: Trail;
  camX: number;
  camY: number;
  squash: number; // >0 squashed (landing), <0 stretched (take-off)
  reduced: boolean;
  progress: number; // 0..1
  showHud: boolean;
  demo?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: RGB;
  kind: 'dot' | 'shard' | 'ring' | 'note' | 'square' | 'spark';
  rot: number;
  vr: number;
  g: number;
}

const TAU = Math.PI * 2;

export class Renderer {
  c: CanvasRenderingContext2D;
  dpr = 1;
  W = 0;
  H = 0;
  view: View = { camX: 0, camY: 0, w: 0, h: 0, ppt: 48, W: 0, H: 0 };
  parts: Particle[] = [];
  trailPts: { x: number; y: number; t: number }[] = [];
  private sprites = new Map<string, HTMLCanvasElement>();
  private world: World = worldFor('deep');
  private palFrom: Palette | null = null;
  private palTo: Palette | null = null;
  private palT = 0;
  private lastSection = -1;
  private shake = 0;
  private flash = 0;
  private ambientT = 0;
  private objIndex = new Map<Obj, number>();
  private loopBars = 0;

  constructor(public canvas: HTMLCanvasElement) {
    this.c = canvas.getContext('2d', { alpha: false })!;
    this.resize();
  }

  resize() {
    const r = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.W = Math.max(1, Math.round(r.width * this.dpr));
    this.H = Math.max(1, Math.round(r.height * this.dpr));
    this.canvas.width = this.W;
    this.canvas.height = this.H;
  }

  setLevel(level: Level) {
    this.world = worldFor(level.world);
    this.objIndex = new Map(level.objs.map((o, i) => [o, i]));
    // endless runs loop whole bars of the song; the energy map loops with them
    const bar = (4 * 60) / level.song.bpm;
    this.loopBars = level.id.startsWith('endless') ? Math.max(1, Math.floor((level.song.duration - level.song.bar0 - 0.5) / bar)) : 0;
    this.palFrom = this.palTo = this.world.palettes[level.sections[0]?.palette ?? 0] ?? this.world.palettes[0];
    this.lastSection = 0;
    this.parts = [];
    this.trailPts = [];
  }

  /** Tiles visible vertically: a little more on tall screens, a little less on phones. */
  viewHeight() {
    const aspect = this.W / this.H;
    return aspect < 1.3 ? 13 : aspect > 2 ? 9.6 : 10.6;
  }

  // ---------------------------------------------------------------- effects API (called by the game)
  burst(x: number, y: number, color: RGB, n: number, kind: Particle['kind'] = 'shard', speed = 9, g = -20) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU;
      const s = speed * (0.35 + Math.random() * 0.9);
      this.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0, max: 0.5 + Math.random() * 0.6, size: 0.12 + Math.random() * 0.22, color, kind, rot: Math.random() * TAU, vr: (Math.random() - 0.5) * 20, g });
    }
    if (this.parts.length > 900) this.parts.splice(0, this.parts.length - 900);
  }
  ring(x: number, y: number, color: RGB, size = 1.6) {
    this.parts.push({ x, y, vx: 0, vy: 0, life: 0, max: 0.4, size, color, kind: 'ring', rot: 0, vr: 0, g: 0 });
  }
  addShake(a: number) {
    this.shake = Math.max(this.shake, a);
  }
  addFlash(a: number) {
    this.flash = Math.max(this.flash, a);
  }
  resetTrail() {
    this.trailPts = [];
  }

  // ---------------------------------------------------------------- frame
  draw(s: DrawState, dt: number) {
    const { c } = this;
    const lvl = s.level;
    const song = lvl.song;
    const beat = 60 / song.bpm;
    const bp = (s.t - song.bar0) / beat;
    const pulse = s.t >= song.bar0 - 0.05 ? Math.exp(-(bp - Math.floor(bp)) * 6.5) : 0;
    let barI = Math.max(0, Math.floor(bp / 4));
    if (this.loopBars) barI %= this.loopBars;
    const db = song.barDb[Math.min(song.barDb.length - 1, barI)] ?? -30;
    const energy = Math.max(0, Math.min(1, (db + 30) / 18));
    let drop = 0;
    for (const d of lvl.drops) if (s.t >= d) drop = Math.exp(-(s.t - d) * 2.5);

    // palette by section
    let si = 0;
    for (let i = 0; i < lvl.sections.length; i++) if (s.t >= lvl.sections[i].t - 0.02) si = i;
    if (si !== this.lastSection) {
      this.palFrom = this.currentPalette();
      this.palTo = this.world.palettes[lvl.sections[si].palette % this.world.palettes.length];
      this.palT = 0;
      this.lastSection = si;
      if (lvl.drops.some((d) => Math.abs(d - lvl.sections[si].t) < 0.05)) this.addFlash(s.reduced ? 0.15 : 0.55);
    }
    this.palT = Math.min(1, this.palT + dt / (beat * 1.5));
    const pal = this.currentPalette();
    const frame: Frame = { t: s.t, pulse, bar: (bp / 4) % 1, energy, drop, reduced: s.reduced };

    // view: zoom bumps on the beat
    const vh = this.viewHeight() * (1 - (s.reduced ? 0 : pulse * 0.012 * (0.5 + energy)));
    const ppt = this.H / vh;
    const shakeX = this.shake ? (Math.random() - 0.5) * this.shake * ppt * 0.35 : 0;
    const shakeY = this.shake ? (Math.random() - 0.5) * this.shake * ppt * 0.35 : 0;
    this.shake = Math.max(0, this.shake - dt * 3);
    const v: View = { camX: s.camX, camY: s.camY, w: this.W / ppt, h: vh, ppt, W: this.W, H: this.H };
    this.view = v;

    c.setTransform(1, 0, 0, 1, 0, 0);
    this.world.back(c, v, pal, frame);
    this.ambient(v, pal, frame, s.speed);

    c.save();
    c.translate(shakeX, shakeY);
    const X = (x: number) => (x - v.camX) * ppt;
    const Y = (y: number) => this.H - (y - v.camY) * ppt;

    // ---------------------------------------------------------------- terrain
    const x0 = v.camX - 2;
    const x1 = v.camX + v.w + 2;
    const solids: Obj[] = [];
    const others: Obj[] = [];
    for (const o of lvl.objs) {
      if (o.x > x1) break;
      if (o.x + o.w < x0) continue;
      (o.kind === 'solid' ? solids : others).push(o);
    }
    this.drawSolids(solids, v, pal, frame, X, Y);

    // ---------------------------------------------------------------- objects
    for (const o of others) this.drawObj(o, s, v, pal, frame, X, Y);

    // practice checkpoints
    for (const cp of s.checkpoints) {
      const cx = X(cp.x);
      const cy = Y(cp.y);
      this.glow(cx, cy, ppt * 1.4, [80, 255, 140], 0.5);
      c.fillStyle = 'rgba(120,255,170,0.95)';
      c.beginPath();
      c.moveTo(cx, cy - ppt * 0.45);
      c.lineTo(cx + ppt * 0.3, cy);
      c.lineTo(cx, cy + ppt * 0.45);
      c.lineTo(cx - ppt * 0.3, cy);
      c.fill();
    }

    // attempt text floats at the start of the run
    if (!s.demo && s.showHud) {
      const ax = X(4.5);
      if (ax > -this.W * 0.5) {
        c.font = `${Math.round(ppt * 0.9)}px Bungee, sans-serif`;
        c.textAlign = 'left';
        c.textBaseline = 'middle';
        c.fillStyle = rgb(lighten(pal.groundEdge, 0.5), 0.92);
        c.fillText(s.practice ? `PRACTICE` : `ATTEMPT ${s.attempt}`, ax, Y(5.4));
      }
    }

    // ---------------------------------------------------------------- runner
    if (!s.dead) {
      this.drawTrail(s, v, X, Y, dt);
      this.drawRunner(s, v, X, Y, pulse);
    } else this.trailPts = [];

    // ---------------------------------------------------------------- particles
    this.drawParticles(v, X, Y, dt);
    c.restore();

    // ---------------------------------------------------------------- overlays
    if (s.speed >= 1.24 && !s.dead) this.speedLines(v, pal, s.speed);
    const vg = c.createRadialGradient(this.W / 2, this.H / 2, this.H * 0.35, this.W / 2, this.H / 2, this.W * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, `rgba(0,0,0,${0.45 - pulse * 0.1})`);
    c.fillStyle = vg;
    c.fillRect(0, 0, this.W, this.H);
    if (this.flash > 0) {
      c.fillStyle = rgb(lighten(pal.glow, 0.6), this.flash * (s.reduced ? 0.25 : 0.6));
      c.fillRect(0, 0, this.W, this.H);
      this.flash = Math.max(0, this.flash - dt * 2.2);
    }
    if (s.showHud && !s.demo) this.hud(s, pal);
  }

  private currentPalette(): Palette {
    if (!this.palFrom || !this.palTo) return this.world.palettes[0];
    const k = this.palT * this.palT * (3 - 2 * this.palT);
    return mixPalette(this.palFrom, this.palTo, k);
  }

  // ---------------------------------------------------------------- pieces
  private glow(x: number, y: number, r: number, color: RGB, a: number) {
    const key = `${color[0] | 0},${color[1] | 0},${color[2] | 0}`;
    let sp = this.sprites.get(key);
    if (!sp) {
      sp = document.createElement('canvas');
      sp.width = sp.height = 64;
      const g = sp.getContext('2d')!;
      const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, `rgba(${key},1)`);
      gr.addColorStop(0.35, `rgba(${key},0.35)`);
      gr.addColorStop(1, `rgba(${key},0)`);
      g.fillStyle = gr;
      g.fillRect(0, 0, 64, 64);
      if (this.sprites.size > 64) this.sprites.clear();
      this.sprites.set(key, sp);
    }
    const c = this.c;
    c.globalAlpha = Math.max(0, Math.min(1, a));
    c.globalCompositeOperation = 'lighter';
    c.drawImage(sp, x - r, y - r, r * 2, r * 2);
    c.globalCompositeOperation = 'source-over';
    c.globalAlpha = 1;
  }

  private drawSolids(solids: Obj[], v: View, pal: Palette, f: Frame, X: (x: number) => number, Y: (y: number) => number) {
    const c = this.c;
    const ppt = v.ppt;
    const style = this.world.groundStyle;
    const edge = lighten(pal.groundEdge, f.pulse * 0.25);
    for (const o of solids) {
      const sx = X(o.x);
      const sy = Y(o.y + o.h);
      const w = o.w * ppt;
      const h = o.h * ppt;
      const g = c.createLinearGradient(0, sy, 0, sy + Math.min(h, ppt * 6));
      g.addColorStop(0, rgb(mix(pal.ground, pal.groundEdge, 0.18)));
      g.addColorStop(1, rgb(pal.ground));
      c.fillStyle = g;
      c.fillRect(sx, sy, w, h);
      // inner pattern
      c.save();
      c.beginPath();
      c.rect(sx, sy, w, h);
      c.clip();
      c.strokeStyle = rgb(pal.groundEdge, 0.16);
      c.fillStyle = rgb(pal.groundEdge, 0.14);
      c.lineWidth = Math.max(1, ppt / 24);
      const top = o.y + o.h;
      const ys = Math.max(o.y, v.camY - 1);
      const ye = Math.min(top, v.camY + v.h + 1);
      const xs = Math.max(o.x, v.camX - 1);
      const xe = Math.min(o.x + o.w, v.camX + v.w + 1);
      switch (style) {
        case 'grid':
        case 'circuit':
        case 'prism':
          for (let gx = Math.floor(xs); gx <= xe; gx++) {
            c.beginPath();
            c.moveTo(X(gx), Y(ys));
            c.lineTo(X(gx), Y(ye));
            c.stroke();
          }
          for (let gy = Math.floor(ys); gy <= ye; gy++) {
            c.beginPath();
            c.moveTo(X(xs), Y(gy));
            c.lineTo(X(xe), Y(gy));
            c.stroke();
          }
          if (style === 'circuit')
            for (let gx = Math.floor(xs); gx <= xe; gx += 2) {
              const gy = top - 1 - ((gx * 7) % 3);
              this.glow(X(gx + 0.5), Y(gy), ppt * 0.35, pal.groundEdge, 0.35 + f.pulse * 0.4);
            }
          break;
        case 'coral':
        case 'crystal':
        case 'glass':
          for (let gx = Math.floor(xs); gx <= xe; gx++) {
            for (let gy = Math.floor(ys); gy <= ye; gy++) {
              if (((gx * 13 + gy * 7) & 3) !== 0) continue;
              c.beginPath();
              c.arc(X(gx + 0.5), Y(gy + 0.5), ppt * (style === 'coral' ? 0.12 : 0.08), 0, TAU);
              c.fill();
            }
          }
          break;
        case 'road':
        case 'chevron':
          for (let gx = Math.floor(xs / 2) * 2; gx <= xe; gx += 2) {
            c.fillRect(X(gx), Y(top - 0.55), ppt * 1.1, ppt * 0.12);
            if (style === 'chevron' && o.h < 25) {
              c.beginPath();
              c.moveTo(X(gx), Y(top - 1));
              c.lineTo(X(gx + 0.6), Y(top - 1.5));
              c.lineTo(X(gx), Y(top - 2));
              c.stroke();
            }
          }
          break;
        case 'velvet':
        case 'silk':
          for (let gy = Math.floor(ys); gy <= ye; gy++) {
            c.beginPath();
            for (let gx = xs; gx <= xe; gx += 0.5) {
              const yy = gy + Math.sin(gx * 0.9 + gy) * 0.18;
              if (gx === xs) c.moveTo(X(gx), Y(yy));
              else c.lineTo(X(gx), Y(yy));
            }
            c.stroke();
          }
          break;
      }
      c.restore();
      // edges: a bright rim with glow
      c.strokeStyle = rgb(edge);
      c.lineWidth = Math.max(2, ppt * 0.08);
      c.strokeRect(sx, sy, w, h);
      if (top < v.camY + v.h + 1 && top > v.camY - 1) {
        this.c.save();
        this.c.globalCompositeOperation = 'lighter';
        const gg = c.createLinearGradient(0, sy - ppt * 0.6, 0, sy + ppt * 0.1);
        gg.addColorStop(0, rgb(edge, 0));
        gg.addColorStop(1, rgb(edge, 0.25 + f.pulse * 0.25));
        c.fillStyle = gg;
        c.fillRect(sx, sy - ppt * 0.6, w, ppt * 0.7);
        this.c.restore();
      }
      if (o.y > v.camY - 1 && o.y < v.camY + v.h + 1 && o.h < 40) {
        // ceiling underside
        this.c.save();
        this.c.globalCompositeOperation = 'lighter';
        const by = Y(o.y);
        const gg = c.createLinearGradient(0, by - ppt * 0.1, 0, by + ppt * 0.6);
        gg.addColorStop(0, rgb(edge, 0.22 + f.pulse * 0.2));
        gg.addColorStop(1, rgb(edge, 0));
        c.fillStyle = gg;
        c.fillRect(sx, by - ppt * 0.1, w, ppt * 0.7);
        this.c.restore();
      }
    }
  }

  private drawObj(o: Obj, s: DrawState, v: View, pal: Palette, f: Frame, X: (x: number) => number, Y: (y: number) => number) {
    const c = this.c;
    const ppt = v.ppt;
    const cx = X(o.x + o.w / 2);
    const cy = Y(o.y + o.h / 2);
    switch (o.kind) {
      case 'thorn': {
        const up = o.dir !== -1;
        const base = up ? Y(o.y) : Y(o.y + o.h);
        const tip = up ? Y(o.y + o.h * (0.92 + f.pulse * 0.06)) : Y(o.y + o.h * (0.08 - f.pulse * 0.06));
        const l = X(o.x + 0.08);
        const r = X(o.x + o.w - 0.08);
        const m = X(o.x + o.w / 2);
        this.glow(m, (base + tip) / 2, ppt * 0.9, pal.thorn, 0.35 + f.pulse * 0.25);
        const g = c.createLinearGradient(0, base, 0, tip);
        g.addColorStop(0, rgb(mix(pal.thorn, [0, 0, 0], 0.35)));
        g.addColorStop(1, rgb(lighten(pal.thorn, 0.35)));
        c.fillStyle = g;
        c.beginPath();
        c.moveTo(l, base);
        c.lineTo(m, tip);
        c.lineTo(r, base);
        c.closePath();
        c.fill();
        // facet
        c.fillStyle = rgb(lighten(pal.thorn, 0.65), 0.55);
        c.beginPath();
        c.moveTo(m, tip);
        c.lineTo(m + (r - m) * 0.4, base);
        c.lineTo(m, base);
        c.closePath();
        c.fill();
        break;
      }
      case 'node': {
        const used = s.nodesUsed.includes(this.objIndex.get(o) ?? -1);
        const r = ppt * 0.5 * (1 + (used ? 0 : f.pulse * 0.15));
        const col = o.style === 1 ? lighten(pal.accent, 0.2) : pal.accent;
        this.glow(cx, cy, r * 3, col, used ? 0.15 : 0.6);
        c.strokeStyle = rgb(col, used ? 0.3 : 1);
        c.lineWidth = Math.max(2, ppt * 0.1);
        c.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * TAU + s.t * 1.5;
          const px = cx + Math.cos(a) * r;
          const py = cy + Math.sin(a) * r;
          if (k === 0) c.moveTo(px, py);
          else c.lineTo(px, py);
        }
        c.closePath();
        c.stroke();
        c.fillStyle = rgb(lighten(col, 0.5), used ? 0.2 : 0.9);
        c.beginPath();
        c.arc(cx, cy, r * 0.35, 0, TAU);
        c.fill();
        break;
      }
      case 'boost': {
        const x = X(o.x);
        const y = Y(o.y);
        const w = o.w * ppt;
        this.glow(cx, y - ppt * 0.3, ppt * 1.4, pal.accent, 0.55 + f.pulse * 0.3);
        c.fillStyle = rgb(pal.accent);
        c.fillRect(x, y - ppt * 0.22, w, ppt * 0.22);
        c.fillStyle = rgb(lighten(pal.accent, 0.6));
        for (let k = 0; k < 2; k++) {
          const yy = y - ppt * (0.45 + k * 0.35) - ((s.t * 3) % 1) * ppt * 0.2;
          c.beginPath();
          c.moveTo(x + w * 0.2, yy);
          c.lineTo(x + w * 0.5, yy - ppt * 0.25);
          c.lineTo(x + w * 0.8, yy);
          c.lineTo(x + w * 0.8, yy + ppt * 0.1);
          c.lineTo(x + w * 0.5, yy - ppt * 0.15);
          c.lineTo(x + w * 0.2, yy + ppt * 0.1);
          c.fill();
        }
        break;
      }
      case 'crystal': {
        const h = o.h * ppt;
        const w = ppt * 0.8;
        this.glow(cx, cy, ppt * 2.4, pal.accent2, 0.6 + f.pulse * 0.3);
        const g = c.createLinearGradient(cx - w, 0, cx + w, 0);
        g.addColorStop(0, rgb(pal.accent2, 0.5));
        g.addColorStop(0.5, rgb(lighten(pal.accent2, 0.7), 0.95));
        g.addColorStop(1, rgb(pal.accent2, 0.5));
        c.fillStyle = g;
        c.beginPath();
        c.moveTo(cx, cy - h / 2);
        c.lineTo(cx + w, cy);
        c.lineTo(cx, cy + h / 2);
        c.lineTo(cx - w, cy);
        c.closePath();
        c.fill();
        c.strokeStyle = rgb(lighten(pal.accent2, 0.8));
        c.lineWidth = Math.max(1.5, ppt * 0.05);
        c.stroke();
        // the form it grants
        c.save();
        c.translate(cx, cy);
        c.scale(ppt * 0.32, ppt * 0.32);
        c.fillStyle = rgb(pal.ground);
        formGlyph(c, o.form ?? 'spark');
        c.restore();
        break;
      }
      case 'gate': {
        const n = o.speed && o.speed >= 1.5 ? 4 : o.speed && o.speed >= 1.24 ? 3 : o.speed && o.speed >= 1 ? 2 : 1;
        const top = Y(o.y + o.h);
        const bot = Y(o.y);
        this.glow(cx, (top + bot) / 2, ppt * 2.2, pal.accent2, 0.35);
        c.strokeStyle = rgb(lighten(pal.accent2, 0.4));
        c.lineWidth = Math.max(2, ppt * 0.12);
        for (let k = 0; k < n; k++) {
          const xx = cx + (k - (n - 1) / 2) * ppt * 0.45;
          c.beginPath();
          c.moveTo(xx - ppt * 0.25, top + ppt * 0.5);
          c.lineTo(xx + ppt * 0.15, (top + bot) / 2);
          c.lineTo(xx - ppt * 0.25, bot - ppt * 0.5);
          c.stroke();
        }
        break;
      }
      case 'laser': {
        const on = o.on?.some(([a, b]) => s.t >= a && s.t < b);
        const soon = o.on?.some(([a]) => s.t >= a - 0.22 && s.t < a);
        const top = Y(o.y + o.h);
        const bot = Y(o.y);
        c.fillStyle = rgb(pal.ground);
        c.fillRect(cx - ppt * 0.3, bot - ppt * 0.3, ppt * 0.6, ppt * 0.3);
        c.fillRect(cx - ppt * 0.3, top, ppt * 0.6, ppt * 0.3);
        c.fillStyle = rgb(pal.accent2, on ? 1 : soon ? 0.8 : 0.35);
        c.fillRect(cx - ppt * 0.2, bot - ppt * 0.2, ppt * 0.4, ppt * 0.12);
        c.fillRect(cx - ppt * 0.2, top + ppt * 0.08, ppt * 0.4, ppt * 0.12);
        if (on) {
          for (let k = 0; k < 3; k++) this.glow(cx, top + ((bot - top) * (k + 0.5)) / 3, ppt * 1.6, pal.accent2, 0.5);
          c.fillStyle = rgb(lighten(pal.accent2, 0.8));
          c.fillRect(cx - ppt * 0.08, top, ppt * 0.16, bot - top);
        } else if (soon) {
          c.strokeStyle = rgb(pal.accent2, 0.6);
          c.setLineDash([ppt * 0.2, ppt * 0.2]);
          c.lineWidth = Math.max(1, ppt * 0.04);
          c.beginPath();
          c.moveTo(cx, top);
          c.lineTo(cx, bot);
          c.stroke();
          c.setLineDash([]);
        }
        break;
      }
      case 'rotor': {
        const r = (o.r ?? 0.9) * ppt;
        this.glow(cx, cy, r * 2, pal.thorn, 0.4);
        c.save();
        c.translate(cx, cy);
        c.rotate(-s.t * 9);
        c.fillStyle = rgb(lighten(pal.thorn, 0.15));
        c.beginPath();
        const teeth = 10;
        for (let k = 0; k < teeth * 2; k++) {
          const a = (k / (teeth * 2)) * TAU;
          const rr = k % 2 ? r : r * 0.72;
          c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
        }
        c.closePath();
        c.fill();
        c.fillStyle = rgb(pal.ground);
        c.beginPath();
        c.arc(0, 0, r * 0.28, 0, TAU);
        c.fill();
        c.restore();
        break;
      }
      case 'phase': {
        const top = Y(o.y + o.h);
        const bot = Y(o.y);
        const x = X(o.x);
        const w = Math.max(3, o.w * ppt);
        const soon = o.beat !== undefined && Math.abs(s.t - o.beat) < 0.35;
        this.glow(cx, (top + bot) / 2, ppt * 1.8, pal.accent2, soon ? 0.7 : 0.35);
        for (let k = 0; k < 6; k++) {
          const yy = top + (((k / 6 + s.t * 0.8) % 1) * (bot - top));
          c.fillStyle = rgb(lighten(pal.accent2, 0.5), 0.8);
          c.fillRect(x - w * 0.6, yy, w * 2.2, ppt * 0.12);
        }
        c.fillStyle = rgb(pal.accent2, 0.55);
        c.fillRect(x, top, w, bot - top);
        break;
      }
      case 'shard': {
        const idx = o.idx ?? 0;
        const got = (s.shardsRun & (1 << idx)) !== 0;
        if (got) break;
        const before = (s.shardsSaved & (1 << idx)) !== 0;
        const bob = Math.sin(s.t * 3 + idx) * ppt * 0.1;
        const col: RGB = before ? [200, 200, 220] : [255, 214, 90];
        this.glow(cx, cy + bob, ppt * 1.6, col, before ? 0.25 : 0.7);
        c.save();
        c.translate(cx, cy + bob);
        c.scale(Math.cos(s.t * 2.5), 1);
        c.fillStyle = rgb(col, before ? 0.5 : 1);
        c.beginPath();
        c.moveTo(0, -ppt * 0.45);
        c.lineTo(ppt * 0.3, 0);
        c.lineTo(0, ppt * 0.45);
        c.lineTo(-ppt * 0.3, 0);
        c.closePath();
        c.fill();
        c.fillStyle = 'rgba(255,255,255,0.8)';
        c.beginPath();
        c.moveTo(0, -ppt * 0.45);
        c.lineTo(ppt * 0.12, -ppt * 0.05);
        c.lineTo(0, 0);
        c.fill();
        c.restore();
        break;
      }
      case 'finish': {
        const top = Y(o.y + o.h);
        const bot = Y(o.y);
        for (let k = 0; k < 5; k++) this.glow(cx, top + ((bot - top) * (k + 0.5)) / 5, ppt * 2.4, pal.glow, 0.5);
        const g = c.createLinearGradient(cx - ppt, 0, cx + ppt, 0);
        g.addColorStop(0, rgb(pal.glow, 0));
        g.addColorStop(0.5, rgb(lighten(pal.glow, 0.7), 0.85));
        g.addColorStop(1, rgb(pal.glow, 0));
        c.fillStyle = g;
        c.fillRect(cx - ppt, top, ppt * 2, bot - top);
        break;
      }
      default:
        break;
    }
  }

  private drawTrail(s: DrawState, v: View, X: (x: number) => number, Y: (y: number) => number, dt: number) {
    const c = this.c;
    const pts = this.trailPts;
    pts.push({ x: s.x, y: s.y, t: s.t });
    while (pts.length && s.t - pts[0].t > 0.32) pts.shift();
    if (pts.length > 1 && pts[pts.length - 2].x > s.x + 1) pts.splice(0, pts.length - 1); // restarted
    const sk = s.skin;
    const kind = s.trail.kind;
    if (kind === 'ribbon' || kind === 'rainbow' || kind === 'flame') {
      c.save();
      c.globalCompositeOperation = 'lighter';
      c.lineCap = 'round';
      for (let i = 1; i < pts.length; i++) {
        const k = i / pts.length;
        const col: RGB = kind === 'rainbow' ? hsl((s.t * 120 + i * 9) % 360) : kind === 'flame' ? mix([255, 60, 20], [255, 220, 90], k) : sk.glow;
        c.strokeStyle = rgb(col, k * 0.7);
        c.lineWidth = v.ppt * (kind === 'flame' ? 0.75 : 0.55) * k;
        c.beginPath();
        c.moveTo(X(pts[i - 1].x), Y(pts[i - 1].y));
        c.lineTo(X(pts[i].x), Y(pts[i].y));
        c.stroke();
      }
      c.restore();
    }
    // emitters
    this.ambientT += dt;
    if (kind === 'sparks' && Math.random() < 0.6) this.parts.push({ x: s.x - 0.3, y: s.y + (Math.random() - 0.5) * 0.5, vx: -2 - Math.random() * 3, vy: (Math.random() - 0.5) * 3, life: 0, max: 0.35, size: 0.08, color: sk.glow, kind: 'spark', rot: 0, vr: 0, g: 0 });
    if (kind === 'pixels' && Math.random() < 0.5) this.parts.push({ x: s.x - 0.4, y: s.y + (Math.random() - 0.5) * 0.6, vx: -1, vy: 0, life: 0, max: 0.4, size: 0.14, color: sk.glow, kind: 'square', rot: 0, vr: 0, g: 0 });
    if (kind === 'notes' && Math.random() < 0.08) this.parts.push({ x: s.x - 0.3, y: s.y + 0.2, vx: -1.5, vy: 1.5, life: 0, max: 0.8, size: 0.35, color: sk.glow, kind: 'note', rot: 0, vr: 0, g: 0 });
  }

  private drawRunner(s: DrawState, v: View, X: (x: number) => number, Y: (y: number) => number, pulse: number) {
    const c = this.c;
    const ppt = v.ppt;
    const sk = s.skin;
    const px = X(s.x);
    const py = Y(s.y);
    const r = ppt * 0.48;
    this.glow(px, py, r * 3.2, sk.glow, 0.45 + pulse * 0.25);
    c.save();
    c.translate(px, py);
    const flip = s.grav === 1 ? -1 : 1;
    switch (s.form) {
      case 'spark': {
        const sq = Math.max(-0.35, Math.min(0.35, s.squash));
        const tilt = Math.max(-0.4, Math.min(0.4, -s.vy * 0.02));
        c.rotate(tilt);
        c.scale(1 + sq * 0.5, (1 - sq) * flip);
        c.translate(0, sq * r * 0.4);
        // antenna
        const wob = Math.sin(s.t * 18) * 0.15 + s.vy * 0.015;
        c.strokeStyle = rgb(sk.rim);
        c.lineWidth = Math.max(1.5, ppt * 0.06);
        c.beginPath();
        c.moveTo(-r * 0.1, -r * 0.85);
        c.quadraticCurveTo(-r * 0.2 - wob * r, -r * 1.25, -r * 0.45 - wob * r * 1.4, -r * 1.45);
        c.stroke();
        this.glow(-r * 0.45 - wob * r * 1.4, -r * 1.45, r * 0.55, sk.glow, 0.9);
        c.fillStyle = rgb(lighten(sk.glow, 0.5));
        c.beginPath();
        c.arc(-r * 0.45 - wob * r * 1.4, -r * 1.45, r * 0.13, 0, TAU);
        c.fill();
        body(c, r, sk);
        eyes(c, r, s, 0.2);
        break;
      }
      case 'flux': {
        c.scale(1, flip);
        c.rotate(s.t * (s.vy !== 0 ? 9 : 2) * 0.3);
        c.fillStyle = rgb(sk.body);
        c.strokeStyle = rgb(sk.rim);
        c.lineWidth = Math.max(2, ppt * 0.07);
        c.beginPath();
        for (let k = 0; k < 3; k++) {
          const a = (k / 3) * TAU - Math.PI / 2;
          c.lineTo(Math.cos(a) * r * 1.15, Math.sin(a) * r * 1.15);
        }
        c.closePath();
        c.fill();
        c.stroke();
        c.rotate(-s.t * (s.vy !== 0 ? 9 : 2) * 0.3);
        eyes(c, r * 0.85, s, 0.1);
        break;
      }
      case 'comet': {
        const ang = Math.atan2(s.vy, s.speed * BASE_SPEED);
        c.rotate(-ang);
        // flame tail
        c.save();
        c.globalCompositeOperation = 'lighter';
        for (let k = 0; k < 4; k++) {
          const len = r * (2.2 + Math.random() * 0.8 - k * 0.4);
          c.fillStyle = rgb(mix(sk.glow, [255, 255, 255], k * 0.2), 0.35);
          c.beginPath();
          c.moveTo(-r * 0.4, -r * (0.45 - k * 0.1));
          c.lineTo(-r * 0.4 - len, 0);
          c.lineTo(-r * 0.4, r * (0.45 - k * 0.1));
          c.fill();
        }
        c.restore();
        c.fillStyle = rgb(sk.body);
        c.strokeStyle = rgb(sk.rim);
        c.lineWidth = Math.max(2, ppt * 0.07);
        c.beginPath();
        c.moveTo(r * 1.15, 0);
        c.lineTo(-r * 0.6, -r * 0.75);
        c.lineTo(-r * 0.25, 0);
        c.lineTo(-r * 0.6, r * 0.75);
        c.closePath();
        c.fill();
        c.stroke();
        c.fillStyle = '#fff';
        c.beginPath();
        c.ellipse(r * 0.3, -r * 0.12, r * 0.18, r * 0.22, 0, 0, TAU);
        c.fill();
        c.fillStyle = '#111';
        c.beginPath();
        c.arc(r * 0.36, -r * 0.1, r * 0.09, 0, TAU);
        c.fill();
        break;
      }
      case 'blink': {
        const phased = s.phase > 0;
        c.globalAlpha = phased ? 0.45 : 1;
        if (phased) {
          for (let k = 1; k <= 3; k++) {
            c.strokeStyle = rgb(sk.glow, 0.35 / k);
            c.lineWidth = Math.max(2, ppt * 0.08);
            diamond(c, -k * r * 0.5, r * 1.1);
            c.stroke();
          }
        }
        c.strokeStyle = rgb(sk.rim);
        c.fillStyle = rgb(sk.body, phased ? 0.2 : 0.35);
        c.lineWidth = Math.max(2.5, ppt * 0.11);
        diamond(c, 0, r * 1.1);
        c.fill();
        c.stroke();
        c.globalAlpha = 1;
        eyes(c, r * 0.8, s, 0);
        break;
      }
    }
    c.restore();
  }

  private drawParticles(v: View, X: (x: number) => number, Y: (y: number) => number, dt: number) {
    const c = this.c;
    const ppt = v.ppt;
    const keep: Particle[] = [];
    for (const p of this.parts) {
      p.life += dt;
      if (p.life >= p.max) continue;
      p.vy += p.g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      keep.push(p);
      const k = 1 - p.life / p.max;
      const sx = X(p.x);
      const sy = Y(p.y);
      switch (p.kind) {
        case 'shard':
          c.save();
          c.translate(sx, sy);
          c.rotate(p.rot);
          c.fillStyle = rgb(p.color, k);
          c.beginPath();
          c.moveTo(0, -p.size * ppt);
          c.lineTo(p.size * ppt * 0.6, p.size * ppt * 0.5);
          c.lineTo(-p.size * ppt * 0.6, p.size * ppt * 0.5);
          c.fill();
          c.restore();
          break;
        case 'ring':
          c.strokeStyle = rgb(p.color, k * 0.9);
          c.lineWidth = Math.max(1.5, ppt * 0.08 * k);
          c.beginPath();
          c.arc(sx, sy, p.size * ppt * (1 - k * 0.7), 0, TAU);
          c.stroke();
          break;
        case 'square':
          c.fillStyle = rgb(p.color, k);
          c.fillRect(sx - (p.size * ppt) / 2, sy - (p.size * ppt) / 2, p.size * ppt, p.size * ppt);
          break;
        case 'note':
          c.fillStyle = rgb(p.color, k);
          c.font = `${Math.round(p.size * ppt * 1.4)}px Exo 2, sans-serif`;
          c.fillText('♪', sx, sy);
          break;
        default:
          this.glow(sx, sy, p.size * ppt * 3, p.color, k * 0.8);
      }
    }
    this.parts = keep;
  }

  private ambient(v: View, pal: Palette, f: Frame, speed: number) {
    const c = this.c;
    const kind = this.world.ambient;
    const n = 26;
    for (let i = 0; i < n; i++) {
      const seed = i * 97.13;
      const life = 6 + (seed % 5);
      const tt = (f.t + seed) % life;
      const px = ((seed * 31.7) % v.W) - ((f.t * speed * v.ppt * (0.15 + (i % 4) * 0.08)) % v.W);
      const x = (px + v.W * 2) % v.W;
      let y = ((seed * 17.3) % v.H) as number;
      const a = Math.sin((tt / life) * Math.PI) * 0.8;
      let col = pal.glow;
      let size = v.ppt * 0.06;
      switch (kind) {
        case 'bubbles':
          y = v.H - ((tt / life) * v.H * 1.1) % v.H;
          c.strokeStyle = rgb(lighten(col, 0.4), a * 0.6);
          c.lineWidth = 1.2 * this.dpr;
          c.beginPath();
          c.arc(x, y, size * 2.2, 0, TAU);
          c.stroke();
          continue;
        case 'rain':
          c.strokeStyle = rgb(lighten(pal.skyBottom, 0.5), 0.25);
          c.lineWidth = this.dpr;
          y = ((tt * v.H * 1.8) % v.H) | 0;
          c.beginPath();
          c.moveTo(x, y);
          c.lineTo(x - v.ppt * 0.3, y + v.ppt * 0.9);
          c.stroke();
          continue;
        case 'static':
          if (Math.random() < 0.3) {
            c.fillStyle = `rgba(255,255,255,${0.08 + f.pulse * 0.1})`;
            c.fillRect(Math.random() * v.W, Math.random() * v.H, v.ppt * 0.8, this.dpr * 2);
          }
          continue;
        case 'streaks':
          c.strokeStyle = rgb(lighten(pal.groundEdge, 0.4), 0.25 + f.pulse * 0.2);
          c.lineWidth = this.dpr * 1.5;
          c.beginPath();
          c.moveTo(x, y);
          c.lineTo(x + v.ppt * 2.5, y);
          c.stroke();
          continue;
        case 'fireflies':
          col = i % 2 ? pal.accent : pal.groundEdge;
          y = y + Math.sin(f.t + i) * v.ppt * 0.5;
          size *= 1.4;
          break;
        case 'embers':
          col = i % 2 ? pal.groundEdge : pal.glow;
          y = v.H - ((tt / life) * v.H) % v.H;
          break;
        case 'petals':
          col = i % 3 ? pal.thorn : pal.groundEdge;
          y = ((tt / life) * v.H * 1.2) % v.H;
          size *= 1.6;
          break;
        default:
          break;
      }
      this.glow(x, y, size * 4, col, a * 0.6);
    }
  }

  private speedLines(v: View, pal: Palette, speed: number) {
    const c = this.c;
    c.save();
    c.globalCompositeOperation = 'lighter';
    c.strokeStyle = rgb(lighten(pal.glow, 0.5), (speed - 1) * 0.25);
    c.lineWidth = this.dpr * 1.2;
    for (let i = 0; i < 14; i++) {
      const y = ((i * 0.071 + 0.03) % 1) * v.H;
      const x = (v.W - ((performance.now() * (0.8 + (i % 3) * 0.3) * speed) % (v.W * 1.5))) | 0;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + v.W * 0.12, y);
      c.stroke();
    }
    c.restore();
  }

  private hud(s: DrawState, pal: Palette) {
    const c = this.c;
    const w = Math.min(this.W * 0.42, 560 * this.dpr);
    const h = Math.max(6, 8 * this.dpr);
    const x = (this.W - w) / 2;
    const y = 18 * this.dpr;
    c.fillStyle = 'rgba(0,0,0,0.35)';
    roundRect(c, x - 3 * this.dpr, y - 3 * this.dpr, w + 6 * this.dpr, h + 6 * this.dpr, h);
    c.fill();
    const g = c.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, rgb(s.practice ? [80, 255, 140] : pal.groundEdge));
    g.addColorStop(1, rgb(s.practice ? [160, 255, 200] : lighten(pal.groundEdge, 0.5)));
    c.fillStyle = g;
    roundRect(c, x, y, Math.max(h, w * s.progress), h, h / 2);
    c.fill();
    c.font = `${Math.round(13 * this.dpr)}px Bungee, sans-serif`;
    c.textAlign = 'center';
    c.textBaseline = 'top';
    c.fillStyle = 'rgba(255,255,255,0.9)';
    c.fillText(`${Math.floor(s.progress * 100)}%`, this.W / 2, y + h + 6 * this.dpr);
  }
}

// ---------------------------------------------------------------- shapes

function body(c: CanvasRenderingContext2D, r: number, sk: Skin) {
  const g = c.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
  g.addColorStop(0, rgb(lighten(sk.body, 0.55)));
  g.addColorStop(1, rgb(sk.body));
  c.fillStyle = g;
  c.beginPath();
  c.arc(0, 0, r, 0, TAU);
  c.fill();
  c.strokeStyle = rgb(sk.rim, 0.9);
  c.lineWidth = Math.max(1.5, r * 0.12);
  c.stroke();
}

function eyes(c: CanvasRenderingContext2D, r: number, s: DrawState, lookUp: number) {
  const blink = Math.sin(s.t * 1.7) > 0.985 ? 0.15 : 1;
  const look = Math.max(-0.25, Math.min(0.25, -s.vy * 0.012)) * (s.grav === 1 ? -1 : 1);
  for (const ex of [0.12, 0.5]) {
    c.fillStyle = '#fff';
    c.beginPath();
    c.ellipse(r * ex, -r * (0.08 + lookUp), r * 0.2, r * 0.27 * blink, 0, 0, TAU);
    c.fill();
    c.fillStyle = '#111';
    c.beginPath();
    c.arc(r * (ex + 0.07), -r * (0.06 + lookUp) + look * r, r * 0.11 * Math.max(0.4, blink), 0, TAU);
    c.fill();
  }
}

function diamond(c: CanvasRenderingContext2D, dx: number, r: number) {
  c.beginPath();
  c.moveTo(dx, -r);
  c.lineTo(dx + r * 0.8, 0);
  c.lineTo(dx, r);
  c.lineTo(dx - r * 0.8, 0);
  c.closePath();
}

export function formGlyph(c: CanvasRenderingContext2D, form: Form) {
  c.beginPath();
  switch (form) {
    case 'spark':
      c.arc(0, 0, 0.8, 0, TAU);
      break;
    case 'flux':
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * TAU - Math.PI / 2;
        c.lineTo(Math.cos(a) * 1, Math.sin(a) * 1);
      }
      c.closePath();
      break;
    case 'comet':
      c.moveTo(1, 0);
      c.lineTo(-0.7, -0.7);
      c.lineTo(-0.3, 0);
      c.lineTo(-0.7, 0.7);
      c.closePath();
      break;
    case 'blink':
      c.moveTo(0, -1);
      c.lineTo(0.75, 0);
      c.lineTo(0, 1);
      c.lineTo(-0.75, 0);
      c.closePath();
      break;
  }
  c.fill();
}

function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

function hsl(h: number): RGB {
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return 255 * (0.55 - 0.45 * Math.max(-1, Math.min(k - 3, 9 - k, 1)));
  };
  return [f(0), f(8), f(4)];
}
