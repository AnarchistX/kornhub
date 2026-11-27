# ECHO PROTOCOL — Design Document

> **Spoiler warning.** This is the full story bible. It is the source of truth for
> every future build session: read it before adding content.

## 1. Pitch

December 1999. You are a new night-shift network technician at Marrow Creek, a
federal biodefense lab on a ridge in West Virginia. The job is the game: every
shift you work a queue of tickets against a rulebook that changes every night.
But the job puts you in front of everyone's files, and things stop adding up.
A dead scientist's badge still swipes into the containment level at 3 a.m.
Somebody inside your own government built a weapon called ECHO, a foreign
intelligence service wants it, and the whole thing is scheduled to vanish at
midnight on New Year's Eve, when the world expects computers to fail anyway.

**Feel:** grounded techno-thriller (Jack Ryan, Chernobyl). Papers, Please's
work loop and moral squeeze, Simulacra / Her Story's "you are reading someone
else's computer," a 1999 period look as distinctive as Papers, Please's.

## 2. Decisions locked with the owner (questionnaire, Nov 2026)

| # | Topic | Decision |
|---|---|---|
| 1 | Setting | **1999.** CRTs, fax, grainy video calls, Y2K deadline as the clock |
| 2 | Tone | **Grounded thriller** |
| 3 | Antagonists | **Both sides:** insiders built it, a foreign service wants it |
| 4 | Names | **Real US agencies; invented countries, companies, pathogen** |
| 5 | Player | **Blank slate:** choose male/female operative, type your name. **Local saves** so a reload loses nothing |
| 6 | Life outside | **Light:** personal messages, no money system |
| 7 | Days | **Timed shifts early**, routine collapses as the conspiracy takes over |
| 8 | Puzzles | **Mostly detective work**, short tense hacking moments |
| 9 | Difficulty | **Challenging but fair:** optional hints, suspicion, fired/arrested endings |
| 10 | Choices | **Big branches, multiple endings** |
| 11 | Art | **Illustrated stills, subtle motion, two-tone "declassified file" look** |
| 12 | Cutscenes | **All built in code** |
| 13 | Voices | **No paid voice tools.** Text + code-made sound (typing blips, line hiss) |
| 14 | Music | **Owner makes the themes; code makes the reactive layer** |
| 15 | Length | **3–4 hours, three acts**, replayable for other endings |
| 16 | Name | **Echo Protocol**; ECHO is the weapon program's codename |
| 17 | Assets | **Code-first.** No external art/voice/video pipeline |

## 3. World

**Marrow Creek Biological Research Annex** ("the Annex"), Kessick County,
West Virginia (fictional county). Built 1958, officially to study crop blight.
Run by the U.S. Department of Defense through the (fictional) **Defense
Biological Programs Office (DBPO)**; facility operations and IT are contracted
to **Halvard-Lowe Biosystems** (fictional). You work for Halvard-Lowe Technical
Services, not the government. That matters later: contractors are deniable.

**Areas and clearance levels**

| Code | Area | Level |
|---|---|---|
| ADM | Administration Wing | L1 |
| OPS | Operations Wing (NOC, server room) | L2 |
| B1 | Laboratory Level B1 | L3 |
| B2 | Laboratory Level B2 | L3 |
| B3 | Containment Level B3 | L4 |
| B3-V | B3 Vault, compartment **ECHO** | compartmented, not processed by Night Ops |

Levels: L1 General · L2 Operations · L3 Research · L4 Containment · L5 Program.

**The workstation OS: SENTINEL 4.0** by Halvard-Lowe Systems (fictional). Putty
chrome, bevels, navy title bars, amber terminal, typewriter documents.
Government classification banners top and bottom
(`UNCLASSIFIED//FOR OFFICIAL USE ONLY`, green). Banners turn red when a window
shows compartmented material. The login shows the real-world-style monitoring
consent notice. Messages arrive as Messenger Service popups ("net send").

## 4. The conspiracy (spoilers)

- **Strain 31.** A Soviet-era agent developed at the Kalnitsa Institute in the
  **Republic of Orvessa** (fictional post-Soviet Black Sea state).
- **1993.** Kalnitsa scientist **Dr. Teodor Vlasko** defects to the US with
  samples. He is resettled under a new identity: **Dr. Paul Whitlock**, who
  goes to work at Marrow Creek.
- **1994–99.** A compartmented program inside the Annex, **ECHO**, turns
  Strain 31 into **EV-31** ("echo variant 31"): a two-phase illness that looks
  like a mild flu, appears to clear, and returns two weeks later, severe. It
  spreads before anyone knows there is an outbreak. (Keep all science vague and
  fictional. Never describe real methods.) ECHO is illegal under the Biological
  Weapons Convention. Its people call it deterrence.
- **Program owners:** Deputy Director **Dr. Martin Ashcombe** (runs it on site),
  **Col. Dennis Varga** (DBPO, Pentagon), and Halvard-Lowe VP **Celia Marsh**
  (money; H-L stands to own the stocks).
- **Oct 14, 1999.** Whitlock, about to send a letter to the Senate Select
  Committee on Intelligence, dies in a single-car crash on **Route 9**. It was
  not an accident. H-L's security contractor arranged it; Ashcombe knows.
- **Since then.** Ashcombe enters the B3 Vault after hours **with Whitlock's
  badge (0417)** so his own badge never logs it. The B3-EAST camera is put in a
  "maintenance window" each time. Night Ops was told to log the swipes as reader
  faults (**known issue KI-114**). Ray Tolliver followed orders without asking.
- **The plan ("Rollover").** A Senate inquiry starts in January 2000. At
  00:00 on Jan 1, 2000 a planted "Y2K date bug" (change request
  **RECSYS-Y2K-0047**, which *you approve* in Act I because it passes every
  rule) wipes the Records System, and a "Y2K contingency transfer" moves the
  EV-31 stocks to Halvard-Lowe's private facility abroad.
- **The Orvessan State Security Directorate** ("the Directorate") wants Strain
  31 back: to bury evidence of its own program, or to restart it. Its officer
  **LANTERN** (true name **Mirela Stanek**) cultivated Whitlock, and after his
  death starts cultivating *you*. LANTERN's hints are always correct, because
  LANTERN needs you to succeed.
- **The FBI.** Counterintelligence Special Agent **Ruth Calloway**
  (Pittsburgh Field Office) is tracking Directorate officers in the region.
  She does not know about ECHO.

## 5. Characters

| Name | Role | Notes |
|---|---|---|
| **You** | NOC Technician I (Nights), L2 | Player-named, M/F. Badge 1187. New this week |
| Raymond "Ray" Tolliver | Night Operations Supervisor, L3 | Ex-Army signals, gruff, decent, compliant. Talks in sticky notes |
| Toby Marchetti | NOC Technician (Days), L2 | Chatty, Y2K doomsday prepper. Comic relief, red herring |
| Capt. Lorna Pike | Facility Security Officer, L4 | Sharp, suspicious, honest. Runs audits. Possible late ally |
| Dr. Martin Ashcombe | Deputy Director of Research, L5 | Warm, paternal. Runs ECHO |
| Dr. Naomi Reyes | Senior Research Scientist, L4 | Whitlock's colleague. Scared. Wants his files |
| Dr. Paul Whitlock | Senior Research Scientist, L4 | **Deceased 10/14/99.** Badge 0417. Really Teodor Vlasko |
| Col. Dennis Varga | Program Manager, DBPO | Hardliner. Never on site |
| Celia Marsh | VP Government Programs, Halvard-Lowe | The money |
| Judith Kraemer | Operations Manager, H-L, L4 | Ray's boss |
| Dr. Richard Coyle | Facility Director, L5 | Absent, mostly in DC |
| Gail Brennan | Facilities Supervisor, L3 | |
| Dwayne Hollis | Facilities Maintenance Tech, L2 | |
| Carla Odom | Laboratory Technician, L3 | Reports to Reyes |
| Marcus Sato | Research Associate, L3 | Reports to Reyes |
| Leon Pruitt | Security Officer, L3 | Badge expired 11/30/99, keeps asking anyway |
| Bernie Quinlan | Security Officer (gate), L2 | |
| Rosa Delgado | Custodial (contractor), L1 | |
| Ken Garrity | Lab Technician | **Terminated 11/19/99** |
| LANTERN | Messenger Service contact | Orvessan Directorate. Writes formal English, no contractions, **DD/MM dates** |
| SA Ruth Calloway | FBI Counterintelligence | Enters in Act II |
| Casey | Your younger sibling | College in Morgantown. Light personal emails |
| Ellen Nakamura | Systems Engineer (H-L), L3 | Files most Y2K changes |
| Curtis Boyd | Network Engineer (H-L), L3 | Thinks you hate him (DNS) |
| Hal Lindqvist | Facilities Engineer, L3 | HVAC and camera firmware |
| Dale Ferris | Records Clerk, L3 | Records Management |
| Eugene Arliss | Legal Counsel, L4 | Placed the legal hold on Whitlock's mail |

## 6. Structure

**Act I — NIGHT SHIFT** (Nights 1–4, Dec 6–10). Timed shifts, Papers, Please loop.

- **Night 1 — Mon Dec 6** *(built)*. Tutorial via Ray's notes. ACCESS tickets,
  directives D-1 to D-4, D-5 (compartments, FORWARD) added at 01:20 by email.
  First "ECHO" sighting on a forwarded ticket. **03:12: reader fault, badge 0417
  = Whitlock, deceased.** Player can pull the badge log (five 03:1x entries
  since his death), check the B3-EAST camera (feed unavailable 03:11–03:14),
  copy the log to Notes (+suspicion), then **LOG AS KI-114** (what Ray wants) or
  **ESCALATE** to Security. 06:58: LANTERN's first message, listing earlier dates
  in DD/MM format (21/10, 02/11, 16/11, 30/11).
- **Night 2 — Tue Dec 7** *(built)*. CHANGE tickets (D-6 calendar, D-7 CAB,
  D-8 window) against the Y2K Change Calendar. Ray video-calls to brief it (and
  reacts to the Night 1 choice); Pike calls if you escalated. **Trap:** Facilities
  asks to disable B3-EAST-CAM-2 03:00–03:20 with no CAB number. Denying it (the
  correct call) keeps the camera on, so the 03:14 still shows **a figure with gray
  hair and glasses** at the reader. Approving it is an error *and* blinds the
  camera ("RELEASED BY NIGHT OPERATIONS"). **RECSYS-Y2K-0047** arrives from
  Ashcombe's office and passes every rule. Cameras tab gains the work-order list
  (every 0417 visit has one, requester RESTRICTED). Mom's casserole email.
- **Night 3 — Wed Dec 8** *(built)*. RECORDS tickets (D-9 need-to-know: level AND
  department, D-10 legal hold) against the Records Index. Reyes calls about her
  request for Whitlock's archive (legal hold) and tells you he said to "read his
  drafts" and that he "wasn't from here." Approving her F-12 manifest request
  releases it: R7 checked out 4.20 kg, back 3.90 kg on 11/30, signed off "—M.A."
  Transfer alert: RECSYS exporting 14 MB to HL-CORP-XFER (Halvard-Lowe). Casey:
  her RA got better, then much worse two weeks later. LANTERN: the mailbox was
  deleted 15/10, the tapes rotate Friday 06:00.
- **Night 4 — Thu Dec 9** *(built)*. Audit sweeps every 30 min 02:00–06:00.
  **Trap:** Ashcombe's office asks to move the tape rotation to 03:30 (not on the
  calendar). Approving it moves the deadline. 01:40 LANTERN opens the **Terminal**
  (backup console). Restore minigame: audit the mailbox (deleted 10/15 08:12),
  pick a tape (C-2/C-3 hold the draft; A-2/C-1 are too old; C-4 is after the
  deletion), choose a target (live = fast and +20 suspicion, local +6, drafts +3),
  pause during sweeps (+10 each if caught running), beat the rotation. The
  letter names ECHO, EV-31, Ashcombe, Varga, Halvard-Lowe, F-12, and "the last
  night of the year." LANTERN: "Now you know why he is dead." End of Act I.

**Act II — COMPARTMENT** (Nights 5–9, Dec 13–23) *(built)*. The routine
collapses. Ray is on leave; you are acting night lead. Two new tools: the
**Sessions** tab in Logs (lead-only session audit) and the **Board** (evidence
board with five case files, see Systems). Supervisor remarks on the shift report
come from J. Kraemer instead of Ray.

- **Night 5 — Mon Dec 13** *(built)*. Kraemer makes you lead (unlocks
  Sessions). The audit shows Ray exported badge 0417's history to a floppy on
  12/10, and that `svc_recsys` read your NOTES.TXT on Saturday morning. Ray's
  "don't reply" email from home. **Lead exception** (story alert): Pike asks for
  a 72-hour exception for an expired badge; granting or denying sets
  `n5_exception`. Reyes calls: she told Ashcombe that Ray was asking (`reyes_guilt`) or
  that Paul "still got letters from home" (`reyes_home`). LANTERN points you at
  the Board. Case file **BADGE 0417** opens.
- **Night 6 — Wed Dec 15** *(built)*. Reyes's records request releases the F-12
  sensor log (RX-2216: DOOR OPEN 03:13:02 on 11/30). Ashcombe's office requests
  your personnel file (deny, D-9). **Logon failures on your account** at 01:55 from an
  Administration PC while you are logged on in the NOC (`n6_intrusion`: lock it
  or escalate). FBI Special Agent Ruth Calloway calls (`fbi_contact`);
  you can tell her about LANTERN or lie. Casey's floor closes. Case file
  **WHAT ECHO IS** opens.
- **Night 7 — Fri Dec 17** *(built)*. A **fax** from "RELAY · VIENNA": Paul
  Whitlock's photo on an Orvessan defector card, as Teodor Vlasko, DD/MM dates.
  LANTERN calls, voice only ("Someone who writes the date correctly") and asks
  for everything on the 23rd. Calloway follows up (`fbi_knows_23`). Case files
  **WHO WHITLOCK WAS** and **WHO LANTERN IS** open.
- **Night 8 — Mon Dec 20** *(built)*. OPS-Y2K-0058 is on the calendar now: the
  B3 cold-storage transfer to HL-OFFSITE, 12/31 23:30–00:30. Ashcombe calls on
  video and offers permanent lead, level four (`ashcombe`: accepted / stalled /
  refused, +10 suspicion if you accuse him). Reyes calls about Simon Hale at the
  Washington Ledger (`reyes_press`). Case file **ROLLOVER** opens.
- **Night 9 — Thu Dec 23** *(built)*. Change freeze. Calloway gives a fax number
  only she reads. At 01:30 LANTERN opens the **Outbox**. **Branch:** send the
  packet to the FBI, the press (needs `reyes_press`), LANTERN, Ashcombe (needs
  `ashcombe`), or wipe it all. `act2_choice` = fbi / press / lantern / ashcombe /
  none, `packet_strength` = case files confirmed (0–5). Each choice gets its own
  response call or message. End of Act II.

**Act III — ROLLOVER** (Night 10, Fri Dec 31, 22:00 → 01:00) *(built)*. One
three-hour shift at ~2.6 s per game minute, opened by the `rollover` cutscene
(snow on Route 9, the convoy already inside the fence). Curtis Boyd puts
**SYSCON** on your desk at 22:04 "for watching". Three things happen around
midnight, and the queue keeps running underneath them:

- **Gate 1 (23:30).** Convoy HL-7 (OPS-Y2K-0058, window 23:30–00:30) asks for the
  gate, in the queue and in SYSCON. Release it, or hold it on the night lead's
  exception (+6 suspicion). Unanswered at 23:40, the war room opens it remotely.
  While you hold, `svc_gate @ WAR-ROOM-03` tries remote overrides at 23:40, 23:48,
  23:56, 00:04, 00:12 and 00:21; each auto-accepts after 4 minutes unless you
  DENY it. Revoking `svc_gate` does nothing (it restarts under its parent
  session); revoking **cboyd**, the person behind it, ends the overrides (Kraemer's
  call names who sits at terminal 03). At 00:30 the window closes and the convoy
  is no longer authorized: `r_gate = expired`.
- **RECSYS-Y2K-0047 (23:50).** The job you released on Night 2 runs `/PURGE`.
  Its help lists `/ARCHIVE` (copies to tape set D in the Deputy Director's
  custody, then purges) and `/TEST` (a CAB rehearsal that writes nothing and logs
  SUCCESS): the quiet fix, +3. Or hold it outright on the lead exception, +12.
- **B3 HVAC (00:00).** AHU-1's controller reads 01/01/1900 and stops; B3
  pressure rises 3 Pa a minute from −42. Lindqvist's 23:00 call (also saved to
  Notes) gives the order: START AHU-2, OPEN damper D-2, then ISOLATE AHU-1. Wrong
  order costs pressure. At 0 Pa containment is lost: `echo`, immediately.
- **Fax (00:30).** Holiday forwarding ends and the NOC fax can dial out once: to
  Calloway (needs `fbi_contact`), Simon Hale (needs `reyes_press`) or LANTERN.

Calls by branch: Calloway (warrant at 00:30, keep the records alive; asks who the
leak is at 00:08), Reyes from the B3 loading dock, LANTERN ("give it the gate",
and again at 23:56 if you held), Ashcombe (release it / let 0047 run; he calls the
moment you hold), Pike (backs a hold if she is an ally), Kraemer, Lindqvist.

**Endings** (`resolveEnding` in `content/rollover.ts`, epilogues in
`content/endings.ts`, one cutscene each):

| id | Name | How |
|---|---|---|
| `daylight` | Daylight | Convoy held, records saved (`/TEST` or held), the press has it (Act II choice or the 00:30 fax), 3+ case files (best) |
| `bureau` | The Bureau | Convoy held and the FBI is involved (Act II choice, the fax, or Calloway's number) |
| `route9` | Route 9 | Convoy held, nobody coming: no FBI, no press. Whitlock's ending |
| `blackout` | Blackout | Convoy gone and you weren't on anyone's side |
| `lantern` | Lantern | Convoy gone, LANTERN's team waiting on Route 9 (Act II choice, or you opened it for LANTERN) |
| `company` | Company Man | You took Ashcombe's offer, released the convoy, and let 0047 purge |
| `echo` | Echo | B3 pressure reached 0 Pa (worst) |
| `detained` | Detained | Suspicion reached 100 |
| `terminated` | Terminated | Three write-ups |

The ending screen shows the epilogue, where everyone ended up, your record,
**endings found** on this device (`kxrnage.echo.endings.v1`), and two replays:
the finale, or Night 9 again (a separate checkpoint, `…checkpoint.v1.n9`).

## 7. Systems

**Shift loop.** 23:00 → 07:00 game time. Night 1 runs ~1.25 s per game minute
(≈10 min real time); later nights get faster or busier. The clock pauses when
the tab is hidden, a modal/tutorial/messenger popup is open, or the game is
paused. Tickets arrive at fixed times. Unprocessed tickets at 07:00 are backlog.

**Ticket kinds.** `access` (N1+), `alert` (story events, N1+), `change` (N2+),
`records` (N3+). Change answers come from the calendar; records answers from the
Records Index plus the requester's personnel record. The deny menu only offers the
directives that apply to that ticket kind. Access answers are **computed from the rules**, never
hand-authored, so content can't contradict itself:
- D-1 clearance ≥ area level · D-2 approver is the listed supervisor (no one
  else) · D-3 badge valid on the access date · D-4 personnel ACTIVE ·
  D-5 compartmented areas are FORWARDED unprocessed.
- APPROVE when no violations. DENY must cite a violated directive.
  FORWARD is correct for compartmented requests.

**Errors.** Two warnings per night are free. Further errors are write-ups.
Three write-ups in total = `terminated`. Tutorial tickets never count.

**Suspicion** (0–100). Rises when you snoop: copying records to Notes, using
terminal tools, out-of-scope lookups, lying to Security. Falls slowly on clean
nights. Shown as the session monitor eye in the tray. 40: Security notice.
70: audit interview. 100: `detained`.

**Notes / evidence.** Items copied from logs, mail, records. Copying is how you
remember; the Board is how you prove.

**Evidence board** (`content/board.ts`, `apps/Board.tsx`, Night 5+). Five case
files, each a few sentences with blanks (selects over a shared noun list). A case
is confirmed only when **every** blank in it is right, so guessing one blank at a
time doesn't work. Files unseal as the story reaches them:

| Case | Opens | Answer, in short |
|---|---|---|
| 1 · The Badge | Night 5 | 0417 = Whitlock, died 10/14; B3 east airlock ~3 a.m. under camera work orders; the user is Ashcombe |
| 2 · The Program | Night 6 | not a vaccine program, EV-31; kept in F-12; 300 g out on 11/30, signed by Ashcombe |
| 3 · The Defector | the fax (N7) | Whitlock was Vlasko; defected 1993 from Kalnitsa; died because he was about to testify |
| 4 · LANTERN | the fax (N7) | writes the day first; works for the Orvessan Directorate; wants the EV-31 stock |
| 5 · Rollover | Night 8 | midnight: 0047 wipes; 0058 moves F-12 to the offshore lab; signed by Ashcombe and Varga |

After two failed confirms, **Ask LANTERN** fixes one wrong blank (`flags.hints`
counts these; LANTERN remembers). Confirmed cases set `case_<id>` and add to
`solved`, which becomes the packet's strength.

**Outbox** (Night 9, after LANTERN opens it). Pick one recipient, confirm, and the
choice is final: `act2_choice`, `packet_strength` (cases confirmed) and
`packet_notes` (notes held). Recipients unlock from earlier choices: the FBI
needs Calloway's call, the press needs Reyes's offer, the Deputy Director needs
Ashcombe's offer; LANTERN and "no one" are always there.

**Story alerts** (`AlertTicket`): a queue item with no right answer, only
options. Each sets `flags[t.flag]` and is shown on the report with the choice.

**Sessions** (Logs, Night 5+ as lead): a session audit that shows who read what,
including Ray's floppy export and `svc_recsys` reading your notes.

**Faxes** (`MailDef.fax`): a mail rendered as thermal paper with a halftone
photo; foreign faxes use DD/MM dates.

**Video calls** (`CallDef`): ring until answered, grainy talking portrait, typed
lines with per-character voice blips (no recordings), choices whose `Effect`s set
flags / suspicion / notes. Calls and messenger popups pause the clock. A call with
`video: false` is **voice only** (LANTERN): no picture, a waveform, "VIDEO
DISABLED BY CALLER". Callers outside the directory (Calloway) live in
`CONTACTS`.

**Suspicion thresholds** (`content/global.ts`): 40 → Security notice email (once);
70 → Pike's interview call (once, choices can lower it); 100 → `detained`.

**Hints.** LANTERN's messages and Reyes's call carry the hints in Act I. From Act II,
an optional "Ask LANTERN" on case files after two failed confirms. Hints are
always correct, and LANTERN counts them.

**Flags.** Story choices are `flags` (e.g. `n1_whitlock: logged|escalated|ignored`,
`n1_copied_log: true`).

**Saves.** Autosave to `localStorage` (`kxrnage.echo.save.v1`) after every
decision, on tab hide, and on page hide. A checkpoint
(`kxrnage.echo.checkpoint.v1`) is taken at the start of each night for
"Restart night." Settings live in `kxrnage.echo.settings.v1`.

**Text templating.** Content strings use `{first} {last} {login} {mr}`
(Mr./Ms.) `{they}/{them}/{their}` resolved from the profile.

## 8. Presentation

**Two looks.**
1. *The workstation* (gameplay): SENTINEL 4.0 inside a subtle CRT (scanlines,
   vignette, faint flicker; all reduced by the "CRT effects" setting).
2. *Cutscenes and photos*: **two-tone dossier**. Ink `#0f1216` and paper
   `#e9dfc8`, one accent red `#c23b22` used sparingly. Halftone dot shading,
   film grain, typed captions on paper strips, occasional redaction bars.

**Typography** (self-hosted via @fontsource): IBM Plex Sans (UI), IBM Plex
Mono (logs, title bars), Courier Prime (documents, captions), VT323
(terminal), Stardos Stencil (titles, stamps).

**Cutscenes** are code: layered SVG scenes, CSS camera moves (pan/zoom), canvas
rain, grain overlay, typed captions, synthesized sound. Built: prologue (road,
ridge, gate, NOC) and dawn. Badge photos are procedural "photocopied" halftone
portraits from a seed.

**Audio** (Web Audio, no files): keys, clicks, stamps, messenger ding, error
beep, dot-matrix printer, CRT power-on, phone ring; ambiences (NOC hum, rain);
a tension drone driven by suspicion and story beats. **Music slots** for the
owner's tracks: drop files in `public/audio/` and register them in
`src/engine/music.ts`. Briefs:
- `title` — "Ridge": slow, cold, analog synth + distant piano, 70 bpm.
- `night` — "Night Shift": minimal pulse under the hum, unobtrusive, loops.
- `tension` — "Compartment": low strings/drones, sparse percussion.
- `rollover` — "Rollover": the finale, building to midnight.

**Phones.** Same workstation, redesigned for touch: one app at a time,
bottom dock, sticky decision bar, rules as a bottom sheet, 44px targets,
safe-area aware. Desktop gets draggable windows.

## 9. Tech

- Source: `source/echo-protocol/` (Vite + React + TypeScript, no UI framework).
- `npm run build` outputs to `/echo_protocol/` (served at `/echo_protocol/` on
  kxrnage.com). The build output is committed because the site is deployed as
  static files.
- Layout: `src/engine` (state, store, saves, clock, rules, audio, text),
  `src/content` (people, areas, directives, nights), `src/os` (shell, windows,
  dock, popups), `src/apps`, `src/screens`, `src/cutscene`, `src/art`.
- Debug: `?speed=N` multiplies the clock; `?debug` shows a state overlay.

## 10. Roadmap

1. **M1 (done):** engine, title, new-hire profile, prologue, boot/login,
   Night 1 complete with tutorial and the 0417 choice, shift report, dawn, saves.
2. **M2 (done):** Nights 2–4: CHANGE and RECORDS tickets, binder tabs, video
   calls, the Terminal tape restore, the letter, suspicion thresholds and the
   `detained` ending, per-night dawns and reports. Act I complete.
3. **M3 (done):** Act II systems: evidence board, outbox, session audit, faxes,
   voice-only calls, story alerts, the night-lead role. Nights 5–7.
4. **M4 (done):** Nights 8–9, the Act II branch (five recipients) with response
   calls and messages, Act II dawns, report remarks and end card.
5. **M5 (done):** Act III Rollover: SYSCON (gate overrides, 0047 switches,
   B3 failover, sessions, fax), Night 10 and every ending with its own
   cutscene and epilogue, endings found, replays from the finale or Night 9.
6. **M6 (launch, done):** live on kxrnage.com. App icons, web manifest and a
   share card (`public/`), windows stay on screen after a resize, a
   rotate-to-portrait nudge for phones held sideways (the clock waits), SYSCON
   puts the midnight controls first on small phones, call captions on a
   lower-third band, a short tap guard so Skip can't land on a choice.
7. **M7:** Music integration once the tracks exist; tuning from real playtests
   (finale timing, case-file difficulty).

## 11. Clue ledger

| Planted | Pays off |
|---|---|
| KI-114 "B3 reader faults after midnight" (N1) | Ray was told to bury Ashcombe's vault visits |
| 0417 swipes 21/10, 02/11, 16/11, 30/11, 06/12, all 03:1x | Ashcombe's schedule; matches his "late budget nights" |
| B3-EAST feed unavailable 03:11–03:14 | Camera maintenance windows are requested by Ashcombe's office |
| LANTERN writes DD/MM and no contractions | LANTERN is foreign (midpoint reveal) |
| Ashcombe's ECHO ticket forwarded on N1 | First sight of the codename |
| Reyes's freezer F-12 inventory request (N1) | F-12 weight mismatch (N3) |
| RECSYS-Y2K-0047 approved by you (N2) | It is the Rollover wipe (Act III) |
| Casey: "half my floor has the flu" | EV-31's flu-like first phase; dread, not plot |
| Route 9 sign in the prologue | Where Whitlock died |
| Camera work orders, requester RESTRICTED (N2) | Ashcombe's office blinds the camera for each visit |
| The 03:14 still on N2: gray hair, glasses | Ashcombe uses Whitlock's badge |
| RECSYS → HL-CORP-XFER export (N3) | Halvard-Lowe is copying the records out before the wipe |
| F-12 R7: 4.20 kg out, 3.90 kg in on 11/30, "—M.A." | 300 g of EV-31 stock left the freezer |
| Reyes: "he wasn't from here" | Whitlock was Teodor Vlasko (Act II) |
| Early tape rotation request from Ashcombe's office (N4) | They knew the drafts were on the tapes |
| The letter: "the last night of the year" | RECSYS-Y2K-0047 and the Rollover transfer |
| Session audit: Ray exported 0417 to a floppy (N5) | Ray is suspended for it; the floppy matters in Act III |
| `svc_recsys` read your NOTES.TXT (N5) | Ashcombe's office watches you through RECSYS |
| F-12 sensor log: DOOR OPEN 03:13:02 on 11/30 (N6) | Matches the 0417 swipe and the 300 g variance |
| Ashcombe asks for your personnel file (N6) | He is checking you before the offer (N8) |
| Logon failures from ADM-2F-PC14 (N6) | Someone in Administration wants into your files (Act III) |
| The fax: Vlasko's photo, DD/MM dates (N7) | Whitlock was Vlasko; LANTERN is the Directorate |
| OPS-Y2K-0058 on the calendar, 12/31 23:30 (N8) | The transfer truck at Gate 1 (Act III) |
