import { useEffect } from 'react';
import { go, nightDef } from '../engine/store';
import { audio } from '../engine/audio';

export function NightCard() {
  const def = nightDef();
  useEffect(() => {
    audio.setAmbience('none');
    audio.play('thunk');
    const t = window.setTimeout(() => go('boot'), 5600);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <div className="card-screen" onClick={() => go('boot')} role="button" aria-label="Continue">
      <div>
        <div className="n">NIGHT {def.n}</div>
        <div className="l" style={{ animationDelay: '0.7s' }}>
          {def.weekday} · {def.longDate}
        </div>
        <div className="l" style={{ animationDelay: '1.3s' }}>
          23:00 · Marrow Creek Annex
        </div>
        <div className="l red" style={{ animationDelay: '2s' }}>
          {def.daysLeft} days until the millennium
        </div>
      </div>
      <div className="hint">TAP TO CONTINUE</div>
    </div>
  );
}
