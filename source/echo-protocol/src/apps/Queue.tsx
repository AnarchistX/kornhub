import { useEffect, useMemo, useState } from 'react';
import type { AccessTicket, AlertTicket, DirectiveId, TicketResult } from '../engine/types';
import { decideAccess, getState, nightDef, resolveAlert, setFlag, useGame } from '../engine/store';
import { clockAt, personById } from '../engine/text';
import { DIRECTIVES } from '../content/world';
import { getUi, openApp, setUi, useUi } from '../os/ui';
import { PersonnelRecord, RequestForm } from './docs';
import { Cctv } from './Cctv';
import { BackIcon, RulesIcon } from '../art/icons';
import { DirectivesBody } from './Directives';
import { audio } from '../engine/audio';

const TUTORIAL: Record<string, string> = {
  approve:
    "ROOKIE —\nLeft is the REQUEST. Right is their PERSONNEL record.\nOPS needs Level 2. Dwayne is L2, his badge is good, and Brennan (his supervisor) signed it.\nAll clean → APPROVE.",
  clearance: 'Every area has a level. The table is in your DIRECTIVES.\nClearance too low → DENY, and cite D-1. —R',
  badge: 'Always check the badge expiry against the DATE OF ACCESS. —R',
};

function statusChip(r?: TicketResult) {
  if (!r) return <span className="chip pend">Pending</span>;
  const label = { approve: 'Approved', deny: 'Denied', forward: 'Fwd', log: 'Logged', escalate: 'Escalated' }[r.decision];
  const cls = r.decision === 'approve' ? 'ok' : r.decision === 'forward' || r.decision === 'log' ? 'fwd' : 'bad';
  return <span className={`chip ${cls}`}>{label}</span>;
}

export function QueueApp({ compact }: { compact: boolean }) {
  const def = nightDef();
  const arrived = useGame((s) => s.night.arrived);
  const results = useGame((s) => s.night.results);
  const sel = useUi((u) => u.queueSel);
  const [rules, setRules] = useState(false);
  const tickets = useMemo(() => def.tickets.filter((t) => arrived.includes(t.id)), [def, arrived]);
  const pending = tickets.filter((t) => !results[t.id]);

  // Desktop: always show something. Pick the oldest pending ticket when nothing is selected.
  useEffect(() => {
    if (compact) return;
    if (!sel && tickets.length) setUi({ queueSel: (pending[0] ?? tickets[tickets.length - 1]).id });
  }, [compact, sel, tickets, pending]);

  const current = tickets.find((t) => t.id === sel) ?? null;

  const list = (
    <div className="pane-list">
      <div className="head">
        Incoming · {pending.length} pending
      </div>
      <div className="rows scroll">
        {tickets.length === 0 && <div className="empty">Queue empty.{'\n'}Tickets arrive through the night.</div>}
        {tickets.map((t) => {
          const who = t.kind === 'access' ? personById(t.requester, null) : null;
          const r = results[t.id];
          return (
            <button key={t.id} className={`row ${sel === t.id ? 'on' : ''} ${!r ? 'unread' : ''}`} onClick={() => setUi({ queueSel: t.id })}>
              <span className="top">
                <span>{t.ref}</span>
                <span className="meta">{statusChip(r)}</span>
              </span>
              <span className="name">{t.kind === 'access' ? (who ? `${who.last}, ${who.first}` : 'Operator') : (t as AlertTicket).title}</span>
              <span className="sub">{t.kind === 'access' ? `Access · ${t.area === 'B3V' ? 'B3-V' : t.area}` : 'Sentinel security event'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  if (compact && !current) return <div className="app compact-app">{list}</div>;

  return (
    <div className={`app ${compact ? 'compact-app' : ''}`}>
      {!compact && list}
      <div className="pane-main">
        {compact && (
          <div className="toolbar">
            <button className="btn" onClick={() => setUi({ queueSel: null })}>
              <BackIcon className="" />
              <span>Queue</span>
            </button>
            <span style={{ font: '500 12px var(--f-mono)', marginLeft: 'auto' }}>{current?.ref}</span>
            <button className="btn" onClick={() => setRules(true)}>
              <RulesIcon />
              <span>Rules</span>
            </button>
          </div>
        )}
        {current ? (
          current.kind === 'access' ? (
            <AccessView key={current.id} t={current} compact={compact} />
          ) : (
            <AlertView key={current.id} t={current} />
          )
        ) : (
          <div className="empty">No ticket selected.</div>
        )}
      </div>
      {rules && (
        <>
          <div className="sheet-scrim" onClick={() => setRules(false)} />
          <div className="sheet">
            <div className="win-title">
              <span className="t">Directives</span>
              <button className="win-x" aria-label="Close" onClick={() => setRules(false)}>
                ×
              </button>
            </div>
            <div className="scroll" style={{ flex: 1, minHeight: 0 }}>
              <DirectivesBody />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function AccessView({ t, compact }: { t: AccessTicket; compact: boolean }) {
  const profile = useGame((s) => s.profile);
  const result = useGame((s) => s.night.results[t.id]);
  const directives = useGame((s) => s.night.directives);
  const [citing, setCiting] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const who = personById(t.requester, profile);

  useEffect(() => {
    const el = document.querySelector('.ticket-scroll');
    if (!el) return;
    const ro = new ResizeObserver(() => setNarrow(el.clientWidth < 700));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const decide = (d: 'approve' | 'deny' | 'forward', cite?: DirectiveId) => {
    setCiting(false);
    decideAccess(t.id, d, cite);
    // Advance to the next pending ticket after the stamp lands.
    window.setTimeout(() => {
      const n = getState().night;
      const next = nightDef().tickets.find((x) => n.arrived.includes(x.id) && !n.results[x.id]);
      if (next && getUi().queueSel === t.id) setUi({ queueSel: next.id });
      else if (compact && getUi().queueSel === t.id && !next) setUi({ queueSel: null });
    }, 900);
  };

  const tut = t.tutorial ? TUTORIAL[t.tutorial] : null;
  const missed = result && !result.correct;

  return (
    <div className={`ticket-view ${narrow || compact ? 'narrow' : ''}`}>
      <div className="ticket-scroll scroll">
        {tut && !result && <div className="tut sticky">{tut}</div>}
        {missed && t.tutorial && <div className="tut sticky miss">{`Nope. ${result.error}\nThat one's on me. Next one counts. —R`}</div>}
        {missed && !t.tutorial && <div className="tut sticky miss">{`AUDIT FLAG: ${result.error}`}</div>}
        <div className="docs">
          <RequestForm t={t} profile={profile} result={result} />
          {who && <PersonnelRecord p={who} profile={profile} />}
        </div>
      </div>
      {!result ? (
        <div className="decide">
          <span className="lbl">Decision</span>
          <button className="btn big approve" onClick={() => decide('approve')}>
            <span>Approve</span>
          </button>
          <button className="btn big deny" onClick={() => (audio.play('click'), setCiting(true))}>
            <span>Deny…</span>
          </button>
          {directives.includes('D5') && (
            <button className="btn big forward" onClick={() => decide('forward')}>
              <span>Forward</span>
            </button>
          )}
        </div>
      ) : (
        <div className="decide">
          <span className="lbl" style={{ display: 'block' }}>
            Filed {t.ref} · {result.decision === 'deny' && result.cite ? `Denied (${DIRECTIVES[result.cite].code})` : result.decision}
          </span>
        </div>
      )}
      {citing && (
        <div className="scrim" onClick={() => setCiting(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Cite a directive">
            <div className="win-title">
              <span className="t">Deny · cite directive</span>
              <button className="win-x" aria-label="Cancel" onClick={() => setCiting(false)}>
                ×
              </button>
            </div>
            <div className="cite-menu">
              {directives
                .filter((d) => d !== 'D5')
                .map((d) => (
                  <button key={d} className="btn" onClick={() => decide('deny', d)}>
                    <span>
                      <b>{DIRECTIVES[d].code}</b> {DIRECTIVES[d].cite}
                    </span>
                  </button>
                ))}
            </div>
            <div className="dialog-actions">
              <button className="btn" onClick={() => setCiting(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AlertView({ t }: { t: AlertTicket }) {
  const result = useGame((s) => s.night.results[t.id]);
  const camChecked = useGame((s) => !!s.flags.n1_cam_checked);
  const [cam, setCam] = useState(camChecked);
  const def = nightDef();
  const { date } = clockAt(def, t.at);

  const lookup = () => {
    audio.play('click');
    openApp('personnel', { personnel: 'whitlock' });
  };
  const history = () => {
    audio.play('click');
    openApp('logs', { logFilter: '0417', logTab: 'badge' });
  };
  const still = () => {
    audio.play('click');
    setCam(true);
  };

  return (
    <div className="ticket-view">
      <div className="ticket-scroll scroll">
        <section className="alert-panel" aria-label="Sentinel security event">
          <h3>SENTINEL SECURITY EVENT</h3>
          <div>{t.ref}</div>
          <div className="rule" />
          <dl>
            <dt>EVENT</dt>
            <dd>READER FAULT (SUSPECTED)</dd>
            <dt>READER</dt>
            <dd>B3-EAST-2 · Containment B3, east airlock</dd>
            <dt>TIME</dt>
            <dd>{date} 03:12:44</dd>
            <dt>BADGE</dt>
            <dd>
              0417{' '}
              <button className="alink" onClick={lookup}>
                [look up]
              </button>
            </dd>
            <dt>RESULT</dt>
            <dd>ACCESS GRANTED · no door-open event recorded</dd>
            <dt>MATCHES</dt>
            <dd>KI-114 (B3 phantom reads after midnight)</dd>
          </dl>
          <div className="rule" />
          <div className="alert-tools">
            <button className="alink" onClick={history}>
              [pull badge history]
            </button>
            <button className="alink" onClick={still}>
              [request camera still]
            </button>
          </div>
          {cam && <CamStill />}
          {result && (
            <div className="alert-result">
              {result.decision === 'log' ? '> LOGGED AS READER FAULT · KI-114 · CLOSED' : '> ESCALATED TO SECURITY · SEC-4471 · AWAITING REVIEW'}
            </div>
          )}
        </section>
      </div>
      {!result && (
        <div className="decide">
          <span className="lbl">Disposition</span>
          <button className="btn big" onClick={() => resolveAlert(t.id, 'log')}>
            <span>Log as reader fault</span>
          </button>
          <button className="btn big deny" onClick={() => resolveAlert(t.id, 'escalate')}>
            <span>Escalate to Security</span>
          </button>
        </div>
      )}
    </div>
  );
}

function CamStill() {
  useEffect(() => {
    setFlag('n1_cam_checked', true);
  }, []);
  return <Cctv cam="b3east" date="12/07/99" time="03:12:44" unavailable={'SCHEDULED MAINTENANCE 03:11–03:14\nWO-7731 · REQUESTED BY: [RESTRICTED]'} />;
}
