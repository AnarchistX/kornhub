import { useMemo } from 'react';
import type { AlertTicket } from '../engine/types';
import { applyEffect, getState, nightDef, setFlag, useGame } from '../engine/store';
import { clockAt, personByBadge, shortName } from '../engine/text';
import { BADGE_LOG, CAMERA_WORK_ORDERS, purgedEntry, visibleEntry } from '../content/badgelog';
import { SESSION_LOG, visibleSession } from '../content/sessions';
import { fill } from '../engine/text';
import { confirmDialog, flashEye, setUi, useUi } from '../os/ui';
import { CAMS, Cctv, type CamId } from './Cctv';
import { audio } from '../engine/audio';

const VAULT = 'B3-VAULT';

export function LogsApp({ compact }: { compact: boolean }) {
  const tab = useUi((u) => u.logTab);
  const lead = useGame((s) => !!s.flags.lead);
  return (
    <div className="app col">
      <div className="tabs" role="tablist">
        <button className={`tab ${tab === 'badge' ? 'on' : ''}`} role="tab" onClick={() => setUi({ logTab: 'badge' })}>
          Badge access log
        </button>
        <button className={`tab ${tab === 'cams' ? 'on' : ''}`} role="tab" onClick={() => setUi({ logTab: 'cams' })}>
          Cameras
        </button>
        {lead && (
          <button className={`tab ${tab === 'sessions' ? 'on' : ''}`} role="tab" onClick={() => setUi({ logTab: 'sessions' })}>
            Sessions
          </button>
        )}
      </div>
      {tab === 'badge' ? <BadgeLog compact={compact} /> : tab === 'sessions' && lead ? <Sessions /> : <Cameras />}
    </div>
  );
}

function BadgeLog({ compact }: { compact: boolean }) {
  const filter = useUi((u) => u.logFilter);
  const minute = useGame((s) => s.night.minute);
  const n = useGame((s) => s.night.n);
  const flags = useGame((s) => s.flags);
  const profile = useGame((s) => s.profile);
  const copied = useGame((s) => s.notes.some((x) => x.id === 'n1-0417-log'));
  const q = filter.trim().toLowerCase();

  const rows = useMemo(() => {
    const s = getState();
    return BADGE_LOG.filter((e) => visibleEntry(e, s))
      .map((e) => {
        const vault = e.reader === VAULT;
        const who = vault ? null : personByBadge(e.badge, profile);
        return { e, vault, purged: purgedEntry(e, s), name: vault ? 'COMPARTMENTED' : who ? shortName(who).toUpperCase() : 'UNKNOWN' };
      })
      .filter((r) => {
        if (!q) return true;
        if (r.vault) return r.e.reader.toLowerCase().includes(q);
        return r.e.badge.includes(q) || r.e.reader.toLowerCase().includes(q) || r.name.toLowerCase().includes(q);
      })
      .reverse();
    // minute/n/flags drive visibility and purges
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minute, n, flags, profile, q]);

  const isWhitlock = q === '0417' || q.includes('whitlock');
  const copy = () =>
    confirmDialog('Sentinel · copy to personal storage', 'Copying access records to personal storage is logged by SENTINEL under your login.\n\nContinue?', 'Copy', () => {
      const body = rows
        .filter((r) => !r.purged)
        .map((r) => `${r.e.date} ${r.e.time}  ${r.e.reader.padEnd(10)} ${r.e.badge}  ${r.e.event}`)
        .join('\n');
      applyEffect({ suspicion: 6, flags: { n1_copied_log: true }, note: { id: 'n1-0417-log', title: 'Badge 0417 · access history', body } });
      audio.play('printer');
      flashEye();
    });

  return (
    <>
      <div className="toolbar">
        <input
          className="field"
          style={{ flex: compact ? 1 : '0 1 260px' }}
          placeholder="Filter: badge, reader, name"
          value={filter}
          onChange={(e) => setUi({ logFilter: e.target.value })}
          aria-label="Filter badge log"
          inputMode="search"
        />
        {filter && (
          <button className="btn" onClick={() => setUi({ logFilter: '' })}>
            Clear
          </button>
        )}
        {isWhitlock && rows.length > 0 && (
          <button className="btn" onClick={copy} disabled={copied}>
            {copied ? 'Copied to notes' : 'Copy to notes'}
          </button>
        )}
      </div>
      <div className="scroll" style={{ flex: 1, minHeight: 0, background: '#fbf8f0' }}>
        {rows.length === 0 && <div className="empty">No matching records.</div>}
        {compact ? (
          <div className="log-cards">
            {rows.map((r, i) => (
              <div key={i} className={`log-card ${q && !r.vault ? 'hit' : ''} ${r.purged ? 'purged' : ''}`}>
                {r.purged ? (
                  <span style={{ gridColumn: '1 / -1' }}>RECORD PURGED 12/07/99 04:16 · SENTINEL ADMIN</span>
                ) : (
                  <>
                    <span className="who">{r.vault ? <span className="masked">████ COMPARTMENTED</span> : `${r.e.badge} · ${r.name}`}</span>
                    <span>{r.e.event}</span>
                    <span>
                      {r.e.date} {r.e.time}
                    </span>
                    <span>{r.e.reader}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <table className="log-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Reader</th>
                <th>Badge</th>
                <th>Name</th>
                <th>Event</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) =>
                r.purged ? (
                  <tr key={i} className="purged">
                    <td colSpan={6}>RECORD PURGED 12/07/99 04:16 · SENTINEL ADMIN</td>
                  </tr>
                ) : (
                  <tr key={i} className={q && !r.vault ? 'hit' : ''}>
                    <td>{r.e.date}</td>
                    <td>{r.e.time}</td>
                    <td>{r.e.reader}</td>
                    <td className={r.vault ? 'masked' : ''}>{r.vault ? '████' : r.e.badge}</td>
                    <td>{r.name}</td>
                    <td>{r.e.event}</td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function Cameras() {
  const minute = useGame((s) => s.night.minute);
  const n = useGame((s) => s.night.n);
  const arrived = useGame((s) => s.night.arrived);
  const flags = useGame((s) => s.flags);
  const scheduleCopied = useGame((s) => s.notes.some((x) => x.id === 'cam-wo'));
  const def = nightDef();
  const now = clockAt(def, minute);
  const live: CamId[] = ['gate', 'corridor'];
  const alert = def.tickets.find((t): t is AlertTicket => t.kind === 'alert' && !!t.camera && arrived.includes(t.id));
  const camKey = alert ? `${alert.id}_cam` : '';
  const result = alert?.camera ? alert.camera(getState()) : null;

  const copySchedule = () =>
    confirmDialog('Sentinel · copy to personal storage', 'Copying work orders to personal storage is logged by SENTINEL under your login.\n\nContinue?', 'Copy', () => {
      applyEffect({
        suspicion: 6,
        note: {
          id: 'cam-wo',
          title: 'B3-EAST-CAM-2 · maintenance work orders',
          body: CAMERA_WORK_ORDERS.map((w) => `${w.wo}  ${w.date}  ${w.window}  requested by: [RESTRICTED]`).join('\n'),
        },
      });
      audio.play('printer');
      flashEye();
    });

  return (
    <div className="cams scroll" style={{ flex: 1, minHeight: 0 }}>
      {live.map((c) => (
        <div key={c}>
          <div className="section-t" style={{ marginTop: 0 }}>
            {CAMS[c].id} · {CAMS[c].name} · live
          </div>
          <Cctv cam={c} date={now.date} time={`${now.time}:${String((minute * 7) % 60).padStart(2, '0')}`} />
        </div>
      ))}
      <div>
        <div className="section-t" style={{ marginTop: 0 }}>
          {CAMS.b3east.id} · {CAMS.b3east.name} · stills by request
        </div>
        {alert && result ? (
          flags[camKey] ? (
            <Cctv cam={result.cam} date={result.date} time={result.time} unavailable={result.unavailable} figure={result.figure} />
          ) : (
            <div className="cam-pick">
              <button
                className="btn"
                onClick={() => {
                  audio.play('click');
                  setFlag(camKey, true);
                }}
              >
                Request still · {result.time}
              </button>
            </div>
          )
        ) : (
          <Cctv cam="b3east" date={now.date} time={`${now.time}:00`} />
        )}
      </div>
      {n >= 2 && (
        <div>
          <div className="section-t" style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            B3-EAST-CAM-2 · maintenance work orders
            <button className="btn" style={{ minHeight: 28 }} onClick={copySchedule} disabled={scheduleCopied}>
              {scheduleCopied ? 'Copied' : 'Copy to notes'}
            </button>
          </div>
          <table className="log-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Window</th>
                <th>Requested by</th>
              </tr>
            </thead>
            <tbody>
              {CAMERA_WORK_ORDERS.map((w) => (
                <tr key={w.wo}>
                  <td>{w.wo}</td>
                  <td>{w.date}</td>
                  <td>{w.window}</td>
                  <td className="masked">[RESTRICTED]</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Sessions() {
  const minute = useGame((s) => s.night.minute);
  const n = useGame((s) => s.night.n);
  const copied = useGame((s) => s.notes.some((x) => x.id === 'sessions'));
  void minute;
  void n;
  const st = getState();
  const rows = SESSION_LOG.filter((e) => visibleSession(e, st)).reverse();
  const text = (v: string) => fill(v, st).replace(/\{LOGIN\}/g, fill('{login}', st).toUpperCase());
  const copy = () =>
    confirmDialog('Sentinel · copy to personal storage', 'Copying the session audit to personal storage is logged by SENTINEL under your login.\n\nContinue?', 'Copy', () => {
      applyEffect({
        suspicion: 6,
        note: {
          id: 'sessions',
          title: 'SENTINEL session audit (excerpt)',
          body: rows
            .filter((r) => r.hot)
            .map((r) => `${r.date} ${r.time}  ${text(r.user).padEnd(10)} ${r.app.padEnd(9)} ${text(r.action)}`)
            .join('\n'),
        },
      });
      audio.play('printer');
      flashEye();
    });
  return (
    <>
      <div className="toolbar">
        <span style={{ font: '600 11px var(--f-mono)', letterSpacing: '0.1em', color: 'var(--text-dim)' }}>NIGHT LEAD · SESSION AUDIT</span>
        <button className="btn" style={{ marginLeft: 'auto' }} onClick={copy} disabled={copied}>
          {copied ? 'Copied to notes' : 'Copy to notes'}
        </button>
      </div>
      <div className="scroll" style={{ flex: 1, minHeight: 0, background: '#fbf8f0' }}>
        <table className="log-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>User</th>
              <th>App</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={r.hot ? 'hit' : ''}>
                <td>{r.date}</td>
                <td>{r.time}</td>
                <td>{text(r.user)}</td>
                <td>{r.app}</td>
                <td style={{ whiteSpace: 'normal' }}>{text(r.action)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
