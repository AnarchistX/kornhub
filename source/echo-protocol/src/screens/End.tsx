import { useEffect } from 'react';
import { canRestartFrom, getState, restartFrom, restartNight, useGame } from '../engine/store';
import { foundEndings } from '../engine/persist';
import { epilogue } from '../content/endings';
import { ENDINGS, ENDING_NAMES } from '../content/rollover';
import { audio } from '../engine/audio';
import { resetUi, setUi } from '../os/ui';

const ACT2_LINES: Record<string, string> = {
  fbi: 'You sent everything to Special Agent Calloway.',
  press: 'You sent everything to Simon Hale at the Washington Ledger.',
  lantern: 'You gave everything to LANTERN.',
  ashcombe: 'You handed everything back to Dr. Ashcombe.',
  none: 'You wiped it all and kept your head down.',
};

export function ToBeContinued() {
  const profile = useGame((s) => s.profile);
  const n = useGame((s) => s.night.n);
  const letter = useGame((s) => !!s.flags.n4_letter);
  const choice = useGame((s) => String(s.flags.act2_choice ?? 'none'));
  const solved = useGame((s) => (s.solved ?? []).length);
  useEffect(() => {
    audio.setAmbience('wind');
    audio.setTension(0.2);
  }, []);
  const act2 = n >= 9;
  return (
    <div className="tbc">
      <div className="tbc-inner">
        <span className="classif">{act2 ? 'END OF ACT II' : 'END OF ACT I'}</span>
        <h2>{act2 ? 'Compartment' : 'Night Shift'}</h2>
        {act2 ? (
          <>
            <p>
              {profile?.first}, {ACT2_LINES[choice] ?? ACT2_LINES.none} You confirmed {solved} of 5 case files.
            </p>
            <p>
              Act III, <b>Rollover</b>, arrives in the next build: December 31, 1999. A truck at Gate 1, a records wipe set for midnight, and everyone you have met on
              the ridge for the last night of the millennium. Your progress is saved on this device.
            </p>
          </>
        ) : (
          <>
            <p>
              {profile?.first}, four nights at Marrow Creek.{' '}
              {letter ? "You have Paul Whitlock's letter, and the names in it." : 'The tapes rotated before you could read whatever Paul Whitlock left behind.'}
            </p>
            <p>Act II arrives in the next build. Your progress is saved on this device.</p>
          </>
        )}
        <nav className="menu">
          <button
            className="ghost"
            onClick={() => {
              audio.play('click');
              resetUi();
              setUi({ title: true });
            }}
          >
            Back to title
          </button>
          <button
            className="ghost"
            onClick={() => {
              audio.play('click');
              restartNight();
              resetUi();
              setUi({ title: false });
            }}
          >
            Replay Night {n}
          </button>
          <a className="ghost" href="/" style={{ textDecoration: 'none' }}>
            KXRNAGE
          </a>
        </nav>
      </div>
    </div>
  );
}

export function Ending() {
  const ending = useGame((s) => s.ending);
  const profile = useGame((s) => s.profile);
  const state = getState();
  const found = foundEndings();
  const ep = ending && ending !== 'detained' && ending !== 'terminated' ? epilogue(ending, state) : null;
  const reports = state.reports;
  const correct = reports.reduce((a, r) => a + r.correct, 0);
  const counted = reports.reduce((a, r) => a + r.counted, 0);
  const solved = (state.solved ?? []).length;
  const finale = state.night.n === 10;
  useEffect(() => {
    audio.setAmbience(ep ? 'wind' : 'none');
    audio.setTension(ending === 'echo' ? 0.6 : 0);
    audio.play('thunk');
  }, [ep, ending]);

  const again = (fn: () => void) => () => {
    audio.play('click');
    fn();
    resetUi();
    setUi({ title: false });
  };

  return (
    <div className="tbc ending-screen">
      <div className="ending-inner">
        {ending === 'detained' && (
          <article className="letter paper">
            <h3>FEDERAL BUREAU OF INVESTIGATION · NOTICE OF DETENTION</h3>
            <p>
              {profile ? `${profile.first} ${profile.last}` : 'Subject'} · Halvard-Lowe Technical Services · Badge 1187
            </p>
            <p>
              You are being detained pending investigation of the unauthorized collection and retention of national defense information from a U.S. Government
              information system (18 U.S.C. § 793).
            </p>
            <p>Your workstation, your notes and your personal storage have been seized. You may contact an attorney.</p>
            <p style={{ marginTop: 24 }}>— Facility Security, on behalf of the Federal Bureau of Investigation</p>
            <span className="stamp red" style={{ marginTop: 8 }}>
              Detained
            </span>
          </article>
        )}
        {ending === 'terminated' && (
          <article className="letter paper">
            <h3>NOTICE OF TERMINATION OF EMPLOYMENT</h3>
            <p>
              {profile ? `${profile.first} ${profile.last}` : 'Employee'} · Badge 1187 · Night Operations
            </p>
            <p>
              Following three procedural write-ups, your employment with Halvard-Lowe Technical Services is terminated effective immediately. Your badge has been
              deactivated. Security will escort you to your vehicle.
            </p>
            <p>Please do not discuss your duties at the Marrow Creek Annex with anyone. You remain bound by the nondisclosure agreement you signed on 12/06/99.</p>
            <p style={{ marginTop: 24 }}>— J. Kraemer, Operations Manager</p>
            <span className="stamp red" style={{ marginTop: 8 }}>
              Terminated
            </span>
          </article>
        )}
        {ep && (
          <section className="epilogue">
            <span className="classif">ENDING · {ep.name.toUpperCase()}</span>
            <h2>{ep.name}</h2>
            <p className="kicker">{ep.kicker}</p>
            {ep.lines.map((l, i) => (
              <p key={i} style={{ animationDelay: `${0.4 + i * 0.5}s` }}>
                {l}
              </p>
            ))}
            {ep.fates.length > 0 && (
              <dl className="fates">
                {ep.fates.map(([who, what]) => (
                  <div key={who}>
                    <dt>{who}</dt>
                    <dd>{what}</dd>
                  </div>
                ))}
              </dl>
            )}
          </section>
        )}
        <section className="ending-meta">
          {profile && (
            <p className="stats">
              {profile.first} {profile.last} · {state.night.n} night{state.night.n > 1 ? 's' : ''} at Marrow Creek · {correct}/{counted} decisions by the book · {solved}/5 case
              files · suspicion {Math.round(state.suspicion)}
            </p>
          )}
          <div className="found" aria-label="Endings found on this device">
            <span>Endings found · {found.length} of {ENDINGS.length}</span>
            <ul>
              {ENDINGS.map((id) => (
                <li key={id} className={`${found.includes(id) ? 'on' : ''} ${id === ending ? 'now' : ''}`}>
                  {found.includes(id) ? ENDING_NAMES[id] : '? ? ?'}
                </li>
              ))}
            </ul>
          </div>
          <nav className="menu">
            <button className="ghost" onClick={again(restartNight)}>
              {finale ? 'Replay the finale' : 'Restart the night'}
            </button>
            {finale && canRestartFrom(9) && (
              <button className="ghost" onClick={again(() => restartFrom(9))}>
                Choose again (Night 9)
              </button>
            )}
            <button
              className="ghost"
              onClick={() => {
                audio.play('click');
                resetUi();
                setUi({ title: true });
              }}
            >
              Title
            </button>
            <a className="ghost" href="/" style={{ textDecoration: 'none' }}>
              KXRNAGE
            </a>
          </nav>
        </section>
      </div>
    </div>
  );
}
