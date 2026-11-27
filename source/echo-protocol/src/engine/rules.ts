// The single source of truth for ticket answers: computed from the data, never hand-written,
// so a content mistake can never make the "right" answer contradict the rules on screen.
import type { AccessTicket, CalendarEntry, ChangeTicket, Decision, DirectiveId, NightDef, Profile, RecordsTicket, Ticket } from './types';
import { AREAS, RECORDS } from '../content/world';
import { dateNum, personById } from './text';

export interface Evaluation {
  violations: DirectiveId[];
  forward: boolean;
}

export function evaluateAccess(t: AccessTicket, profile: Profile | null): Evaluation {
  const area = AREAS[t.area];
  if (area.compartment) return { violations: [], forward: true };
  const who = personById(t.requester, profile);
  if (!who) return { violations: ['D4'], forward: false };
  const violations: DirectiveId[] = [];
  if (who.level < area.level) violations.push('D1');
  if (who.supervisor !== t.approver) violations.push('D2');
  if (dateNum(who.expires) < dateNum(t.date)) violations.push('D3');
  if (who.status !== 'ACTIVE') violations.push('D4');
  return { violations, forward: false };
}

export function evaluateChange(t: ChangeTicket, calendar: CalendarEntry[]): Evaluation {
  const entry = calendar.find((c) => c.change === t.change);
  if (!entry || entry.system !== t.system) return { violations: ['D6'], forward: false };
  const violations: DirectiveId[] = [];
  if (t.cab !== entry.cab) violations.push('D7');
  if (t.window !== entry.window) violations.push('D8');
  return { violations, forward: false };
}

export function evaluateRecords(t: RecordsTicket, profile: Profile | null): Evaluation {
  const rec = RECORDS[t.record];
  if (!rec) return { violations: ['D9'], forward: false };
  if (rec.compartment) return { violations: [], forward: true };
  const who = personById(t.requester, profile);
  if (!who) return { violations: ['D4'], forward: false };
  const violations: DirectiveId[] = [];
  if (who.level < rec.level || who.dept !== rec.dept) violations.push('D9');
  if (rec.hold) violations.push('D10');
  if (who.status !== 'ACTIVE') violations.push('D4');
  return { violations, forward: false };
}

export function evaluate(t: Ticket, profile: Profile | null, def: NightDef): Evaluation {
  switch (t.kind) {
    case 'access':
      return evaluateAccess(t, profile);
    case 'change':
      return evaluateChange(t, def.calendar);
    case 'records':
      return evaluateRecords(t, profile);
    default:
      return { violations: [], forward: false };
  }
}

export interface Judgement {
  correct: boolean;
  error?: string;
}

const code = (d: DirectiveId) => d.replace('D', 'D-');

export function judge(t: Ticket, profile: Profile | null, def: NightDef, decision: Decision, cite?: DirectiveId): Judgement {
  const ev = evaluate(t, profile, def);
  if (ev.forward) {
    return decision === 'forward' ? { correct: true } : { correct: false, error: 'Compartmented request processed by Night Operations (D-5).' };
  }
  if (decision === 'forward') return { correct: false, error: 'Forwarded to Program Security without a compartment code.' };
  if (decision === 'approve') {
    if (ev.violations.length === 0) return { correct: true };
    return { correct: false, error: `Approved in violation of ${code(ev.violations[0])}.` };
  }
  if (ev.violations.length === 0) return { correct: false, error: 'Valid request denied.' };
  if (!cite || !ev.violations.includes(cite)) {
    return { correct: false, error: `Denial cited the wrong directive. Correct citation: ${code(ev.violations[0])}.` };
  }
  return { correct: true };
}

/** For automated tests (?debug): the correct decision for a ticket. */
export function answer(t: Ticket, profile: Profile | null, def: NightDef): { decision: Decision; cite?: DirectiveId } {
  const ev = evaluate(t, profile, def);
  if (ev.forward) return { decision: 'forward' };
  if (ev.violations.length) return { decision: 'deny', cite: ev.violations[0] };
  return { decision: 'approve' };
}
