// All sound is synthesized with the Web Audio API: no audio files to download.
// Music tracks (made by the owner) plug into the `music` bus via src/engine/music.ts.
import type { Settings } from './types';

export type Sfx =
  | 'key'
  | 'click'
  | 'open'
  | 'close'
  | 'error'
  | 'mail'
  | 'ticket'
  | 'netsend'
  | 'stamp'
  | 'printer'
  | 'boot'
  | 'sting'
  | 'type'
  | 'paper'
  | 'thunk'
  | 'beep'
  | 'ring'
  | 'hangup'
  | 'mount';

export type Ambience = 'none' | 'noc' | 'rain' | 'wind';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private sfxBus!: GainNode;
  private ambBus!: GainNode;
  private musicBus!: GainNode;
  private noise!: AudioBuffer;
  private ambNodes: { gain: GainNode; stop: () => void } | null = null;
  private ambName: Ambience = 'none';
  private tension: { gain: GainNode; filter: BiquadFilterNode } | null = null;
  private tensionLevel = 0;
  private relayTimer: number | null = null;
  private settings: Settings | null = null;
  private lastType = 0;
  musicEl: HTMLAudioElement | null = null;

  get ready() {
    return !!this.ctx;
  }

  /** Must be called from a user gesture (iOS). Safe to call repeatedly. */
  unlock() {
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      const ctx = new Ctor();
      this.ctx = ctx;
      this.master = ctx.createGain();
      this.master.connect(ctx.destination);
      this.sfxBus = this.bus();
      this.ambBus = this.bus();
      this.musicBus = this.bus();
      const len = ctx.sampleRate * 2;
      this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      if (this.settings) this.apply(this.settings);
      const want = this.ambName;
      this.ambName = 'none';
      if (want !== 'none') this.setAmbience(want);
      this.setTension(this.tensionLevel);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  private bus() {
    const g = this.ctx!.createGain();
    g.connect(this.master);
    return g;
  }

  apply(s: Settings) {
    this.settings = s;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(s.master, t, 0.05);
    this.sfxBus.gain.setTargetAtTime(s.sfx, t, 0.05);
    this.ambBus.gain.setTargetAtTime(s.ambience, t, 0.05);
    this.musicBus.gain.setTargetAtTime(s.music, t, 0.05);
    if (this.musicEl) this.musicEl.volume = s.master * s.music;
  }

  // ---------- building blocks ----------
  private env(g: GainNode, t: number, peak: number, attack: number, decay: number) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  }

  private noiseBurst(t: number, opts: { type: BiquadFilterType; freq: number; q?: number; peak: number; attack?: number; decay: number; dest?: AudioNode }) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.playbackRate.value = 0.8 + Math.random() * 0.4;
    const f = ctx.createBiquadFilter();
    f.type = opts.type;
    f.frequency.value = opts.freq;
    f.Q.value = opts.q ?? 0.7;
    const g = ctx.createGain();
    this.env(g, t, opts.peak, opts.attack ?? 0.002, opts.decay);
    src.connect(f).connect(g).connect(opts.dest ?? this.sfxBus);
    src.start(t, Math.random() * 1.5);
    src.stop(t + (opts.attack ?? 0.002) + opts.decay + 0.05);
  }

  private tone(t: number, opts: { type: OscillatorType; freq: number; to?: number; peak: number; attack?: number; decay: number; dest?: AudioNode; detune?: number }) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = opts.type;
    o.frequency.setValueAtTime(opts.freq, t);
    if (opts.to) o.frequency.exponentialRampToValueAtTime(opts.to, t + (opts.attack ?? 0.005) + opts.decay);
    if (opts.detune) o.detune.value = opts.detune;
    const g = ctx.createGain();
    this.env(g, t, opts.peak, opts.attack ?? 0.005, opts.decay);
    o.connect(g).connect(opts.dest ?? this.sfxBus);
    o.start(t);
    o.stop(t + (opts.attack ?? 0.005) + opts.decay + 0.05);
  }

  // ---------- sound effects ----------
  play(name: Sfx) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + 0.005;
    switch (name) {
      case 'key':
        this.noiseBurst(t, { type: 'bandpass', freq: 1800 + Math.random() * 1600, q: 1.4, peak: 0.22, decay: 0.035 });
        this.noiseBurst(t + 0.012, { type: 'lowpass', freq: 500, peak: 0.08, decay: 0.03 });
        break;
      case 'type': {
        const now = performance.now();
        if (now - this.lastType < 45) return;
        this.lastType = now;
        this.noiseBurst(t, { type: 'bandpass', freq: 2400 + Math.random() * 1200, q: 2, peak: 0.07, decay: 0.02 });
        break;
      }
      case 'click':
        this.noiseBurst(t, { type: 'highpass', freq: 1800, peak: 0.12, decay: 0.018 });
        this.tone(t, { type: 'square', freq: 1400, peak: 0.015, decay: 0.012 });
        break;
      case 'open':
        this.tone(t, { type: 'sine', freq: 520, to: 860, peak: 0.07, decay: 0.07 });
        this.tone(t + 0.06, { type: 'sine', freq: 860, peak: 0.05, decay: 0.09 });
        break;
      case 'close':
        this.tone(t, { type: 'sine', freq: 760, to: 480, peak: 0.06, decay: 0.08 });
        break;
      case 'error':
        this.tone(t, { type: 'square', freq: 196, peak: 0.06, decay: 0.12 });
        this.tone(t + 0.13, { type: 'square', freq: 147, peak: 0.06, decay: 0.2 });
        break;
      case 'beep':
        this.tone(t, { type: 'square', freq: 880, peak: 0.035, decay: 0.09 });
        break;
      case 'mail':
        this.tone(t, { type: 'sine', freq: 988, peak: 0.07, decay: 0.35 });
        this.tone(t + 0.09, { type: 'sine', freq: 1319, peak: 0.06, decay: 0.5 });
        break;
      case 'ticket':
        this.tone(t, { type: 'triangle', freq: 660, peak: 0.06, decay: 0.09 });
        this.tone(t + 0.1, { type: 'triangle', freq: 660, peak: 0.05, decay: 0.09 });
        break;
      case 'netsend':
        this.tone(t, { type: 'triangle', freq: 1175, peak: 0.12, decay: 0.6 });
        this.tone(t, { type: 'sine', freq: 2350, peak: 0.03, decay: 0.4 });
        this.tone(t + 0.14, { type: 'triangle', freq: 880, peak: 0.1, decay: 0.9 });
        break;
      case 'stamp':
        this.tone(t, { type: 'sine', freq: 150, to: 42, peak: 0.6, attack: 0.002, decay: 0.12 });
        this.noiseBurst(t, { type: 'lowpass', freq: 1200, peak: 0.35, decay: 0.07 });
        this.noiseBurst(t + 0.03, { type: 'bandpass', freq: 3200, q: 1, peak: 0.05, decay: 0.05 });
        break;
      case 'thunk':
        this.tone(t, { type: 'sine', freq: 90, to: 40, peak: 0.45, attack: 0.003, decay: 0.25 });
        this.noiseBurst(t, { type: 'lowpass', freq: 400, peak: 0.2, decay: 0.2 });
        break;
      case 'paper':
        this.noiseBurst(t, { type: 'bandpass', freq: 2600, q: 0.8, peak: 0.09, attack: 0.03, decay: 0.12 });
        break;
      case 'printer': {
        // Dot-matrix: a burst of needle strikes, a carriage return, another burst.
        for (let line = 0; line < 3; line++) {
          const base = t + line * 0.42;
          for (let i = 0; i < 16; i++) {
            this.noiseBurst(base + i * 0.018, { type: 'bandpass', freq: 3600, q: 3, peak: 0.05 + Math.random() * 0.05, decay: 0.012 });
          }
          this.tone(base + 0.31, { type: 'sawtooth', freq: 110, to: 70, peak: 0.02, decay: 0.08 });
        }
        break;
      }
      case 'boot':
        this.tone(t, { type: 'sine', freq: 70, to: 32, peak: 0.5, attack: 0.004, decay: 0.4 });
        this.noiseBurst(t, { type: 'highpass', freq: 3000, peak: 0.1, decay: 0.25 });
        this.tone(t + 0.1, { type: 'sine', freq: 7800, peak: 0.006, attack: 0.4, decay: 1.4 });
        for (let i = 0; i < 9; i++) {
          this.noiseBurst(t + 0.8 + i * 0.07 + Math.random() * 0.05, { type: 'bandpass', freq: 1200, q: 4, peak: 0.08, decay: 0.02 });
        }
        break;
      case 'ring': {
        // Two-tone electronic trill, ISDN desk-set style.
        for (let i = 0; i < 12; i++) {
          this.tone(t + i * 0.05, { type: 'square', freq: i % 2 ? 1470 : 1290, peak: 0.035, attack: 0.002, decay: 0.045 });
        }
        for (let i = 0; i < 12; i++) {
          this.tone(t + 0.75 + i * 0.05, { type: 'square', freq: i % 2 ? 1470 : 1290, peak: 0.035, attack: 0.002, decay: 0.045 });
        }
        break;
      }
      case 'hangup':
        this.tone(t, { type: 'sine', freq: 480, peak: 0.05, decay: 0.12 });
        this.tone(t + 0.16, { type: 'sine', freq: 380, peak: 0.05, decay: 0.2 });
        this.noiseBurst(t + 0.02, { type: 'lowpass', freq: 600, peak: 0.12, decay: 0.08 });
        break;
      case 'mount':
        // Robot arm in the tape library: servo whine and a clunk.
        this.tone(t, { type: 'sawtooth', freq: 180, to: 420, peak: 0.025, attack: 0.05, decay: 0.7 });
        this.noiseBurst(t + 0.8, { type: 'lowpass', freq: 700, peak: 0.3, decay: 0.12 });
        this.tone(t + 0.8, { type: 'sine', freq: 110, to: 50, peak: 0.3, attack: 0.002, decay: 0.15 });
        break;
      case 'sting': {
        const ctx = this.ctx;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.14, t + 1.2);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 4.5);
        const f = ctx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.setValueAtTime(180, t);
        f.frequency.exponentialRampToValueAtTime(900, t + 1.2);
        f.frequency.exponentialRampToValueAtTime(160, t + 4.5);
        f.connect(g).connect(this.sfxBus);
        [55, 58.27, 82.4, 110.5].forEach((fr) => {
          const o = ctx.createOscillator();
          o.type = 'sawtooth';
          o.frequency.value = fr;
          o.connect(f);
          o.start(t);
          o.stop(t + 4.6);
        });
        break;
      }
    }
  }

  // ---------- voices: no recordings, just a filtered blip per syllable ----------
  private lastBlip = 0;
  blip(pitch: number) {
    if (!this.ctx) return;
    const now = performance.now();
    if (now - this.lastBlip < 55) return;
    this.lastBlip = now;
    const ctx = this.ctx;
    const t = ctx.currentTime + 0.005;
    const o = ctx.createOscillator();
    o.type = 'triangle';
    const f = pitch * (0.9 + Math.random() * 0.25);
    o.frequency.setValueAtTime(f, t);
    o.frequency.exponentialRampToValueAtTime(f * 0.86, t + 0.07);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 900 + Math.random() * 500;
    bp.Q.value = 1.2;
    const g = ctx.createGain();
    this.env(g, t, 0.09, 0.006, 0.07);
    o.connect(bp).connect(g).connect(this.sfxBus);
    o.start(t);
    o.stop(t + 0.1);
  }

  private hiss: { src: AudioBufferSourceNode; gain: GainNode } | null = null;
  /** Phone-line hiss under a video call. */
  line(on: boolean) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    if (on && !this.hiss) {
      const src = ctx.createBufferSource();
      src.buffer = this.noise;
      src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 1800;
      f.Q.value = 0.6;
      const gain = ctx.createGain();
      gain.gain.value = 0.0001;
      gain.gain.setTargetAtTime(0.025, ctx.currentTime, 0.3);
      src.connect(f).connect(gain).connect(this.sfxBus);
      src.start();
      this.hiss = { src, gain };
    } else if (!on && this.hiss) {
      const h = this.hiss;
      h.gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.2);
      window.setTimeout(() => h.src.stop(), 900);
      this.hiss = null;
    }
  }

  // ---------- ambience ----------
  setAmbience(name: Ambience) {
    if (name === this.ambName) return;
    this.ambName = name;
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    if (this.ambNodes) {
      const old = this.ambNodes;
      old.gain.gain.setTargetAtTime(0.0001, now, 0.4);
      window.setTimeout(() => old.stop(), 2000);
      this.ambNodes = null;
    }
    if (this.relayTimer) {
      window.clearTimeout(this.relayTimer);
      this.relayTimer = null;
    }
    if (name === 'none') return;
    const out = ctx.createGain();
    out.gain.value = 0.0001;
    out.gain.setTargetAtTime(1, now, 0.8);
    out.connect(this.ambBus);
    const stops: Array<() => void> = [];
    const loopNoise = (type: BiquadFilterType, freq: number, gain: number, q = 0.7) => {
      const src = ctx.createBufferSource();
      src.buffer = this.noise;
      src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = type;
      f.frequency.value = freq;
      f.Q.value = q;
      const g = ctx.createGain();
      g.gain.value = gain;
      src.connect(f).connect(g).connect(out);
      src.start();
      stops.push(() => src.stop());
      return { src, f, g };
    };
    const hum = (freq: number, gain: number, type: OscillatorType = 'sine') => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = gain;
      o.connect(g).connect(out);
      o.start();
      stops.push(() => o.stop());
      return { o, g };
    };
    if (name === 'noc') {
      loopNoise('lowpass', 180, 0.22);
      loopNoise('bandpass', 900, 0.012, 0.5);
      hum(60, 0.018);
      hum(120, 0.008);
      hum(180, 0.004);
      const buzz = hum(120, 0.0025, 'sawtooth');
      const bf = ctx.createBiquadFilter();
      bf.type = 'bandpass';
      bf.frequency.value = 2400;
      bf.Q.value = 6;
      buzz.g.disconnect();
      buzz.g.connect(bf).connect(out);
      const relay = () => {
        if (this.ambName !== 'noc') return;
        this.play('click');
        this.relayTimer = window.setTimeout(relay, 9000 + Math.random() * 16000);
      };
      this.relayTimer = window.setTimeout(relay, 6000);
    } else if (name === 'rain') {
      loopNoise('bandpass', 1300, 0.12, 0.5);
      loopNoise('highpass', 5000, 0.035);
      loopNoise('lowpass', 220, 0.09);
    } else if (name === 'wind') {
      const w = loopNoise('lowpass', 420, 0.16);
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.07;
      const lg = ctx.createGain();
      lg.gain.value = 260;
      lfo.connect(lg).connect(w.f.frequency);
      lfo.start();
      stops.push(() => lfo.stop());
      loopNoise('bandpass', 1500, 0.02, 0.4);
    }
    this.ambNodes = { gain: out, stop: () => stops.forEach((s) => s()) };
  }

  // ---------- tension drone, 0..1 ----------
  setTension(level: number) {
    this.tensionLevel = Math.max(0, Math.min(1, level));
    if (!this.ctx) return;
    const ctx = this.ctx;
    if (!this.tension) {
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 160;
      const gain = ctx.createGain();
      gain.gain.value = 0.0001;
      filter.connect(gain).connect(this.ambBus);
      [41.2, 41.5, 61.7].forEach((fr, i) => {
        const o = ctx.createOscillator();
        o.type = i === 2 ? 'triangle' : 'sawtooth';
        o.frequency.value = fr;
        o.connect(filter);
        o.start();
      });
      this.tension = { gain, filter };
    }
    const now = ctx.currentTime;
    const v = this.tensionLevel;
    this.tension.gain.gain.setTargetAtTime(v <= 0.001 ? 0.0001 : 0.05 * v, now, 1.5);
    this.tension.filter.frequency.setTargetAtTime(140 + 520 * v, now, 1.5);
  }
}

export const audio = new AudioEngine();
