import { useEffect } from 'react';
import { closePopup, dismissIntro, dismissNotice, finishShift, flushSave, getState, nightDef, restartNight, setSettings, useGame, useSettings } from '../engine/store';
import { clockAt, endClock, loginName } from '../engine/text';
import { openApp, setUi, useUi, resetUi } from './ui';
import { InfoIcon, WarnIcon } from '../art/icons';
import { audio } from '../engine/audio';

export function IntroSticky() {
  const done = useGame((s) => s.night.introDone);
  if (done) return null;
  return (
    <div className="scrim" style={{ background: 'rgba(6,8,10,0.35)' }}>
      <div className="sticky-pop">
        <div className="sticky">{nightDef().sticky}</div>
        <button
          className="btn big"
          style={{ width: '100%' }}
          onClick={() => {
            audio.play('paper');
            dismissIntro();
          }}
        >
          <span>Peel it off</span>
        </button>
      </div>
    </div>
  );
}

export function NetSendPopup() {
  const popup = useGame((s) => s.night.popup);
  const profile = useGame((s) => s.profile);
  if (!popup) return null;
  const def = nightDef();
  const ns = def.netsends.find((x) => x.id === popup);
  if (!ns) return null;
  const { date, h, m } = clockAt(def, getState().night.minute);
  const [mm, dd, yy] = date.split('/');
  const stamp = `${Number(mm)}/${Number(dd)}/${yy} ${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
  return (
    <div className="scrim">
      <div className={`dialog netsend ${ns.alarm ? 'alarm' : ''}`} role="alertdialog" aria-label={ns.alarm ? 'SYSCON alarm' : 'Messenger Service'}>
        <div className="win-title">
          <span className="t">{ns.alarm ? 'SYSCON · Alarm' : 'Messenger Service'}</span>
        </div>
        <div className="dialog-body">
          <span className="ico">
            <InfoIcon />
          </span>
          <div className="dialog-text selectable">
            <span className="meta">
              Message from {ns.from} to {profile ? loginName(profile).toUpperCase() : 'OPERATOR'} on {stamp}
            </span>
            {ns.body(getState())}
          </div>
        </div>
        <div className="dialog-actions">
          {ns.alarm && (
            <button
              className="btn"
              onClick={() => {
                closePopup();
                openApp('syscon', { sysconTab: ns.tab ?? null });
              }}
            >
              Open SYSCON
            </button>
          )}
          <button className="btn" autoFocus onClick={closePopup}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export function Notices() {
  const notices = useGame((s) => s.night.notices);
  const writeups = useGame((s) => s.writeups);
  if (!notices.length) return null;
  return (
    <div className="notices" aria-live="polite">
      {notices.map((n) => (
        <div key={n.id} className="slip paper" role="status">
          <h4>NOTICE OF PROCEDURAL ERROR</h4>
          <div>{n.ref}</div>
          <div>{n.text}</div>
          <span className="kind">{n.kind === 'writeup' ? `WRITE-UP · ${writeups} OF 3` : 'WARNING · NO PENALTY'}</span>
          <button className="btn" onClick={() => dismissNotice(n.id)}>
            Acknowledge
          </button>
        </div>
      ))}
    </div>
  );
}

export function ConfirmDialog() {
  const c = useUi((u) => u.confirm);
  if (!c) return null;
  const close = () => setUi({ confirm: null });
  return (
    <div className="scrim" onClick={close}>
      <div className="dialog" role="alertdialog" aria-label={c.title} onClick={(e) => e.stopPropagation()}>
        <div className="win-title">
          <span className="t">{c.title}</span>
        </div>
        <div className="dialog-body">
          <span className="ico">
            <WarnIcon />
          </span>
          <div className="dialog-text">{c.text}</div>
        </div>
        <div className="dialog-actions">
          <button className="btn" onClick={close}>
            Cancel
          </button>
          <button
            className="btn"
            autoFocus
            onClick={() => {
              close();
              c.onOk();
            }}
          >
            {c.ok}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SettingsPanel() {
  const s = useSettings();
  const slider = (key: 'master' | 'music' | 'sfx' | 'ambience', label: string) => (
    <label>
      {label}
      <input type="range" min={0} max={1} step={0.05} value={s[key]} onChange={(e) => setSettings({ [key]: Number(e.target.value) })} />
    </label>
  );
  const seg = (key: 'crt' | 'textSpeed', label: string, opts: string[]) => (
    <div className="srow" role="group" aria-label={label}>
      {label}
      <span className="seg">
        {opts.map((o, i) => (
          <button key={o} type="button" className={`btn ${s[key] === i ? 'pressed' : ''}`} onClick={() => setSettings({ [key]: i })}>
            {o}
          </button>
        ))}
      </span>
    </div>
  );
  return (
    <div className="settings">
      {slider('master', 'Master volume')}
      {slider('music', 'Music')}
      {slider('sfx', 'Effects')}
      {slider('ambience', 'Room sound')}
      {seg('crt', 'CRT effects', ['Off', 'Subtle', 'Full'])}
      {seg('textSpeed', 'Text speed', ['Instant', 'Normal', 'Slow'])}
    </div>
  );
}

export function MenuDialog() {
  const open = useUi((u) => u.menu);
  if (!open) return null;
  const close = () => setUi({ menu: false });
  return (
    <div className="scrim" onClick={close}>
      <div className="dialog" role="dialog" aria-label="Sentinel menu" onClick={(e) => e.stopPropagation()}>
        <div className="win-title">
          <span className="t">Sentinel · Settings</span>
          <button className="win-x" aria-label="Close" onClick={close}>
            ×
          </button>
        </div>
        <SettingsPanel />
        <div className="menu-list">
          <button className="btn" onClick={close}>
            Resume shift
          </button>
          <button
            className="btn"
            onClick={() => {
              close();
              restartNight();
              resetUi();
              setUi({ title: false });
            }}
          >
            Restart this night
          </button>
          <button
            className="btn"
            onClick={() => {
              flushSave();
              resetUi();
              setUi({ title: true, menu: false });
            }}
          >
            Save and quit to title
          </button>
        </div>
        <div className="dialog-actions">
          <span style={{ marginRight: 'auto', font: '500 11px var(--f-mono)', color: 'var(--text-dim)' }}>Progress saves automatically.</span>
          <button className="btn" onClick={close}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function EndShift() {
  const ended = useGame((s) => s.night.ended);
  const popup = useGame((s) => s.night.popup);
  const profile = useGame((s) => s.profile);
  useEffect(() => {
    if (ended && !popup) audio.play('beep');
  }, [ended, popup]);
  if (!ended || popup) return null;
  return (
    <div className="end-shift">
      <div>
        <h2>{endClock(nightDef()).time}</h2>
        <div>{nightDef().endLine ?? 'SHIFT COMPLETE · DAY SHIFT HAS THE CONSOLE'}</div>
        <div style={{ opacity: 0.7, marginBottom: 22 }}>Logging off {profile ? loginName(profile) : 'operator'}…</div>
        <button className="ghost" onClick={finishShift}>
          Clock out
        </button>
      </div>
    </div>
  );
}
