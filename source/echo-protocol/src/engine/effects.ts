// Pure state helpers shared by the store and by night content (no imports from either).
import type { Effect, GameState } from './types';

/** Flags suspicion thresholds so the matching notice mail / interview call can be delivered. */
export function thresholds(s: GameState): GameState {
  const f = s.flags;
  let flags = f;
  if (s.suspicion >= 40 && !f.susp40) flags = { ...flags, susp40: true };
  if (s.suspicion >= 70 && !f.susp70) flags = { ...flags, susp70: true };
  return flags === f ? s : { ...s, flags };
}

/** Apply a story effect: flags, suspicion, a copied note. */
export function withEffect(s: GameState, e?: Effect): GameState {
  if (!e) return s;
  let next = s;
  if (e.flags) next = { ...next, flags: { ...next.flags, ...e.flags } };
  if (e.note && !next.notes.some((x) => x.id === e.note!.id)) next = { ...next, notes: [...next.notes, { ...e.note, night: next.night.n }] };
  if (e.suspicion) next = { ...next, suspicion: Math.max(0, Math.min(100, next.suspicion + e.suspicion)) };
  return thresholds(next);
}
