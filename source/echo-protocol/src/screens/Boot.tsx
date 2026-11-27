import { useEffect, useState } from 'react';
import { go, nightDef, useGame } from '../engine/store';
import { startClock, loginName } from '../engine/text';
import { audio } from '../engine/audio';
import { SentinelMark } from '../art/icons';

type Phase = 'power' | 'post' | 'splash' | 'cad' | 'login' | 'consent';

const POST = [
  'HALVARD-LOWE SENTINEL BIOS v2.14  (C) 1997 Halvard-Lowe Systems',
  'Pentium II 400MHz  ·  128 MB RAM',
  'Memory test: 131072K OK',
  'Detecting IDE drives ... HLS-6400 6.4GB  OK',
  'Network: 3C905 10/100  link up  MCRA-OPS',
  'Y2K BIOS date check ............... PASS',
  'Loading SENTINEL 4.0 ...',
];

export function Boot() {
  const profile = useGame((s) => s.profile);
  const [phase, setPhase] = useState<Phase>('power');
  const [lines, setLines] = useState(0);
  const [dots, setDots] = useState(0);
  const def = nightDef();

  useEffect(() => {
    audio.play('boot');
    audio.setAmbience('noc');
    const t = window.setTimeout(() => setPhase((p) => (p === 'power' ? 'post' : p)), 800);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase === 'post') {
      if (lines < POST.length) {
        const t = window.setTimeout(() => {
          setLines((n) => n + 1);
          audio.play('type');
        }, 170);
        return () => window.clearTimeout(t);
      }
      const t = window.setTimeout(() => setPhase('splash'), 500);
      return () => window.clearTimeout(t);
    }
    if (phase === 'splash') {
      const t = window.setTimeout(() => setPhase('cad'), 1800);
      return () => window.clearTimeout(t);
    }
    if (phase === 'login' && dots < 8) {
      const t = window.setTimeout(() => {
        setDots((d) => d + 1);
        audio.play('key');
      }, dots === 0 ? 500 : 95);
      return () => window.clearTimeout(t);
    }
  }, [phase, lines, dots]);

  useEffect(() => {
    if (phase !== 'cad') return;
    const go2 = () => {
      audio.play('click');
      setPhase('login');
    };
    window.addEventListener('keydown', go2);
    return () => window.removeEventListener('keydown', go2);
  }, [phase]);

  const skip = () => {
    if (phase === 'power' || phase === 'post' || phase === 'splash') setPhase('cad');
  };

  const login = profile ? loginName(profile) : 'operator';

  return (
    <div className="boot" onClick={skip}>
      {phase === 'power' && <div className="power" />}
      {phase === 'post' && <div className="post">{POST.slice(0, lines).join('\n')}</div>}
      {phase === 'splash' && (
        <div className="splash">
          <SentinelMark />
          <div className="name">SENTINEL 4.0</div>
          <div className="bar">
            <i />
          </div>
        </div>
      )}
      {(phase === 'cad' || phase === 'login' || phase === 'consent') && (
        <div className="logon">
          {phase === 'cad' && (
            <div className="cad" onClick={() => (audio.play('click'), setPhase('login'))} role="button" tabIndex={0}>
              <b>SENTINEL 4.0</b>
              Press Ctrl+Alt+Del to log on
              <div style={{ opacity: 0.55, fontSize: 12, marginTop: 6 }}>(or tap)</div>
            </div>
          )}
          {phase === 'login' && (
            <div className="dialog" role="dialog" aria-label="Log on to Sentinel">
              <div className="win-title">
                <span className="t">Log on to Sentinel</span>
              </div>
              <div className="login-form">
                <span>User name:</span>
                <input className="field" value={login} readOnly aria-label="User name" />
                <span>Password:</span>
                <input className="field" value={'•'.repeat(dots)} readOnly aria-label="Password" />
                <span>Domain:</span>
                <input className="field" value="MCRA-OPS" readOnly aria-label="Domain" />
              </div>
              <div className="dialog-actions">
                <button className="btn" disabled={dots < 8} onClick={() => (audio.play('click'), setPhase('consent'))}>
                  OK
                </button>
              </div>
            </div>
          )}
          {phase === 'consent' && (
            <div className="dialog" role="dialog" aria-label="Notice and consent">
              <div className="win-title">
                <span className="t">Notice and consent</span>
              </div>
              <div className="consent-text">
                <p>
                  <b>You are accessing a U.S. Government information system</b>, operated under contract by Halvard-Lowe Technical Services for the Marrow Creek Biological Research Annex.
                </p>
                <p>By using this system you consent to the following:</p>
                <p>· Communications and data on this system are not private. They are subject to routine monitoring, interception and search.</p>
                <p>· All activity is logged under your user name ({login}) and may be audited at any time.</p>
                <p>· Unauthorized use may result in disciplinary action and civil and criminal penalties.</p>
                <p style={{ color: 'var(--text-dim)', fontSize: 12 }}>
                  Session opened {def.date} {startClock(def)} · Night Operations
                </p>
              </div>
              <div className="dialog-actions">
                <button className="btn" autoFocus onClick={() => (audio.play('click'), go('desktop'))}>
                  I agree
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
