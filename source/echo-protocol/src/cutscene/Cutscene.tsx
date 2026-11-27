import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cutsceneDone, getState, useGame, useSettings } from '../engine/store';
import { useTyped } from '../engine/hooks';
import { fill } from '../engine/text';
import { audio } from '../engine/audio';
import { SCENES } from '../art/scenes';
import { CUTSCENES, type Shot } from './scripts';
import { Rain } from './Rain';

const CHAR_MS = [0, 30, 55];

export function CutscenePlayer() {
  const id = useGame((s) => s.cutscene);
  const shots = (id && CUTSCENES[id]) || [];
  const [i, setI] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const shot = shots[i];

  const next = useCallback(() => {
    if (leaving) return;
    if (i + 1 < shots.length) setI(i + 1);
    else {
      setLeaving(true);
      window.setTimeout(cutsceneDone, 700);
    }
  }, [i, shots.length, leaving]);

  useEffect(() => {
    if (!shot) {
      cutsceneDone();
      return;
    }
    if (shot.ambience) audio.setAmbience(shot.ambience);
    if (shot.sfx) window.setTimeout(() => audio.play(shot.sfx!), 600);
  }, [shot]);

  if (!shot) return null;
  return (
    <div className={`cutscene ${leaving ? 'leaving' : ''}`} onClick={() => document.dispatchEvent(new CustomEvent('cs-tap'))}>
      <ShotView key={`${id}-${i}`} shot={shot} onDone={next} />
      <div className="grain" />
      <button
        className="skip"
        onClick={(e) => {
          e.stopPropagation();
          setLeaving(true);
          window.setTimeout(cutsceneDone, 500);
        }}
      >
        Skip ▸▸
      </button>
      <div className="cs-dots" aria-hidden="true">
        {shots.map((_, k) => (
          <span key={k} className={k === i ? 'on' : ''} />
        ))}
      </div>
    </div>
  );
}

function ShotView({ shot, onDone }: { shot: Shot; onDone: () => void }) {
  const settings = useSettings();
  const cam = useRef<HTMLDivElement>(null);
  const Scene = shot.scene ? SCENES[shot.scene] : null;
  const caption = shot.caption ? fill(typeof shot.caption === 'function' ? shot.caption(getState()) : shot.caption, getState()) : '';
  const onChar = useCallback(() => audio.play('type'), []);
  const [typed, done, finish] = useTyped(caption, CHAR_MS[settings.textSpeed] ?? 30, onChar);

  // Camera: jump to `from`, then glide to `to` over the shot's duration.
  useLayoutEffect(() => {
    const el = cam.current;
    if (!el || !shot.from) return;
    const t = (v: [number, number, number]) => `scale(${v[2]}) translate(${v[0]}%, ${v[1]}%)`;
    el.style.transition = 'none';
    el.style.transform = t(shot.from);
    void el.offsetWidth;
    el.style.transition = `transform ${shot.ms + 1200}ms cubic-bezier(0.33, 0, 0.4, 1)`;
    el.style.transform = t(shot.to ?? shot.from);
  }, [shot]);

  // Auto-advance; a tap finishes the caption first, then moves on. Fires at most once per shot.
  const fired = useRef(false);
  const doneRef = useRef(done);
  doneRef.current = done;
  const once = useCallback(() => {
    if (fired.current) return;
    fired.current = true;
    onDone();
  }, [onDone]);
  useEffect(() => {
    const id = window.setTimeout(once, shot.ms);
    return () => window.clearTimeout(id);
  }, [shot, once]);
  useEffect(() => {
    const tap = () => {
      if (!doneRef.current && caption) finish();
      else once();
    };
    document.addEventListener('cs-tap', tap);
    return () => document.removeEventListener('cs-tap', tap);
  }, [finish, once, caption]);

  return (
    <div className="shot">
      {Scene && (
        <div className="cam" ref={cam}>
          <Scene />
        </div>
      )}
      {shot.rain ? <Rain density={shot.rain} /> : null}
      {shot.snow ? <Rain density={shot.snow} snow /> : null}
      {shot.title && (
        <div className="cs-title">
          {shot.title.map((l, k) => (
            <div key={k} style={{ animationDelay: `${0.4 + k * 0.9}s` }}>
              {l}
            </div>
          ))}
        </div>
      )}
      {caption && (
        <div className="caption paper">
          {shot.tag && <div className="tag">{shot.tag}</div>}
          <p>
            {typed}
            {!done && <span className="caret">▌</span>}
          </p>
        </div>
      )}
    </div>
  );
}
