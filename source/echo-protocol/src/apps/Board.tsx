// Evidence board: case files with blanks. Confirm a whole case at once; LANTERN can fill a blank.
import { useEffect, useState, type ReactNode } from 'react';
import { applyEffect, checkCase, getState, hintCase, setBoard, setFlag, useGame } from '../engine/store';
import { CASES, NOUNS, questionRight, type Case } from '../content/board';
import { confirmDialog } from '../os/ui';
import { audio } from '../engine/audio';

// Stable fallbacks: a selector must not return a new array/object each render.
const NO_SOLVED: string[] = [];
const NO_BOARD: Record<string, string[]> = {};

export function BoardApp() {
  const outbox = useGame((s) => !!s.flags.outbox_open);
  const [tab, setTab] = useState<'cases' | 'outbox'>('cases');
  useEffect(() => {
    setFlag('board_seen', true);
  }, []);
  return (
    <div className="app col cork">
      {outbox && (
        <div className="tabs" role="tablist">
          <button className={`tab ${tab === 'cases' ? 'on' : ''}`} role="tab" onClick={() => setTab('cases')}>
            Case files
          </button>
          <button className={`tab ${tab === 'outbox' ? 'on' : ''}`} role="tab" onClick={() => setTab('outbox')}>
            Outbox
          </button>
        </div>
      )}
      <div className="scroll board-scroll">{tab === 'outbox' && outbox ? <Outbox /> : <Cases />}</div>
    </div>
  );
}

function Cases() {
  const solved = useGame((s) => s.solved ?? NO_SOLVED);
  const n = useGame((s) => s.night.n);
  const flags = useGame((s) => s.flags);
  void n;
  void flags;
  const st = getState();
  return (
    <div className="cases">
      <p className="board-intro">
        Pin what you know. A case holds when every blank in it is right. {solved.length} of {CASES.length} confirmed.
      </p>
      {CASES.map((c) => (c.unlock(st) ? <CaseCard key={c.id} c={c} solved={solved.includes(c.id)} /> : <Sealed key={c.id} c={c} />))}
    </div>
  );
}

function Sealed({ c }: { c: Case }) {
  return (
    <article className="case sealed paper" aria-label={`${c.title}, sealed`}>
      <span className="pin" />
      <h3>{c.title}</h3>
      <p>Sealed. You don't know enough yet.</p>
    </article>
  );
}

function CaseCard({ c, solved }: { c: Case; solved: boolean }) {
  const board = useGame((s) => s.board ?? NO_BOARD);
  const tries = useGame((s) => Number(s.flags[`case_${c.id}_tries`] || 0));
  const [msg, setMsg] = useState('');
  const confirm = () => {
    const ok = checkCase(c.id);
    setMsg(ok ? '' : "Something in this file doesn't hold up.");
  };
  const hint = () =>
    confirmDialog('Ask LANTERN', 'LANTERN will correct one blank in this file. LANTERN is always right.\n\nLANTERN will also know you asked.', 'Ask', () => {
      const q = hintCase(c.id);
      setMsg(q ? 'LANTERN corrected one blank.' : 'Nothing to correct.');
    });

  return (
    <article className={`case paper ${solved ? 'solved' : ''}`} aria-label={c.title}>
      <span className="pin" />
      <h3>{c.title}</h3>
      {c.questions.map((q) => {
        // A confirmed file always shows its answers, whatever is (or isn't) in the saved picks.
        const picks = solved ? q.slots.map((x) => x.answer) : (board[q.id] ?? []);
        const parts = q.text.split(/(\{\d\})/);
        const out: ReactNode[] = [];
        for (let i = 0; i < parts.length; i++) {
          const m = parts[i].match(/^\{(\d)\}$/);
          if (!m) {
            if (parts[i]) out.push(<span key={i}>{parts[i]}</span>);
            continue;
          }
          const k = Number(m[1]);
          const slot = q.slots[k];
          // keep the punctuation that follows a blank on the same line as the blank
          const after = parts[i + 1] ?? '';
          const punct = after.match(/^[,.;:!?)"”]+/)?.[0] ?? '';
          if (punct) parts[i + 1] = after.slice(punct.length);
          out.push(
            <span key={i} className="nw">
              <select
                className={`blank ${picks[k] ? 'filled' : ''}`}
                value={picks[k] ?? ''}
                disabled={solved}
                aria-label={`Blank ${k + 1}`}
                onChange={(e) => {
                  audio.play('paper');
                  setBoard(q.id, k, e.target.value);
                  setMsg('');
                }}
              >
                <option value="" disabled>
                  {'\u2003\u2003\u2003\u2003'}
                </option>
                {slot.options.map((o) => (
                  <option key={o} value={o}>
                    {NOUNS[o]?.label ?? o}
                  </option>
                ))}
              </select>
              {punct}
            </span>,
          );
        }
        return (
          <p key={q.id} className={`q ${solved && questionRight(q, picks) ? 'ok' : ''}`}>
            {out}
          </p>
        );
      })}
      <footer>
        {solved ? (
          <span className="stamp green land">Confirmed</span>
        ) : (
          <>
            <button className="btn" onClick={confirm}>
              Confirm case
            </button>
            {tries >= 2 && (
              <button className="btn" onClick={hint}>
                Ask LANTERN
              </button>
            )}
            {msg && <span className="case-msg">{msg}</span>}
          </>
        )}
      </footer>
    </article>
  );
}

const RECIPIENTS: { id: string; label: string; detail: string; when: (f: Record<string, unknown>) => boolean }[] = [
  { id: 'fbi', label: 'FBI · Special Agent Ruth Calloway', detail: 'Secure fax, Pittsburgh Field Office.', when: (f) => !!f.fbi_contact },
  { id: 'press', label: 'The Washington Ledger · Simon Hale', detail: "Newsroom fax, through Dr. Reyes's contact.", when: (f) => !!f.reyes_press },
  { id: 'lantern', label: 'LANTERN', detail: 'A relay address that changes every hour.', when: () => true },
  { id: 'ashcombe', label: 'Office of the Deputy Director', detail: 'Hand it all back. Keep the promotion.', when: (f) => !!f.ashcombe },
  { id: 'none', label: 'No one', detail: 'Wipe your notes. Walk away. Keep your head down.', when: () => true },
];

function Outbox() {
  const flags = useGame((s) => s.flags);
  const notes = useGame((s) => s.notes);
  const solved = useGame((s) => s.solved ?? NO_SOLVED);
  const [pick, setPick] = useState('');
  const sent = flags.act2_choice as string | undefined;
  const options = RECIPIENTS.filter((r) => r.when(flags));
  const send = () => {
    const r = RECIPIENTS.find((x) => x.id === pick);
    if (!r) return;
    confirmDialog('Send the packet', `Send everything you have to: ${r.label}?\n\nThis cannot be undone.`, r.id === 'none' ? 'Wipe it' : 'Send', () => {
      audio.play('printer');
      applyEffect({ flags: { act2_choice: r.id, packet_strength: solved.length, packet_notes: notes.length } });
    });
  };
  return (
    <div className="cases">
      <article className="case paper outbox">
        <span className="pin" />
        <h3>The packet</h3>
        <p className="q">
          {notes.length} copied records · {solved.length} confirmed case file{solved.length === 1 ? '' : 's'}.{' '}
          {solved.length >= 4 ? 'It is a strong packet.' : solved.length >= 2 ? 'It holds together, mostly.' : 'It is thin. Anyone could dismiss it.'}
        </p>
        {sent ? (
          <p className="q sent">
            Sent to <b>{RECIPIENTS.find((x) => x.id === sent)?.label}</b>. There is no taking it back.
          </p>
        ) : (
          <>
            <div className="recips" role="radiogroup" aria-label="Recipient">
              {options.map((r) => (
                <label key={r.id} className={`recip ${pick === r.id ? 'on' : ''}`}>
                  <input type="radio" name="recip" value={r.id} checked={pick === r.id} onChange={() => (audio.play('click'), setPick(r.id))} />
                  <span>
                    <b>{r.label}</b>
                    <small>{r.detail}</small>
                  </span>
                </label>
              ))}
            </div>
            <footer>
              <button className="btn big" disabled={!pick} onClick={send}>
                <span>{pick === 'none' ? 'Wipe it all' : 'Send packet'}</span>
              </button>
            </footer>
          </>
        )}
      </article>
    </div>
  );
}
