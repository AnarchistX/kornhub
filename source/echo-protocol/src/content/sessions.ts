import type { GameState } from '../engine/types';

/** SENTINEL session audit, visible with night-lead access (Act II). {login} is the player. */
export interface SessionEntry {
  date: string;
  time: string;
  user: string;
  app: string;
  action: string;
  night?: number;
  at?: number;
  hot?: boolean; // worth noticing
}

export const SESSION_LOG: SessionEntry[] = [
  { date: '12/06/99', time: '22:52', user: '{login}', app: 'SENTINEL', action: 'LOGON · night operations' },
  { date: '12/09/99', time: '04:02', user: '{login}', app: 'HL-BKP', action: 'RESTORE pwhitlock/Drafts → local' },
  { date: '12/10/99', time: '02:12', user: 'tolliver', app: 'LOGS', action: 'VIEW badge history 0417', hot: true },
  { date: '12/10/99', time: '02:19', user: 'tolliver', app: 'LOGS', action: 'EXPORT badge history 0417 → A:\\ (floppy)', hot: true },
  { date: '12/10/99', time: '02:31', user: 'tolliver', app: 'RECORDS', action: 'VIEW RX-3305 camera work orders', hot: true },
  { date: '12/11/99', time: '09:40', user: 'svc_recsys', app: 'FILES', action: 'READ C:\\USERS\\{LOGIN}\\NOTES.TXT', hot: true },
  { date: '12/11/99', time: '09:41', user: 'svc_recsys', app: 'FILES', action: 'LIST C:\\USERS\\{LOGIN}\\RESTORE\\', hot: true },
  { date: '12/12/99', time: '14:02', user: 'kraemer', app: 'HR', action: 'STATUS tolliver → ADMINISTRATIVE LEAVE' },
  { date: '12/13/99', time: '09:15', user: 'kraemer', app: 'SENTINEL', action: 'GRANT {login} → NIGHT LEAD' },
  { night: 5, at: 1, date: '12/13/99', time: '22:58', user: '{login}', app: 'SENTINEL', action: 'LOGON · night lead' },
  { night: 6, at: 1, date: '12/14/99', time: '10:31', user: 'svc_recsys', app: 'FILES', action: 'READ C:\\USERS\\{LOGIN}\\NOTES.TXT', hot: true },
  { night: 6, at: 2, date: '12/15/99', time: '22:57', user: '{login}', app: 'SENTINEL', action: 'LOGON · night lead' },
  { night: 7, at: 1, date: '12/16/99', time: '16:44', user: 'ashcombe', app: 'PERSONNEL', action: 'VIEW 1187 ({LOGIN})', hot: true },
  { night: 7, at: 2, date: '12/17/99', time: '22:55', user: '{login}', app: 'SENTINEL', action: 'LOGON · night lead' },
  { night: 8, at: 1, date: '12/20/99', time: '22:56', user: '{login}', app: 'SENTINEL', action: 'LOGON · night lead' },
  { night: 9, at: 1, date: '12/23/99', time: '22:59', user: '{login}', app: 'SENTINEL', action: 'LOGON · night lead' },
];

export const visibleSession = (e: SessionEntry, s: GameState) => !e.night || e.night < s.night.n || (e.night === s.night.n && (e.at ?? 0) <= s.night.minute);
