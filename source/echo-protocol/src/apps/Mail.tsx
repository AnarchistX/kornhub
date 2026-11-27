import { useEffect, useMemo } from 'react';
import { allMails, getState, markRead, nightDef, useGame } from '../engine/store';
import { clockAt, fill, loginName } from '../engine/text';
import { setUi, useUi } from '../os/ui';
import { BackIcon } from '../art/icons';
import { audio } from '../engine/audio';

export function MailApp({ compact }: { compact: boolean }) {
  const def = nightDef();
  const ids = useGame((s) => s.night.mails);
  const read = useGame((s) => s.night.read);
  const profile = useGame((s) => s.profile);
  const sel = useUi((u) => u.mailSel);
  const mails = useMemo(() => allMails(def).filter((m) => ids.includes(m.id)).sort((a, b) => ids.indexOf(b.id) - ids.indexOf(a.id)), [def, ids]);
  const current = mails.find((m) => m.id === sel) ?? null;

  useEffect(() => {
    if (!compact && !sel && mails.length) setUi({ mailSel: mails[mails.length - 1].id });
  }, [compact, sel, mails]);

  useEffect(() => {
    if (current) markRead(current.id);
  }, [current]);

  const list = (
    <div className="pane-list">
      <div className="head">Inbox · {profile ? loginName(profile) : ''}@mcra</div>
      <div className="rows scroll">
        {mails.length === 0 && <div className="empty">No messages.</div>}
        {mails.map((m) => (
          <button
            key={m.id}
            className={`row ${sel === m.id ? 'on' : ''} ${!read.includes(m.id) ? 'unread' : ''}`}
            onClick={() => {
              audio.play('click');
              setUi({ mailSel: m.id });
            }}
          >
            <span className="top">
              <span>{m.personal ? 'PERSONAL' : 'INTERNAL'}</span>
              <span className="meta">{clockAt(def, m.at).time}</span>
            </span>
            <span className="name">{m.from}</span>
            <span className="sub">{m.subject}</span>
          </button>
        ))}
      </div>
    </div>
  );

  if (compact && !current) return <div className="app compact-app">{list}</div>;

  const s = getState();
  return (
    <div className={`app ${compact ? 'compact-app' : ''}`}>
      {!compact && list}
      <div className="pane-main">
        {compact && (
          <div className="toolbar">
            <button className="btn" onClick={() => setUi({ mailSel: null })}>
              <BackIcon />
              <span>Inbox</span>
            </button>
          </div>
        )}
        {current ? (
          <div className="mail-read scroll">
            <article className="mail-sheet paper">
              <dl className="mail-hdr">
                <dt>From:</dt>
                <dd>
                  {current.from} &lt;{fill(current.addr, s)}&gt;
                </dd>
                <dt>To:</dt>
                <dd>{profile ? loginName(profile) : 'operator'}@mcra.hlts.com</dd>
                <dt>Date:</dt>
                <dd>
                  {clockAt(def, current.at).date} {clockAt(def, current.at).time}
                </dd>
                <dt>Subject:</dt>
                <dd className="subj">{current.subject}</dd>
              </dl>
              <pre className="mail-body selectable">{fill(current.body, s)}</pre>
            </article>
          </div>
        ) : (
          <div className="empty">Select a message.</div>
        )}
      </div>
    </div>
  );
}
