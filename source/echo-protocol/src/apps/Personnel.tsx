import { useEffect, useMemo, useState } from 'react';
import { setFlag, useGame } from '../engine/store';
import { allPeople } from '../engine/text';
import { setUi, useUi } from '../os/ui';
import { PersonnelRecord } from './docs';
import { BackIcon } from '../art/icons';
import { audio } from '../engine/audio';

export function PersonnelApp({ compact }: { compact: boolean }) {
  const profile = useGame((s) => s.profile);
  const sel = useUi((u) => u.personnel);
  const sawDeceased = useGame((s) => !!s.flags.n1_saw_deceased);
  const [q, setQ] = useState('');
  const people = useMemo(() => allPeople(profile).sort((a, b) => a.last.localeCompare(b.last)), [profile]);
  const query = q.trim().toLowerCase();
  const shown = query
    ? people.filter((p) => `${p.last} ${p.first} ${p.badge} ${p.dept} ${p.title}`.toLowerCase().includes(query))
    : people;
  const current = people.find((p) => p.id === sel) ?? null;

  useEffect(() => {
    if (!compact && !sel && people.length) setUi({ personnel: people[0].id });
  }, [compact, sel, people]);

  // The first time anyone opens Whitlock's record, the room goes cold.
  useEffect(() => {
    if (current?.id === 'whitlock' && !sawDeceased) {
      setFlag('n1_saw_deceased', true);
      audio.play('sting');
    }
  }, [current, sawDeceased]);

  const list = (
    <div className="pane-list">
      <div className="toolbar">
        <input className="field" style={{ flex: 1 }} placeholder="Search name, badge, dept" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search personnel" inputMode="search" />
      </div>
      <div className="rows scroll">
        {shown.map((p) => (
          <button
            key={p.id}
            className={`row ${sel === p.id ? 'on' : ''}`}
            onClick={() => {
              audio.play('click');
              setUi({ personnel: p.id });
            }}
          >
            <span className="top">
              <span>{p.badge}</span>
              <span className="meta">{p.status !== 'ACTIVE' ? <span className="chip bad">{p.status}</span> : `L${p.level}`}</span>
            </span>
            <span className="name">
              {p.last}, {p.first}
            </span>
            <span className="sub">{p.title}</span>
          </button>
        ))}
        {shown.length === 0 && <div className="empty">No match.</div>}
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
            <button className="btn" onClick={() => setUi({ personnel: null })}>
              <BackIcon />
              <span>Directory</span>
            </button>
          </div>
        )}
        <div className="scroll" style={{ flex: 1, minHeight: 0, padding: 16 }}>
          {current ? (
            <div className="person-card">
              <PersonnelRecord p={current} profile={profile} />
            </div>
          ) : (
            <div className="empty">Select a record.</div>
          )}
        </div>
      </div>
    </div>
  );
}
