import { useEffect } from 'react';
import { restartNight, useGame } from '../engine/store';
import { audio } from '../engine/audio';
import { resetUi, setUi } from '../os/ui';

export function ToBeContinued() {
  const profile = useGame((s) => s.profile);
  const letter = useGame((s) => !!s.flags.n4_letter);
  useEffect(() => {
    audio.setAmbience('wind');
    audio.setTension(0.15);
  }, []);
  return (
    <div className="tbc">
      <div className="tbc-inner">
        <span className="classif">END OF ACT I</span>
        <h2>Night Shift</h2>
        <p>
          {profile?.first}, four nights at Marrow Creek.{' '}
          {letter
            ? "You have Paul Whitlock's letter, and the names in it."
            : 'The tapes rotated before you could read whatever Paul Whitlock left behind.'}
        </p>
        <p>
          Act II, <b>Compartment</b>, arrives in the next build. The routine is about to break: Ray is about to disappear from the schedule, and LANTERN wants more
          than your attention. Your progress is saved on this device.
        </p>
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
            Replay Night 4
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
  useEffect(() => {
    audio.setAmbience('none');
    audio.setTension(0);
    audio.play('thunk');
  }, []);
  return (
    <div className="tbc">
      <div style={{ display: 'grid', gap: 22, justifyItems: 'center' }}>
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
        <nav className="menu" style={{ justifyItems: 'center' }}>
          <button
            className="ghost"
            onClick={() => {
              audio.play('click');
              restartNight();
              resetUi();
              setUi({ title: false });
            }}
          >
            Restart the night
          </button>
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
        </nav>
      </div>
    </div>
  );
}
