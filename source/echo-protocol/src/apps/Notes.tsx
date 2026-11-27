import { setScratch, useGame } from '../engine/store';
import { loginName } from '../engine/text';

export function NotesApp() {
  const notes = useGame((s) => s.notes);
  const scratch = useGame((s) => s.scratch);
  const profile = useGame((s) => s.profile);
  return (
    <div className="app col scroll" style={{ background: '#b9b2a3' }}>
      <div className="notes-wrap">
        <div className="section-t" style={{ margin: 0 }}>
          C:\USERS\{profile ? loginName(profile).toUpperCase() : 'OPERATOR'}\NOTES.TXT
        </div>
        <textarea
          className="scratch"
          value={scratch}
          onChange={(e) => setScratch(e.target.value)}
          placeholder="Your notes. Names, times, anything that doesn't add up."
          aria-label="Personal notes"
          spellCheck={false}
        />
        <div className="section-t" style={{ margin: '6px 0 0' }}>
          Copied records · {notes.length}
        </div>
        {notes.length === 0 && <div className="empty" style={{ padding: 8, textAlign: 'left' }}>Nothing copied yet.</div>}
        {notes.map((n) => (
          <article key={n.id} className="note-item paper selectable">
            <h4>{n.title}</h4>
            {n.body}
          </article>
        ))}
      </div>
    </div>
  );
}
