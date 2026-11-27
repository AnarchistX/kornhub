import { useEffect } from 'react';
import { advanceNight, go, useGame } from '../engine/store';
import { NIGHTS } from '../content/nights';
import { audio } from '../engine/audio';
import { resetUi } from '../os/ui';

export function NightCard() {
  const n = useGame((s) => s.night.n);
  const ended = useGame((s) => s.night.ended);

  // Arriving here from the dawn cutscene: roll over to the next night, with a clean desktop.
  useEffect(() => {
    advanceNight();
    resetUi();
  }, []);

  useEffect(() => {
    if (ended) return;
    audio.setAmbience('none');
    audio.play('thunk');
    const t = window.setTimeout(() => go('boot'), 5600);
    return () => window.clearTimeout(t);
  }, [ended, n]);

  if (ended) return <div className="card-screen" />;
  const def = NIGHTS[n];
  return (
    <div className="card-screen" onClick={() => go('boot')} role="button" aria-label="Continue">
      <div key={n}>
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
