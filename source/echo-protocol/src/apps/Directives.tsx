import { useEffect, useRef, useState } from 'react';
import { nightDef, seenDirectives, useGame } from '../engine/store';
import { AREAS, DIRECTIVES, KNOWN_ISSUES, LEVEL_NAMES, RECORDS } from '../content/world';
import { CalendarDoc } from './docs';

type Tab = 'dir' | 'cal' | 'rec';

export function DirectivesBody() {
  const n = useGame((s) => s.night.n);
  const directives = useGame((s) => s.night.directives);
  const fresh = useGame((s) => s.night.newDirectives);
  const [tab, setTab] = useState<Tab>('dir');
  const flashed = useRef<string[]>(fresh);
  useEffect(() => {
    flashed.current = Array.from(new Set([...flashed.current, ...fresh]));
    if (fresh.length) seenDirectives();
  }, [fresh]);
  const def = nightDef();
  void n;
  const hasCal = def.calendar.length > 0;
  const hasRec = def.records.length > 0;

  return (
    <div className="binder">
      {(hasCal || hasRec) && (
        <div className="binder-tabs" role="tablist">
          <button className={`tab ${tab === 'dir' ? 'on' : ''}`} role="tab" onClick={() => setTab('dir')}>
            Directives
          </button>
          {hasCal && (
            <button className={`tab ${tab === 'cal' ? 'on' : ''}`} role="tab" onClick={() => setTab('cal')}>
              Change calendar
            </button>
          )}
          {hasRec && (
            <button className={`tab ${tab === 'rec' ? 'on' : ''}`} role="tab" onClick={() => setTab('rec')}>
              Records index
            </button>
          )}
        </div>
      )}
      {tab === 'cal' && hasCal ? (
        <CalendarDoc calendar={def.calendar} />
      ) : tab === 'rec' && hasRec ? (
        <article className="doc paper">
          <header className="doc-head">
            <div>
              Records Management
              <b>Records Index</b>
            </div>
            <div className="formno">
              RECSYS
              <br />
              {def.date}
            </div>
          </header>
          <table className="areas">
            <thead>
              <tr>
                <th>Record</th>
                <th>Title</th>
                <th>Level</th>
                <th>Owner</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {def.records.map((id) => {
                const r = RECORDS[id];
                return (
                  <tr key={id}>
                    <td className="lv">{r.id}</td>
                    <td>{r.title}</td>
                    <td className="lv">{r.compartment ? `Comp. ${r.compartment}` : LEVEL_NAMES[r.level].split(' ')[0]}</td>
                    <td>{r.dept}</td>
                    <td style={{ color: r.hold ? 'var(--red-ink)' : undefined }}>{r.hold ? 'LEGAL HOLD' : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </article>
      ) : (
        <article className="doc paper">
          <header className="doc-head">
            <div>
              Night Operations
              <b>Directives</b>
            </div>
            <div className="formno">
              Effective {def.date}
              <br />
              Night {def.n}
            </div>
          </header>
          {directives.map((id) => {
            const d = DIRECTIVES[id];
            const isNew = flashed.current.includes(id);
            return (
              <div key={id} className={`dir ${isNew ? 'fresh' : ''}`}>
                <span className="code">{d.code}</span>
                <div>
                  <h4>
                    {d.title}
                    {isNew && <span className="new chip bad">New</span>}
                  </h4>
                  <p>{d.text}</p>
                </div>
              </div>
            );
          })}
          <div className="section-t">Area clearance table</div>
          <table className="areas">
            <thead>
              <tr>
                <th>Code</th>
                <th>Area</th>
                <th>Requires</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(AREAS).map((a) => (
                <tr key={a.id}>
                  <td className="lv">{a.id === 'B3V' ? 'B3-V' : a.id}</td>
                  <td>{a.name}</td>
                  <td className="lv">{a.compartment ? `Compartment ${a.compartment}` : `Level ${a.level}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="section-t">Known issues</div>
          <ul className="ki">
            {KNOWN_ISSUES.map((k) => (
              <li key={k.id}>
                <b>{k.id}</b> {k.text}
              </li>
            ))}
          </ul>
        </article>
      )}
    </div>
  );
}

export function DirectivesApp() {
  return (
    <div className="app col scroll">
      <DirectivesBody />
    </div>
  );
}
