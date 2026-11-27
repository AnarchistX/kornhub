import { useEffect, useState } from 'react';
import { go, resetGame, useGame } from '../engine/store';
import { audio } from '../engine/audio';
import { playMusic } from '../engine/music';
import { confirmDialog, resetUi, setUi } from '../os/ui';
import { RidgeScene } from '../art/scenes';
import { SettingsPanel } from '../os/Popups';

export function TitleScreen() {
  const [begun, setBegun] = useState(audio.ready);
  const [settings, setSettingsOpen] = useState(false);
  const profile = useGame((s) => s.profile);
  const screen = useGame((s) => s.screen);

  useEffect(() => {
    if (!begun) return;
    audio.setAmbience('wind');
    audio.setTension(0);
    playMusic('title');
  }, [begun]);

  const start = () => {
    resetUi();
    setUi({ title: false });
    go('profile');
  };
  const newGame = () => {
    audio.play('click');
    if (profile) {
      confirmDialog('Start over', 'Starting a new game replaces your saved progress on this device.', 'Start over', () => {
        resetGame();
        start();
      });
    } else start();
  };
  const cont = () => {
    audio.play('click');
    resetUi();
    setUi({ title: false });
    if (screen === 'title') go('profile');
  };

  return (
    <div className="title-screen">
      <div className="cam">
        <RidgeScene car />
      </div>
      <div className="grain" />
      <div className="title-shade" />
      <a className="home-link" href="/">
        ← KXRNAGE
      </a>
      <div className="title-ui">
        <span className="classif">TOP SECRET//ECHO</span>
        <h1 className="logo">
          <span>Echo</span>
          <span>Protocol</span>
        </h1>
        <p className="tagline">Night shift at a federal lab, December 1999. A dead man's badge is still opening doors.</p>
        <nav className="menu" aria-label="Main menu">
          {profile && (
            <button className="ghost" onClick={cont}>
              Continue · {profile.first} {profile.last}
            </button>
          )}
          <button className="ghost" onClick={newGame}>
            New game
          </button>
          <button className="ghost" onClick={() => (audio.play('click'), setSettingsOpen(true))}>
            Settings
          </button>
        </nav>
      </div>
      <div className="title-foot">
        MARROW CREEK · 1999
        <br />
        TEN NIGHTS · THREE ACTS · NINE ENDINGS
      </div>
      {settings && (
        <div className="scrim" onClick={() => setSettingsOpen(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Settings">
            <div className="win-title">
              <span className="t">Settings</span>
              <button className="win-x" aria-label="Close" onClick={() => setSettingsOpen(false)}>
                ×
              </button>
            </div>
            <SettingsPanel />
            <div className="dialog-actions">
              <button className="btn" onClick={() => setSettingsOpen(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      {!begun && (
        <button
          className="begin"
          onClick={() => {
            audio.unlock();
            audio.play('thunk');
            setBegun(true);
          }}
        >
          <div>
            <span>Press to begin</span>
            <div style={{ marginTop: 14, fontSize: 11, letterSpacing: '0.2em', opacity: 0.5 }}>Best with sound</div>
          </div>
        </button>
      )}
    </div>
  );
}
