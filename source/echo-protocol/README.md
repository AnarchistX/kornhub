# Echo Protocol — source

The game served at `/echo_protocol/` on kxrnage.com. Vite + React + TypeScript; no UI framework,
no image or audio files (art and sound are generated in code).

```bash
npm install
npm run dev      # http://localhost:5173/echo_protocol/
npm run build    # type-checks, then writes the site build to ../../echo_protocol/
```

The build output in `/echo_protocol/` is committed because the site deploys as static files.
Always rebuild after changing anything here.

- Story bible, systems and roadmap: [DESIGN.md](./DESIGN.md)
- Content (people, directives, tickets, mail): `src/content/`
- Debug: append `?speed=10` to run the shift clock faster, `?debug` for a state overlay.
- Music: drop tracks in `public/audio/` and register them in `src/engine/music.ts`.
