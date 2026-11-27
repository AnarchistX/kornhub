import { useEffect } from 'react';
import { useGame, useSettings } from './engine/store';
import { audio } from './engine/audio';
import { DEBUG } from './engine/hooks';
import { getState, nightDef } from './engine/store';
import { answer } from './engine/rules';
import { useUi } from './os/ui';
import { ConfirmDialog } from './os/Popups';
import { Desktop } from './os/Desktop';
import { TitleScreen } from './screens/Title';
import { ProfileScreen } from './screens/Profile';
import { NightCard } from './screens/Card';
import { Boot } from './screens/Boot';
import { Report } from './screens/Report';
import { Ending, ToBeContinued } from './screens/End';
import { CutscenePlayer } from './cutscene/Cutscene';

function Screen() {
  const title = useUi((u) => u.title);
  const screen = useGame((s) => s.screen);
  if (title) return <TitleScreen />;
  switch (screen) {
    case 'profile':
      return <ProfileScreen />;
    case 'cutscene':
      return <CutscenePlayer />;
    case 'card':
      return <NightCard />;
    case 'boot':
      return <Boot />;
    case 'desktop':
      return <Desktop />;
    case 'report':
      return <Report />;
    case 'tbc':
      return <ToBeContinued />;
    case 'ending':
      return <Ending />;
    default:
      return <TitleScreen />;
  }
}

function DebugOverlay() {
  const s = useGame((x) => x);
  return (
    <pre style={{ position: 'fixed', left: 4, bottom: 4, zIndex: 9999, margin: 0, padding: 6, maxWidth: 360, font: '11px monospace', background: 'rgba(0,0,0,.7)', color: '#7f7', pointerEvents: 'none' }}>
      {JSON.stringify({ screen: s.screen, minute: s.night.minute, arrived: s.night.arrived.length, errors: s.night.errors, writeups: s.writeups, suspicion: s.suspicion, flags: s.flags }, null, 1)}
    </pre>
  );
}

if (DEBUG && typeof window !== 'undefined') {
  (window as unknown as { __echo: unknown }).__echo = {
    answer: (id: string) => {
      const t = nightDef().tickets.find((x) => x.id === id);
      return t && t.kind !== 'alert' ? answer(t, getState().profile, nightDef()) : null;
    },
    state: () => getState(),
  };
}

export function App() {
  const settings = useSettings();
  useEffect(() => {
    const unlock = () => audio.unlock();
    window.addEventListener('pointerdown', unlock, { capture: true });
    window.addEventListener('keydown', unlock, { capture: true });
    return () => {
      window.removeEventListener('pointerdown', unlock, { capture: true });
      window.removeEventListener('keydown', unlock, { capture: true });
    };
  }, []);
  return (
    <>
      <Screen />
      <ConfirmDialog />
      <div className="crt" data-level={settings.crt} aria-hidden="true" />
      {DEBUG && <DebugOverlay />}
    </>
  );
}
