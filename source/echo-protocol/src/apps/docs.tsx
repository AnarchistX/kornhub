import type { AccessTicket, Person, Profile, TicketResult } from '../engine/types';
import { AREAS, LEVEL_NAMES } from '../content/world';
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
