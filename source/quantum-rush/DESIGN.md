# QUANTUM RUSH — Design Document

Owner: Kxrnage (music, direction). Build: code only (no image or audio files except the owner's tracks).
Lives at `kxrnage.com/quantum-rush/`, replacing the old endless cube runner.

## 1. Pitch

A one-button rhythm runner built on Kxrnage's own soundtrack. Every level is a song, and
every jump, flip and dash lands on the music, so a clean run feels like playing the track.
Loud, colourful worlds that pulse with every kick; brutal but fair; instant retries.

Inspiration (feel only, never look or content): Geometry Dash (rhythm, precision, instant
retry), Dadish (charm, juicy character), Vector (speed, momentum). Everything we ship is
original: our own runner and forms, obstacles, worlds, levels and sounds.

## 2. Decisions (questionnaire, Nov 2026)

| # | Topic | Choice |
|---|---|---|
| 1 | Name | Keep **Quantum Rush** |
| 2 | Levels | Hand-built levels, one per song, **plus a generated endless mode** |
| 3 | Controls | **One button** (tap / click / space / up): jump, hold for longer moves |
| 4 | Variety | Early levels one form; **later levels add forms** |
| 5 | Difficulty | Hardcore (one hit restarts, attempts, completion %) **plus practice mode with checkpoints** |
| 6 | Progression | Level select; finishing a level unlocks the next; medals |
| 7 | Look | **Colourful and loud**, not minimal: a distinct world per song, neon, layered parallax, particles |
| 8 | Beat reaction | **Heavy**: camera bumps, flashes on drops, obstacles pulse; reduced-flash setting |
| 9 | Tracks | All 10 songs, ordered easy → hard |
| 10 | Length | Cuts of the songs early, **full songs for the later levels** |
| 11 | Phone | **Landscape** for play; menus work either way |
| 12 | Goals | Completion % **plus 3 hidden shards per level** |
| 13 | Customization | Runner colours and trails unlocked with medals |
| 14 | Extras | None yet |
| 15 | Story | None: pure arcade |
| 16 | SFX | All new, synthesized in code |
| 17 | Names | New level names; song credited as **"Song Title - Kxrnage"** |
| 18 | References | Geometry Dash, Dadish, Vector |

## 3. The soundtrack (analysed)

Tempos come from onset analysis of the files (they land on whole numbers, i.e. the
project tempos). `bar0` is the first downbeat in seconds. Section changes are 4-bar
loudness jumps (dB) and drive where a level changes pace, form or palette.

| Song | BPM | bar0 | Bars | Length | Section changes (bar: dB) |
|---|---|---|---|---|---|
| Bioluminescence Protocol | 105 | 0.542 | 48 | 1:50 | 4 +2.7, 8 +7.5, 28 −4.0, 44 −12.6 |
| Astral Siren's Call | 120 | 1.932 | 107 | 3:37 | 48 −4.5, 64 +4.5, 84 −3.6, 92 −5.7, 96 +3.4, 100 +6.9 |
| Digital Pursuit | 97 | 0.007 | 80 | 3:19 | 4 +5.2, 8 +4.3, 16 −5.0, 36 −5.8, 44 +3.2, 56 +2.5, 68 −8.1 |
| System Genesis | 115 | 0.039 | 113 | 3:56 | 8 +5.9, 40 +3.6, 52 −2.9, 68 −2.7, 72 +3.2, 88 −6.6, 96 +6.8 |
| Digital Lattice | 98 | 0.615 | 77 | 3:10 | 4 +3.4, 8 +5.4, 32 +2.6, 40 −8.2, 44 +5.7, 64 −3.3 |
| Quantum Seduction | 162 | 1.396 | 135 | 3:21 | 16 +3.8, 28 −3.2, 36 +2.8, 56 +2.8, 96 +4.1, 120 +4.6 |
| Digital Awakening | 105 | 0.248 | 77 | 2:56 | 36 −4.7, 44 +4.9, 76 −9.2 |
| Digital Velocity | 90 | 2.591 | 45 | 2:04 | 8 +3.3, 32 −5.0, 36 +2.7, 40 +5.4 |
| Digital Silk Stream | 90 | 2.591 | 79 | 3:34 | 32 −4.7, 40 +4.8, 72 −6.0 |
| Quantum Rush | 130 | 1.325 | 122 | 3:46 | 8 +3.5, 52 −3.1, 56 −5.5, 64 +3.3, 88 +6.3, 116 +3.8 |

Several tracks read nearly as strongly at double tempo (busy hats); charts use the
kick pulse above as the beat and subdivide it.

## 4. Levels

Ordered easy → hard. Early levels are cuts that end on a phrase; levels 6–10 play the
full song. Forms are introduced one at a time.

| # | Level (id) | Song credit | Length | Window | New |
|---|---|---|---|---|---|
| 1 | Lumen Deep (`lumen`) | Bioluminescence Protocol - Kxrnage | bars 0–32, 1:14 | ±90 ms | Spark: thorns, steps, gaps, boost, shards |
| 2 | Siren Drift (`siren`) | Astral Siren's Call - Kxrnage | bars 0–48, 1:38 | ±85 ms | pulse nodes, rotors |
| 3 | Neon Pursuit (`pursuit`) | Digital Pursuit - Kxrnage | bars 0–36, 1:29 | ±80 ms | first speed gate (1.24×), beat lasers |
| 4 | Genesis Bloom (`genesis`) | System Genesis - Kxrnage | bars 0–56, 1:57 | ±75 ms | **Flux** (gravity flip) |
| 5 | Lattice Run (`lattice`) | Digital Lattice - Kxrnage | bars 0–40, 1:39 | ±70 ms | **Comet** (hold to climb) |
| 6 | Velvet Static (`velvet`) | Quantum Seduction - Kxrnage | full, 3:20 | ±70 ms | 162 BPM, forms mixed |
| 7 | First Light (`firstlight`) | Digital Awakening - Kxrnage | full, 2:54 | ±65 ms | **Blink** (phase on the beat) |
| 8 | Redline (`redline`) | Digital Velocity - Kxrnage | full, 2:03 | ±60 ms | top speed 1.45×, sixteenth-note flux and blink |
| 9 | Silkwave (`silkwave`) | Digital Silk Stream - Kxrnage | full, 3:31 | ±60 ms | long form chains |
| 10 | Singularity (`singularity`) | Quantum Rush - Kxrnage | full, 3:45 | ±55 ms | everything |

Levels 1–5 fade the music out two bars after the finish; 6–10 end with the song. Section
starts follow the analysed song structure: the beat entering, drops (form changes, speed
gates, palette swaps), breaks (rests, shard routes) and outros.

## 5. The runner and its forms

The runner is a small round **spark**: a squashy, glowing ball with two eyes, a little
antenna and a trail. It squashes on landing, stretches on take-off and leans into speed.
Form crystals turn it into:

| Form | Look | Input | Physics |
|---|---|---|---|
| **Spark** | round, eyes, antenna | tap: jump · hold: re-jump on landing | fixed arc: apex 2.1 tiles, 0.44 s air (one jump per beat fits up to 130 BPM) |
| **Flux** | a spinning tri-prism | tap: flip gravity (from a surface) | crosses a 6-tile corridor in ~0.31 s |
| **Comet** | an arrowhead with a flame tail | hold: climb · release: dive | ±62 tiles/s², capped at 8.6 tiles/s; slides along top and bottom surfaces |
| **Blink** | a hollow diamond | tap: phase for 0.24 s | ground only; passes through phase walls while phased |

Physics are the same in every level so skill carries over; the music only decides where
things are. Base speed 10.4 tiles/s; speed gates set 1×, 1.24× or 1.45×. Pulse nodes give
a fresh jump; boost plates launch higher (0.65 s in the air).

Fairness: player hitbox 0.62 × 0.62 inside a 0.8 × 1 body; thorn hitboxes are 36 % wide and
58 % tall of their art; a 140 ms press buffer and 60 ms coyote time; node taps count within
1.15 tiles (height weighted at 0.6, so timing matters more than aim, and up to 1.5 tiles
after passing the centre, because players tap as they see the overlap); a node always
lifts you 2.1 tiles above itself, so a late, lower tap still reaches the same height;
shards are picked up within 0.85 tiles.

Teaching: every pulse node has an approach ring that closes onto it on the beat the tap
belongs to; in the first two levels nodes also say TAP, level 1 says TAP TO JUMP over its
first thorn, and the levels that introduce a form say how it works over its crystal
(TAP TO FLIP, HOLD TO RISE, TAP TO PHASE).

## 6. Objects (original look)

- **Thorns**: crystal spikes on floors and ceilings (hazard).
- **Blocks and platforms**: solid; land on top, hitting a side kills.
- **Pits**: missing floor.
- **Rotors**: spinning blade discs (hazard), later levels.
- **Beat lasers**: beams that switch on and off on the beat, telegraphed half a beat ahead.
- **Pulse nodes**: hexagonal beacons; tap inside one for a mid-air jump.
- **Boost plates**: chevron plates that launch you, no input.
- **Form crystals**: a prism you smash through to change form.
- **Speed gates**: arched chevrons (one to four) that set the speed.
- **Phase walls**: shimmering barriers only a phased Blink can pass.
- **Shards**: three per level, off the main line; tapping a hidden route gets them.
- **Practice beacons**: checkpoints in practice mode.

## 7. Charts and the level builder

Levels are written as **charts**: what the player does on which beat, bar by bar, the
way a rhythm game is charted. The builder simulates those inputs with the real physics
and then places geometry around the resulting path:

1. Simulate the intended inputs → the safe trajectory.
2. Put hazards where *not* doing the input kills (a thorn under a jump, a wall in front
   of a phase, a tunnel around a comet's path).
3. Keep clearance between the path and every hazard.
4. Decorate (props, lights, parallax) without collision.

So every level is passable by construction, and on the beat by construction. Margins
scale with speed and with the level's timing window: pits keep ground either side for an
early or late press, flux thorns start late enough for a slow flip and stop early enough
for an early one, comet tunnels keep 1.6 tiles of clearance and never dig below the base
floor, and crystals and gates sit 0.1 s before the downbeat so a press on the drop
already uses the new form.

`npx tsx scripts/validate.ts` replays every level: exact, the whole run shifted early and
late by the level's window, twelve runs with independent per-press jitter of ¾ of the
window, and each shard route. All ten pass; `scripts/diagnose.ts <id>` maps any failure to
its bar and step. The same intended inputs drive the title-screen demo.

Chart rows are one bar each; a step is an eighth note (`grid: 16` for sixteenths).
Spark: `J` jump a thorn · `K` two · `L` three · `U` step up · `D` step down · `G` gap ·
`N` tap a node mid-air (one step after its jump) · `B` boost plate · `S` shard route ·
`R` jump under a rotor · `X` beat laser. Flux: `F` flip. Comet: `^` press, `v` release.
Blink: `W` phase wall. `.` nothing.

Spacing the physics allows: two eighths between jumps up to 130 BPM (three at 162); after
an `N` the next ground action waits for the higher landing; five quiet eighths after `S`;
flux flips 0.31 s apart, blink walls 0.24 s; every flux section ends on the floor (an
even number of flips); three-thorn `L` jumps only at 1.24× or faster.

Endless mode runs the same builder on a seeded generator that plans one continuous
timeline of eighth notes with these spacing rules, cycles the forms in eight-bar
sections, ramps density and speed, loops the song (and its energy map) every whole bar,
and builds 160 bars; `scripts/endless.ts` validates 60 generated runs across the songs.

## 8. Worlds

Every song gets its own world: palette, sky, parallax layers, props and a beat-reactive
centrepiece. All drawn in code on canvas.

| Level | World |
|---|---|
| Lumen Deep | the deep sea: teal water, jellyfish lanterns, glowing coral floor |
| Siren Drift | a violet nebula: floating crystal islands, aurora ribbons |
| Neon Pursuit | night city chase: magenta and orange signs, wet highway, searchlights |
| Genesis Bloom | a circuit forest: green and gold trees that grow on the beat |
| Lattice Run | wireframe world: magenta grid floor, polygon mountains, scanning lines |
| Velvet Static | crimson velvet and TV static, heart-shaped speakers |
| First Light | sunrise: orange to gold sky, light shafts, crystal spires |
| Redline | a red-and-white speed tunnel, chevrons, streaks |
| Silkwave | flowing silk ribbons in aqua, pink and gold |
| Singularity | prismatic: a black hole with an accretion disc, colours cycling |

**Beat reaction:** the kick bumps the camera and the floor glow; obstacles pulse; drops
(from the section map) flash and swap palettes; bar loudness from the analysis scales the
intensity. *Reduced flashes* replaces flashes with gentle fades.

## 9. Progression and goals

- Level select: a horizontal carousel of the 10 worlds; level N+1 unlocks when N is
  cleared. Each card shows best %, practice best %, shards (0–3), attempts.
- Medals: **Clear**, **Shards 3/3**. Medals unlock runner colours and trails.
- Practice mode: checkpoints drop automatically every 2 bars on safe ground (and on a
  second tap target); the song restarts from the checkpoint. Practice clears don't
  count as clears.
- Endless: per song, unlocked by clearing its level. Score = beats survived. Best kept.
- Saves: localStorage `kxrnage.qr.save.v1` (progress), `kxrnage.qr.settings.v1`.

## 10. Presentation

- **Fonts:** Bungee (logo, big numbers), Exo 2 (UI).
- **HUD:** progress bar, attempt count (fades), pause.
- **Death:** the runner bursts into shards, a short shake, 0.6 s, instant retry.
- **Clear:** time slows, the world blooms, a results card.
- **SFX** (Web Audio, synthesized): jump, land, node, flip, dash, form change, shard,
  checkpoint, death, clear, UI. Music is the owner's tracks only.
- **Settings:** music, effects, reduced flashes, audio offset (latency calibration).

## 11. Tech

- Source `source/quantum-rush/` (Vite + React + TypeScript). Menus in React; gameplay on
  a single canvas with its own loop.
- Fixed-step simulation (1/240 s), interpolated rendering, deterministic.
- Music: Web Audio `AudioBuffer` per level (decoded on load), clock = audio time + offset;
  restarts and checkpoints start the buffer at an offset.
- Tracks are served from the site's existing `/assets/sounds/music/` folder.
- Builds into `/quantum-rush/` at launch (the old game is replaced then).
- Debug: `?level=N` (or id), `?bot` (autoplay the chart), `?practice`, `?t=seconds` (start
  at), `?debug` (exposes the game for real-time tests), `?unlock` (select any level),
  `?demo=id&bar=N` (title backdrop), `?og` (share-image layout).
- Assets: `public/` holds the favicon, app icons, manifest and the 1200×630 share image
  (`og.jpg`, rendered from the title in `?og` mode).

## 12. Status

1. Engine: physics, forms, builder, validator, renderer, music clock, SFX: done.
2. Menus, saves, practice, endless, customization: done.
3. All ten levels charted and bot-validated; real-time runs against the music clock
   (input lag ~2 ms), death/restart, pause, practice checkpoints, results and unlocks
   tested on desktop and emulated phones.
4. Launch: build with `QR_OUT=../../quantum-rush npx vite build` to replace the old
   single-file game, and update the hub card.
