import { useEffect } from 'react';
import { restartNight, useGame } from '../engine/store';
import { audio } from '../engine/audio';
import { resetUi, setUi } from '../os/ui';

export function ToBeContinued() {
  const profile = useGame((s) => s.profile);
  const copied = useGame((s) => !!s.flags.n1_copied_log);
  const saw = useGame((s) => !!s.flags.n1_saw_deceased);
  useEffect(() => {
    audio.setAmbience('wind');
    audio.setTension(0.15);
  }, []);
  return (
    <div className="tbc">
      <div className="tbc-inner">
        <span className="classif">END OF NIGHT 1</span>
        <h2>To be continued</h2>
        <p>
          {profile?.first}, you made it through your first night at Marrow Creek.{' '}
          {saw ? 'You know whose badge opened that door. ' : 'You never looked up who badge 0417 belongs to. Maybe next time. '}
          {copied ? 'And somewhere on that workstation, there is a copy of the log with your name on it.' : ''}
        </p>
        <p>
          Night 2 arrives in the next build: Y2K change requests, a call from Security, and a message from LANTERN that will not wait. Your progress is saved on this
          device.
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
            Replay Night 1
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
