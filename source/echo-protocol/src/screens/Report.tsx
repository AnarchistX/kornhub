import { useEffect } from 'react';
import type { GameState } from '../engine/types';
import { afterReport, getState, nightDef, useGame } from '../engine/store';
import { loginName } from '../engine/text';
import { useCompact } from '../engine/hooks';
import { audio } from '../engine/audio';

const dots = (label: string, value: string, width: number) => `${label} ${'.'.repeat(Math.max(2, width - label.length - value.length - 2))} ${value}`;

function rayRemark(s: GameState) {
  const n = s.night.n;
  const r = s.reports.find((x) => x.n === n);
  const res = s.night.results;
  const parts: string[] = [];
  if (!r || r.errors === 0) parts.push(n === 1 ? 'Clean queue. Not bad for a rookie.' : 'Clean queue.');
  else if (r.errors >= 3) parts.push('Rough night. Read the directives on your break.');
  else parts.push('A couple of misses. Tighten up.');

  if (n === 1) {
    const w = s.flags.n1_whitlock;
    if (w === 'escalated') parts.push('Pike called me at HOME at six a.m. about a READER FAULT. Read KI-114 before you wake up Security again.');
    else if (w === 'logged') parts.push('Saw you logged the B3 fault. Good.');
    else parts.push('You left a reader fault sitting in the queue all night. Log them.');
  } else if (n === 2) {
    if (res.n2c5?.decision === 'approve') parts.push("Who told you to kill the B3 camera? That change wasn't on the calendar. Pike is asking ME questions now.");
    else parts.push('You bounced a Facilities change with no CAB number. Good. Hollis is mad. Hollis is always mad.');
  } else if (n === 3) {
    if (res.n3r4?.decision === 'approve') parts.push("You released a record under LEGAL HOLD. Counsel called Kraemer. Kraemer called me. I'm calling you: don't.");
    else parts.push("Reyes wanted the Whitlock file. You said no. That's the job. I know it doesn't feel like it.");
  } else if (n === 4) {
    if (res.n4c2?.decision === 'approve') parts.push('You moved the tape rotation up without a calendar entry. WHY.');
    if (s.flags.tape_job || s.flags.tape_mounting_id) parts.push("Pike's drill report says somebody was on the backup console last night. Tell me it wasn't you. Actually, don't tell me anything.");
    else parts.push("Pike's people say your console was clean. Good.");
  }
  return `${parts.join('\n\n')}\n\n— R.`;
}

export function Report() {
  const s = getState();
  const report = useGame((st) => st.reports.find((x) => x.n === st.night.n));
  const writeups = useGame((st) => st.writeups);
  const def = nightDef();
  const p = s.profile;
  const W = useCompact() ? 34 : 46;

  useEffect(() => {
    audio.setAmbience('none');
    audio.play('printer');
    const t = window.setTimeout(() => audio.play('printer'), 1300);
    return () => window.clearTimeout(t);
  }, []);

  if (!report || !p) return null;
  const alerts = def.tickets.filter((t) => t.kind === 'alert');
  const text = [
    `HALVARD-LOWE TECHNICAL SERVICES`,
    `NIGHT OPS SHIFT REPORT · NIGHT ${def.n}`,
    `RUN ${def.nextDate} 07:00`,
    ``,
    `OPERATOR  ${loginName(p).toUpperCase()}`,
    `NAME      ${p.last.toUpperCase()}, ${p.first.charAt(0).toUpperCase()}.`,
    `BADGE     1187`,
    '-'.repeat(W),
    dots('TICKETS RECEIVED', String(report.total), W),
    dots('TICKETS PROCESSED', String(report.processed), W),
    dots('DECISIONS CORRECT', `${report.correct} / ${report.counted ?? report.correct}`, W),
    dots('PROCEDURAL ERRORS', String(report.errors), W),
    dots('WRITE-UPS ON FILE', `${writeups} / 3`, W),
    ...alerts.map((t) => {
      const r = s.night.results[t.id];
      return dots(t.ref.slice(0, W - 14), r ? (r.decision === 'log' ? 'LOGGED' : 'ESCALATED') : 'OPEN', W);
    }),
    '-'.repeat(W),
    `END OF REPORT`,
  ].join('\n');

  return (
    <div className="report-bg">
      <div className="greenbar">
        <pre>{text}</pre>
      </div>
      <div className="report-actions">
        <div className="sticky">{rayRemark(s)}</div>
        <button className="btn big" onClick={() => (audio.play('click'), afterReport())}>
          <span>Go home</span>
        </button>
      </div>
    </div>
  );
}
