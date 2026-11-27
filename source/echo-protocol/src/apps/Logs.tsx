import { useMemo } from 'react';
import { addNote, addSuspicion, nightDef, setFlag, useGame } from '../engine/store';
import { clockAt, personByBadge, shortName } from '../engine/text';
import { BADGE_LOG, PURGE_AT } from '../content/night1';
import { confirmDialog, flashEye, setUi, useUi } from '../os/ui';
import { CAMS, Cctv, type CamId } from './Cctv';
import { audio } from '../engine/audio';

const VAULT = 'B3-VAULT';

export function LogsApp({ compact }: { compact: boolean }) {
  const tab = useUi((u) => u.logTab);
  return (
    <div className="app col">
      <div className="tabs" role="tablist">
        <button className={`tab ${tab === 'badge' ? 'on' : ''}`} role="tab" onClick={() => setUi({ logTab: 'badge' })}>
          Badge access log
        </button>
        <button className={`tab ${tab === 'cams' ? 'on' : ''}`} role="tab" onClick={() => setUi({ logTab: 'cams' })}>
          Cameras
        </button>
      </div>
      {tab === 'badge' ? <BadgeLog compact={compact} /> : <Cameras />}
    </div>
  );
}

function BadgeLog({ compact }: { compact: boolean }) {
  const filter = useUi((u) => u.logFilter);
  const minute = useGame((s) => s.night.minute);
  const profile = useGame((s) => s.profile);
  const escalated = useGame((s) => s.flags.n1_whitlock === 'escalated');
  const copied = useGame((s) => !!s.flags.n1_copied_log);
  const q = filter.trim().toLowerCase();

  const rows = useMemo(() => {
    const visible = BADGE_LOG.filter((e) => e.at === undefined || e.at <= minute);
    return visible
      .map((e) => {
        const vault = e.reader === VAULT;
        const who = vault ? null : personByBadge(e.badge, profile);
        const purged = escalated && e.badge === '0417' && e.at === 252 && minute >= PURGE_AT;
        return { e, vault, who, purged, name: vault ? 'COMPARTMENTED' : who ? shortName(who).toUpperCase() : 'UNKNOWN' };
      })
      .filter((r) => {
        if (!q) return true;
        if (r.vault) return r.e.reader.toLowerCase().includes(q);
        return r.e.badge.includes(q) || r.e.reader.toLowerCase().includes(q) || r.name.toLowerCase().includes(q);
      })
      .reverse();
  }, [minute, profile, escalated, q]);

  const isWhitlock = q === '0417' || q.includes('whitlock');
  const copy = () =>
    confirmDialog(
      'Sentinel · copy to personal storage',
      'Copying access records to personal storage is logged by SENTINEL under your login.\n\nContinue?',
      'Copy',
      () => {
        const body = rows
          .filter((r) => !r.purged)
          .map((r) => `${r.e.date} ${r.e.time}  ${r.e.reader.padEnd(10)} ${r.e.badge}  ${r.e.event}`)
          .join('\n');
        if (addNote({ id: 'n1-0417-log', title: 'Badge 0417 · access history', body })) {
          addSuspicion(6);
          setFlag('n1_copied_log', true);
          audio.play('printer');
          flashEye();
        }
      },
    );

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
  const alertIn = useGame((s) => s.night.arrived.includes('n1a1'));
  const checked = useGame((s) => !!s.flags.n1_cam_checked);
  const def = nightDef();
  const now = clockAt(def, minute);
  const live: CamId[] = ['gate', 'corridor'];
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
        {alertIn ? (
          checked ? (
            <Cctv cam="b3east" date="12/07/99" time="03:12:44" unavailable={'SCHEDULED MAINTENANCE 03:11–03:14\nWO-7731 · REQUESTED BY: [RESTRICTED]'} />
          ) : (
            <div className="cam-pick">
              <button
                className="btn"
                onClick={() => {
                  audio.play('click');
                  setFlag('n1_cam_checked', true);
                }}
              >
                Request still · 03:12:44
              </button>
            </div>
          )
        ) : (
          <Cctv cam="b3east" date={now.date} time={`${now.time}:00`} />
        )}
      </div>
    </div>
  );
}
