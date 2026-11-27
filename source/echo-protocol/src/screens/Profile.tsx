import { useMemo, useState } from 'react';
import type { Gender, PortraitSpec } from '../engine/types';
import { newGame } from '../engine/store';
import { audio } from '../engine/audio';
import { Portrait } from '../art/Portrait';

const NAME_RE = /^[A-Za-z][A-Za-z' -]{0,15}$/;

function tidy(name: string) {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .split(/([ -])/)
    .map((part) => (part.length > 1 || /[a-z]/i.test(part) ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : part))
    .join('');
}

export function ProfileScreen() {
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [take, setTake] = useState(0);
  const [seed] = useState(() => Math.floor(Math.random() * 100000));
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  const photo: PortraitSpec = useMemo(
    () => ({ seed: seed + take * 13, sex: gender === 'female' ? 'f' : 'm', hair: take % 5, glasses: take % 3 === 2, beard: gender === 'male' && take % 4 === 3 }),
    [seed, take, gender],
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const f = tidy(first);
    const l = tidy(last);
    if (!NAME_RE.test(l) || !NAME_RE.test(f)) {
      setErr('Names: letters, spaces, hyphens or apostrophes, up to 16 characters.');
      audio.play('error');
      return;
    }
    if (!gender) {
      setErr('Item 3 is required.');
      audio.play('error');
      return;
    }
    setErr('');
    setDone(true);
    audio.play('stamp');
    window.setTimeout(() => newGame({ first: f, last: l, gender, photo }), 1100);
  };

  const key = () => audio.play('key');

  return (
    <div className="desk-bg">
      <form className="hire paper" onSubmit={submit} noValidate>
        <div className="sub">Halvard-Lowe Technical Services · Form HL-201</div>
        <h1>PERSONNEL ACTION · NEW HIRE</h1>
        <div className="sub">Marrow Creek Biological Research Annex · Effective 12/06/99</div>
        <div className="hire-grid">
          <div className="hfield">
            <label htmlFor="last">1. Last name</label>
            <input id="last" value={last} onChange={(e) => (setLast(e.target.value), key())} maxLength={16} autoComplete="family-name" placeholder="DOE" disabled={done} />
          </div>
          <div className="hfield">
            <label htmlFor="first">2. First name</label>
            <input id="first" value={first} onChange={(e) => (setFirst(e.target.value), key())} maxLength={16} autoComplete="given-name" placeholder="JAMIE" disabled={done} />
          </div>
          <div className="hfield full">
            <span className="lab">3. Sex</span>
            <div className="sexes" role="radiogroup" aria-label="Sex">
              {(['male', 'female'] as const).map((g) => (
                <button
                  type="button"
                  key={g}
                  role="radio"
                  aria-checked={gender === g}
                  onClick={() => {
                    audio.play('click');
                    setGender(g);
                  }}
                  disabled={done}
                >
                  <span className="box">{gender === g ? '✗' : ''}</span>
                  {g === 'male' ? 'M' : 'F'}
                </button>
              ))}
            </div>
          </div>
          <div className="hfield">
            <span className="lab">4. Position</span>
            <div className="fixed">NOC TECHNICIAN I (NIGHTS)</div>
          </div>
          <div className="hfield">
            <span className="lab">5. Clearance</span>
            <div className="fixed">L2 · OPERATIONS</div>
          </div>
          <div className="hfield full">
            <span className="lab">6. Badge photo</span>
            <div className="photo-row">
              <div className="photo">{gender ? <Portrait spec={photo} title="Your badge photo" /> : null}</div>
              <button
                type="button"
                className="btn"
                disabled={!gender || done}
                onClick={() => {
                  audio.play('thunk');
                  setTake((t) => t + 1);
                }}
              >
                Retake photo
              </button>
            </div>
          </div>
        </div>
        {err && <div className="err">{err}</div>}
        <div className="submit">
          <span style={{ font: '400 12px var(--f-mono)', color: 'var(--text-dim)' }}>Badge no. 1187 will be issued.</span>
          <button className="btn big" type="submit" disabled={done}>
            <span>Sign &amp; submit</span>
          </button>
        </div>
        {done && (
          <div className="processed">
            <span className="stamp land red">Processed</span>
          </div>
        )}
      </form>
    </div>
  );
}
