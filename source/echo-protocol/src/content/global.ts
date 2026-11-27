// Story beats that can fire on any night, driven by suspicion thresholds.
import type { CallDef, MailDef } from '../engine/types';

export const GLOBAL_MAILS: MailDef[] = [
  {
    id: 'g_susp40',
    at: 0,
    from: 'Security Operations',
    addr: 'secops@mcra.hlts.com',
    subject: 'SENTINEL activity review',
    when: (s) => !!s.flags.susp40 && !s.flags.g_susp40_sent,
    effect: { flags: { g_susp40_sent: true } },
    body: `Automated notice.

SENTINEL has flagged activity under your login for review: copies to personal storage and lookups outside your assigned queue.

No action is required at this time. All activity continues to be logged.

— Security Operations`,
  },
];

export const GLOBAL_CALLS: CallDef[] = [
  {
    id: 'g_interview',
    at: 0,
    from: 'pike',
    place: 'Security Office · Annex',
    when: (s) => !!s.flags.susp70 && !s.flags.interviewed,
    start: 'a',
    nodes: {
      a: { who: 'them', text: '{mr} {last}. Captain Pike. SENTINEL has been flagging your login for two days. Copies to personal storage. Lookups outside your queue.', effect: { flags: { interviewed: true } }, next: 'b' },
      b: {
        who: 'them',
        text: 'Explain it to me. Slowly.',
        choices: [
          { text: "Curiosity. I'm new. I'm learning the systems.", to: 'c1', effect: { suspicion: -10 } },
          { text: 'Something is wrong on B3, and I think you know it.', to: 'c2', effect: { suspicion: -15, flags: { pike: 'ally' } } },
          { text: "I don't know what you mean.", to: 'c3', effect: { suspicion: 5 } },
        ],
      },
      c1: { who: 'them', text: 'Curiosity is how people lose their clearance. This is your only warning.', next: 'z' },
      c2: { who: 'them', text: '...Not on this line. Stop copying things to that workstation. If you need something looked at, you bring it to me in person.', next: 'z' },
      c3: { who: 'them', text: "Then you won't mind me watching a little closer.", next: 'z' },
      z: { who: 'them', text: 'Back to your queue.', end: true },
    },
  },
];
