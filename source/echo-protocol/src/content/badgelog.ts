import type { BadgeLogEntry, GameState } from '../engine/types';

/**
 * Badge reader history. Entries without `night` existed before the game began.
 * Entries with `night`/`at` appear during that night at that game minute, then stay as history.
 */
export const BADGE_LOG: BadgeLogEntry[] = [
  { date: '10/13/99', time: '07:58:12', reader: 'ADM-MAIN', badge: '0417', event: 'GRANTED' },
  { date: '10/13/99', time: '08:20:41', reader: 'B3-EAST-1', badge: '0417', event: 'GRANTED' },
  { date: '10/13/99', time: '18:05:03', reader: 'ADM-MAIN', badge: '0417', event: 'GRANTED' },
  { date: '10/21/99', time: '03:14:08', reader: 'B3-EAST-2', badge: '0417', event: 'GRANTED' },
  { date: '11/02/99', time: '03:11:52', reader: 'B3-EAST-2', badge: '0417', event: 'GRANTED' },
  { date: '11/16/99', time: '03:13:30', reader: 'B3-EAST-2', badge: '0417', event: 'GRANTED' },
  { date: '11/30/99', time: '03:12:17', reader: 'B3-EAST-2', badge: '0417', event: 'GRANTED' },
  { date: '12/06/99', time: '07:12:55', reader: 'ADM-MAIN', badge: '0388', event: 'GRANTED' },
  { date: '12/06/99', time: '08:02:10', reader: 'B3-EAST-1', badge: '0388', event: 'GRANTED' },
  { date: '12/06/99', time: '17:41:37', reader: 'ADM-MAIN', badge: '0102', event: 'GRANTED' },
  { date: '12/06/99', time: '22:48:09', reader: 'GATE-1', badge: '1187', event: 'GRANTED' },
  { date: '12/06/99', time: '22:51:30', reader: 'OPS-NOC', badge: '1187', event: 'GRANTED' },
  { date: '12/06/99', time: '22:55:02', reader: 'GATE-1', badge: '0592', event: 'GRANTED' },
  // Night 1
  { night: 1, at: 32, date: '12/06/99', time: '23:31:44', reader: 'OPS-SRV', badge: '0772', event: 'GRANTED' },
  { night: 1, at: 122, date: '12/07/99', time: '01:02:18', reader: 'ADM-2F', badge: '1033', event: 'GRANTED' },
  { night: 1, at: 179, date: '12/07/99', time: '01:58:40', reader: 'B3-VAULT', badge: '0102', event: 'GRANTED' },
  { night: 1, at: 211, date: '12/07/99', time: '02:31:06', reader: 'OPS-BRK', badge: '0592', event: 'GRANTED' },
  { night: 1, at: 237, date: '12/07/99', time: '02:57:12', reader: 'B3-VAULT', badge: '0102', event: 'GRANTED' },
  { night: 1, at: 252, date: '12/07/99', time: '03:12:44', reader: 'B3-EAST-2', badge: '0417', event: 'GRANTED', purge: { flag: 'n1_whitlock', value: 'escalated', at: 316, night: 1 } },
  { night: 1, at: 273, date: '12/07/99', time: '03:33:51', reader: 'B3-EAST-1', badge: '0388', event: 'GRANTED' },
  // Night 2
  { night: 2, at: 1, date: '12/07/99', time: '22:50:12', reader: 'GATE-1', badge: '1187', event: 'GRANTED' },
  { night: 2, at: 24, date: '12/07/99', time: '23:24:10', reader: 'OPS-SRV', badge: '0772', event: 'GRANTED' },
  { night: 2, at: 209, date: '12/08/99', time: '02:29:51', reader: 'B3-VAULT', badge: '0102', event: 'GRANTED' },
  { night: 2, at: 254, date: '12/08/99', time: '03:14:07', reader: 'B3-EAST-2', badge: '0417', event: 'GRANTED' },
  { night: 2, at: 266, date: '12/08/99', time: '03:26:40', reader: 'B3-VAULT', badge: '0102', event: 'GRANTED' },
  { night: 2, at: 422, date: '12/08/99', time: '06:02:13', reader: 'ADM-MAIN', badge: '0745', event: 'GRANTED' },
  // Night 3
  { night: 3, at: 1, date: '12/08/99', time: '22:49:31', reader: 'GATE-1', badge: '1187', event: 'GRANTED' },
  { night: 3, at: 92, date: '12/09/99', time: '00:31:58', reader: 'ADM-2F', badge: '1033', event: 'GRANTED' },
  { night: 3, at: 371, date: '12/09/99', time: '05:11:20', reader: 'B3-EAST-1', badge: '0388', event: 'GRANTED' },
  // Night 4
  { night: 4, at: 1, date: '12/09/99', time: '22:52:44', reader: 'GATE-1', badge: '1187', event: 'GRANTED' },
  { night: 4, at: 242, date: '12/10/99', time: '03:02:08', reader: 'B3-VAULT', badge: '0102', event: 'GRANTED' },
  { night: 4, at: 296, date: '12/10/99', time: '03:56:50', reader: 'B3-VAULT', badge: '0102', event: 'GRANTED' },
];

export function visibleEntry(e: BadgeLogEntry, s: GameState): boolean {
  if (!e.night) return true;
  if (e.night < s.night.n) return true;
  return e.night === s.night.n && (e.at ?? 0) <= s.night.minute;
}

export function purgedEntry(e: BadgeLogEntry, s: GameState): boolean {
  const p = e.purge;
  if (!p || s.flags[p.flag] !== p.value) return false;
  return s.night.n > p.night || s.night.minute >= p.at;
}

/** B3 camera maintenance work orders: every 0417 visit has one. */
export const CAMERA_WORK_ORDERS = [
  { wo: 'WO-7588', date: '10/21/99', window: '03:12–03:16' },
  { wo: 'WO-7613', date: '11/02/99', window: '03:10–03:14' },
  { wo: 'WO-7650', date: '11/16/99', window: '03:12–03:15' },
  { wo: 'WO-7702', date: '11/30/99', window: '03:10–03:14' },
  { wo: 'WO-7731', date: '12/07/99', window: '03:11–03:14' },
];
