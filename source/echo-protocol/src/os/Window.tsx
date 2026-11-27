import { useRef } from 'react';
import type { Win } from './ui';
import { closeApp, focusApp, moveWin } from './ui';
import { APP_ICONS, APP_NAMES } from '../art/icons';

interface Drag {
  mode: 'move' | 'size';
  px: number;
  py: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export function Window({ win, active, children }: { win: Win; active: boolean; children: React.ReactNode }) {
  const drag = useRef<Drag | null>(null);
  const Icon = APP_ICONS[win.app];

  const down = (mode: Drag['mode']) => (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    focusApp(win.app);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { mode, px: e.clientX, py: e.clientY, x: win.x, y: win.y, w: win.w, h: win.h };
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const desk = (e.currentTarget as HTMLElement).closest('.desk') as HTMLElement | null;
    const W = desk?.clientWidth ?? window.innerWidth;
    const H = desk?.clientHeight ?? window.innerHeight;
    const dx = e.clientX - d.px;
    const dy = e.clientY - d.py;
    if (d.mode === 'move') {
      moveWin(win.app, {
        x: Math.round(Math.max(-d.w + 120, Math.min(W - 120, d.x + dx))),
        y: Math.round(Math.max(0, Math.min(H - 28, d.y + dy))),
      });
    } else {
      moveWin(win.app, {
        w: Math.round(Math.max(320, Math.min(W - d.x, d.w + dx))),
        h: Math.round(Math.max(220, Math.min(H - d.y, d.h + dy))),
      });
    }
  };
  const up = () => {
    drag.current = null;
  };

  return (
    <section
      className={`win ${active ? '' : 'blur'}`}
      style={{ left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }}
      onPointerDownCapture={() => focusApp(win.app)}
      aria-label={APP_NAMES[win.app]}
    >
      <div className="win-title" onPointerDown={down('move')} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <Icon />
        <span className="t">{APP_NAMES[win.app]}</span>
        <button className="win-x" aria-label={`Close ${APP_NAMES[win.app]}`} onPointerDown={(e) => e.stopPropagation()} onClick={() => closeApp(win.app)}>
          ×
        </button>
      </div>
      <div className="win-body">{children}</div>
      <div className="win-grip" onPointerDown={down('size')} onPointerMove={move} onPointerUp={up} onPointerCancel={up} />
    </section>
  );
}
