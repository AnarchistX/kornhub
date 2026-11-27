import type { GameState, NightDef, Person, Profile } from './types';
import { CONTACTS, PEOPLE, PLAYER_BADGE, PLAYER_ID } from '../content/world';

/** MM/DD/YY → sortable number (YYYYMMDD). Two-digit years below 50 are 20xx. */
export function dateNum(d: string): number {
  const [m, day, y] = d.split('/').map(Number);
  const year = y < 50 ? 2000 + y : 1900 + y;
  return year * 10000 + m * 100 + day;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Wall clock for a game minute (0 = the shift start, 23:00 unless the night says otherwise). */
export function clockAt(night: NightDef, minute: number) {
  const total = (night.startHour ?? 23) * 60 + Math.floor(minute);
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  const date = total >= 24 * 60 ? night.nextDate : night.date;
  return { date, time: `${pad(h)}:${pad(m)}`, h, m };
}

export const shiftLength = (night: NightDef) => night.shiftMinutes ?? 480;
export const startClock = (night: NightDef) => clockAt(night, 0).time;
export const endClock = (night: NightDef) => clockAt(night, shiftLength(night));

export function loginName(p: Profile): string {
  const last = p.last.toLowerCase().replace(/[^a-z]/g, '');
  const first = p.first.toLowerCase().replace(/[^a-z]/g, '');
  return (last.slice(0, 7) + first.slice(0, 1)) || 'operator';
}

export function playerPerson(p: Profile): Person {
  return {
    id: PLAYER_ID,
    last: p.last,
    first: p.first,
    badge: PLAYER_BADGE,
    title: 'NOC Technician I (Nights)',
    dept: 'Operations (Halvard-Lowe)',
    level: 2,
    supervisor: 'tolliver',
    status: 'ACTIVE',
    expires: '12/06/00',
    photo: p.photo,
  };
}

export function allPeople(profile: Profile | null): Person[] {
  const list = Object.values(PEOPLE);
  return profile ? [...list, playerPerson(profile)] : list;
}

export function personById(id: string, profile: Profile | null): Person | undefined {
  if (id === PLAYER_ID && profile) return playerPerson(profile);
  return PEOPLE[id] ?? CONTACTS[id];
}

export function personByBadge(badge: string, profile: Profile | null): Person | undefined {
  return allPeople(profile).find((p) => p.badge === badge);
}

export function displayName(p: Person): string {
  return `${p.last}, ${p.first}`;
}

export function shortName(p: Person): string {
  return `${p.last}, ${p.first.charAt(0)}.`;
}

/** Replace {first} {last} {login} {mr} {they} {them} {their} with profile values. */
export function fill(text: string, s: Pick<GameState, 'profile'>): string {
  const p = s.profile;
  if (!p) return text;
  const male = p.gender === 'male';
  const map: Record<string, string> = {
    first: p.first,
    last: p.last,
    login: loginName(p),
    mr: male ? 'Mr.' : 'Ms.',
    they: male ? 'he' : 'she',
    them: male ? 'him' : 'her',
    their: male ? 'his' : 'her',
    badge: PLAYER_BADGE,
  };
  return text.replace(/\{(\w+)\}/g, (all, key: string) => map[key] ?? all);
}
