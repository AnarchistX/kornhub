import { useEffect } from 'react';
import type { GameState } from '../engine/types';
import { afterReport, getState, nightDef, useGame } from '../engine/store';
import { loginName } from '../engine/text';
import { useCompact } from '../engine/hooks';
import { audio } from '../engine/audio';

const dots = (label: string, value: string, width: number) => `${label} ${'.'.repeat(Math.max(2, width - label.length - value.length - 2))} ${value}`;

function rayRemark(s: GameState) {
  const r = s.reports.find((x) => x.n === s.night.n);
  const w = s.flags.n1_whitlock;
  const parts: string[] = [];
  if (!r || r.errors === 0) parts.push('Clean queue. Not bad for a rookie.');
  else if (r.errors >= 3) parts.push('Rough first night. Read the directives on your break.');
  else parts.push('A couple of misses. Everybody has them the first week.');
  if (w === 'escalated') parts.push('Pike called me at HOME at six a.m. about a READER FAULT. Read KI-114 before you wake up Security again.');
  else if (w === 'logged') parts.push('Saw you logged the B3 fault. Good.');
  else parts.push('You left a reader fault sitting in the queue all night. Log them.');
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
  const w = s.flags.n1_whitlock;
  const counted = def.tickets.filter((t) => t.kind === 'access' && !t.tutorial).length;
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
    dots('ACCESS DECISIONS CORRECT', `${report.correct} / ${counted}`, W),
    dots('PROCEDURAL ERRORS', String(report.errors), W),
    dots('WRITE-UPS ON FILE', `${writeups} / 3`, W),
    dots('B3 READER FAULT 03:12', w === 'logged' ? 'LOGGED' : w === 'escalated' ? 'ESCALATED' : 'OPEN', W),
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
