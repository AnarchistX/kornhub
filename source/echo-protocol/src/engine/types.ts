// Core data model. Everything in GameState must stay JSON-serializable (it is saved to localStorage).

export type Gender = 'male' | 'female';
export type AreaId = 'ADM' | 'OPS' | 'B1' | 'B2' | 'B3' | 'B3V';
export type Level = 1 | 2 | 3 | 4 | 5;
export type Status = 'ACTIVE' | 'TERMINATED' | 'DECEASED';
export type DirectiveId = 'D1' | 'D2' | 'D3' | 'D4' | 'D5';
export type AppId = 'queue' | 'directives' | 'mail' | 'logs' | 'personnel' | 'notes';

export interface PortraitSpec {
  seed: number;
  sex: 'm' | 'f';
  hair: number; // style index, interpreted per sex
  glasses?: boolean;
  beard?: boolean;
  gray?: boolean;
}

export interface Person {
  id: string;
  last: string;
  first: string;
  badge: string;
  title: string;
  dept: string;
  level: Level;
  supervisor: string | null; // person id
  status: Status;
  statusDate?: string; // MM/DD/YY
  expires: string; // MM/DD/YY
  photo: PortraitSpec;
  external?: string; // organisation, for people who are not site staff
}

export interface Area {
  id: AreaId;
  name: string;
  level: Level;
  compartment?: string;
}

export interface Directive {
  id: DirectiveId;
  code: string;
  title: string;
  text: string;
  cite: string; // short label used when citing a denial
}

export type Decision = 'approve' | 'deny' | 'forward';

export interface AccessTicket {
  kind: 'access';
  id: string;
  ref: string;
  at: number; // game minutes after 23:00
  requester: string;
  area: AreaId;
  date: string;
  window: string;
  purpose: string;
  approver: string;
  remark?: string;
  tutorial?: string;
}

export interface AlertTicket {
  kind: 'alert';
  id: string;
  ref: string;
  at: number;
  title: string;
}

export type Ticket = AccessTicket | AlertTicket;

export interface MailDef {
  id: string;
  at: number;
  from: string;
  addr: string;
  subject: string;
  body: string;
  personal?: boolean;
  unlocks?: DirectiveId[];
  when?: (s: GameState) => boolean; // optional condition, evaluated on arrival
}

export interface NetSendDef {
  id: string;
  at: number;
  from: string;
  body: (s: GameState) => string;
}

export interface BadgeLogEntry {
  date: string; // MM/DD/YY
  time: string; // HH:MM:SS
  reader: string;
  badge: string;
  event: 'GRANTED' | 'DENIED' | 'FAULT';
  at?: number; // only for entries that happen during the current night (game minute)
}

export interface NightDef {
  n: number;
  weekday: string;
  date: string; // start date, MM/DD/YY
  nextDate: string; // date after midnight
  longDate: string;
  daysLeft: number;
  minuteMs: number; // real milliseconds per game minute
  directives: DirectiveId[];
  tickets: Ticket[];
  mails: MailDef[];
  netsends: NetSendDef[];
}

export type Screen = 'title' | 'profile' | 'cutscene' | 'card' | 'boot' | 'desktop' | 'report' | 'tbc' | 'ending';

export interface Profile {
  first: string;
  last: string;
  gender: Gender;
  photo: PortraitSpec;
}

export interface TicketResult {
  decision: Decision | 'log' | 'escalate';
  cite?: DirectiveId;
  correct: boolean;
  error?: string;
  at: number;
}

export interface Notice {
  id: string;
  kind: 'warning' | 'writeup';
  ref: string;
  text: string;
}

export interface NoteItem {
  id: string;
  title: string;
  body: string;
  night: number;
}

export interface NightState {
  n: number;
  minute: number;
  started: boolean;
  ended: boolean;
  arrived: string[];
  results: Record<string, TicketResult>;
  mails: string[];
  read: string[];
  directives: DirectiveId[];
  newDirectives: DirectiveId[];
  errors: number;
  netsends: string[];
  popup: string | null; // net send id currently on screen
  notices: Notice[];
  introDone: boolean; // Ray's first sticky note dismissed
}

export interface NightReport {
  n: number;
  processed: number;
  total: number;
  correct: number;
  errors: number;
  writeups: number;
}

export interface GameState {
  v: 1;
  screen: Screen;
  cutscene: string | null;
  next: Screen | null; // where a cutscene goes when it ends
  profile: Profile | null;
  night: NightState;
  writeups: number;
  suspicion: number;
  flags: Record<string, string | number | boolean>;
  notes: NoteItem[];
  scratch: string;
  reports: NightReport[];
  ending: string | null;
}

export interface Settings {
  master: number;
  music: number;
  sfx: number;
  ambience: number;
  crt: number; // 0 off, 1 subtle, 2 full
  textSpeed: number; // 0 instant, 1 normal, 2 slow
}
