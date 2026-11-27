// HL-BKP backup console: the Night 4 tape restore. Tap commands on phones, type them on desktop.
import { useEffect, useRef, useState } from 'react';
import { applyEffect, getState, nightDef, useGame } from '../engine/store';
import { clockAt, loginName } from '../engine/text';
import { audio } from '../engine/audio';
import { LETTER, MOUNT_MINUTES, RATES, TAPES, TARGET_COST, nextSweep, rotationAt, sweepAt, type TapeId, type Target } from '../content/night4';

const pad = (n: number) => String(n).padStart(2, '0');
const hhmm = (minute: number) => {
  const t = 23 * 60 + minute;
  return `${pad(Math.floor(t / 60) % 24)}:${pad(t % 60)}`;
};
const bar = (pct: number, w = 24) => `[${'#'.repeat(Math.round((pct / 100) * w))}${'.'.repeat(w - Math.round((pct / 100) * w))}] ${Math.round(pct)}%`;

const HELP = [
  'Commands:',
  '  status                  rotation time, sweeps, current job',
  '  audit mailbox pwhitlock mailbox status',
  '  tape list               tapes in set A and set C',
  '  mount <tape>            e.g. mount C-3  (takes 15 min)',
  '  restore live            restore mailbox to the live mail server (fast, loud)',
  '  restore local           restore mailbox to this workstation',
  '  restore drafts          restore only the Drafts folder here (quiet)',
  '  pause | resume          hold the restore during an audit sweep',
  '  open letter             read a restored draft',
];

export function TerminalApp({ compact }: { compact: boolean }) {
  const flags = useGame((s) => s.flags);
  const minute = useGame((s) => s.night.minute);
  const profile = useGame((s) => s.profile);
  const [out, setOut] = useState<string[]>(() => [
    'HL-BKP 2.1 · Halvard-Lowe backup console',
    `Session: ${profile ? loginName(profile) : 'operator'}@MCRA-OPS · this console is audited`,
    "Type 'help', or use the buttons below.",
    '',
  ]);
  const [input, setInput] = useState('');
  const [letter, setLetter] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const prev = useRef({ mounted: flags.tape_mounted, job: flags.tape_job, state: flags.tape_state, sweep: undefined as number | undefined });
  const s = getState();
  const rot = rotationAt(s);
  const sweep = sweepAt(minute);
  const upcoming = nextSweep(minute);
  const running = flags.tape_job === 'running';
  const rotated = flags.tape_state === 'rotated';

  const print = (...lines: string[]) => setOut((o) => [...o, ...lines]);

  // React to the simulation: mounts finishing, jobs ending, sweeps starting.
  useEffect(() => {
    const p = prev.current;
    if (flags.tape_mounted && flags.tape_mounted !== p.mounted) {
      print(`> tape ${flags.tape_mounted} mounted. Ready.`);
      audio.play('mount');
    }
    if (flags.tape_job !== p.job) {
      if (flags.tape_job === 'done') {
        print('> restore complete.', `  Drafts/senate_letter_draft.txt  (4 KB, saved 10/13/99 17:52)`, "  type 'open letter'");
        audio.play('mail');
      } else if (flags.tape_job === 'empty') {
        print('> restore complete.', '  Drafts: 0 items newer than 10/10/99.', '  This tape is too old. Mount another.');
        audio.play('error');
      } else if (flags.tape_job === 'missing') {
        print('> ERROR: mailbox pwhitlock not found on tape.', '  It was deleted before this backup ran. Mount another.');
        audio.play('error');
      } else if (flags.tape_job === 'lost') {
        print('> ERROR: media removed during restore. Job aborted.');
        audio.play('error');
      }
    }
    if (rotated && !p.state) {
      print('', '*** TAPE SET C ROTATED · MEDIA OVERWRITTEN ***');
      audio.play('error');
    }
    if (sweep !== undefined && sweep !== p.sweep && running) {
      print(`!!! AUDIT SWEEP ${hhmm(sweep)} · restore activity is being logged`);
      audio.play('beep');
    }
    prev.current = { mounted: flags.tape_mounted, job: flags.tape_job, state: flags.tape_state, sweep };
  }, [flags.tape_mounted, flags.tape_job, flags.tape_state, rotated, sweep, running]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [out]);

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!cmd) return;
    audio.play('key');
    print(`${profile ? loginName(profile) : 'op'}@hl-bkp> ${cmd}`);
    const st = getState();
    const f = st.flags;
    const m = st.night.minute;
    if (cmd === 'help' || cmd === '?') return print(...HELP);
    if (cmd === 'status') {
      return print(
        `  tape rotation: ${rotated ? 'DONE (overwritten)' : hhmm(rotationAt(st))}`,
        `  audit sweep:   ${sweepAt(m) !== undefined ? 'ACTIVE NOW' : upcoming ? `next at ${hhmm(upcoming)}` : 'none scheduled'}`,
        `  mounted:       ${f.tape_mounting ? `mounting ${f.tape_mounting_id}…` : f.tape_mounted || 'none'}`,
        `  job:           ${f.tape_job || 'none'}${f.tape_job === 'running' || f.tape_job === 'paused' ? ` ${Math.round(Number(f.tape_progress || 0))}%` : ''}`,
      );
    }
    if (cmd.startsWith('audit')) {
      return print('  MAILBOX   pwhitlock (Whitlock, Paul E.)', '  STATUS    DELETED 10/15/99 08:12:31', '  BY        ADMIN  (no ticket on file)', '  LAST USE  10/13/99 17:58');
    }
    if (cmd === 'tape list' || cmd === 'tapes') {
      return print('  TAPE  TYPE  WRITTEN', ...TAPES.map((t) => `  ${t.id}   ${t.label}  ${t.when}`), `  set C rotates ${rotated ? '— ROTATED' : `at ${hhmm(rotationAt(st))}`}`);
    }
    if (rotated) return print('  ERROR: set C has been rotated. Nothing left to restore.');
    if (cmd.startsWith('mount')) {
      const id = cmd.split(' ')[1]?.toUpperCase() as TapeId | undefined;
      if (!id || !TAPES.some((t) => t.id === id)) return print('  usage: mount <tape>   (see: tape list)');
      if (f.tape_mounting) return print('  ERROR: robot arm busy.');
      if (f.tape_job === 'running' || f.tape_job === 'paused') return print('  ERROR: a restore job is using the drive.');
      audio.play('mount');
      applyEffect({ flags: { tape_mounting: true, tape_mounting_id: id, tape_mount_done: m + MOUNT_MINUTES, tape_mounted: '', tape_job: '', tape_progress: 0 } });
      return print(`  mounting ${id}… robot arm moving. ETA ${hhmm(m + MOUNT_MINUTES)}`);
    }
    if (cmd.startsWith('restore')) {
      const target = cmd.split(' ')[1] as Target | undefined;
      if (!target || !(target in RATES)) return print('  usage: restore live | local | drafts');
      if (!f.tape_mounted) return print('  ERROR: no tape mounted.');
      if (f.tape_job === 'running' || f.tape_job === 'paused') return print('  ERROR: a restore is already in progress.');
      applyEffect({ suspicion: TARGET_COST[target], flags: { tape_job: 'running', tape_target: target, tape_progress: 0 } });
      return print(
        `  restoring pwhitlock${target === 'drafts' ? '/Drafts' : ''} from ${f.tape_mounted} → ${target === 'live' ? 'MAILSRV (live)' : `C:\\USERS\\${(profile ? loginName(profile) : 'op').toUpperCase()}\\RESTORE`}`,
        target === 'live' ? '  WARNING: writes to the live mail server are reported to Security.' : '  job started.',
      );
    }
    if (cmd === 'pause') {
      if (f.tape_job !== 'running') return print('  nothing to pause.');
      applyEffect({ flags: { tape_job: 'paused' } });
      return print('  restore paused.');
    }
    if (cmd === 'resume') {
      if (f.tape_job !== 'paused') return print('  nothing to resume.');
      applyEffect({ flags: { tape_job: 'running' } });
      return print('  restore resumed.');
    }
    if (cmd.startsWith('open')) {
      if (f.tape_job !== 'done') return print('  no restored drafts to open.');
      openLetter();
      return print('  opening senate_letter_draft.txt');
    }
    print(`  unknown command: ${cmd}. Type 'help'.`);
  };

  const openLetter = () => {
    setLetter(true);
    audio.play('paper');
    if (!getState().flags.n4_letter) {
      applyEffect({ flags: { n4_letter: true }, note: { id: 'letter', title: "Whitlock's unsent letter (draft, 10/13/99)", body: LETTER } });
    }
  };

  // Context-aware shortcut buttons (the main way to play on a phone).
  const chips: string[] = ['help', 'status'];
  if (!rotated) {
    chips.push('audit mailbox pwhitlock', 'tape list');
    if (!flags.tape_mounting && flags.tape_job !== 'running' && flags.tape_job !== 'paused') chips.push(...TAPES.map((t) => `mount ${t.id}`));
    if (flags.tape_mounted && !flags.tape_job) chips.push('restore drafts', 'restore local', 'restore live');
    if (running) chips.push('pause');
    if (flags.tape_job === 'paused') chips.push('resume');
  }
  if (flags.tape_job === 'done') chips.push('open letter');

  const progress = Number(flags.tape_progress || 0);
  const mountLeft = flags.tape_mounting ? Math.max(0, Number(flags.tape_mount_done) - minute) : 0;
  const def = nightDef();
  void def;

  return (
    <div className="app col term">
      <div className={`term-status ${sweep !== undefined ? 'alarm' : ''}`}>
        <span>ROTATION {rotated ? 'DONE' : hhmm(rot)}</span>
        <span>{sweep !== undefined ? 'AUDIT SWEEP ACTIVE' : upcoming && upcoming <= 420 ? `NEXT SWEEP ${hhmm(upcoming)} (${upcoming - minute}m)` : 'NO SWEEPS'}</span>
        <span>
          {flags.tape_mounting
            ? `MOUNTING ${flags.tape_mounting_id} · ${mountLeft}m`
            : flags.tape_job === 'running' || flags.tape_job === 'paused'
              ? `${flags.tape_job === 'paused' ? 'PAUSED' : 'RESTORE'} ${bar(progress, compact ? 10 : 18)}`
              : flags.tape_mounted
                ? `TAPE ${flags.tape_mounted} READY`
                : 'DRIVE EMPTY'}
        </span>
      </div>
      <div className="term-out scroll selectable" ref={scroller}>
        {out.map((l, i) => (
          <div key={i} className={l.startsWith('!!!') || l.startsWith('***') || l.includes('ERROR') ? 'warn' : ''}>
            {l || '\u00a0'}
          </div>
        ))}
      </div>
      <div className="term-chips">
        {chips.map((c) => (
          <button key={c} className="chipbtn" onClick={() => run(c)}>
            {c}
          </button>
        ))}
      </div>
      {!compact && (
        <form
          className="term-in"
          onSubmit={(e) => {
            e.preventDefault();
            run(input);
            setInput('');
          }}
        >
          <span>&gt;</span>
          <input value={input} onChange={(e) => setInput(e.target.value)} aria-label="Console command" autoComplete="off" spellCheck={false} />
        </form>
      )}
      {letter && (
        <div className="letter-pop">
          <article className="doc paper letter-doc selectable">
            <header className="doc-head">
              <div>
                C:\…\RESTORE\Drafts
                <b>senate_letter_draft.txt</b>
              </div>
              <div className="formno">
                <button className="btn" onClick={() => setLetter(false)}>
                  Close
                </button>
              </div>
            </header>
            <pre className="rec-body">{LETTER}</pre>
          </article>
        </div>
      )}
      <span className="sr-only">{clockAt(nightDef(), minute).time}</span>
    </div>
  );
}
