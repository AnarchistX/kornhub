import { useEffect, useRef } from 'react';
import type { AppId } from '../engine/types';
import { nightDef, useGame } from '../engine/store';
import { useCompact, useShiftClock } from '../engine/hooks';
import { clockAt } from '../engine/text';
import { audio } from '../engine/audio';
import { openApp, setUi, useUi } from './ui';
import { Window } from './Window';
import { EndShift, IntroSticky, MenuDialog, NetSendPopup, Notices } from './Popups';
import { APP_ICONS, APP_NAMES, APP_SHORT, EyeIcon, MenuIcon, SentinelMark } from '../art/icons';
import { QueueApp } from '../apps/Queue';
import { DirectivesApp } from '../apps/Directives';
import { MailApp } from '../apps/Mail';
import { LogsApp } from '../apps/Logs';
import { PersonnelApp } from '../apps/Personnel';
import { NotesApp } from '../apps/Notes';
import { TerminalApp } from '../apps/Terminal';
import { CallPopup } from './Call';
import { BoardApp } from '../apps/Board';
import { SysconApp } from '../apps/Syscon';
import { AppGuard } from './Crash';
import { RotateHint, useRotateHint } from './Rotate';

const ORDER: AppId[] = ['queue', 'directives', 'mail', 'logs', 'personnel', 'notes'];

function AppContent({ app, compact }: { app: AppId; compact: boolean }) {
  switch (app) {
    case 'queue':
      return <QueueApp compact={compact} />;
    case 'directives':
      return <DirectivesApp />;
    case 'mail':
      return <MailApp compact={compact} />;
    case 'logs':
      return <LogsApp compact={compact} />;
    case 'personnel':
      return <PersonnelApp compact={compact} />;
    case 'notes':
      return <NotesApp />;
    case 'terminal':
      return <TerminalApp compact={compact} />;
    case 'board':
      return <BoardApp />;
    case 'syscon':
      return <SysconApp compact={compact} />;
  }
}

/** Only this subscribes to the game minute, so the rest of the desktop doesn't re-render every tick. */
function Clock({ withDate }: { withDate?: boolean }) {
  const minute = useGame((s) => s.night.minute);
  const c = clockAt(nightDef(), minute);
  return <>{withDate ? `${c.date} ${c.time}` : c.time}</>;
}

function useCounts() {
  const def = nightDef();
  const arrived = useGame((s) => s.night.arrived);
  const results = useGame((s) => s.night.results);
  const mails = useGame((s) => s.night.mails);
  const read = useGame((s) => s.night.read);
  const fresh = useGame((s) => s.night.newDirectives.length);
  const pending = def.tickets.filter((t) => arrived.includes(t.id) && !results[t.id]).length;
  const unread = mails.filter((m) => !read.includes(m)).length;
  return { queue: pending, mail: unread, directives: fresh, logs: 0, personnel: 0, notes: 0, terminal: 0, board: 0, syscon: 0 } as Record<AppId, number>;
}

export function Desktop() {
  const compact = useCompact();
  const menu = useUi((u) => u.menu);
  const confirm = useUi((u) => u.confirm);
  const introDone = useGame((s) => s.night.introDone);
  const suspicion = useGame((s) => s.suspicion);
  const sawDeceased = useGame((s) => !!s.flags.n1_saw_deceased);
  const welcomeRead = useGame((s) => s.night.read.includes('n1m1'));
  const wins = useUi((u) => u.wins);
  const active = useUi((u) => u.active);
  const queueSel = useUi((u) => u.queueSel);
  const eyeFlash = useUi((u) => u.eyeFlash);
  const counts = useCounts();
  const nightN = useGame((s) => s.night.n);
  const terminal = useGame((s) => !!s.flags.terminal_unlocked) && nightN === 4;
  const syscon = useGame((s) => !!s.flags.r_syscon);
  const sysconAlarm = useGame((s) => !!s.flags.r_ov || s.flags.r_hvac === 'fault');
  const apps: AppId[] = [...ORDER, ...(terminal ? (['terminal'] as AppId[]) : []), ...(nightN >= 5 ? (['board'] as AppId[]) : []), ...(syscon ? (['syscon'] as AppId[]) : [])];
  const boardNew = useGame((s) => s.night.n >= 5 && !s.flags.board_seen);

  const rotate = useRotateHint();
  useShiftClock(menu || !!confirm || !introDone || rotate.show);

  useEffect(() => {
    audio.setAmbience('noc');
    return () => audio.setAmbience('none');
  }, []);

  useEffect(() => {
    audio.setTension((sawDeceased ? 0.3 : 0) + suspicion / 120);
  }, [sawDeceased, suspicion]);

  // Phones start on the mail (Ray's briefing), then live in the queue.
  useEffect(() => {
    if (compact && !active) setUi({ active: welcomeRead ? 'queue' : 'mail' });
  }, [compact, active, welcomeRead]);

  const lastSusp = useRef(suspicion);
  const eyeRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (suspicion > lastSusp.current || eyeFlash) {
      const el = eyeRef.current;
      if (el) {
        el.classList.remove('flash');
        void el.offsetWidth;
        el.classList.add('flash');
      }
    }
    lastSusp.current = suspicion;
  }, [suspicion, eyeFlash]);

  const secret = active === 'queue' && queueSel === 'n1t7';
  const pulse = (app: AppId) =>
    introDone && ((app === 'syscon' && (sysconAlarm || (!wins.some((w) => w.app === 'syscon') && active !== 'syscon'))) || (app === 'board' && boardNew) || (app === 'terminal' && !wins.some((w) => w.app === 'terminal') && active !== 'terminal') || (app === 'mail' && !welcomeRead) || (app === 'queue' && welcomeRead && counts.queue > 0 && !wins.some((w) => w.app === 'queue') && !(compact && active === 'queue')));

  const open = (app: AppId) => {
    if (compact) {
      if (active !== app) audio.play('click');
      setUi({ active: app });
    } else openApp(app);
  };

  const eyeColor = suspicion >= 40 ? 'var(--red-ink)' : suspicion > 0 ? '#7a5a1a' : 'var(--putty-dk)';
  const eye = (
    <span className="eye" ref={eyeRef} title="Session monitoring" style={{ color: eyeColor }} aria-label={`Session monitoring ${suspicion > 0 ? 'active' : 'idle'}`}>
      <EyeIcon />
    </span>
  );

  return (
    <div className={`os ${compact ? 'compact' : ''}`}>
      <div className={`banner top ${secret ? 'secret' : ''}`}>
        {secret
          ? compact
            ? 'SECRET//ECHO//NOFORN'
            : 'SECRET//ECHO//NOFORN · COMPARTMENTED · FORWARD UNREAD'
          : compact
            ? 'UNCLASSIFIED//FOUO'
            : 'UNCLASSIFIED//FOR OFFICIAL USE ONLY · MARROW CREEK OPERATIONS NETWORK'}
      </div>

      {compact ? (
        <>
          <div className="app-head">
            <span className="title">
              {active && (() => {
                const I = APP_ICONS[active];
                return <I />;
              })()}
              {active ? APP_NAMES[active] : 'Sentinel'}
            </span>
            {eye}
            <span className="clock"><Clock /></span>
            <button className="hbtn" aria-label="Menu" onClick={() => (audio.play('click'), setUi({ menu: true }))}>
              <MenuIcon />
            </button>
          </div>
          <div className="app-body">
            {active && (
              <AppGuard key={active} name={active}>
                <AppContent app={active} compact />
              </AppGuard>
            )}
          </div>
          <nav className={`dock ${apps.length > 6 ? 'seven' : ''}`} aria-label="Apps" style={{ gridTemplateColumns: `repeat(${apps.length}, 1fr)` }}>
            {apps.map((app) => {
              const I = APP_ICONS[app];
              return (
                <button key={app} className={`dock-btn ${active === app ? 'on' : ''} ${pulse(app) ? 'pulse' : ''}`} onClick={() => open(app)}>
                  <I />
                  {(apps.length > 7 && APP_SHORT[app]) || APP_NAMES[app]}
                  {counts[app] > 0 && <span className="count">{counts[app]}</span>}
                </button>
              );
            })}
          </nav>
        </>
      ) : (
        <>
          <div className="desk">
            <div className="wallpaper" aria-hidden="true">
              <div>
                <SentinelMark />
                <div className="wp-name">SENTINEL 4.0</div>
                <div className="wp-sub">HALVARD-LOWE TECHNICAL SERVICES</div>
              </div>
            </div>
            <div className="icons">
              {apps.map((app) => {
                const I = APP_ICONS[app];
                return (
                  <button key={app} className={`dicon ${pulse(app) ? 'pulse' : ''}`} onClick={() => open(app)} onDoubleClick={() => open(app)}>
                    <I />
                    {APP_NAMES[app]}
                    {counts[app] > 0 && <span className="count">{counts[app]}</span>}
                  </button>
                );
              })}
            </div>
            {wins.map((w) => (
              <Window key={w.app} win={w} active={active === w.app}>
                <AppGuard name={w.app}>
                  <AppContent app={w.app} compact={false} />
                </AppGuard>
              </Window>
            ))}
            <Notices />
          </div>
          <div className="taskbar">
            <button className="btn start" onClick={() => (audio.play('click'), setUi({ menu: true }))}>
              <SentinelMark />
              <span>Sentinel</span>
            </button>
            {wins.map((w) => {
              const I = APP_ICONS[w.app];
              return (
                <button key={w.app} className={`btn task-btn ${active === w.app ? 'pressed' : ''}`} onClick={() => openApp(w.app)}>
                  <I />
                  <span>{APP_NAMES[w.app]}</span>
                </button>
              );
            })}
            <div className="tray">
              {eye}
              <span>
                <Clock withDate />
              </span>
            </div>
          </div>
        </>
      )}
      {!compact && <div className="banner">UNCLASSIFIED//FOR OFFICIAL USE ONLY</div>}

      {compact && <Notices />}
      <IntroSticky />
      <NetSendPopup />
      <CallPopup />
      {rotate.show && <RotateHint onDismiss={rotate.dismiss} />}
      <MenuDialog />
      <EndShift />
    </div>
  );
}
