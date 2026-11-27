// SYSCON · the Y2K rollover console Curtis Boyd built "for watching".
// Gate 1, RECSYS-Y2K-0047, the B3 air handlers, live sessions and the NOC fax on one screen.
import { useEffect, useState } from 'react';
import { applyEffect, getState, resolveAlert, useGame } from '../engine/store';
import { loginName } from '../engine/text';
import { audio } from '../engine/audio';
import { confirmDialog, setUi, useUi } from '../os/ui';
import { Cctv } from './Cctv';
import {
  GRACE,
  MODES,
  PA_WARN,
  SESSIONS,
  T,
  denyOverride,
  faxOpen,
  gone,
  hhmm,
  holdGate,
  holdJob,
  hvac,
  releaseGate,
  revoke,
  roll,
  sendFax,
  setMode,
  type HvacCmd,
  type Mode,
  type Roll,
  type SessionUser,
} from '../content/rollover';

type Tab = 'gate' | 'recsys' | 'hvac' | 'sessions' | 'fax';
type Lamp = 'ok' | 'warn' | 'bad' | 'off';

function lamps(r: Roll, m: number): Record<Tab, Lamp> {
  return {
    gate: r.ov ? 'bad' : r.gate === 'requested' || r.gate === 'held' ? 'warn' : gone(r.gate) ? 'off' : 'ok',
    recsys: r.job === 'armed' ? (r.mode === 'PURGE' ? 'warn' : 'ok') : r.job === 'purged' || r.job === 'archived' ? 'off' : 'ok',
    hvac: r.hvac === 'fault' ? 'bad' : r.hvac === 'lost' ? 'bad' : 'ok',
    sessions: r.boydOut ? 'ok' : 'ok',
    fax: m >= T.window && !r.fax ? 'warn' : 'off',
  };
}

const TABS: { id: Tab; label: string; short: string }[] = [
  { id: 'gate', label: 'Gate 1', short: 'Gate' },
  { id: 'recsys', label: 'RECSYS', short: '0047' },
  { id: 'hvac', label: 'B3 HVAC', short: 'HVAC' },
  { id: 'sessions', label: 'Sessions', short: 'Users' },
  { id: 'fax', label: 'Fax', short: 'Fax' },
];

export function SysconApp({ compact }: { compact: boolean }) {
  const minute = useGame((s) => s.night.minute);
  const flags = useGame((s) => s.flags);
  const profile = useGame((s) => s.profile);
  const [tab, setTab] = useState<Tab>('gate');
  const [log, setLog] = useState<string[]>([]);
  const s = getState();
  const r = roll(s);
  void flags;

  // An alarm popup's "Open SYSCON" asks for its panel. SYSCON never switches panels on its own:
  // a tab flipping under a finger could turn a tap on Start into a tap on Release convoy.
  const want = useUi((u) => u.sysconTab);
  useEffect(() => {
    if (want && TABS.some((t) => t.id === want)) setTab(want as Tab);
    if (want) setUi({ sysconTab: null });
  }, [want]);

  const say = (line: string) => setLog((l) => [line, ...l].slice(0, 4));
  const act = (e: ReturnType<typeof holdGate>, line: string, sfx: 'beep' | 'stamp' | 'click' | 'error' = 'beep') => {
    if (!e) return;
    applyEffect(e);
    audio.play(sfx);
    say(line);
  };

  const L = lamps(r, minute);
  const toMidnight = T.rollover - Math.floor(minute);
  const me = profile ? loginName(profile) : 'operator';

  return (
    <div className={`syscon ${compact ? 'compact' : ''}`}>
      <header className="sc-head">
        <div className="sc-brand">
          <b>SYSCON</b>
          <span>Y2K ROLLOVER CONSOLE · OPS-Y2K-0070</span>
        </div>
        <div className={`sc-count ${toMidnight <= 10 && toMidnight > 0 ? 'hot' : ''}`}>
          {toMidnight > 0 ? (
            <>
              T−{String(Math.floor(toMidnight / 60)).padStart(2, '0')}:{String(toMidnight % 60).padStart(2, '0')}
              <small>to rollover</small>
            </>
          ) : (
            <>
              {hhmm(minute)}
              <small>01/01/2000</small>
            </>
          )}
        </div>
      </header>
      <nav className="sc-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`sc-tab ${tab === t.id ? 'on' : ''}`}
            onClick={() => {
              audio.play('click');
              setTab(t.id);
            }}
          >
            <i className={`lamp ${L[t.id]}`} />
            <span className="full">{t.label}</span>
            <span className="short">{t.short}</span>
          </button>
        ))}
      </nav>
      {r.ov > 0 && r.gate === 'held' && (
        <div className="sc-alarm top" role="alert">
          <div>
            <b>REMOTE OVERRIDE · GATE 1</b>
            <span>svc_gate @ WAR-ROOM-03 · accepted automatically at {hhmm(r.ovAt + GRACE)}</span>
          </div>
          <button className="btn big deny" onClick={() => act(denyOverride(getState()), `override ${r.ov} DENIED from OPS-NOC-01`, 'stamp')}>
            <span>Deny</span>
          </button>
        </div>
      )}
      {r.hvac === 'fault' && tab !== 'hvac' && (
        <button className="sc-alarm top as-btn" onClick={() => (audio.play('click'), setTab('hvac'))}>
          <div>
            <b>B3 PRESSURE {Math.round(r.pa)} Pa · RISING</b>
            <span>AHU-1 fault · containment is lost at 0 Pa · tap for B3 HVAC</span>
          </div>
        </button>
      )}
      <div className="sc-body">
        {tab === 'gate' && <GatePanel r={r} minute={minute} act={act} />}
        {tab === 'recsys' && <JobPanel r={r} minute={minute} me={me} act={act} />}
        {tab === 'hvac' && <HvacPanel r={r} minute={minute} say={say} />}
        {tab === 'sessions' && <SessionsPanel r={r} me={me} say={say} />}
        {tab === 'fax' && <FaxPanel r={r} minute={minute} say={say} />}
      </div>
      <footer className="sc-log" aria-live="polite">
        {log.length ? log.map((l, i) => <div key={i + l}>&gt; {l}</div>) : <div>&gt; {me}@OPS-NOC-01 · read-mostly session</div>}
      </footer>
    </div>
  );
}

type Act = (e: ReturnType<typeof holdGate>, line: string, sfx?: 'beep' | 'stamp' | 'click' | 'error') => void;

function Row({ k, v, tone }: { k: string; v: React.ReactNode; tone?: Lamp }) {
  return (
    <div className="sc-row">
      <span className="k">{k}</span>
      <span className={`v ${tone ?? ''}`}>{v}</span>
    </div>
  );
}

// ------------------------------------------------------------------ Gate 1

function GatePanel({ r, minute, act }: { r: Roll; minute: number; act: Act }) {
  const status =
    r.gate === 'closed'
      ? ['CLOSED · LOCAL', 'ok']
      : r.gate === 'requested'
        ? ['CONVOY WAITING · RELEASE REQUESTED', 'warn']
        : r.gate === 'held'
          ? ['HELD · NIGHT LEAD EXCEPTION', 'warn']
          : r.gate === 'expired'
            ? ['HELD · WINDOW CLOSED 00:30', 'ok']
            : [`OPENED ${hhmm(r.gateAt)} · CONVOY DEPARTED`, 'bad'];
  const decide = (v: 'held' | 'released') => {
    const st = getState();
    const e = v === 'held' ? holdGate(st) : releaseGate(st);
    if (!e) return;
    if (!st.night.results.n10x1 && st.night.arrived.includes('n10x1')) resolveAlert('n10x1', v);
    if (v === 'held') act(e, 'GATE 1 HELD · night lead exception logged under your name', 'stamp');
    else act(e, 'GATE 1 OPEN · convoy HL-7 departing', 'beep');
  };
  return (
    <div className="sc-panel gate">
      <div className="sc-cam">
        <Cctv cam="gate" date={minute >= T.rollover ? '01/01/00' : '12/31/99'} time={hhmm(minute)} truck={r.gate !== 'closed' && !gone(r.gate)} />
      </div>
      <div className="sc-readout">
        <Row k="GATE 1" v={status[0]} tone={status[1] as Lamp} />
        <Row k="CONVOY" v="HL-7 · OPS-Y2K-0058 · B3 cold storage → HL-OFFSITE" />
        <Row k="WINDOW" v="12/31/99 23:30–00:30 · CAB-1299-11" />
        <Row k="REMOTE" v={r.boydOut ? 'disabled · parent session logged off' : 'svc_gate @ WAR-ROOM-03 · enabled'} tone={r.boydOut ? 'ok' : 'warn'} />
        {r.denied > 0 && <Row k="DENIED" v={`${r.denied} remote override${r.denied > 1 ? 's' : ''}`} />}
      </div>
      {r.gate === 'closed' && <p className="sc-note">Convoy HL-7 is due at the gate at 23:30.</p>}
      {(r.gate === 'requested' || r.gate === 'held') && (
        <div className="sc-actions">
          <button className="btn big" onClick={() => decide('released')}>
            <span>Release convoy</span>
          </button>
          {r.gate === 'requested' && (
            <button className="btn big deny" onClick={() => decide('held')}>
              <span>Hold the gate</span>
            </button>
          )}
        </div>
      )}
      {r.gate === 'requested' && <p className="sc-note">If the NOC doesn't answer by 23:40, the war room opens the gate remotely.</p>}
      {r.gate === 'held' && <p className="sc-note">OPS-Y2K-0058 stops being valid at 00:30. Until then, the war room can try to open the gate remotely.</p>}
    </div>
  );
}

// ------------------------------------------------------------------ RECSYS-Y2K-0047

function JobPanel({ r, minute, me, act }: { r: Roll; minute: number; me: string; act: Act }) {
  const [pick, setPick] = useState<Mode>(r.mode);
  const [help, setHelp] = useState(false);
  const armed = r.job === 'armed' && minute < T.job;
  const left = T.job - Math.floor(minute);
  const status =
    r.job === 'armed'
      ? [`ARMED · runs at 23:50 (in ${left} min)`, r.mode === 'PURGE' ? 'warn' : 'ok']
      : r.job === 'held'
        ? ['HELD · NIGHT LEAD EXCEPTION · did not run', 'ok']
        : r.job === 'rehearsed'
          ? ['COMPLETE · /TEST · SUCCESS · 0 records changed', 'ok']
          : r.job === 'archived'
            ? ['COMPLETE · /ARCHIVE · 4,113 records → tape set D (ODD) · purged', 'bad']
            : ['COMPLETE · /PURGE · 4,113 records deleted', 'bad'];
  return (
    <div className="sc-panel job">
      <article className="sc-card paper">
        <h4>RECSYS-Y2K-0047 · Records System date-rollover patch</h4>
        <Row k="OWNER" v="Office of the Deputy Director" />
        <Row k="WINDOW" v="12/31/99 23:50–00:10 · CAB-1299-03" />
        <Row k="RELEASED" v="12/08/99 · Night Operations" />
        <pre className="sc-cmd">
          RUN \\RECSYS\ARCHIVE\*.* /{r.mode} /UNATTENDED
        </pre>
        <Row k="STATUS" v={status[0]} tone={status[1] as Lamp} />
      </article>
      {armed ? (
        <>
          <fieldset className="sc-modes">
            <legend>Mode switch</legend>
            {(Object.keys(MODES) as Mode[]).map((m) => (
              <label key={m} className={pick === m ? 'on' : ''}>
                <input type="radio" name="mode" checked={pick === m} onChange={() => setPick(m)} />
                <b>/{m}</b>
                {help && <span>{MODES[m]}</span>}
              </label>
            ))}
          </fieldset>
          <div className="sc-actions">
            <button className="btn" onClick={() => (audio.play('click'), setHelp((h) => !h))}>
              <span>{help ? 'Hide help' : 'Help /?'}</span>
            </button>
            <button className="btn big" disabled={pick === r.mode} onClick={() => act(setMode(getState(), pick), `0047 switch changed to /${pick} by ${me} (logged)`, 'beep')}>
              <span>Apply switch</span>
            </button>
            <button
              className="btn big deny"
              onClick={() =>
                confirmDialog(
                  'Hold RECSYS-Y2K-0047',
                  "A night lead exception stops the job outright. It is logged under your name, and the Deputy Director's office is paged.",
                  'Hold the job',
                  () => act(holdJob(getState()), `0047 HELD by ${me} · exception paged to ODD`, 'stamp'),
                )
              }
            >
              <span>Hold the job</span>
            </button>
          </div>
          <p className="sc-note">Changes during the freeze are logged. The job runs unattended at 23:50.</p>
        </>
      ) : (
        <p className="sc-note">{r.job === 'armed' ? 'Running…' : 'The job window is closed.'}</p>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ B3 air handlers

function HvacPanel({ r, minute, say }: { r: Roll; minute: number; say: (l: string) => void }) {
  const locked = r.hvac === 'ok';
  const pa = Math.round(r.pa);
  const tone: Lamp = r.hvac === 'lost' ? 'bad' : pa >= PA_WARN ? 'bad' : r.hvac === 'fault' ? 'warn' : 'ok';
  const run = (cmd: HvacCmd) => {
    const res = hvac(getState(), cmd);
    if (res.effect) applyEffect(res.effect);
    audio.play(res.line.includes('jumped') ? 'error' : res.effect ? 'beep' : 'click');
    say(res.line);
  };
  const pct = Math.max(0, Math.min(100, ((pa + 50) / 50) * 100));
  return (
    <div className="sc-panel hvac">
      <svg className="pid" viewBox="0 0 360 200" role="img" aria-label="B3 air handling schematic">
        <rect width="360" height="200" fill="#0b1310" />
        {/* ducts */}
        <path d="M14 60 H70 M14 140 H70" stroke="#3b4a42" strokeWidth="10" />
        <path d="M130 60 H190 V96 M130 140 H160 M200 140 H190 V104 M190 100 H262" stroke={r.ahu1 === 'isolated' ? '#3b4a42' : '#3b4a42'} strokeWidth="10" fill="none" />
        <path d="M130 60 H190 V100 H262" stroke={r.ahu1 === 'run' ? '#5fd17a' : r.ahu1 === 'fault' ? '#c23b22' : '#26302b'} strokeWidth="3" fill="none" />
        <path d="M130 140 H160" stroke={r.ahu2 === 'run' ? '#5fd17a' : '#26302b'} strokeWidth="3" />
        <path d="M200 140 H190 V100 H262" stroke={r.ahu2 === 'run' && r.d2 === 'open' ? '#5fd17a' : '#26302b'} strokeWidth="3" fill="none" />
        {/* AHU-1 */}
        <g transform="translate(70 36)">
          <rect width="60" height="48" fill="#16201a" stroke={r.ahu1 === 'fault' ? '#c23b22' : '#59605b'} strokeWidth="2" />
          <circle cx="30" cy="24" r="14" fill="none" stroke={r.ahu1 === 'run' ? '#5fd17a' : r.ahu1 === 'fault' ? '#c23b22' : '#3b4a42'} strokeWidth="2" />
          <g className={r.ahu1 === 'run' ? 'fan spin' : 'fan'} style={{ transformOrigin: '30px 24px' }}>
            <path d="M30 24 L30 12 M30 24 L40 30 M30 24 L20 30" stroke={r.ahu1 === 'run' ? '#5fd17a' : '#3b4a42'} strokeWidth="3" />
          </g>
          {r.ahu1 === 'fault' && <path d="M14 8 L46 40 M46 8 L14 40" stroke="#c23b22" strokeWidth="3" />}
          <text x="30" y="62" textAnchor="middle" className="pid-t">AHU-1 · {r.ahu1.toUpperCase()}</text>
        </g>
        {/* AHU-2 */}
        <g transform="translate(70 116)">
          <rect width="60" height="48" fill="#16201a" stroke="#59605b" strokeWidth="2" />
          <circle cx="30" cy="24" r="14" fill="none" stroke={r.ahu2 === 'run' ? '#5fd17a' : '#3b4a42'} strokeWidth="2" />
          <g className={r.ahu2 === 'run' ? 'fan spin' : 'fan'} style={{ transformOrigin: '30px 24px' }}>
            <path d="M30 24 L30 12 M30 24 L40 30 M30 24 L20 30" stroke={r.ahu2 === 'run' ? '#5fd17a' : '#3b4a42'} strokeWidth="3" />
          </g>
          <text x="30" y="62" textAnchor="middle" className="pid-t">AHU-2 · {r.ahu2.toUpperCase()}</text>
        </g>
        {/* damper D-2 */}
        <g transform="translate(180 140)">
          <circle r="11" fill="#0b1310" stroke="#a7aea6" strokeWidth="2" />
          <path d={r.d2 === 'open' ? 'M-9 0 H9' : 'M0 -9 V9'} stroke={r.d2 === 'open' ? '#5fd17a' : '#ffb547'} strokeWidth="3" />
          <text y="26" textAnchor="middle" className="pid-t">D-2 · {r.d2.toUpperCase()}</text>
        </g>
        {/* B3 */}
        <g transform="translate(262 52)">
          <rect width="88" height="100" fill="#16201a" stroke={tone === 'bad' ? '#c23b22' : tone === 'warn' ? '#ffb547' : '#5fd17a'} strokeWidth="2" />
          <text x="44" y="16" textAnchor="middle" className="pid-t">B3</text>
          <text x="44" y="27" textAnchor="middle" className="pid-t">CONTAINMENT</text>
          <text x="44" y="66" textAnchor="middle" className={`pid-pa ${tone}`}>
            {pa}
          </text>
          <text x="44" y="86" textAnchor="middle" className="pid-t">Pa</text>
        </g>
        <text x="14" y="190" className="pid-t">OUTSIDE AIR</text>
        <text x="346" y="190" textAnchor="end" className="pid-t">
          {minute >= T.rollover ? '01/01/1900 ← AHU-1 CLOCK' : 'HVAC-CTL 4.1'}
        </text>
      </svg>
      <div className="sc-meter" aria-label={`B3 differential pressure ${pa} pascals`}>
        <div className="fill" style={{ width: `${pct}%` }} data-tone={tone} />
        <span style={{ left: `${((PA_WARN + 50) / 50) * 100}%` }}>−15</span>
        <span style={{ left: '100%' }}>0 · LOST</span>
      </div>
      {locked && <p className="sc-note">HVAC-CTL is locked by the change freeze. Manual control unlocks on a fault.</p>}
      {r.hvac === 'stable' && <p className="sc-note ok">B3 is on AHU-2. Pressure holding.</p>}
      <div className="sc-hvac">
        {(
          [
            ['ahu2', 'AHU-2', 'Start', r.ahu2 === 'run'],
            ['d2', 'Damper D-2', 'Open', r.d2 === 'open'],
            ['ahu1', 'AHU-1', 'Isolate', r.ahu1 === 'isolated'],
          ] as const
        ).map(([cmd, name, verb, done]) => (
          <div key={cmd} className="sc-hrow">
            <span>{name}</span>
            <button className="btn big" disabled={locked || done || r.hvac === 'lost'} onClick={() => run(cmd)}>
              <span>{done ? 'Done' : verb}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ sessions

function SessionsPanel({ r, me, say }: { r: Roll; me: string; say: (l: string) => void }) {
  const flags = useGame((s) => s.flags);
  // Boyd's service account dies with his session; the records service restarts itself.
  const out = (u: SessionUser) => (u === 'cboyd' || u === 'svc_gate' ? r.boydOut : u === 'svc_recsys' ? false : !!flags[`r_rev_${u}`]);
  return (
    <div className="sc-panel sessions">
      <table className="sc-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Host</th>
            <th>Since</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr className="me">
            <td>{me}</td>
            <td>OPS-NOC-01</td>
            <td>21:58</td>
            <td>this session</td>
          </tr>
          {SESSIONS.map((x) => {
            const gone = out(x.user);
            return (
              <tr key={x.user} className={gone ? 'gone' : ''}>
                <td>
                  {x.user}
                  <small>{x.who}</small>
                </td>
                <td>{x.host}</td>
                <td>{x.since}</td>
                <td>
                  {gone ? (
                    'logged off'
                  ) : (
                    <button
                      className="btn"
                      onClick={() =>
                        confirmDialog(
                          'Revoke session',
                          `Log ${x.user}@${x.host} off the network?\n\nRevoking a session during the change freeze is logged under your name.`,
                          'Revoke',
                          () => {
                            const res = revoke(getState(), x.user);
                            applyEffect(res.effect);
                            audio.play('stamp');
                            say(res.line);
                          },
                        )
                      }
                    >
                      <span>Revoke</span>
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="sc-note">Service accounts restart on their own. People don't.</p>
    </div>
  );
}

// ------------------------------------------------------------------ fax

const RECIPIENTS: { id: 'fbi' | 'press' | 'lantern'; label: string; detail: string; when: (f: Record<string, unknown>) => boolean }[] = [
  { id: 'fbi', label: 'FBI · Special Agent Ruth Calloway', detail: '(412) 555-0193 · Pittsburgh Field Office', when: (f) => !!f.fbi_contact },
  { id: 'press', label: 'The Washington Ledger · Simon Hale', detail: '(202) 555-0148 · newsroom', when: (f) => !!f.reyes_press },
  { id: 'lantern', label: 'LANTERN', detail: '+43 1 · relay, Vienna', when: () => true },
];

function FaxPanel({ r, minute, say }: { r: Roll; minute: number; say: (l: string) => void }) {
  const flags = useGame((s) => s.flags);
  const notes = useGame((s) => s.notes.length);
  const solved = useGame((s) => (s.solved ?? []).length);
  const [to, setTo] = useState<'fbi' | 'press' | 'lantern' | null>(null);
  const open = faxOpen(getState());
  const records = r.job === 'held' || r.job === 'rehearsed' ? 'RECSYS archive · 4,113 records (the manifests, the sensor logs, the work orders)' : r.job === 'armed' ? 'RECSYS archive · still on the server' : 'RECSYS archive · nothing left to send';
  const sentTo = RECIPIENTS.find((x) => x.id === r.fax);
  return (
    <div className="sc-panel fax">
      {r.fax ? (
        <p className="sc-note ok">
          Sent to {sentTo?.label}. {notes + solved + (r.job === 'held' || r.job === 'rehearsed' ? 40 : 0) + 3} pages. The machine is still warm.
        </p>
      ) : !open ? (
        <p className="sc-note">
          Outside lines are forwarded to the war room until 00:30 (OPS-Y2K-0065). Anything sent from the NOC before then goes through the war room's switchboard.
          {minute < T.window && ` Lines return in ${T.window - Math.floor(minute)} min.`}
        </p>
      ) : (
        <>
          <p className="sc-note">The line is yours until 01:00. What goes out:</p>
          <ul className="sc-list">
            <li>Your notes · {notes}</li>
            <li>Confirmed case files · {solved} of 5</li>
            <li>{records}</li>
            <li>Gate 1 log · {gone(r.gate) ? `convoy departed ${hhmm(r.gateAt)}` : 'convoy still inside the fence'}</li>
          </ul>
          <div className="sc-recips">
            {RECIPIENTS.filter((x) => x.when(flags)).map((x) => (
              <button key={x.id} className={`recip ${to === x.id ? 'on' : ''}`} onClick={() => (audio.play('click'), setTo(x.id))}>
                <b>{x.label}</b>
                <span>{x.detail}</span>
              </button>
            ))}
          </div>
          <div className="sc-actions">
            <button
              className="btn big"
              disabled={!to}
              onClick={() =>
                to &&
                confirmDialog('Send fax', `Send everything to ${RECIPIENTS.find((x) => x.id === to)?.label}?\n\nThere is one line and one night. You can send it once.`, 'Send', () => {
                  const e = sendFax(getState(), to);
                  if (!e) return;
                  applyEffect(e);
                  audio.play('printer');
                  say(`FAX · dialing… connected · ${notes + solved + 3} pages sent`);
                })
              }
            >
              <span>Send</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
