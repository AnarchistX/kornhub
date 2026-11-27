// Music is the clock: a decoded AudioBuffer played through Web Audio, so restarts and checkpoints are
// sample-accurate. Every sound effect is synthesized here; the only files are Kxrnage's tracks.
import type { Song } from '../content/songs';

export type Sfx = 'jump' | 'node' | 'boost' | 'land' | 'flip' | 'phase' | 'form' | 'speed' | 'shard' | 'checkpoint' | 'die' | 'clear' | 'click' | 'hover' | 'unlock' | 'back';

const MUSIC_DIR = '/assets/sounds/music/';

class Audio {
  ctx: AudioContext | null = null;
  private master!: GainNode;
  private musicGain!: GainNode;
  private sfxGain!: GainNode;
  private noise!: AudioBuffer;
  private cache = new Map<string, Promise<AudioBuffer>>();
  private source: AudioBufferSourceNode | null = null;
  private startedAt = 0; // ctx time when song time `startOffset` played
  private startOffset = 0;
  private playing = false;
  private pausedAt = 0;
  musicVolume = 0.8;
  sfxVolume = 0.7;
  offsetMs = 0; // user calibration: positive = visuals later

  /** Must be called from a user gesture the first time (iOS). */
  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx({ latencyHint: 'interactive' });
      this.master = this.ctx.createGain();
      this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.connect(this.master);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.connect(this.master);
      this.applyVolumes();
      const len = this.ctx.sampleRate;
      this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  applyVolumes() {
    if (!this.ctx) return;
    this.musicGain.gain.value = this.musicVolume;
    this.sfxGain.gain.value = this.sfxVolume * 0.9;
  }

  load(song: Song): Promise<AudioBuffer> {
    this.unlock();
    let p = this.cache.get(song.id);
    if (!p) {
      p = fetch(MUSIC_DIR + encodeURIComponent(song.file))
        .then((r) => {
          if (!r.ok) throw new Error(`music ${r.status}`);
          return r.arrayBuffer();
        })
        .then((b) => new Promise<AudioBuffer>((res, rej) => this.ctx!.decodeAudioData(b, res, rej)));
      p.catch(() => this.cache.delete(song.id));
      // keep at most two decoded songs (they are large)
      this.cache.set(song.id, p);
      while (this.cache.size > 2) this.cache.delete(this.cache.keys().next().value!);
    }
    return p;
  }

  /** Start the song at `offset` seconds (song time). Endless mode loops whole bars. */
  play(buf: AudioBuffer, offset: number, loop?: { start: number; end: number }) {
    this.unlock();
    const ctx = this.ctx!;
    this.stop();
    const src = ctx.createBufferSource();
    src.buffer = buf;
    if (loop) {
      src.loop = true;
      src.loopStart = loop.start;
      src.loopEnd = loop.end;
    }
    src.connect(this.musicGain);
    this.musicGain.gain.cancelScheduledValues(ctx.currentTime);
    this.musicGain.gain.setValueAtTime(this.musicVolume, ctx.currentTime);
    const when = ctx.currentTime + 0.03;
    let start = offset;
    if (loop && start > loop.end) start = loop.start + ((start - loop.start) % (loop.end - loop.start));
    src.start(when, Math.max(0, start));
    this.source = src;
    this.startedAt = when;
    this.startOffset = offset;
    this.playing = true;
  }

  stop() {
    if (this.source) {
      try {
        this.source.stop();
      } catch {
        /* already stopped */
      }
      this.source.disconnect();
      this.source = null;
    }
    this.playing = false;
  }

  fadeOut(seconds: number) {
    if (!this.ctx) return;
    const g = this.musicGain.gain;
    g.cancelScheduledValues(this.ctx.currentTime);
    g.setValueAtTime(g.value, this.ctx.currentTime);
    g.linearRampToValueAtTime(0, this.ctx.currentTime + seconds);
  }

  pause() {
    if (!this.playing) return;
    this.pausedAt = this.time();
    this.stop();
  }

  /** Song time as heard: output latency and the user's offset are taken off. */
  time(): number {
    if (!this.ctx) return 0;
    if (!this.playing) return this.pausedAt;
    const lat = (this.ctx.outputLatency || 0) + (this.ctx.baseLatency || 0);
    return this.startOffset + (this.ctx.currentTime - this.startedAt) - lat - this.offsetMs / 1000;
  }

  get running() {
    return this.playing;
  }

  // ---------------------------------------------------------------- synthesized effects
  sfx(name: Sfx) {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const t = ctx.currentTime + 0.005;
    switch (name) {
      case 'jump':
        this.tone(t, { type: 'square', f: 420, to: 760, dur: 0.07, peak: 0.05, lp: 2600 });
        break;
      case 'node':
        this.tone(t, { type: 'triangle', f: 660, to: 1320, dur: 0.12, peak: 0.08 });
        this.tone(t + 0.04, { type: 'sine', f: 1320, to: 1760, dur: 0.1, peak: 0.05 });
        break;
      case 'boost':
        this.tone(t, { type: 'sawtooth', f: 180, to: 900, dur: 0.22, peak: 0.07, lp: 2200 });
        this.noiseHit(t, { dur: 0.18, peak: 0.05, bp: 3000, q: 0.8 });
        break;
      case 'land':
        this.noiseHit(t, { dur: 0.05, peak: 0.035, bp: 900, q: 1.2 });
        break;
      case 'flip':
        this.tone(t, { type: 'sine', f: 300, to: 620, dur: 0.12, peak: 0.08 });
        this.tone(t, { type: 'square', f: 150, to: 310, dur: 0.12, peak: 0.025, lp: 1400 });
        break;
      case 'phase':
        this.noiseHit(t, { dur: 0.16, peak: 0.07, bp: 5200, q: 3 });
        this.tone(t, { type: 'sine', f: 1900, to: 900, dur: 0.14, peak: 0.04 });
        break;
      case 'form':
        for (let i = 0; i < 4; i++) this.tone(t + i * 0.035, { type: 'triangle', f: 440 * [1, 1.25, 1.5, 2][i], dur: 0.12, peak: 0.06 });
        this.noiseHit(t, { dur: 0.25, peak: 0.05, bp: 6000, q: 0.6 });
        break;
      case 'speed':
        this.tone(t, { type: 'sawtooth', f: 220, to: 1100, dur: 0.3, peak: 0.05, lp: 3000 });
        break;
      case 'shard':
        [0, 0.06, 0.12, 0.18].forEach((d, i) => this.tone(t + d, { type: 'sine', f: [988, 1319, 1568, 1976][i], dur: 0.18, peak: 0.07 }));
        break;
      case 'checkpoint':
        this.tone(t, { type: 'triangle', f: 784, dur: 0.12, peak: 0.06 });
        this.tone(t + 0.08, { type: 'triangle', f: 1175, dur: 0.16, peak: 0.06 });
        break;
      case 'die':
        this.noiseHit(t, { dur: 0.45, peak: 0.22, bp: 700, q: 0.5, sweepTo: 120 });
        this.tone(t, { type: 'sawtooth', f: 240, to: 40, dur: 0.4, peak: 0.12, lp: 900 });
        break;
      case 'clear':
        [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(t + i * 0.09, { type: 'triangle', f, dur: 0.5, peak: 0.07 }));
        this.tone(t + 0.45, { type: 'sine', f: 2093, dur: 0.9, peak: 0.05 });
        break;
      case 'click':
        this.tone(t, { type: 'square', f: 1100, dur: 0.03, peak: 0.03, lp: 3000 });
        break;
      case 'hover':
        this.tone(t, { type: 'sine', f: 1700, dur: 0.025, peak: 0.015 });
        break;
      case 'back':
        this.tone(t, { type: 'square', f: 700, to: 420, dur: 0.06, peak: 0.03, lp: 2400 });
        break;
      case 'unlock':
        [659, 880, 1175, 1568].forEach((f, i) => this.tone(t + i * 0.07, { type: 'square', f, dur: 0.14, peak: 0.035, lp: 3500 }));
        break;
    }
  }

  private tone(t: number, o: { type: OscillatorType; f: number; to?: number; dur: number; peak: number; lp?: number }) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = o.type;
    osc.frequency.setValueAtTime(o.f, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + o.dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(o.peak, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    let node: AudioNode = osc;
    if (o.lp) {
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = o.lp;
      osc.connect(f);
      node = f;
    }
    node.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + o.dur + 0.02);
  }

  private noiseHit(t: number, o: { dur: number; peak: number; bp: number; q: number; sweepTo?: number }) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.setValueAtTime(o.bp, t);
    if (o.sweepTo) f.frequency.exponentialRampToValueAtTime(o.sweepTo, t + o.dur);
    f.Q.value = o.q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(o.peak, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    src.connect(f);
    f.connect(g);
    g.connect(this.sfxGain);
    src.start(t, Math.random() * 0.5);
    src.stop(t + o.dur + 0.02);
  }
}

export const audio = new Audio();
