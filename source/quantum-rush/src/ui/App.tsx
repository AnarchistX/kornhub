import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LEVELS } from '../content/levels';
import { getEndless, getLevel } from '../content/registry';
import { audio } from '../engine/audio';
import {
  clears,
  loadSave,
  loadSettings,
  meets,
  newUnlocks,
  popcount,
  progressOf,
  shardCount,
  storeSave,
  storeSettings,
  type SaveData,
  type Settings,
} from '../engine/save';
import { Game, type Mode, type RunResult } from '../game/Game';
import { Renderer } from '../game/render';
import { SKINS, TRAILS, type Skin, type Trail } from '../game/skins';
import { rgb, worldFor } from '../game/worlds';

type Screen =
  | { name: 'title' }
  | { name: 'select'; focus?: number }
  | { name: 'play'; id: string; mode: Mode; seed?: number }
  | { name: 'custom' }
  | { name: 'settings'; back: Screen };

const params = new URLSearchParams(location.search);

export function App() {
  const [save, setSave] = useState<SaveData>(loadSave);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [screen, setScreen] = useState<Screen>(() => {
    const lv = params.get('level');
    if (lv) {
      const spec = LEVELS[Number(lv) - 1] ?? LEVELS.find((l) => l.id === lv);
      if (spec) return { name: 'play', id: spec.id, mode: params.has('practice') ? 'practice' : params.has('bot') ? 'demo' : 'normal' };
    }
    return { name: 'title' };
  });

  useEffect(() => {
    audio.musicVolume = settings.music;
    audio.sfxVolume = settings.sfx;
    audio.offsetMs = settings.offsetMs;
    audio.applyVolumes();
    storeSettings(settings);
  }, [settings]);

  const update = useCallback((fn: (s: SaveData) => SaveData) => {
    setSave((prev) => {
      const next = fn(prev);
      storeSave(next);
      return next;
    });
  }, []);

  const go = (s: Screen) => {
    audio.sfx('click');
    setScreen(s);
  };

  return (
    <div className="app">
      {screen.name === 'title' && <Title save={save} onPlay={() => go({ name: 'select' })} onCustom={() => go({ name: 'custom' })} onSettings={() => go({ name: 'settings', back: screen })} />}
      {screen.name === 'select' && (
        <Select
          save={save}
          focus={screen.focus}
          onBack={() => go({ name: 'title' })}
          onPlay={(id, mode) => go({ name: 'play', id, mode, seed: Date.now() % 100000 })}
          onSettings={() => go({ name: 'settings', back: screen })}
        />
      )}
      {screen.name === 'play' && (
        <Play
          key={`${screen.id}-${screen.mode}-${screen.seed ?? 0}`}
          id={screen.id}
          mode={screen.mode}
          seed={screen.seed ?? 1}
          save={save}
          settings={settings}
          update={update}
          onExit={(focus) => go({ name: 'select', focus })}
          onNext={(id) => go({ name: 'play', id, mode: 'normal', seed: Date.now() % 100000 })}
        />
      )}
      {screen.name === 'custom' && <Custom save={save} update={update} onBack={() => go({ name: 'title' })} />}
      {screen.name === 'settings' && <SettingsView settings={settings} setSettings={setSettings} onBack={() => go(screen.back)} />}
    </div>
  );
}

// ---------------------------------------------------------------- title

function Title({ save, onPlay, onCustom, onSettings }: { save: SaveData; onPlay: () => void; onCustom: () => void; onSettings: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [armed, setArmed] = useState(() => audio.ctx !== null);
  const demoId = useMemo(() => {
    const forced = params.get('demo');
    if (forced && LEVELS.some((l) => l.id === forced)) return forced;
    const open = LEVELS.filter((_, i) => i === 0 || progressOf(save, LEVELS[i - 1].id).cleared);
    return open[Math.floor(Math.random() * open.length)].id;
  }, [save]);
  const og = params.has('og');
  useEffect(() => {
    const el = canvas.current!;
    const level = getLevel(demoId);
    const skin = SKINS.find((s) => s.id === save.skin) ?? SKINS[0];
    const trail = TRAILS.find((t) => t.id === save.trail) ?? TRAILS[0];
    const bars = Number(params.get('bar') ?? 8);
    const g = new Game(el, level, { mode: 'demo', skin, trail, reduced: true, shardsSaved: 0, startAt: level.song.bar0 + (60 / level.song.bpm) * 4 * bars });
    void g.start();
    const onResize = () => g.renderer.resize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      g.destroy();
    };
  }, [demoId, save.skin, save.trail]);
  const total = shardCount(save);
  return (
    <div className="screen title">
      <canvas ref={canvas} className="demo" />
      <div className="title-shade" />
      {!og && (
        <a className="home" href="/" onClick={() => audio.sfx('back')}>
          ← KXRNAGE
        </a>
      )}
      <div className={`title-body ${og ? 'og' : ''}`}>
        <h1 className="logo">
          <span>QUANTUM</span>
          <span>RUSH</span>
        </h1>
        <p className="tag">Jump, flip and fly.</p>
        {og ? null : !armed ? (
          <button
            className="cta"
            onClick={() => {
              audio.unlock();
              audio.sfx('unlock');
              goFullscreen();
              setArmed(true);
            }}
          >
            Tap to start
          </button>
        ) : (
          <nav className="menu">
            <button className="cta" onClick={onPlay}>
              Play
            </button>
            <button className="ghost" onClick={onCustom}>
              Customize
            </button>
            <button className="ghost" onClick={onSettings}>
              Settings
            </button>
          </nav>
        )}
        {!og && (
          <p className="stats">
            {clears(save)}/10 cleared · {total}/30 shards
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- level select

const DIFF = ['Easy', 'Easy', 'Normal', 'Normal', 'Hard', 'Hard', 'Harder', 'Insane', 'Insane', 'Extreme'];

function Select({ save, focus, onBack, onPlay, onSettings }: { save: SaveData; focus?: number; onBack: () => void; onPlay: (id: string, mode: Mode) => void; onSettings: () => void }) {
  const firstOpen = Math.max(0, LEVELS.findIndex((l) => !progressOf(save, l.id).cleared));
  const [i, setI] = useState(focus ?? (firstOpen === -1 ? 0 : firstOpen));
  const spec = LEVELS[i];
  const pr = progressOf(save, spec.id);
  const unlocked = i === 0 || progressOf(save, LEVELS[i - 1].id).cleared || params.has('unlock');
  const world = worldFor(spec.world);
  const pal = world.palettes[0];
  const move = (d: number) => {
    const n = Math.max(0, Math.min(LEVELS.length - 1, i + d));
    if (n !== i) {
      audio.sfx('hover');
      setI(n);
    }
  };
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') move(1);
      if (e.key === 'ArrowLeft') move(-1);
      if ((e.key === 'Enter' || e.key === ' ') && unlocked) onPlay(spec.id, 'normal');
      if (e.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });
  const touch = useRef<number | null>(null);
  return (
    <div
      className="screen select"
      style={{ background: `radial-gradient(120% 90% at 70% 20%, ${rgb(pal.skyBottom)}, ${rgb(pal.skyTop)} 60%, #05040a)` }}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 50) move(dx < 0 ? 1 : -1);
        touch.current = null;
      }}
    >
      <header className="bar">
        <button className="icon" onClick={onBack} aria-label="Back">
          ←
        </button>
        <span className="crumb">Select a level</span>
        <button className="icon" onClick={onSettings} aria-label="Settings">
          ⚙
        </button>
      </header>
      <div className="carousel">
        <button className="arrow" disabled={i === 0} onClick={() => move(-1)} aria-label="Previous level">
          ‹
        </button>
        <article className={`card ${unlocked ? '' : 'locked'}`} style={{ borderColor: rgb(pal.groundEdge), boxShadow: `0 0 60px ${rgb(pal.glow, 0.35)}` }}>
          <div className="card-art" style={{ background: `linear-gradient(180deg, ${rgb(pal.skyTop)}, ${rgb(pal.skyBottom)})` }}>
            <span className="num" style={{ color: rgb(pal.groundEdge) }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="ground" style={{ background: rgb(pal.ground), borderTopColor: rgb(pal.groundEdge) }} />
            <div className="spike" style={{ borderBottomColor: rgb(pal.thorn) }} />
            <div className="spike s2" style={{ borderBottomColor: rgb(pal.thorn) }} />
            <div className="orb" style={{ background: rgb(pal.accent), boxShadow: `0 0 18px ${rgb(pal.accent)}` }} />
          </div>
          <div className="card-body">
            <h2>{spec.name}</h2>
            <p className="credit">♪ {getCredit(spec.song)}</p>
            <div className="meta">
              <span className="diff" title="Difficulty">
                {DIFF[i]}
                <i style={{ width: `${(i + 1) * 10}%`, background: rgb(pal.groundEdge) }} />
              </span>
              <span className="shards" aria-label={`${popcount(pr.shards)} of 3 shards`}>
                {[0, 1, 2].map((k) => (
                  <b key={k} className={pr.shards & (1 << k) ? 'on' : ''}>
                    ◆
                  </b>
                ))}
              </span>
            </div>
            <div className="bests">
              <Meter label="Normal" value={pr.best} color={rgb(pal.groundEdge)} />
              <Meter label="Practice" value={pr.practiceBest} color="#7dffa8" />
            </div>
            {pr.attempts > 0 && <p className="attempts">{pr.attempts} attempts{pr.endless ? ` · endless best ${pr.endless} beats` : ''}</p>}
            {unlocked ? (
              <div className="actions">
                <button className="cta" onClick={() => onPlay(spec.id, 'normal')}>
                  Play
                </button>
                <button className="ghost" onClick={() => onPlay(spec.id, 'practice')}>
                  Practice
                </button>
                {pr.cleared && (
                  <button className="ghost" onClick={() => onPlay(spec.id, 'endless')}>
                    Endless
                  </button>
                )}
              </div>
            ) : (
              <p className="lockmsg">🔒 Clear {LEVELS[i - 1].name} to unlock</p>
            )}
          </div>
        </article>
        <button className="arrow" disabled={i === LEVELS.length - 1} onClick={() => move(1)} aria-label="Next level">
          ›
        </button>
      </div>
      <div className="dots">
        {LEVELS.map((l, k) => (
          <button key={l.id} className={`dot ${k === i ? 'on' : ''} ${progressOf(save, l.id).cleared ? 'done' : ''}`} onClick={() => setI(k)} aria-label={l.name} />
        ))}
      </div>
    </div>
  );
}

function getCredit(songId: string) {
  return `${LEVEL_SONG_TITLES[songId] ?? songId} - Kxrnage`;
}
const LEVEL_SONG_TITLES: Record<string, string> = {
  bioluminescence: 'Bioluminescence Protocol',
  astral: "Astral Siren's Call",
  pursuit: 'Digital Pursuit',
  genesis: 'System Genesis',
  lattice: 'Digital Lattice',
  seduction: 'Quantum Seduction',
  awakening: 'Digital Awakening',
  velocity: 'Digital Velocity',
  silk: 'Digital Silk Stream',
  quantum: 'Quantum Rush',
};

function Meter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="meter">
      <span>{label}</span>
      <div className="track">
        <i style={{ width: `${Math.round(value * 100)}%`, background: color }} />
      </div>
      <b>{Math.floor(value * 100)}%</b>
    </div>
  );
}

// ---------------------------------------------------------------- play

function Play({
  id,
  mode,
  seed,
  save,
  settings,
  update,
  onExit,
  onNext,
}: {
  id: string;
  mode: Mode;
  seed: number;
  save: SaveData;
  settings: Settings;
  update: (fn: (s: SaveData) => SaveData) => void;
  onExit: (focus: number) => void;
  onNext: (id: string) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const game = useRef<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paused, setPaused] = useState(false);
  const [practice, setPractice] = useState(mode === 'practice');
  const [result, setResult] = useState<RunResult | null>(null);
  const [unlocks, setUnlocks] = useState<string[]>([]);
  const [endlessOver, setEndlessOver] = useState<RunResult | null>(null);
  const idx = LEVELS.findIndex((l) => l.id === id);
  const spec = LEVELS[idx];
  const shardsSaved = progressOf(save, id).shards;

  useEffect(() => {
    let g: Game | null = null;
    let cancelled = false;
    const timer = setTimeout(() => {
      try {
        const level = mode === 'endless' ? getEndless(id, seed) : getLevel(id);
        const skin = SKINS.find((s) => s.id === save.skin) ?? SKINS[0];
        const trail = TRAILS.find((t) => t.id === save.trail) ?? TRAILS[0];
        const t = params.get('t');
        g = new Game(canvas.current!, level, {
          mode,
          skin,
          trail,
          reduced: settings.reduced,
          shardsSaved,
          startAt: t ? level.song.bar0 + Number(t) : undefined,
          onAttemptEnd: (r) => {
            const m = g!.opt.mode;
            update((s) => {
              const p = { ...progressOf(s, id) };
              if (m === 'practice') p.practiceBest = Math.max(p.practiceBest, r.progress);
              else if (m === 'normal') {
                p.best = Math.max(p.best, r.progress);
                p.attempts++;
              } else if (m === 'endless') p.endless = Math.max(p.endless, r.beats);
              return { ...s, levels: { ...s.levels, [id]: p } };
            });
            if (m === 'endless') {
              g!.pause();
              setEndlessOver(r);
            }
          },
          onComplete: (r) => {
            const m = g!.opt.mode;
            if (m === 'endless') {
              // reaching the end of a generated run is the best an endless run can do
              update((s) => ({ ...s, levels: { ...s.levels, [id]: { ...progressOf(s, id), endless: Math.max(progressOf(s, id).endless, r.beats) } } }));
              g!.pause();
              setEndlessOver(r);
              return;
            }
            update((s) => {
              const p = { ...progressOf(s, id) };
              if (m === 'normal') {
                p.cleared = true;
                p.best = 1;
                p.attempts++;
                p.shards |= r.shards;
              } else if (m === 'practice') p.practiceBest = 1;
              const next = { ...s, levels: { ...s.levels, [id]: p } };
              const fresh = newUnlocks(next);
              if (fresh.length) {
                setUnlocks(fresh);
                next.seenUnlocks = [...next.seenUnlocks, ...fresh];
                setTimeout(() => audio.sfx('unlock'), 600);
              }
              return next;
            });
            setResult(r);
          },
        });
        game.current = g;
        if (params.has('debug')) (window as unknown as { __qr: unknown }).__qr = { game: g, audio };
        g.start()
          .then(() => !cancelled && setLoading(false))
          .catch((e) => setError(String(e)));
      } catch (e) {
        setError(String(e));
      }
    }, 30);
    const onResize = () => g?.renderer.resize();
    window.addEventListener('resize', onResize);
    // turning a phone to portrait mid-run pauses it
    const portrait = window.matchMedia('(orientation: portrait) and (pointer: coarse)');
    const onTurn = () => {
      if (portrait.matches && g && !g.isPaused) {
        g.pause();
        setPaused(true);
      }
    };
    portrait.addEventListener('change', onTurn);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
      portrait.removeEventListener('change', onTurn);
      g?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // input: anywhere on the canvas, space / up / W / click
  useEffect(() => {
    const isUi = (t: EventTarget | null) => t instanceof Element && !!t.closest('button, a, .overlay');
    const down = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'Escape' || e.code === 'KeyP') {
        togglePause();
        return;
      }
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Enter') {
        e.preventDefault();
        game.current?.press();
      }
      if (e.code === 'KeyR' && !paused) game.current?.restart(true);
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Enter') game.current?.release();
    };
    const pd = (e: PointerEvent) => {
      if (isUi(e.target)) return;
      e.preventDefault();
      game.current?.press();
    };
    const pu = (e: PointerEvent) => {
      if (isUi(e.target)) return;
      game.current?.release();
    };
    const vis = () => {
      if (document.hidden) {
        game.current?.pause();
        setPaused(true);
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('pointerdown', pd, { passive: false });
    window.addEventListener('pointerup', pu);
    window.addEventListener('pointercancel', pu);
    document.addEventListener('visibilitychange', vis);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('pointerdown', pd);
      window.removeEventListener('pointerup', pu);
      window.removeEventListener('pointercancel', pu);
      document.removeEventListener('visibilitychange', vis);
    };
  });

  const togglePause = () => {
    const g = game.current;
    if (!g || result) return;
    if (g.isPaused) {
      g.resume();
      setPaused(false);
    } else {
      g.pause();
      setPaused(true);
    }
    audio.sfx('click');
  };

  const nextId = LEVELS[idx + 1]?.id;
  return (
    <div className="screen play">
      <canvas ref={canvas} className="game" />
      {!loading && !result && (
        <button className="pause-btn" onClick={togglePause} aria-label="Pause">
          ❚❚
        </button>
      )}
      {loading && !error && (
        <div className="overlay loading">
          <div className="spin" />
          <p>
            {spec.name}
            <small>{getCredit(spec.song)}</small>
          </p>
        </div>
      )}
      {error && (
        <div className="overlay">
          <div className="panel">
            <h3>Couldn't load the level</h3>
            <p className="small">{error}</p>
            <button className="cta" onClick={() => onExit(idx)}>
              Back
            </button>
          </div>
        </div>
      )}
      {paused && !result && (
        <div className="overlay">
          <div className="panel">
            <h3>Paused</h3>
            <p className="small">
              {spec.name} · {getCredit(spec.song)}
            </p>
            <button className="cta" onClick={togglePause}>
              Resume
            </button>
            <button
              className="ghost"
              onClick={() => {
                game.current?.resume();
                game.current?.restart(true);
                setPaused(false);
              }}
            >
              Restart
            </button>
            {mode !== 'endless' && (
              <button
                className="ghost"
                onClick={() => {
                  const on = !practice;
                  setPractice(on);
                  game.current?.resume();
                  game.current?.setPractice(on);
                  setPaused(false);
                }}
              >
                {practice ? 'Leave practice' : 'Practice mode'}
              </button>
            )}
            <button className="ghost" onClick={() => onExit(idx)}>
              Levels
            </button>
          </div>
        </div>
      )}
      {endlessOver && (
        <div className="overlay">
          <div className="panel">
            <h3>{endlessOver.beats} beats</h3>
            <p className="small">Best {Math.max(endlessOver.beats, progressOf(save, id).endless)} · {spec.name} endless</p>
            <button
              className="cta"
              onClick={() => {
                setEndlessOver(null);
                game.current?.resume();
                game.current?.restart(true);
              }}
            >
              Again
            </button>
            <button className="ghost" onClick={() => onExit(idx)}>
              Levels
            </button>
          </div>
        </div>
      )}
      {result && (
        <div className="overlay">
          <div className="panel results">
            <span className="kicker">{game.current?.opt.mode === 'practice' ? 'Practice run complete' : 'Level complete'}</span>
            <h3>{spec.name}</h3>
            <p className="small">{getCredit(spec.song)}</p>
            <div className="res-row">
              <div>
                <b>{result.attempts}</b>
                <span>attempt{result.attempts === 1 ? '' : 's'}</span>
              </div>
              <div>
                <b className="gems">
                  {[0, 1, 2].map((k) => (
                    <i key={k} className={(result.shards | progressOf(save, id).shards) & (1 << k) ? 'on' : ''}>
                      ◆
                    </i>
                  ))}
                </b>
                <span>shards</span>
              </div>
            </div>
            {unlocks.length > 0 && (
              <p className="unlocks">
                Unlocked:{' '}
                {unlocks
                  .map((u) => {
                    const [kind, uid] = u.split(':');
                    return kind === 'skin' ? `${SKINS.find((s) => s.id === uid)?.name} colour` : `${TRAILS.find((t) => t.id === uid)?.name} trail`;
                  })
                  .join(', ')}
              </p>
            )}
            {nextId && game.current?.opt.mode === 'normal' && (
              <button className="cta" onClick={() => onNext(nextId)}>
                Next: {LEVELS[idx + 1].name}
              </button>
            )}
            <button
              className="ghost"
              onClick={() => {
                setResult(null);
                setUnlocks([]);
                game.current?.restart(true);
              }}
            >
              Play again
            </button>
            <button className="ghost" onClick={() => onExit(idx)}>
              Levels
            </button>
          </div>
        </div>
      )}
      <div className="rotate">
        <div className="phone" />
        <p>Turn your phone sideways to play</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- customize

function Custom({ save, update, onBack }: { save: SaveData; update: (fn: (s: SaveData) => SaveData) => void; onBack: () => void }) {
  const skin = SKINS.find((s) => s.id === save.skin) ?? SKINS[0];
  return (
    <div className="screen custom">
      <header className="bar">
        <button className="icon" onClick={onBack} aria-label="Back">
          ←
        </button>
        <span className="crumb">Customize</span>
        <span />
      </header>
      <div className="custom-body">
        <div className="preview">
          <RunnerPreview skin={skin} trail={TRAILS.find((t) => t.id === save.trail) ?? TRAILS[0]} />
          <p>{skin.name}</p>
        </div>
        <section>
          <h3>Colours</h3>
          <div className="swatches">
            {SKINS.map((s) => {
              const ok = meets(save, s.need);
              return (
                <button
                  key={s.id}
                  className={`swatch ${save.skin === s.id ? 'on' : ''}`}
                  disabled={!ok}
                  title={ok ? s.name : s.unlock}
                  onClick={() => {
                    audio.sfx('click');
                    update((sv) => ({ ...sv, skin: s.id }));
                  }}
                >
                  <i style={{ background: rgb(s.body), boxShadow: `0 0 14px ${rgb(s.glow)}`, borderColor: rgb(s.rim) }} />
                  <span>{ok ? s.name : '🔒'}</span>
                  {!ok && <small>{s.unlock}</small>}
                </button>
              );
            })}
          </div>
          <h3>Trails</h3>
          <div className="swatches">
            {TRAILS.map((t) => {
              const ok = meets(save, t.need);
              return (
                <button
                  key={t.id}
                  className={`swatch trail ${save.trail === t.id ? 'on' : ''}`}
                  disabled={!ok}
                  onClick={() => {
                    audio.sfx('click');
                    update((sv) => ({ ...sv, trail: t.id }));
                  }}
                >
                  <i className={`tr-${t.kind}`} />
                  <span>{ok ? t.name : '🔒'}</span>
                  {!ok && <small>{t.unlock}</small>}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

/** The real renderer drawing the runner in all four forms, so the preview matches the game exactly. */
function RunnerPreview({ skin, trail }: { skin: Skin; trail: Trail }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [form, setForm] = useState('spark');
  useEffect(() => {
    const r = new Renderer(canvas.current!, true);
    let raf = 0;
    let last = performance.now();
    const t0 = last;
    let shown = '';
    const frame = (ms: number) => {
      raf = requestAnimationFrame(frame);
      const f = r.preview(skin, trail, (ms - t0) / 1000, Math.min(0.05, (ms - last) / 1000));
      last = ms;
      if (f !== shown) {
        shown = f;
        setForm(f);
      }
    };
    raf = requestAnimationFrame(frame);
    const onResize = () => r.resize();
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [skin, trail]);
  return (
    <div className="runner-preview">
      <canvas ref={canvas} />
      <span>{form}</span>
    </div>
  );
}

// ---------------------------------------------------------------- settings

function SettingsView({ settings, setSettings, onBack }: { settings: Settings; setSettings: (s: Settings) => void; onBack: () => void }) {
  const set = (patch: Partial<Settings>) => setSettings({ ...settings, ...patch });
  return (
    <div className="screen settings">
      <header className="bar">
        <button className="icon" onClick={onBack} aria-label="Back">
          ←
        </button>
        <span className="crumb">Settings</span>
        <span />
      </header>
      <div className="panel wide">
        <label className="row">
          <span>Music</span>
          <input type="range" min={0} max={1} step={0.05} value={settings.music} onChange={(e) => set({ music: Number(e.target.value) })} />
        </label>
        <label className="row">
          <span>Effects</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.sfx}
            onChange={(e) => {
              set({ sfx: Number(e.target.value) });
              audio.sfx('jump');
            }}
          />
        </label>
        <label className="row">
          <span>Reduced flashes</span>
          <input type="checkbox" checked={settings.reduced} onChange={(e) => set({ reduced: e.target.checked })} />
        </label>
        <label className="row">
          <span>
            Audio offset <small>{settings.offsetMs > 0 ? '+' : ''}{settings.offsetMs} ms</small>
          </span>
          <input type="range" min={-150} max={150} step={5} value={settings.offsetMs} onChange={(e) => set({ offsetMs: Number(e.target.value) })} />
        </label>
        <p className="small">If jumps feel late against the music (Bluetooth headphones), raise the offset.</p>
        <button
          className="ghost"
          onClick={() => {
            if (confirm('Erase all progress?')) {
              localStorage.removeItem('kxrnage.qr.save.v1');
              location.reload();
            }
          }}
        >
          Erase progress
        </button>
      </div>
    </div>
  );
}

/** On phones, take the whole screen and hold landscape where the browser allows it (Android). */
function goFullscreen() {
  if (!window.matchMedia('(pointer: coarse)').matches) return;
  const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void };
  try {
    const p = el.requestFullscreen ? el.requestFullscreen({ navigationUI: 'hide' }) : (el.webkitRequestFullscreen?.(), undefined);
    void Promise.resolve(p)
      .then(() => (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> })?.lock?.('landscape'))
      .catch(() => {});
  } catch {
    /* not supported (iPhone Safari) */
  }
}
