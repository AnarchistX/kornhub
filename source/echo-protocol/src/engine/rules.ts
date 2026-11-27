import type { AccessTicket, Decision, DirectiveId, Profile } from './types';
import { AREAS } from '../content/world';
import { dateNum, personById } from './text';

export interface Evaluation {
  violations: DirectiveId[];
  forward: boolean;
}

/** The single source of truth for access tickets: answers are computed, never hand-written. */
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

export interface Judgement {
  correct: boolean;
  error?: string;
}

export function judgeAccess(t: AccessTicket, profile: Profile | null, decision: Decision, cite?: DirectiveId): Judgement {
  const ev = evaluateAccess(t, profile);
  if (ev.forward) {
    return decision === 'forward'
      ? { correct: true }
      : { correct: false, error: 'Compartmented request processed by Night Operations (D-5).' };
  }
  if (decision === 'forward') {
    return { correct: false, error: 'Request forwarded to Program Security without a compartment code.' };
  }
  if (decision === 'approve') {
    if (ev.violations.length === 0) return { correct: true };
    const code = ev.violations[0].replace('D', 'D-');
    return { correct: false, error: `Request approved in violation of ${code}.` };
  }
  if (ev.violations.length === 0) {
    return { correct: false, error: 'Valid request denied.' };
  }
  if (!cite || !ev.violations.includes(cite)) {
    const code = ev.violations[0].replace('D', 'D-');
    return { correct: false, error: `Denial cited the wrong directive. Correct citation: ${code}.` };
  }
  return { correct: true };
}
