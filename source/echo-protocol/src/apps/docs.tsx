import type { AccessTicket, CalendarEntry, ChangeTicket, Person, Profile, RecordsTicket, TicketResult } from '../engine/types';
import { AREAS, LEVEL_NAMES, RECORDS } from '../content/world';
import { personById, shortName } from '../engine/text';
import { Portrait } from '../art/Portrait';

export function DecisionStamp({ result }: { result?: TicketResult }) {
  if (!result) return null;
  const map = {
    approve: ['Approved', 'green'],
    deny: ['Denied', 'red'],
    forward: ['Forwarded', 'navy'],
    log: ['Logged · KI-114', 'navy'],
    escalate: ['Escalated', 'red'],
  } as const;
  const [label, color] = map[result.decision];
  return (
    <div className="stamp-slot">
      <span className={`stamp land ${color}`}>{label}</span>
    </div>
  );
}

export function RequestForm({ t, profile, result }: { t: AccessTicket; profile: Profile | null; result?: TicketResult }) {
  const who = personById(t.requester, profile);
  const approver = personById(t.approver, profile);
  const area = AREAS[t.area];
  return (
    <article className="doc paper" aria-label={`Access request ${t.ref}`}>
      <header className="doc-head">
        <div>
          Halvard-Lowe Technical Services
          <b>Facility Access Request</b>
        </div>
        <div className="formno">
          Form HL-114 · Rev 3/97
          <br />
          {t.ref}
        </div>
      </header>
      <dl className="fields">
        <dt>Requester</dt>
        <dd>{who ? `${who.last}, ${who.first}` : 'UNKNOWN'}</dd>
        <dt>Badge no.</dt>
        <dd>{who?.badge ?? '—'}</dd>
        <dt>Area</dt>
        <dd>
          {area.id === 'B3V' ? 'B3-V' : area.id} <span className="plain">— {area.name}</span>
          {area.compartment && (
            <>
              <br />
              <span className="comp-block">COMPARTMENT: {area.compartment}</span>
            </>
          )}
        </dd>
        <dt>Date of access</dt>
        <dd>{t.date}</dd>
        <dt>Time</dt>
        <dd>{t.window}</dd>
        <dt>Purpose</dt>
        <dd className="plain" style={{ fontWeight: 400 }}>
          {t.purpose}
        </dd>
        <dt>Approved by</dt>
        <dd>
          <span className="sig">
            <span className="hand">{approver?.last ?? '???'}</span>
            <span>{approver ? shortName(approver).toUpperCase() : '—'}</span>
          </span>
        </dd>
      </dl>
      {t.remark && <div className="remark sticky">{t.remark}</div>}
      <DecisionStamp result={result} />
    </article>
  );
}

export function PersonnelRecord({ p, profile }: { p: Person; profile: Profile | null }) {
  const sup = p.supervisor ? personById(p.supervisor, profile) : null;
  return (
    <article className="doc paper" aria-label={`Personnel record ${p.last}`}>
      <header className="doc-head">
        <div>
          Sentinel HR/2
          <b>Personnel Record</b>
        </div>
        <div className="formno">
          Badge
          <br />
          <b style={{ fontSize: 18 }}>{p.badge}</b>
        </div>
      </header>
      <div className="record">
        <div className="photo">
          <Portrait spec={p.photo} title={`${p.first} ${p.last}`} />
        </div>
        <dl className="fields">
          <dt>Name</dt>
          <dd>
            {p.last}, {p.first}
          </dd>
          <dt>Title</dt>
          <dd className="plain" style={{ fontWeight: 400 }}>
            {p.title}
          </dd>
          <dt>Dept</dt>
          <dd className="plain" style={{ fontWeight: 400 }}>
            {p.dept}
          </dd>
          <dt>Clearance</dt>
          <dd>{LEVEL_NAMES[p.level]}</dd>
          <dt>Supervisor</dt>
          <dd>{sup ? shortName(sup).toUpperCase() : p.external ? 'EXTERNAL' : '—'}</dd>
          <dt>Status</dt>
          <dd style={{ color: p.status === 'ACTIVE' ? undefined : 'var(--red-ink)' }}>
            {p.status}
            {p.statusDate ? ` ${p.statusDate}` : ''}
          </dd>
          <dt>Badge exp.</dt>
          <dd>{p.expires}</dd>
        </dl>
      </div>
      {p.status !== 'ACTIVE' && (
        <div className="status-stamp">
          <span className="stamp red">{p.status}</span>
        </div>
      )}
    </article>
  );
}

// ------------------------------------------------------------------ change requests

export function ChangeForm({ t, profile, result }: { t: ChangeTicket; profile: Profile | null; result?: TicketResult }) {
  const who = personById(t.requester, profile);
  return (
    <article className="doc paper" aria-label={`Change request ${t.ref}`}>
      <header className="doc-head">
        <div>
          Y2K Remediation Program
          <b>Change Request</b>
        </div>
        <div className="formno">
          Form HL-310 · Rev 9/99
          <br />
          {t.ref}
        </div>
      </header>
      <dl className="fields">
        <dt>Change ID</dt>
        <dd>{t.change}</dd>
        <dt>System</dt>
        <dd>{t.system}</dd>
        <dt>Title</dt>
        <dd className="plain" style={{ fontWeight: 400 }}>
          {t.title}
        </dd>
        <dt>Requested by</dt>
        <dd>{who ? `${who.last}, ${who.first}` : 'UNKNOWN'}</dd>
        <dt>Window</dt>
        <dd>{t.window}</dd>
        <dt>CAB no.</dt>
        <dd style={{ color: t.cab ? undefined : 'var(--red-ink)' }}>{t.cab || '— none —'}</dd>
        <dt>Detail</dt>
        <dd className="plain" style={{ fontWeight: 400, fontSize: 14 }}>
          {t.description}
        </dd>
      </dl>
      {t.remark && <div className="remark sticky">{t.remark}</div>}
      <DecisionStamp result={result} />
    </article>
  );
}

export function CalendarDoc({ calendar }: { calendar: CalendarEntry[] }) {
  return (
    <article className="doc paper" aria-label="Y2K change calendar">
      <header className="doc-head">
        <div>
          Y2K Remediation Program
          <b>Change Calendar · Dec 1999</b>
        </div>
        <div className="formno">
          CAB-approved
          <br />
          Rev 12/06/99
        </div>
      </header>
      <div className="cal">
        {calendar.map((c) => (
          <div key={c.change} className="cal-row">
            <b>{c.change}</b>
            <span>{c.system}</span>
            <span>{c.window}</span>
            <span>{c.cab}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

// ------------------------------------------------------------------ records requests

export function RecordsForm({ t, profile, result }: { t: RecordsTicket; profile: Profile | null; result?: TicketResult }) {
  const who = personById(t.requester, profile);
  return (
    <article className="doc paper" aria-label={`Records request ${t.ref}`}>
      <header className="doc-head">
        <div>
          Records Management
          <b>Records Request</b>
        </div>
        <div className="formno">
          Form HL-220 · Rev 1/98
          <br />
          {t.ref}
        </div>
      </header>
      <dl className="fields">
        <dt>Requester</dt>
        <dd>{who ? `${who.last}, ${who.first}` : 'UNKNOWN'}</dd>
        <dt>Badge no.</dt>
        <dd>{who?.badge ?? '—'}</dd>
        <dt>Record</dt>
        <dd>{t.record}</dd>
        <dt>Purpose</dt>
        <dd className="plain" style={{ fontWeight: 400 }}>
          {t.purpose}
        </dd>
      </dl>
      {t.remark && <div className="remark sticky">{t.remark}</div>}
      <DecisionStamp result={result} />
    </article>
  );
}

export function RecordCard({ id }: { id: string }) {
  const r = RECORDS[id];
  if (!r) return null;
  return (
    <article className="doc paper" aria-label={`Records index ${id}`}>
      <header className="doc-head">
        <div>
          Records Index
          <b>{r.id}</b>
        </div>
        <div className="formno">
          RECSYS
          <br />
          card
        </div>
      </header>
      <dl className="fields">
        <dt>Title</dt>
        <dd className="plain" style={{ fontWeight: 400 }}>
          {r.title}
        </dd>
        <dt>Level</dt>
        <dd>{r.compartment ? '—' : LEVEL_NAMES[r.level]}</dd>
        <dt>Owner</dt>
        <dd>{r.dept}</dd>
        <dt>Status</dt>
        <dd style={{ color: r.hold ? 'var(--red-ink)' : undefined }}>{r.hold ?? 'AVAILABLE'}</dd>
      </dl>
      {r.compartment && (
        <div style={{ marginTop: 10 }}>
          <span className="comp-block">COMPARTMENT: {r.compartment}</span>
        </div>
      )}
    </article>
  );
}
