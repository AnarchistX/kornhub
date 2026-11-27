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
- **Night 2 — Tue Dec 7.** Adds CHANGE tickets (Y2K remediation): approve if on
  the change calendar, CAB-approved, inside the window. **RECSYS-Y2K-0047**
  arrives from Ashcombe's office and passes every rule. If you escalated, Pike
  video-calls you. LANTERN points you at the camera schedule. Casey's flu email.
- **Night 3 — Wed Dec 8.** Adds RECORDS requests (need-to-know). Reyes asks for
  Whitlock's archived mail, which is under legal hold. Choice: follow the rule,
  or help her through a workaround (suspicion). Freezer F-12 manifest: 4.2 kg
  out, 3.9 kg in.
- **Night 4 — Thu Dec 9.** Security audit drill. **Hacking moment:** restore
  Whitlock's mailbox from backup tape before the 06:00 rotation overwrites it.
  His unsent letter to the Senate committee. LANTERN: "Now you know why he is
  dead."

**Act II — COMPARTMENT** (Nights 5–9, Dec 13–23). The routine collapses. Ray is
suspended; you are acting night lead with wider access. The **evidence board**
unlocks: deduction questions filled with evidence and confirmed in batches
(who used badge 0417 · what ECHO is · who Whitlock really was · where the stocks
are going · what 0047 actually does). Video calls with Reyes, Calloway, and
Ashcombe (who offers a promotion for loyalty). Midpoint reveal: LANTERN is the
Directorate (DD/MM dates, phrasing, a Kalnitsa fax). Second reveal: Whitlock was
Vlasko. **Branch at the end of Act II:** who gets the evidence: the FBI, LANTERN,
the press (via Reyes), Ashcombe, or no one.

**Act III — ROLLOVER** (Dec 31, 22:00 → Jan 1, 01:00). The facility on Y2K
watch. Near real-time finale at the console: the 0047 countdown, the transfer
truck at the gate, a Directorate team, an FBI operation with a leak. Short,
tense hacking sequences (kill or reroute 0047, hold the gate, trace the leak,
get the evidence out on a 1999 network).

**Endings** (track as `ending` id):

| id | Name | How |
|---|---|---|
| `daylight` | Daylight | Expose ECHO, stocks secured, you survive (best) |
| `bureau` | The Bureau | FBI gets it all; buried and classified; new name for you |
| `blackout` | Blackout | 0047 succeeds; nothing proven; you're let go; ECHO continues |
| `lantern` | Lantern | You hand it to the Directorate; money; a news item months later |
| `company` | Company Man | You side with Ashcombe; promoted; epilogue 2003 |
| `detained` | Detained | Suspicion maxed; arrested under the Espionage Act |
| `route9` | Route 9 | You dig too openly with no allies. Whitlock's ending |
| `echo` | Echo | Containment lost during rollover (worst) |
| `terminated` | Terminated | Three write-ups in Act I (early fail) |

## 7. Systems

**Shift loop.** 23:00 → 07:00 game time. Night 1 runs ~1.25 s per game minute
(≈10 min real time); later nights get faster or busier. The clock pauses when
the tab is hidden, a modal/tutorial/messenger popup is open, or the game is
paused. Tickets arrive at fixed times. Unprocessed tickets at 07:00 are backlog.

**Ticket kinds.** `access` (Act I N1+), `alert` (story alerts, N1+), `change`
(N2+), `records` (N3+). Access answers are **computed from the rules**, never
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

**Notes / evidence.** Items copied from logs, mail, records. In Act II they slot
into deduction questions on the evidence board.

**Hints.** From Night 2, an optional "Ask LANTERN" on investigation puzzles.
Hints are always correct. Hint count feeds one line in the epilogues.

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

1. **M1 (this build):** engine, title, new-hire profile, prologue, boot/login,
   Night 1 complete with tutorial and the 0417 choice, shift report, dawn, saves.
2. **M2:** Nights 2–4 (CHANGE and RECORDS tickets, Pike's call, the tape
   restore hacking moment, the letter). Act I complete.
3. **M3:** Act II systems (evidence board, video calls, acting lead), Nights 5–7.
4. **M4:** Nights 8–9, Act II branch, all branches wired.
5. **M5:** Act III Rollover and every ending. Polish, music integration.

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
