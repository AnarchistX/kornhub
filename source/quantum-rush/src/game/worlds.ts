// Ten worlds, one per song. Palettes swap at musical sections; backdrops are procedural and react to the beat.
export type RGB = [number, number, number];

export interface Palette {
  skyTop: RGB;
  skyBottom: RGB;
  far: RGB;
  mid: RGB;
  ground: RGB;
  groundEdge: RGB;
  thorn: RGB;
  accent: RGB; // nodes, boosts, shards
  accent2: RGB; // crystals, gates, lasers
  glow: RGB; // ambient light
}

export interface View {
  camX: number; // left edge, tiles
  camY: number; // bottom edge, tiles
  w: number; // width in tiles
  h: number; // height in tiles
  ppt: number; // pixels per tile
  W: number; // canvas pixels
  H: number;
}

export interface Frame {
  t: number; // song time
  pulse: number; // 0..1, spikes on each beat
  bar: number; // 0..1 progress through the bar
  energy: number; // 0..1 loudness of the current bar
  drop: number; // 0..1, decays after a drop
  reduced: boolean; // reduced flashes
}

export interface World {
  id: string;
  name: string;
  palettes: Palette[];
  back: (c: CanvasRenderingContext2D, v: View, p: Palette, f: Frame) => void;
  ambient: 'bubbles' | 'stars' | 'rain' | 'fireflies' | 'motes' | 'static' | 'embers' | 'streaks' | 'petals' | 'sparks';
  groundStyle: 'coral' | 'crystal' | 'road' | 'circuit' | 'grid' | 'velvet' | 'glass' | 'chevron' | 'silk' | 'prism';
}

const hex = (s: string): RGB => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
export const rgb = (c: RGB, a = 1) => (a >= 1 ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})` : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`);
export const mix = (a: RGB, b: RGB, k: number): RGB => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
export const lighten = (a: RGB, k: number): RGB => mix(a, [255, 255, 255], k);
export function mixPalette(a: Palette, b: Palette, k: number): Palette {
  const o = {} as Palette;
  for (const key of Object.keys(a) as (keyof Palette)[]) o[key] = mix(a[key], b[key], k);
  return o;
}

const P = (sky: [string, string], far: string, mid: string, ground: string, edge: string, thorn: string, accent: string, accent2: string, glow: string): Palette => ({
  skyTop: hex(sky[0]),
  skyBottom: hex(sky[1]),
  far: hex(far),
  mid: hex(mid),
  ground: hex(ground),
  groundEdge: hex(edge),
  thorn: hex(thorn),
  accent: hex(accent),
  accent2: hex(accent2),
  glow: hex(glow),
});

// ---------------------------------------------------------------- shared painters

const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

function sky(c: CanvasRenderingContext2D, v: View, p: Palette, f: Frame) {
  const g = c.createLinearGradient(0, 0, 0, v.H);
  g.addColorStop(0, rgb(p.skyTop));
  g.addColorStop(1, rgb(lighten(p.skyBottom, f.reduced ? 0 : f.drop * 0.25)));
  c.fillStyle = g;
  c.fillRect(0, 0, v.W, v.H);
}

function stars(c: CanvasRenderingContext2D, v: View, color: RGB, n: number, par: number, f: Frame, seed = 1) {
  const span = v.W * 1.5;
  const off = (v.camX * v.ppt * par) % span;
  for (let i = 0; i < n; i++) {
    const x = ((hash(i * 3 + seed) * span - off + span) % span) - v.W * 0.25;
    const y = hash(i * 7 + seed * 13) * v.H * 0.75;
    const tw = 0.4 + 0.6 * Math.abs(Math.sin(f.t * (0.7 + hash(i) * 2) + i));
    const r = (0.6 + hash(i * 11) * 1.6) * (v.ppt / 48) * (1 + f.pulse * 0.35);
    c.fillStyle = rgb(color, tw * 0.9);
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fill();
  }
}

/** A silhouette ridge band, parallaxed. */
function ridge(c: CanvasRenderingContext2D, v: View, color: RGB, par: number, base: number, amp: number, freq: number, seed: number, alpha = 1) {
  const off = v.camX * par;
  c.fillStyle = rgb(color, alpha);
  c.beginPath();
  c.moveTo(0, v.H);
  const step = Math.max(6, v.W / 120);
  for (let px = 0; px <= v.W + step; px += step) {
    const wx = px / v.ppt + off;
    const y = base + amp * (Math.sin(wx * freq + seed) * 0.6 + Math.sin(wx * freq * 2.3 + seed * 1.7) * 0.3 + Math.sin(wx * freq * 5.1 + seed * 3.1) * 0.1);
    c.lineTo(px, v.H - y * v.H);
  }
  c.lineTo(v.W, v.H);
  c.closePath();
  c.fill();
}

function glowDisc(c: CanvasRenderingContext2D, x: number, y: number, r: number, color: RGB, a: number) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgb(color, a));
  g.addColorStop(1, rgb(color, 0));
  c.fillStyle = g;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();
}

function rays(c: CanvasRenderingContext2D, v: View, x: number, y: number, color: RGB, n: number, f: Frame, alpha: number) {
  c.save();
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + f.t * 0.05;
    const w = 0.05 + hash(i) * 0.06;
    c.fillStyle = rgb(color, alpha * (0.4 + 0.6 * hash(i + 9)) * (0.7 + f.pulse * 0.6));
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + Math.cos(a - w) * v.W * 1.2, y + Math.sin(a - w) * v.W * 1.2);
    c.lineTo(x + Math.cos(a + w) * v.W * 1.2, y + Math.sin(a + w) * v.W * 1.2);
    c.closePath();
    c.fill();
  }
  c.restore();
}

// ---------------------------------------------------------------- the worlds

export const WORLDS: Record<string, World> = {
  deep: {
    id: 'deep',
    name: 'The deep',
    ambient: 'bubbles',
    groundStyle: 'coral',
    palettes: [
      P(['#021a2b', '#06506b'], '#0a3a52', '#0b2c40', '#0b2233', '#3df2e0', '#ff4fd8', '#7dfcff', '#ffd166', '#22d3ee'),
      P(['#04112e', '#2a1f7a'], '#24317a', '#1a2160', '#0c1840', '#7ef9ff', '#ff5fa2', '#a0fff0', '#ffe066', '#7b61ff'),
      P(['#010b18', '#0d3a4a'], '#0c2f3c', '#082430', '#061a24', '#5cffc8', '#ff7ad9', '#bfffef', '#ffd166', '#34d399'),
    ],
    back(c, v, p, f) {
      sky(c, v, p, f);
      // shafts of light from the surface
      c.save();
      c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 6; i++) {
        const x = ((i * 0.23 + 0.1 - (v.camX * 0.02) / v.w) % 1.3) * v.W;
        const g = c.createLinearGradient(x, 0, x + v.W * 0.1, v.H);
        g.addColorStop(0, rgb(p.glow, 0.16 + f.energy * 0.08));
        g.addColorStop(1, rgb(p.glow, 0));
        c.fillStyle = g;
        c.beginPath();
        c.moveTo(x - v.W * 0.02, 0);
        c.lineTo(x + v.W * 0.05, 0);
        c.lineTo(x + v.W * 0.2, v.H);
        c.lineTo(x + v.W * 0.08, v.H);
        c.fill();
      }
      c.restore();
      ridge(c, v, p.far, 0.08, 0.3, 0.14, 0.12, 1);
      // jellyfish lanterns drifting, pulsing on the beat
      for (let i = 0; i < 7; i++) {
        const span = v.w * 1.6;
        const wx = ((i * 9.7 - v.camX * 0.25) % span + span) % span - v.w * 0.3;
        const x = wx * v.ppt;
        const y = v.H * (0.2 + 0.35 * hash(i * 5)) + Math.sin(f.t * 0.8 + i) * v.ppt * 0.6;
        const r = v.ppt * (0.7 + hash(i * 3) * 0.6) * (1 + f.pulse * 0.12);
        const jc = mix(p.far, i % 2 ? p.accent : p.glow, 0.55);
        glowDisc(c, x, y, r * 3, jc, 0.1 + f.pulse * 0.1);
        c.fillStyle = rgb(jc, 0.5);
        c.beginPath();
        c.arc(x, y, r, Math.PI, 0);
        c.quadraticCurveTo(x + r * 0.5, y + r * 0.35, x, y + r * 0.2);
        c.quadraticCurveTo(x - r * 0.5, y + r * 0.35, x - r, y);
        c.fill();
        c.strokeStyle = rgb(jc, 0.32);
        c.lineWidth = Math.max(1, v.ppt / 30);
        for (let k = -1; k <= 1; k++) {
          c.beginPath();
          c.moveTo(x + k * r * 0.45, y + r * 0.2);
          for (let s = 1; s <= 4; s++) c.lineTo(x + k * r * 0.45 + Math.sin(f.t * 3 + s + i) * r * 0.2, y + r * 0.2 + s * r * 0.45);
          c.stroke();
        }
      }
      ridge(c, v, p.mid, 0.22, 0.18, 0.1, 0.25, 4);
    },
  },

  nebula: {
    id: 'nebula',
    name: 'Nebula',
    ambient: 'stars',
    groundStyle: 'crystal',
    palettes: [
      P(['#12052e', '#5b1a8c'], '#3a1569', '#2a0f52', '#1b0a38', '#e0a3ff', '#ff4fa3', '#9ef0ff', '#ffd166', '#c77dff'),
      P(['#0a0624', '#14308a'], '#1c2a72', '#141f58', '#0e1644', '#9ec5ff', '#ff6fb5', '#b4fff2', '#ffe08a', '#6ea8ff'),
      P(['#1d0326', '#8a1a6b'], '#5c1450', '#430c3c', '#2a0826', '#ffb3e6', '#ffd166', '#a0f8ff', '#ffffff', '#ff7ad9'),
    ],
    back(c, v, p, f) {
      sky(c, v, p, f);
      glowDisc(c, v.W * 0.7, v.H * 0.35, v.W * 0.45, p.glow, 0.25 + f.energy * 0.12);
      glowDisc(c, v.W * 0.25, v.H * 0.2, v.W * 0.3, p.accent2, 0.12);
      stars(c, v, [255, 255, 255], 120, 0.02, f, 3);
      // aurora ribbons
      c.save();
      c.globalCompositeOperation = 'lighter';
      for (let r = 0; r < 3; r++) {
        c.strokeStyle = rgb(r === 1 ? p.accent : p.glow, 0.18 + f.pulse * 0.12);
        c.lineWidth = v.ppt * (0.8 + r * 0.4);
        c.beginPath();
        for (let px = -20; px <= v.W + 20; px += 16) {
          const wx = px / v.ppt + v.camX * 0.05;
          const y = v.H * (0.18 + r * 0.08) + Math.sin(wx * 0.18 + f.t * 0.6 + r) * v.ppt * 1.4;
          if (px < 0) c.moveTo(px, y);
          else c.lineTo(px, y);
        }
        c.stroke();
      }
      c.restore();
      // floating crystal islands
      for (let i = 0; i < 5; i++) {
        const span = v.w * 2;
        const wx = ((i * 13.3 - v.camX * 0.18) % span + span) % span - v.w * 0.4;
        const x = wx * v.ppt;
        const y = v.H * (0.3 + 0.3 * hash(i * 9)) + Math.sin(f.t * 0.5 + i * 2) * v.ppt * 0.4;
        const s = v.ppt * (1.2 + hash(i) * 1.4);
        c.fillStyle = rgb(p.mid);
        c.beginPath();
        c.moveTo(x - s * 1.4, y);
        c.lineTo(x + s * 1.4, y);
        c.lineTo(x + s * 0.3, y + s * 1.6);
        c.lineTo(x - s * 0.2, y + s * 1.1);
        c.closePath();
        c.fill();
        c.fillStyle = rgb(mix(p.mid, p.accent2, 0.3), 0.7);
        for (let k = 0; k < 3; k++) {
          const cx = x + (k - 1) * s * 0.7;
          const h = s * (0.45 + hash(i * 4 + k) * 0.5) * (1 + f.pulse * 0.08);
          c.beginPath();
          c.moveTo(cx - s * 0.3, y);
          c.lineTo(cx - s * 0.3, y - h * 0.6);
          c.lineTo(cx, y - h);
          c.lineTo(cx + s * 0.3, y - h * 0.6);
          c.lineTo(cx + s * 0.3, y);
          c.fill();
        }
      }
      ridge(c, v, p.far, 0.1, 0.16, 0.08, 0.2, 7, 0.8);
    },
  },

  city: {
    id: 'city',
    name: 'Night city',
    ambient: 'rain',
    groundStyle: 'road',
    palettes: [
      P(['#0b0420', '#3d0c4a'], '#26103d', '#170a2a', '#120820', '#ff3df0', '#ffb703', '#00f0ff', '#ff3d6e', '#ff3df0'),
      P(['#04081f', '#0f3a5c'], '#122b4a', '#0b1c33', '#081426', '#00f0ff', '#ff3d6e', '#ffe14d', '#b14dff', '#00c8ff'),
      P(['#1a0410', '#5c0b25'], '#3d0a1d', '#280614', '#1a040d', '#ff6a3d', '#00f0ff', '#ffe14d', '#ff3df0', '#ff5a36'),
    ],
    back(c, v, p, f) {
      sky(c, v, p, f);
      glowDisc(c, v.W * 0.5, v.H * 0.95, v.W * 0.6, p.glow, 0.25 + f.energy * 0.15);
      // searchlights
      c.save();
      c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 2; i++) {
        const a = -Math.PI / 2 + Math.sin(f.t * 0.4 + i * 2.2) * 0.5;
        const bx = v.W * (0.3 + i * 0.4);
        const g = c.createLinearGradient(bx, v.H, bx + Math.cos(a) * v.H, v.H + Math.sin(a) * v.H);
        g.addColorStop(0, rgb(p.accent2, 0.22));
        g.addColorStop(1, rgb(p.accent2, 0));
        c.fillStyle = g;
        c.beginPath();
        c.moveTo(bx, v.H);
        c.lineTo(bx + Math.cos(a - 0.06) * v.H * 1.4, v.H + Math.sin(a - 0.06) * v.H * 1.4);
        c.lineTo(bx + Math.cos(a + 0.06) * v.H * 1.4, v.H + Math.sin(a + 0.06) * v.H * 1.4);
        c.fill();
      }
      c.restore();
      // two skyline layers with lit windows and neon signs
      for (const [par, base, color, seed] of [
        [0.12, 0.35, p.far, 1],
        [0.3, 0.22, p.mid, 5],
      ] as [number, number, RGB, number][]) {
        const off = v.camX * par;
        let wx = Math.floor(off / 3) * 3;
        while ((wx - off) * v.ppt < v.W + 200) {
          const i = Math.round(wx / 3) + seed * 1000;
          const bw = (2 + hash(i) * 2.5) * v.ppt;
          const bh = (base + hash(i * 3) * 0.35) * v.H;
          const x = (wx - off) * v.ppt;
          c.fillStyle = rgb(color);
          c.fillRect(x, v.H - bh, bw, bh);
          if (par > 0.2) {
            c.fillStyle = rgb(p.accent2, 0.2);
            for (let wy = v.H - bh + v.ppt * 0.4; wy < v.H - v.ppt * 0.5; wy += v.ppt * 0.6) {
              for (let wxx = x + v.ppt * 0.3; wxx < x + bw - v.ppt * 0.3; wxx += v.ppt * 0.5) {
                if (hash(wxx * 0.13 + wy * 0.71 + i) > 0.62) c.fillRect(wxx, wy, v.ppt * 0.2, v.ppt * 0.25);
              }
            }
            if (hash(i * 7) > 0.6) {
              const sc = hash(i * 11) > 0.5 ? p.groundEdge : p.thorn;
              const on = 0.55 + 0.45 * (hash(i * 13) > 0.5 ? f.pulse : 1 - f.pulse);
              c.fillStyle = rgb(mix(color, sc, 0.55), on * 0.75);
              c.fillRect(x + bw * 0.15, v.H - bh - v.ppt * 0.9, bw * 0.7, v.ppt * 0.5);
              glowDisc(c, x + bw * 0.5, v.H - bh - v.ppt * 0.65, bw * 0.8, sc, 0.1 * on);
            }
          }
          wx += 3;
        }
      }
    },
  },

  forest: {
    id: 'forest',
    name: 'Circuit forest',
    ambient: 'fireflies',
    groundStyle: 'circuit',
    palettes: [
      P(['#021a0f', '#0d4a2a'], '#0f3a22', '#0a2a18', '#06190e', '#7dff8a', '#ffd23f', '#9bffea', '#ff8fab', '#5cff9d'),
      P(['#14140a', '#4a3d0d'], '#3d330d', '#2b2409', '#1a1606', '#ffd23f', '#7dff8a', '#ffffff', '#ff8fab', '#ffcf3f'),
      P(['#030f1a', '#0d3a3a'], '#0f3a3a', '#0a2a2a', '#061a1a', '#3dffd0', '#ff6fd8', '#ffe066', '#a0ff7d', '#3dffd0'),
    ],
    back(c, v, p, f) {
      sky(c, v, p, f);
      glowDisc(c, v.W * 0.62, v.H * 0.32, v.W * 0.25, p.glow, 0.3 + f.pulse * 0.15);
      ridge(c, v, p.far, 0.06, 0.32, 0.1, 0.14, 3);
      // circuit trees that grow a little on each beat
      for (const [par, scale, color] of [
        [0.15, 0.7, p.far],
        [0.32, 1, p.mid],
      ] as [number, number, RGB][]) {
        const off = v.camX * par;
        for (let k = Math.floor(off / 4) - 1; k < Math.floor(off / 4) + v.w / 4 + 3; k++) {
          const x = (k * 4 - off) * v.ppt;
          const hgt = (0.35 + hash(k * 3 + scale) * 0.3) * v.H * scale * (1 + f.pulse * 0.04);
          c.strokeStyle = rgb(color);
          c.lineWidth = v.ppt * 0.35 * scale;
          c.beginPath();
          c.moveTo(x, v.H);
          c.lineTo(x, v.H - hgt);
          c.stroke();
          c.lineWidth = v.ppt * 0.14 * scale;
          for (let b = 0; b < 4; b++) {
            const by = v.H - hgt * (0.45 + b * 0.15);
            const dir = b % 2 ? 1 : -1;
            const len = v.ppt * (1.2 + hash(k + b) * 1.4) * scale;
            c.beginPath();
            c.moveTo(x, by);
            c.lineTo(x + dir * len * 0.5, by - len * 0.5);
            c.lineTo(x + dir * len, by - len * 0.5);
            c.stroke();
            if (scale === 1) {
              const lit = (b + k) % 3 === Math.floor(f.t * 2) % 3;
              glowDisc(c, x + dir * len, by - len * 0.5, v.ppt * 0.42, lit ? p.accent : p.groundEdge, lit ? 0.42 : 0.16);
            }
          }
        }
      }
    },
  },

  lattice: {
    id: 'lattice',
    name: 'Wireframe',
    ambient: 'motes',
    groundStyle: 'grid',
    palettes: [
      P(['#0a001a', '#2b0050'], '#3a0a6b', '#250545', '#120024', '#ff2fd6', '#00e5ff', '#ffe600', '#00ff9d', '#ff2fd6'),
      P(['#00061a', '#002a50'], '#0a3a6b', '#052545', '#001224', '#00e5ff', '#ff2fd6', '#ffe600', '#ff8a00', '#00b3ff'),
      P(['#140010', '#500030'], '#6b0a3a', '#450525', '#240012', '#ff8a00', '#00e5ff', '#ffffff', '#ff2fd6', '#ff5e00'),
    ],
    back(c, v, p, f) {
      sky(c, v, p, f);
      // sun with scan bands
      const sx = v.W * 0.5;
      const sy = v.H * 0.52;
      const sr = v.H * 0.26 * (1 + f.pulse * 0.03);
      glowDisc(c, sx, sy, sr * 2.2, p.glow, 0.35);
      const g = c.createLinearGradient(0, sy - sr, 0, sy + sr);
      g.addColorStop(0, rgb(p.accent));
      g.addColorStop(1, rgb(p.groundEdge));
      c.fillStyle = g;
      c.beginPath();
      c.arc(sx, sy, sr, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = rgb(p.skyBottom);
      for (let i = 0; i < 7; i++) c.fillRect(sx - sr, sy + sr * (0.1 + i * 0.13), sr * 2, sr * (0.02 + i * 0.012));
      // polygon mountains (wireframe)
      c.strokeStyle = rgb(p.groundEdge, 0.7);
      c.lineWidth = Math.max(1, v.ppt / 28);
      const off = v.camX * 0.1;
      c.fillStyle = rgb(p.far);
      c.beginPath();
      c.moveTo(0, v.H * 0.72);
      for (let k = Math.floor(off / 3) - 1; k < off / 3 + v.w / 3 + 2; k++) {
        const x = (k * 3 - off) * v.ppt;
        const y = v.H * (0.72 - hash(k * 5) * 0.22);
        c.lineTo(x, y);
      }
      c.lineTo(v.W, v.H);
      c.lineTo(0, v.H);
      c.fill();
      c.stroke();
      // perspective grid floor
      const hz = v.H * 0.72;
      c.strokeStyle = rgb(p.groundEdge, 0.45 + f.pulse * 0.35);
      for (let i = 1; i < 12; i++) {
        const y = hz + (v.H - hz) * Math.pow(i / 12, 1.8);
        c.beginPath();
        c.moveTo(0, y);
        c.lineTo(v.W, y);
        c.stroke();
      }
      const roll = (v.camX * 0.5) % 2;
      for (let i = -20; i <= 20; i++) {
        const xb = v.W / 2 + (i - roll) * v.ppt * 2.2;
        c.beginPath();
        c.moveTo(v.W / 2 + (xb - v.W / 2) * 0.05, hz);
        c.lineTo(xb, v.H);
        c.stroke();
      }
    },
  },

  velvet: {
    id: 'velvet',
    name: 'Velvet static',
    ambient: 'static',
    groundStyle: 'velvet',
    palettes: [
      P(['#1a0010', '#5c0029'], '#4a0022', '#330018', '#22000f', '#ff4d8d', '#ffd1e8', '#ffb3c7', '#ff0055', '#ff2e6e'),
      P(['#0d0018', '#3d0052'], '#33004a', '#240033', '#160021', '#d65cff', '#ff4d8d', '#ffffff', '#ff7ad9', '#c13dff'),
      P(['#1a0500', '#5c1a00'], '#4a1400', '#330e00', '#220900', '#ff8a5c', '#ffd1e8', '#ffe066', '#ff2e6e', '#ff5c39'),
    ],
    back(c, v, p, f) {
      sky(c, v, p, f);
      // velvet folds
      for (let i = 0; i < 9; i++) {
        const x = ((i * 0.13 - (v.camX * 0.015) / v.w) % 1.2) * v.W;
        const g = c.createLinearGradient(x, 0, x + v.W * 0.06, 0);
        g.addColorStop(0, rgb(p.far, 0));
        g.addColorStop(0.5, rgb(lighten(p.far, 0.12), 0.6));
        g.addColorStop(1, rgb(p.far, 0));
        c.fillStyle = g;
        c.fillRect(x, 0, v.W * 0.06, v.H);
      }
      // heart speakers that kick on the beat
      for (let i = 0; i < 4; i++) {
        const span = v.w * 1.8;
        const wx = ((i * 11.5 - v.camX * 0.2) % span + span) % span - v.w * 0.3;
        const x = wx * v.ppt;
        const y = v.H * (0.35 + 0.15 * hash(i * 3));
        const s = v.ppt * (1.6 + hash(i) * 0.8) * (1 + f.pulse * 0.18);
        glowDisc(c, x, y, s * 2.6, p.accent2, 0.12 + f.pulse * 0.12);
        c.fillStyle = rgb(mix(p.far, p.groundEdge, 0.45), 0.6);
        c.beginPath();
        c.moveTo(x, y + s * 0.9);
        c.bezierCurveTo(x - s * 1.6, y - s * 0.1, x - s * 0.7, y - s * 1.2, x, y - s * 0.45);
        c.bezierCurveTo(x + s * 0.7, y - s * 1.2, x + s * 1.6, y - s * 0.1, x, y + s * 0.9);
        c.fill();
        c.fillStyle = rgb(p.skyTop, 0.6);
        c.beginPath();
        c.arc(x, y - s * 0.05, s * 0.32 * (1 + f.pulse * 0.4), 0, Math.PI * 2);
        c.fill();
      }
      ridge(c, v, p.mid, 0.2, 0.16, 0.06, 0.35, 2, 0.9);
    },
  },

  sunrise: {
    id: 'sunrise',
    name: 'First light',
    ambient: 'embers',
    groundStyle: 'glass',
    palettes: [
      P(['#2b0a3d', '#ff7a3d'], '#7a2b4a', '#4a1a3d', '#2b0f26', '#ffd23f', '#ff3d6e', '#fffbe6', '#3dfcff', '#ffb03d'),
      P(['#3d1a00', '#ffcf3d'], '#a0521a', '#6b3510', '#3d1d08', '#fff3b0', '#ff5c39', '#ffffff', '#3d9eff', '#ffe03d'),
      P(['#0a1a3d', '#ff9e7a'], '#3d4a7a', '#2a335c', '#161c38', '#ffe6f0', '#ff3d8a', '#ffffff', '#ffd23f', '#ffb3c7'),
    ],
    back(c, v, p, f) {
      sky(c, v, p, f);
      const sx = v.W * 0.62;
      const sy = v.H * 0.68;
      rays(c, v, sx, sy, p.glow, 18, f, 0.12 + f.energy * 0.06);
      glowDisc(c, sx, sy, v.H * 0.55, p.glow, 0.45);
      c.fillStyle = rgb(lighten(p.groundEdge, 0.3));
      c.beginPath();
      c.arc(sx, sy, v.H * 0.16 * (1 + f.pulse * 0.03), 0, Math.PI * 2);
      c.fill();
      ridge(c, v, p.far, 0.07, 0.28, 0.12, 0.13, 5);
      // crystal spires
      const off = v.camX * 0.28;
      for (let k = Math.floor(off / 5) - 1; k < off / 5 + v.w / 5 + 2; k++) {
        const x = (k * 5 - off) * v.ppt;
        const h = (0.16 + hash(k * 7) * 0.22) * v.H;
        const w = v.ppt * (2.4 + hash(k) * 1.6);
        c.fillStyle = rgb(mix(p.mid, p.skyBottom, 0.3));
        c.beginPath();
        c.moveTo(x - w, v.H);
        c.lineTo(x, v.H - h);
        c.lineTo(x + w, v.H);
        c.fill();
        c.fillStyle = rgb(lighten(p.groundEdge, 0.2), 0.25 + f.pulse * 0.2);
        c.beginPath();
        c.moveTo(x, v.H - h);
        c.lineTo(x + w * 0.4, v.H - h * 0.4);
        c.lineTo(x, v.H - h * 0.3);
        c.fill();
      }
    },
  },

  redline: {
    id: 'redline',
    name: 'Redline',
    ambient: 'streaks',
    groundStyle: 'chevron',
    palettes: [
      P(['#1a0000', '#5c0000'], '#3d0000', '#290000', '#140000', '#ff2b2b', '#ffffff', '#ffe14d', '#ffffff', '#ff1f1f'),
      P(['#000000', '#3d0010'], '#26000a', '#1a0007', '#0d0004', '#ffffff', '#ff2b2b', '#ffe14d', '#ff2b2b', '#ff3d3d'),
      P(['#1a0d00', '#5c2b00'], '#3d1d00', '#291300', '#140a00', '#ffb02b', '#ffffff', '#ff2b2b', '#ffffff', '#ff8a1f'),
    ],
    back(c, v, p, f) {
      sky(c, v, p, f);
      // tunnel rings rushing past
      const cx = v.W * 0.55;
      const cy = v.H * 0.45;
      c.save();
      c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 14; i++) {
        const z = ((i - ((v.camX * 0.6) % 1)) / 14) ** 2;
        const r = v.H * (0.05 + z * 1.4);
        c.strokeStyle = rgb(i % 3 === 0 ? p.groundEdge : p.glow, 0.08 + z * 0.35 + f.pulse * 0.1);
        c.lineWidth = Math.max(1, z * v.ppt * 0.5);
        c.beginPath();
        c.arc(cx, cy, r, 0, Math.PI * 2);
        c.stroke();
      }
      c.restore();
      // giant chevrons
      const off = (v.camX * 0.35) % 6;
      c.fillStyle = rgb(p.mid, 0.9);
      for (let k = -1; k < v.w / 6 + 2; k++) {
        const x = (k * 6 - off) * v.ppt;
        const y = v.H * 0.3;
        const s = v.ppt * 2.2;
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x + s, y + s);
        c.lineTo(x, y + s * 2);
        c.lineTo(x - s * 0.6, y + s * 2);
        c.lineTo(x + s * 0.4, y + s);
        c.lineTo(x - s * 0.6, y);
        c.fill();
      }
    },
  },

  silk: {
    id: 'silk',
    name: 'Silkwave',
    ambient: 'petals',
    groundStyle: 'silk',
    palettes: [
      P(['#001a1f', '#00525c'], '#004a52', '#003338', '#002226', '#5cffe6', '#ff7ad9', '#ffe6a0', '#ff9ec7', '#3dffd8'),
      P(['#1a0a1f', '#5c2a6b'], '#4a2a5c', '#331d40', '#22132b', '#ffb3e6', '#5cffe6', '#ffe6a0', '#7ad9ff', '#ff9ee0'),
      P(['#1f1400', '#6b4a00'], '#5c4000', '#402c00', '#2b1d00', '#ffe066', '#ff7ad9', '#ffffff', '#5cffe6', '#ffd23f'),
    ],
    back(c, v, p, f) {
      sky(c, v, p, f);
      glowDisc(c, v.W * 0.4, v.H * 0.3, v.W * 0.4, p.glow, 0.18 + f.energy * 0.1);
      c.save();
      c.globalCompositeOperation = 'lighter';
      const cols: RGB[] = [p.groundEdge, p.thorn, p.accent, p.accent2];
      for (let r = 0; r < 5; r++) {
        const col = cols[r % cols.length];
        const g = c.createLinearGradient(0, 0, v.W, 0);
        g.addColorStop(0, rgb(col, 0));
        g.addColorStop(0.5, rgb(col, 0.22 + f.pulse * 0.1));
        g.addColorStop(1, rgb(col, 0));
        c.fillStyle = g;
        c.beginPath();
        const amp = v.ppt * (1.4 + r * 0.3);
        const base = v.H * (0.2 + r * 0.11);
        for (let px = 0; px <= v.W; px += 12) {
          const wx = px / v.ppt + v.camX * (0.05 + r * 0.03);
          const y = base + Math.sin(wx * 0.15 + f.t * (0.4 + r * 0.1) + r) * amp;
          if (px === 0) c.moveTo(px, y);
          else c.lineTo(px, y);
        }
        for (let px = v.W; px >= 0; px -= 12) {
          const wx = px / v.ppt + v.camX * (0.05 + r * 0.03);
          const y = base + v.ppt * 0.5 + Math.sin(wx * 0.15 + f.t * (0.4 + r * 0.1) + r + 0.6) * amp;
          c.lineTo(px, y);
        }
        c.fill();
      }
      c.restore();
      ridge(c, v, p.mid, 0.2, 0.15, 0.07, 0.22, 9, 0.85);
    },
  },

  prism: {
    id: 'prism',
    name: 'Singularity',
    ambient: 'sparks',
    groundStyle: 'prism',
    palettes: [
      P(['#05000f', '#1a0533'], '#140a33', '#0d0626', '#08041a', '#ffffff', '#ff3d8a', '#3dffd8', '#ffd23f', '#a07dff'),
      P(['#000a14', '#002b3d'], '#0a2b3d', '#061d2b', '#03121c', '#3dffd8', '#ff3d8a', '#ffd23f', '#a07dff', '#3dd8ff'),
      P(['#140005', '#3d0016'], '#3d0a1a', '#2b0612', '#1c030b', '#ffd23f', '#3dffd8', '#ff3d8a', '#ffffff', '#ff7a3d'),
      P(['#0a0a0a', '#262626'], '#1f1f1f', '#141414', '#0a0a0a', '#ffffff', '#ff3d3d', '#3dffd8', '#ffd23f', '#ffffff'),
    ],
    back(c, v, p, f) {
      sky(c, v, p, f);
      stars(c, v, [255, 255, 255], 140, 0.03, f, 11);
      // the black hole with a spinning accretion disc that shifts hue
      const cx = v.W * 0.62;
      const cy = v.H * 0.38;
      const R = v.H * 0.22 * (1 + f.pulse * 0.04);
      c.save();
      c.translate(cx, cy);
      c.scale(1, 0.32);
      c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 48; i++) {
        const a = (i / 48) * Math.PI * 2 + f.t * 0.6;
        const hue = (i * 7.5 + f.t * 40) % 360;
        c.strokeStyle = `hsla(${hue}, 100%, 65%, ${0.18 + f.energy * 0.15})`;
        c.lineWidth = R * 0.35;
        c.beginPath();
        c.arc(0, 0, R * 1.8, a, a + 0.16);
        c.stroke();
      }
      c.restore();
      glowDisc(c, cx, cy, R * 1.6, p.glow, 0.35);
      c.fillStyle = '#000';
      c.beginPath();
      c.arc(cx, cy, R * 0.75, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = rgb(lighten(p.glow, 0.5), 0.9);
      c.lineWidth = Math.max(1.5, v.ppt * 0.06);
      c.beginPath();
      c.arc(cx, cy, R * 0.78, 0, Math.PI * 2);
      c.stroke();
      ridge(c, v, p.far, 0.12, 0.14, 0.06, 0.3, 13, 0.9);
    },
  },
};

export const worldFor = (id: string) => WORLDS[id] ?? WORLDS.deep;
