// Phones held sideways get a gentle nudge: the workstation needs the height of portrait.
// The shift clock pauses while the nudge is up.
import { useEffect, useState } from 'react';
import { audio } from '../engine/audio';

const QUERY = '(orientation: landscape) and (max-height: 500px) and (pointer: coarse)';
let dismissed = false; // for this visit only

export function useRotateHint() {
  const [sideways, setSideways] = useState(() => window.matchMedia(QUERY).matches);
  const [hidden, setHidden] = useState(dismissed);
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const on = () => setSideways(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return {
    show: sideways && !hidden,
    dismiss: () => {
      audio.play('click');
      dismissed = true;
      setHidden(true);
    },
  };
}

export function RotateHint({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="rotate-hint" role="dialog" aria-label="Rotate your phone">
      <div className="rotate-phone" aria-hidden="true">
        <span />
      </div>
      <p>The workstation is built for portrait.</p>
      <small>Turn your phone upright. The clock waits for you.</small>
      <button className="ghost" onClick={onDismiss}>
        Play sideways anyway
      </button>
    </div>
  );
}
