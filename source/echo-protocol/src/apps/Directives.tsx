import { useEffect, useRef } from 'react';
import { nightDef, seenDirectives, useGame } from '../engine/store';
import { AREAS, DIRECTIVES, KNOWN_ISSUES } from '../content/world';

export function DirectivesBody() {
  const directives = useGame((s) => s.night.directives);
  const fresh = useGame((s) => s.night.newDirectives);
  const flashed = useRef<string[]>(fresh);
  useEffect(() => {
    flashed.current = Array.from(new Set([...flashed.current, ...fresh]));
    if (fresh.length) seenDirectives();
  }, [fresh]);
  const def = nightDef();
  return (
    <div className="binder">
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
