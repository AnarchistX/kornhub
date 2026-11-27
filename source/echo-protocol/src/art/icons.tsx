// Hand-drawn 1999-style icons. Two tones plus one accent, drawn on a 32px grid.
import type { AppId } from '../engine/types';

type P = { className?: string };
const S = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true" shapeRendering="crispEdges">
    {children}
  </svg>
);

const ink = '#1c1b19';
const paper = '#f6f0e1';
const putty = '#cbc4b4';
const navy = '#34508a';
const red = '#c23b22';
const amber = '#ffb547';

export const QueueIcon = ({ className }: P) => (
  <S className={className}>
    <rect x="4" y="15" width="24" height="12" fill={putty} stroke={ink} strokeWidth="2" />
    <rect x="8" y="5" width="16" height="13" fill={paper} stroke={ink} strokeWidth="2" />
    <path d="M11 9h10M11 12h10M11 15h6" stroke={ink} strokeWidth="1.5" />
    <path d="M4 15h7l2 4h6l2-4h7" fill="none" stroke={ink} strokeWidth="2" />
  </S>
);

export const DirectivesIcon = ({ className }: P) => (
  <S className={className}>
    <rect x="6" y="3" width="21" height="26" fill={navy} stroke={ink} strokeWidth="2" />
    <rect x="9" y="7" width="15" height="7" fill={paper} stroke={ink} strokeWidth="1.5" />
    <path d="M11 10h11" stroke={ink} strokeWidth="1.5" />
    <rect x="3" y="7" width="6" height="3" fill={putty} stroke={ink} strokeWidth="1.5" />
    <rect x="3" y="15" width="6" height="3" fill={putty} stroke={ink} strokeWidth="1.5" />
    <rect x="3" y="23" width="6" height="3" fill={putty} stroke={ink} strokeWidth="1.5" />
  </S>
);

export const MailIcon = ({ className }: P) => (
  <S className={className}>
    <rect x="3" y="8" width="26" height="17" fill={paper} stroke={ink} strokeWidth="2" />
    <path d="M3 8l13 10 13-10" fill="none" stroke={ink} strokeWidth="2" />
    <rect x="22" y="11" width="4" height="4" fill={red} />
  </S>
);

export const LogsIcon = ({ className }: P) => (
  <S className={className}>
    <rect x="3" y="5" width="26" height="20" fill="#0d0a05" stroke={ink} strokeWidth="2" />
    <path d="M7 10h8M7 14h12M7 18h6" stroke={amber} strokeWidth="2" />
    <rect x="21" y="17" width="3" height="3" fill={amber} />
    <rect x="11" y="25" width="10" height="3" fill={putty} stroke={ink} strokeWidth="1.5" />
  </S>
);

export const PersonnelIcon = ({ className }: P) => (
  <S className={className}>
    <rect x="3" y="7" width="26" height="19" fill={paper} stroke={ink} strokeWidth="2" />
    <rect x="6" y="11" width="8" height="10" fill={putty} stroke={ink} strokeWidth="1.5" />
    <circle cx="10" cy="14.5" r="2" fill={ink} />
    <path d="M7 20.5c1-2 5-2 6 0" fill={ink} />
    <path d="M17 12h9M17 16h9M17 20h6" stroke={ink} strokeWidth="1.5" />
    <rect x="13" y="4" width="6" height="4" fill={navy} stroke={ink} strokeWidth="1.5" />
  </S>
);

export const NotesIcon = ({ className }: P) => (
  <S className={className}>
    <rect x="6" y="4" width="20" height="25" fill="#fffbea" stroke={ink} strokeWidth="2" />
    <path d="M9 11h14M9 15h14M9 19h14M9 23h9" stroke="#8fa7d1" strokeWidth="1.5" />
    <path d="M9 4v25" stroke={red} strokeWidth="1" />
    <path d="M20 24l7-11 2 1.5-7 11-3 1z" fill={amber} stroke={ink} strokeWidth="1.2" />
  </S>
);

export const SentinelMark = ({ className }: P) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <path d="M32 3l25 9v18c0 15-10.5 26-25 31C17.5 56 7 45 7 30V12z" fill="none" stroke="currentColor" strokeWidth="3" />
    <path d="M32 13l15 5.4V30c0 9.5-6.3 16.6-15 20-8.7-3.4-15-10.5-15-20V18.4z" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M23 24h18M23 31h18M27 38h10" stroke="currentColor" strokeWidth="3" />
  </svg>
);

export const EyeIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="3.6" fill="currentColor" />
  </svg>
);

export const WarnIcon = ({ className }: P) => (
  <S className={className}>
    <path d="M16 3l14 25H2z" fill={amber} stroke={ink} strokeWidth="2" strokeLinejoin="round" />
    <rect x="14.5" y="11" width="3" height="9" fill={ink} />
    <rect x="14.5" y="22" width="3" height="3" fill={ink} />
  </S>
);

export const InfoIcon = ({ className }: P) => (
  <S className={className}>
    <circle cx="16" cy="16" r="13" fill={paper} stroke={ink} strokeWidth="2" />
    <rect x="14.5" y="13" width="3" height="11" fill={navy} />
    <rect x="14.5" y="8" width="3" height="3" fill={navy} />
  </S>
);

export const BackIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M15 4l-8 8 8 8" fill="none" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

export const MenuIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

export const RulesIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M5 3h12l2 2v16H5z" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const TerminalIcon = ({ className }: P) => (
  <S className={className}>
    <rect x="3" y="5" width="26" height="20" fill="#0d0a05" stroke={ink} strokeWidth="2" />
    <path d="M7 10l4 3-4 3" fill="none" stroke={amber} strokeWidth="2" />
    <rect x="13" y="16" width="7" height="2" fill={amber} />
    <rect x="9" y="25" width="14" height="3" fill={putty} stroke={ink} strokeWidth="1.5" />
  </S>
);

export const APP_ICONS: Record<AppId, (p: P) => React.ReactElement> = {
  queue: QueueIcon,
  directives: DirectivesIcon,
  mail: MailIcon,
  logs: LogsIcon,
  personnel: PersonnelIcon,
  notes: NotesIcon,
  terminal: TerminalIcon,
};

export const APP_NAMES: Record<AppId, string> = {
  queue: 'Queue',
  directives: 'Directives',
  mail: 'Mail',
  logs: 'Logs',
  personnel: 'Personnel',
  notes: 'Notes',
  terminal: 'Terminal',
};
