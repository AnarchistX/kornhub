// Core data model. Everything in GameState must stay JSON-serializable (it is saved to localStorage).
// Content definitions (NightDef and friends) may hold functions: they are code, never saved.

export type Gender = 'male' | 'female';
export type AreaId = 'ADM' | 'OPS' | 'B1' | 'B2' | 'B3' | 'B3V';
export type Level = 1 | 2 | 3 | 4 | 5;
export type Status = 'ACTIVE' | 'TERMINATED' | 'DECEASED';
export type DirectiveId = 'D1' | 'D2' | 'D3' | 'D4' | 'D5' | 'D6' | 'D7' | 'D8' | 'D9' | 'D10';
export type AppId = 'queue' | 'directives' | 'mail' | 'logs' | 'personnel' | 'notes' | 'terminal';
export type CamId = 'gate' | 'corridor' | 'b3east';

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

/** Changes a story beat makes to the game state. Plain data so it can live in content files. */
export interface Effect {
  flags?: Record<string, string | number | boolean>;
  suspicion?: number;
  note?: { id: string; title: string; body: string };
}

interface TicketBase {
  id: string;
  ref: string;
  at: number; // game minutes after 23:00
  remark?: string;
  tutorial?: string;
}

export interface AccessTicket extends TicketBase {
  kind: 'access';
  requester: string;
  area: AreaId;
  date: string;
  window: string;
  purpose: string;
  approver: string;
}

export interface ChangeTicket extends TicketBase {
  kind: 'change';
  change: string;
  system: string;
  title: string;
  requester: string;
  window: string;
  cab: string;
  description: string;
}

export interface RecordsTicket extends TicketBase {
  kind: 'records';
  requester: string;
  record: string;
  purpose: string;
}

export interface CamResult {
  cam: CamId;
  date: string;
  time: string;
  unavailable?: string;
  figure?: boolean;
}

export interface AlertLine {
  k: string;
  v: string;
  link?: 'person' | 'history';
}

export interface AlertTicket extends TicketBase {
  kind: 'alert';
  title: string;
  heading: string;
  lines: AlertLine[];
  badge?: string; // for [look up] and [pull badge history]
  person?: string; // person id the badge resolves to
  camera?: (s: GameState) => CamResult;
  flag: string; // where the disposition is stored
  options: { value: 'log' | 'escalate'; label: string }[];
  done: { log: string; escalate: string };
}

export type Ticket = AccessTicket | ChangeTicket | RecordsTicket | AlertTicket;

export interface CalendarEntry {
  change: string;
  system: string;
  window: string;
  cab: string;
  owner: string;
}

export interface RecordDef {
  id: string;
  title: string;
  level: Level;
  dept: string;
  compartment?: string;
  hold?: string;
  contents?: string; // shown once released
}

export interface MailDef {
  id: string;
  at: number;
  from: string;
  addr: string;
  subject: string;
  body: string;
  personal?: boolean;
  unlocks?: DirectiveId[];
  when?: (s: GameState) => boolean; // delivered at or after `at`, once this is true
  effect?: Effect;
}

export interface NetSendDef {
  id: string;
  at: number;
  from: string;
  body: (s: GameState) => string;
  when?: (s: GameState) => boolean;
  effect?: Effect;
}

export interface CallChoice {
  text: string;
  to: string;
  effect?: Effect;
}

export interface CallNode {
  who: 'them' | 'you' | 'sys';
  text: string | ((s: GameState) => string);
  next?: string | ((s: GameState) => string);
  choices?: CallChoice[];
  effect?: Effect;
  end?: boolean;
}

export interface CallDef {
  id: string;
  at: number;
  from: string; // person id
  place: string;
  when?: (s: GameState) => boolean;
  start: string;
  nodes: Record<string, CallNode>;
}

export interface BadgeLogEntry {
  date: string; // MM/DD/YY
  time: string; // HH:MM:SS
  reader: string;
  badge: string;
  event: 'GRANTED' | 'DENIED' | 'FAULT';
  night?: number; // appears during this night at minute `at`; earlier nights see nothing, later nights see history
  at?: number;
  purge?: { flag: string; value: string; at: number; night: number }; // scrubbed when the flag matches
}

export interface NightDef {
  n: number;
  weekday: string;
  date: string; // start date, MM/DD/YY
  nextDate: string; // date after midnight
  longDate: string;
  daysLeft: number;
  minuteMs: number; // real milliseconds per game minute
  sticky: string; // Ray's note on the monitor
  directives: DirectiveId[];
  apps?: AppId[]; // extra apps available from the start of the night
  tickets: Ticket[];
  mails: MailDef[];
  netsends: NetSendDef[];
  calls: CallDef[];
  calendar: CalendarEntry[];
  records: string[]; // ids of records in the index tonight
  /** Night-specific simulation (e.g. the Night 4 tape restore). Pure: returns the next state. */
  onTick?: (s: GameState) => GameState;
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
  calls: string[];
  popup: string | null; // messenger popup or call id currently on screen
  notices: Notice[];
  introDone: boolean; // Ray's sticky note dismissed
}

export interface NightReport {
  n: number;
  processed: number;
  total: number;
  correct: number;
  counted: number;
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
