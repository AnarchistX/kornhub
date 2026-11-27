import { useEffect, useState } from 'react';
import { getState, nightDef, tick, useGame } from './store';

const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
export const SPEED = Math.max(0.25, Math.min(200, Number(params.get('speed')) || 1));
export const DEBUG = params.has('debug');

const COMPACT_QUERY = '(max-width: 820px), (max-height: 540px)';

/** True on phones and small windows: single-app layout with a bottom dock. */
export function useCompact(): boolean {
  const [compact, setCompact] = useState(() => window.matchMedia(COMPACT_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(COMPACT_QUERY);
    const on = () => setCompact(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return compact;
}

/** Drives the shift clock. Pauses when hidden, paused, or a popup is open. */
export function useShiftClock(paused: boolean) {
  const started = useGame((s) => s.night.started);
  const ended = useGame((s) => s.night.ended);
  const popup = useGame((s) => s.night.popup);
  useEffect(() => {
    if (!started || ended || popup || paused) return;
    const interval = nightDef().minuteMs / SPEED;
    let acc = 0;
    let last = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      acc += Math.min(now - last, 250);
      last = now;
      while (acc >= interval) {
        acc -= interval;
        tick();
        const n = getState().night;
        if (n.popup || n.ended) {
          acc = 0;
          break;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [started, ended, popup, paused]);
}

/** Reveals text character by character. speed: ms per character (0 = instant). */
export function useTyped(text: string, msPerChar: number, onChar?: () => void): [string, boolean, () => void] {
  const [count, setCount] = useState(msPerChar <= 0 ? text.length : 0);
  useEffect(() => {
    setCount(msPerChar <= 0 ? text.length : 0);
  }, [text, msPerChar]);
  useEffect(() => {
    if (count >= text.length) return;
    const id = window.setTimeout(() => {
      setCount((c) => Math.min(text.length, c + 1));
      if (text[count] && text[count] !== ' ') onChar?.();
    }, text[count - 1] === '.' || text[count - 1] === '\n' ? msPerChar * 8 : msPerChar);
    return () => window.clearTimeout(id);
  }, [count, text, msPerChar, onChar]);
  const done = count >= text.length;
  return [text.slice(0, count), done, () => setCount(text.length)];
}
