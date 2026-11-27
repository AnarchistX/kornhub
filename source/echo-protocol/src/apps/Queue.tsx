import { useEffect, useMemo, useRef, useState } from 'react';
import type { AccessTicket, AlertTicket, ChangeTicket, DirectiveId, RecordsTicket, Ticket } from '../engine/types';
import { applyEffect, decide, getState, nightDef, resolveAlert, setFlag, useGame } from '../engine/store';
import { personById } from '../engine/text';
import { DIRECTIVES, RECORDS } from '../content/world';
import { confirmDialog, flashEye, getUi, openApp, setUi, useUi } from '../os/ui';
import { CalendarDoc, ChangeForm, PersonnelRecord, RecordCard, RecordsForm, RequestForm } from './docs';
import { Cctv } from './Cctv';
import { BackIcon, RulesIcon } from '../art/icons';
import { DirectivesBody } from './Directives';
import { audio } from '../engine/audio';

const TUTORIAL: Record<string, string> = {
  approve:
    "ROOKIE —\nLeft is the REQUEST. Right is their PERSONNEL record.\nOPS needs Level 2. Dwayne is L2, his badge is good, and Brennan (his supervisor) signed it.\nAll clean → APPROVE.",
  clearance: 'Every area has a level. The table is in your DIRECTIVES.\nClearance too low → DENY, and cite D-1. —R',
  badge: 'Always check the badge expiry against the DATE OF ACCESS. —R',
  change: 'CHANGE ticket. Find this change ID on the calendar (right).\nSame system, same CAB number, same window → APPROVE. —R',
  window: 'Read the window to the minute. Calendar says one thing, ticket says another → DENY, D-8. —R',
  records: 'RECORDS ticket. Record card says level + owner.\nRequester needs the level AND the department. Both → APPROVE. —R',
  need: "Carla is L3. That record is L4. Same department doesn't save her → D-9. —R",
};

const CITES: Record<'access' | 'change' | 'records', DirectiveId[]> = {
  access: ['D1', 'D2', 'D3', 'D4'],
  change: ['D6', 'D7', 'D8'],
  records: ['D9', 'D10', 'D4'],
};

function rowLabel(t: Ticket) {
  switch (t.kind) {
    case 'access': {
      const who = personById(t.requester, getState().profile);
      return { name: who ? `${who.last}, ${who.first}` : 'Operator', sub: `Access · ${t.area === 'B3V' ? 'B3-V' : t.area}` };
    }
    case 'change':
      return { name: t.change, sub: `Change · ${t.system}` };
    case 'records': {
      const who = personById(t.requester, getState().profile);
      return { name: who ? `${who.last}, ${who.first}` : 'Operator', sub: `Records · ${t.record}` };
    }
    case 'alert':
      return { name: t.title, sub: 'Sentinel event' };
  }
}

function statusChip(decision?: string) {
  if (!decision) return <span className="chip pend">Pending</span>;
  const label: Record<string, string> = { approve: 'Approved', deny: 'Denied', forward: 'Fwd', log: 'Logged', escalate: 'Escalated' };
  const cls = decision === 'approve' ? 'ok' : decision === 'forward' || decision === 'log' ? 'fwd' : 'bad';
  return <span className={`chip ${cls}`}>{label[decision]}</span>;
}

export function QueueApp({ compact }: { compact: boolean }) {
  const def = nightDef();
  const arrived = useGame((s) => s.night.arrived);
  const results = useGame((s) => s.night.results);
  const sel = useUi((u) => u.queueSel);
  const [rules, setRules] = useState(false);
  const tickets = useMemo(() => def.tickets.filter((t) => arrived.includes(t.id)), [def, arrived]);
  const pending = tickets.filter((t) => !results[t.id]);

  useEffect(() => {
    if (compact) return;
    if (!sel || !tickets.some((t) => t.id === sel)) {
      if (tickets.length) setUi({ queueSel: (pending[0] ?? tickets[tickets.length - 1]).id });
    }
  }, [compact, sel, tickets, pending]);

  const current = tickets.find((t) => t.id === sel) ?? null;

  const list = (
    <div className="pane-list">
      <div className="head">Incoming · {pending.length} pending</div>
      <div className="rows scroll">
        {tickets.length === 0 && <div className="empty">Queue empty.{'\n'}Tickets arrive through the night.</div>}
        {tickets.map((t) => {
          const r = results[t.id];
          const l = rowLabel(t);
          return (
            <button key={t.id} className={`row ${sel === t.id ? 'on' : ''} ${!r ? 'unread' : ''}`} onClick={() => setUi({ queueSel: t.id })}>
              <span className="top">
                <span>{t.ref}</span>
                <span className="meta">{statusChip(r?.decision)}</span>
              </span>
              <span className="name">{l.name}</span>
              <span className="sub">{l.sub}</span>
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
              <BackIcon />
              <span>Queue</span>
            </button>
            <span style={{ font: '500 12px var(--f-mono)', marginLeft: 'auto' }}>{current?.ref}</span>
            <button className="btn" onClick={() => setRules(true)}>
              <RulesIcon />
              <span>Rules</span>
            </button>
          </div>
        )}
        {current ? <TicketView key={current.id} t={current} compact={compact} /> : <div className="empty">No ticket selected.</div>}
      </div>
      {rules && (
        <>
          <div className="sheet-scrim" onClick={() => setRules(false)} />
          <div className="sheet">
            <div className="win-title">
              <span className="t">Binder</span>
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

function TicketView({ t, compact }: { t: Ticket; compact: boolean }) {
  if (t.kind === 'alert') return <AlertView t={t} />;
  return <DecisionView t={t} compact={compact} />;
}

function useNarrow() {
  const ref = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setNarrow(el.clientWidth < 700));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, narrow] as const;
}

function DecisionView({ t, compact }: { t: AccessTicket | ChangeTicket | RecordsTicket; compact: boolean }) {
  const profile = useGame((s) => s.profile);
  const result = useGame((s) => s.night.results[t.id]);
  const directives = useGame((s) => s.night.directives);
  const [citing, setCiting] = useState(false);
  const [ref, narrow] = useNarrow();

  const choose = (d: 'approve' | 'deny' | 'forward', cite?: DirectiveId) => {
    setCiting(false);
    decide(t.id, d, cite);
    window.setTimeout(() => {
      const n = getState().night;
      const next = nightDef().tickets.find((x) => n.arrived.includes(x.id) && !n.results[x.id]);
      if (next && getUi().queueSel === t.id) setUi({ queueSel: next.id });
      else if (compact && getUi().queueSel === t.id && !next) setUi({ queueSel: null });
    }, 900);
  };

  const tut = t.tutorial ? TUTORIAL[t.tutorial] : null;
  const missed = result && !result.correct;
  const cites = CITES[t.kind].filter((d) => directives.includes(d));
  const canForward = t.kind !== 'change' && directives.includes('D5');

  let docs: React.ReactNode;
  if (t.kind === 'access') {
    const who = personById(t.requester, profile);
    docs = (
      <>
        <RequestForm t={t} profile={profile} result={result} />
        {who && <PersonnelRecord p={who} profile={profile} />}
      </>
    );
  } else if (t.kind === 'change') {
    docs = (
      <>
        <ChangeForm t={t} profile={profile} result={result} />
        <CalendarDoc calendar={nightDef().calendar} />
      </>
    );
  } else {
    const who = personById(t.requester, profile);
    docs = (
      <>
        <RecordsForm t={t} profile={profile} result={result} />
        <div style={{ display: 'grid', gap: 16 }}>
          <RecordCard id={t.record} />
          {who && <PersonnelRecord p={who} profile={profile} />}
        </div>
      </>
    );
  }

  return (
    <div className={`ticket-view ${narrow || compact ? 'narrow' : ''}`}>
      <div className="ticket-scroll scroll" ref={ref}>
        {tut && !result && <div className="tut sticky">{tut}</div>}
        {missed && t.tutorial && <div className="tut sticky miss">{`Nope. ${result.error}\nThat one's on me. Next one counts. —R`}</div>}
        {missed && !t.tutorial && <div className="tut sticky miss">{`AUDIT FLAG: ${result.error}`}</div>}
        <div className="docs">{docs}</div>
        {t.kind === 'records' && result?.decision === 'approve' && <Released id={t.record} />}
      </div>
      {!result ? (
        <div className="decide">
          <span className="lbl">Decision</span>
          <button className="btn big approve" onClick={() => choose('approve')}>
            <span>Approve</span>
          </button>
          <button className="btn big deny" onClick={() => (audio.play('click'), setCiting(true))}>
            <span>Deny…</span>
          </button>
          {canForward && (
            <button className="btn big forward" onClick={() => choose('forward')}>
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
              {cites.map((d) => (
                <button key={d} className="btn" onClick={() => choose('deny', d)}>
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

/** A released record you are allowed to read, and (riskily) copy. */
function Released({ id }: { id: string }) {
  const r = RECORDS[id];
  const copied = useGame((s) => s.notes.some((n) => n.id === `rec-${id}`));
  if (!r?.contents) return null;
  const copy = () =>
    confirmDialog('Sentinel · copy to personal storage', 'Copying a released record to personal storage is logged by SENTINEL under your login.\n\nContinue?', 'Copy', () => {
      applyEffect({ suspicion: 6, note: { id: `rec-${id}`, title: `${r.id} · ${r.title}`, body: r.contents! } });
      audio.play('printer');
      flashEye();
    });
  return (
    <article className="doc paper released selectable" style={{ marginTop: 16 }}>
      <header className="doc-head">
        <div>
          Released to requester
          <b>{r.id}</b>
        </div>
        <div className="formno">
          <button className="btn" onClick={copy} disabled={copied}>
            {copied ? 'Copied' : 'Copy to notes'}
          </button>
        </div>
      </header>
      <pre className="rec-body">{r.contents}</pre>
    </article>
  );
}

function AlertView({ t }: { t: AlertTicket }) {
  const result = useGame((s) => s.night.results[t.id]);
  const camKey = `${t.id}_cam`;
  const camChecked = useGame((s) => !!s.flags[camKey]);
  const cam = t.camera ? t.camera(getState()) : null;
  const stillCopied = useGame((s) => s.notes.some((n) => n.id === `still-${t.id}`));

  const lookup = () => {
    audio.play('click');
    if (t.person) openApp('personnel', { personnel: t.person });
  };
  const history = () => {
    audio.play('click');
    openApp('logs', { logFilter: t.badge ?? '', logTab: 'badge' });
  };
  const still = () => {
    audio.play('click');
    setFlag(camKey, true);
  };
  const copyStill = () =>
    confirmDialog('Sentinel · copy to personal storage', 'Copying a camera still to personal storage is logged by SENTINEL under your login.\n\nContinue?', 'Copy', () => {
      applyEffect({
        suspicion: 6,
        note: { id: `still-${t.id}`, title: `Camera still · ${cam?.date} ${cam?.time}`, body: 'B3-EAST-CAM-2. One figure at the east airlock reader. Gray hair. Glasses. White coat. Badge held to the reader.' },
      });
      audio.play('printer');
      flashEye();
    });

  return (
    <div className="ticket-view">
      <div className="ticket-scroll scroll">
        <section className="alert-panel" aria-label={t.heading}>
          <h3>{t.heading}</h3>
          <div>{t.ref}</div>
          <div className="rule" />
          <dl>
            {t.lines.map((l) => (
              <div key={l.k} style={{ display: 'contents' }}>
                <dt>{l.k}</dt>
                <dd>
                  {l.v}
                  {l.link === 'person' && t.person && (
                    <>
                      {' '}
                      <button className="alink" onClick={lookup}>
                        [look up]
                      </button>
                    </>
                  )}
                </dd>
              </div>
            ))}
          </dl>
          {(t.badge || t.camera) && (
            <>
              <div className="rule" />
              <div className="alert-tools">
                {t.badge && (
                  <button className="alink" onClick={history}>
                    [pull badge history]
                  </button>
                )}
                {t.camera && (
                  <button className="alink" onClick={still}>
                    [request camera still]
                  </button>
                )}
              </div>
            </>
          )}
          {cam && camChecked && (
            <>
              <Cctv cam={cam.cam} date={cam.date} time={cam.time} unavailable={cam.unavailable} figure={cam.figure} />
              {cam.figure && (
                <div style={{ marginTop: 8 }}>
                  <button className="alink" onClick={copyStill} disabled={stillCopied}>
                    {stillCopied ? '[still copied to notes]' : '[copy still to notes]'}
                  </button>
                </div>
              )}
            </>
          )}
          {result && <div className="alert-result">{result.decision === 'log' ? t.done.log : t.done.escalate}</div>}
        </section>
      </div>
      {!result && (
        <div className="decide">
          <span className="lbl">Disposition</span>
          {t.options.map((o) => (
            <button key={o.value} className={`btn big ${o.value === 'escalate' ? 'deny' : ''}`} onClick={() => resolveAlert(t.id, o.value)}>
              <span>{o.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
