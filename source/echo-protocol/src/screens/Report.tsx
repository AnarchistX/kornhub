import { useEffect } from 'react';
import type { GameState } from '../engine/types';
import { afterReport, getState, nightDef, useGame } from '../engine/store';
import { endClock, loginName } from '../engine/text';
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
  if (n >= 5) {
    if (n === 5) parts.push(res.n5x1?.choice === 'granted' ? "Exception for Pruitt noted. Security thanks you. Don't make a habit of it." : 'Pike asked why her exception was denied. I told her to read the directives.');
    if (n === 6 && res.n6r2?.decision === 'approve') parts.push("You released Night Operations session logs to the Deputy Director's office. Outside their department.");
    if (n === 6)
      parts.push(
        s.flags.n6_intrusion === 'escalated'
          ? 'Security opened SEC-4603 on your account. IT says somebody on the second floor mistyped a login. Three times.'
          : "IT reset your password at two in the morning. Don't write the new one on a sticky note.",
      );
    if (n === 7) parts.push('The NOC fax printed something at 01:05. Wrong number, I assume. Shred wrong numbers.');
    if (n === 8 && res.n8a1?.decision === 'approve') parts.push('You let a Halvard-Lowe vice president in without a valid approval. Corporate was delighted. I was not.');
    if (n === 8 && s.flags.ashcombe === 'accepted') parts.push("The Deputy Director's office says you're staying on as lead through the rollover. Congratulations, I suppose.");
    if (n === 8 && s.flags.ashcombe === 'refused') parts.push('The Deputy Director asked me whether you are "a team player." I said yes. Don\'t make me a liar.');
    if (n === 9) parts.push('Change freeze is in effect. Merry Christmas.');
    if (n === 10) {
      const g = s.flags.r_gate;
      if (g === 'held' || g === 'expired') parts.push("You held the Deputy Director's convoy on a night lead exception. I have been on the phone since 23:31.");
      else if (s.flags.r_unanswered) parts.push('The convoy sat at the gate for ten minutes waiting on the NOC. Curtis had to open it from down here.');
      else parts.push('Convoy out on time. Smooth rollover. Thank you.');
      if (s.flags.r_job === 'held') parts.push('You held 0047. The Deputy Director would like a word. So would I.');
      if (s.flags.r_hvac === 'stable') parts.push('Facilities says you failed B3 over by hand at midnight. Lindqvist wants to buy you a drink.');
      if (s.flags.r_rev_cboyd) parts.push("And you kicked Curtis off the network in the middle of the war room. He's still red.");
      parts.push('Happy New Year.');
    }
    return `${parts.join('\n\n')}\n\n— J.K.`;
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
    `RUN ${endClock(def).date} ${endClock(def).time}`,
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
      const v = r ? (r.choice ?? (r.decision === 'log' ? 'logged' : 'escalated')).toUpperCase() : 'OPEN';
      return dots(t.ref.slice(0, W - 14), v, W);
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
