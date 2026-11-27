// Two-tone "declassified file" scenes, drawn entirely in code.
// Every scene uses a 1600×1600 canvas with preserveAspectRatio="slice": the key subject sits in the
// centre (x 450–1150, y 380–1220) so it survives both portrait phones and widescreen monitors.
import { useId } from 'react';
import { ConvoyScene, InterceptScene, LedgerScene, MidnightScene, MirrorScene, SealedScene } from './scenes3';

export const INK = '#0f1216';
export const PAPER = '#e9dfc8';
export const RED = '#c23b22';

export function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function pine(x: number, base: number, h: number, w: number): string {
  const tiers = 4;
  let d = '';
  for (let i = 0; i < tiers; i++) {
    const top = base - h + (h * i) / (tiers + 0.7);
    const bot = base - h + (h * (i + 1.7)) / (tiers + 0.7);
    const tw = (w * (i + 1.2)) / tiers;
    d += `M${x} ${top}L${x + tw / 2} ${bot}L${x - tw / 2} ${bot}Z`;
  }
  return d + `M${x - w * 0.05} ${base - h * 0.1}h${w * 0.1}V${base}h${-w * 0.1}Z`;
}

export function forest(seed: number, x0: number, x1: number, base: number, hMin: number, hMax: number, gap: number): string {
  const r = rng(seed);
  let d = '';
  for (let x = x0; x < x1; x += gap * (0.6 + r() * 0.8)) {
    const h = hMin + r() * (hMax - hMin);
    d += pine(x, base + r() * gap * 0.3, h, h * (0.34 + r() * 0.1));
  }
  return d;
}

export function ridge(seed: number, y: number, amp: number, step: number, bottom = 1600): string {
  const r = rng(seed);
  let d = `M0 ${bottom}L0 ${y}`;
  let v = 0;
  for (let x = 0; x <= 1600; x += step) {
    v = v * 0.55 + (r() - 0.5) * amp;
    d += `L${x} ${y + v}`;
  }
  return d + `L1600 ${bottom}Z`;
}

export function Halftone({ u }: { u: string }) {
  return (
    <>
      <pattern id={`hL${u}`} width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
        <circle cx="8" cy="8" r="4.6" fill={PAPER} />
      </pattern>
      <pattern id={`hM${u}`} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
        <circle cx="6" cy="6" r="2.6" fill={PAPER} />
      </pattern>
      <pattern id={`hS${u}`} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
        <circle cx="4.5" cy="4.5" r="1.3" fill={PAPER} />
      </pattern>
      <pattern id={`hI${u}`} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
        <circle cx="6" cy="6" r="3.2" fill={INK} />
      </pattern>
      <radialGradient id={`rg${u}`}>
        <stop offset="0" stopColor="#fff" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`lgUp${u}`} x1="0" x2="0" y1="1" y2="0">
        <stop offset="0" stopColor="#fff" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <linearGradient id={`lgDown${u}`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#fff" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <linearGradient id={`lgBand${u}`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0" />
        <stop offset="0.5" stopColor="#fff" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
    </>
  );
}

/** A halftone glow: big dots in the core, fine dots in the falloff. */
export function Glow({ u, cx, cy, r, k = 1 }: { u: string; cx: number; cy: number; r: number; k?: number }) {
  const id = `${u}${Math.round(cx)}${Math.round(cy)}${Math.round(r)}`;
  return (
    <g opacity={k}>
      <mask id={`gm1${id}`}>
        <circle cx={cx} cy={cy} r={r} fill={`url(#rg${u})`} />
      </mask>
      <mask id={`gm2${id}`}>
        <circle cx={cx} cy={cy} r={r * 0.45} fill={`url(#rg${u})`} />
      </mask>
      <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} fill={`url(#hS${u})`} mask={`url(#gm1${id})`} />
      <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} fill={`url(#hM${u})`} mask={`url(#gm2${id})`} />
    </g>
  );
}

export function Stars({ seed, n, maxY }: { seed: number; n: number; maxY: number }) {
  const r = rng(seed);
  return (
    <g fill={PAPER}>
      {Array.from({ length: n }, (_, i) => (
        <circle key={i} cx={r() * 1600} cy={r() * maxY} r={0.8 + r() * 1.8} opacity={0.25 + r() * 0.6} />
      ))}
    </g>
  );
}

export const svgProps = {
  viewBox: '0 0 1600 1600',
  preserveAspectRatio: 'xMidYMid slice',
  width: '100%',
  height: '100%',
  'aria-hidden': true,
} as const;

// ------------------------------------------------------------------ the ridge (title, prologue)

export function RidgeScene({ car = false }: { car?: boolean }) {
  const u = useId().replace(/[^a-zA-Z0-9]/g, '');
  const windows: React.ReactElement[] = [];
  const r = rng(7);
  for (let row = 0; row < 3; row++) {
    for (let c = 0; c < 12; c++) {
      if (r() > 0.55) windows.push(<rect key={`${row}-${c}`} x={650 + c * 20} y={834 + row * 14} width="9" height="6" fill={PAPER} opacity={0.55 + r() * 0.45} />);
    }
  }
  const road = 'M560 1600 C640 1420 900 1330 760 1220 C640 1130 1000 1060 880 960 C840 930 820 910 800 892';
  return (
    <svg {...svgProps}>
      <defs>
        <Halftone u={u} />
      </defs>
      <rect width="1600" height="1600" fill={INK} />
      <Stars seed={3} n={90} maxY={720} />
      <Glow u={u} cx={810} cy={830} r={560} k={0.55} />
      <path d={ridge(11, 760, 90, 40)} fill="#1a2029" />
      <path d={ridge(19, 850, 70, 50)} fill="#131820" />
      {/* the facility hill */}
      <path d="M0 1080 C260 1040 420 960 560 890 L1040 890 C1180 960 1340 1040 1600 1070 L1600 1600 L0 1600Z" fill="#0b0e12" />
      {/* buildings */}
      <g fill="#05070a">
        <rect x="636" y="820" width="258" height="72" />
        <rect x="894" y="792" width="96" height="100" />
        <rect x="574" y="852" width="62" height="40" />
        <rect x="702" y="690" width="18" height="132" />
        <rect x="1040" y="868" width="40" height="24" />
      </g>
      {windows}
      <rect x="910" y="806" width="64" height="5" fill={PAPER} opacity="0.85" />
      {/* steam from the stack */}
      <g className="steam">
        <ellipse cx="712" cy="650" rx="44" ry="26" fill={`url(#hS${u})`} opacity="0.75" />
        <ellipse cx="742" cy="606" rx="64" ry="34" fill={`url(#hS${u})`} opacity="0.5" />
        <ellipse cx="786" cy="560" rx="84" ry="40" fill={`url(#hS${u})`} opacity="0.28" />
      </g>
      {/* radio mast */}
      <g stroke={PAPER} strokeWidth="2.5" opacity="0.7">
        <path d="M952 560 L938 792 M952 560 L966 792" />
        {[600, 640, 680, 720, 760].map((y) => (
          <path key={y} d={`M${944 - (y - 560) * 0.03} ${y} L${960 + (y - 560) * 0.03} ${y}`} />
        ))}
      </g>
      <circle className="beacon" cx="952" cy="556" r="7" fill={RED} />
      {/* fence and lights */}
      <path d="M548 900 L1052 900" stroke={PAPER} strokeWidth="2" opacity="0.5" />
      {Array.from({ length: 13 }, (_, i) => (
        <g key={i}>
          <rect x={556 + i * 40} y={884} width="3" height="18" fill={PAPER} opacity="0.5" />
          <circle cx={557 + i * 40} cy={884} r={i % 3 === 0 ? 4 : 2.4} fill={PAPER} />
        </g>
      ))}
      <Glow u={u} cx={620} cy={880} r={70} />
      <Glow u={u} cx={980} cy={880} r={80} />
      <Glow u={u} cx={760} cy={890} r={60} k={0.8} />
      {/* fog in the valley */}
      <mask id={`fog${u}`}>
        <rect x="0" y="960" width="1600" height="170" fill={`url(#lgBand${u})`} />
      </mask>
      <rect x="0" y="960" width="1600" height="170" fill={`url(#hS${u})`} mask={`url(#fog${u})`} opacity="0.6" />
      {/* access road with a car climbing it */}
      <path d={road} fill="none" stroke="#1d232b" strokeWidth="14" />
      <path d={road} fill="none" stroke={PAPER} strokeWidth="1.5" strokeDasharray="10 22" opacity="0.35" />
      {car && (
        <g>
          <circle r="5" fill={PAPER}>
            <animateMotion dur="26s" repeatCount="indefinite" path={road} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
          </circle>
          <circle r="16" fill={`url(#hM${u})`} opacity="0.7">
            <animateMotion dur="26s" repeatCount="indefinite" path={road} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
          </circle>
        </g>
      )}
      {/* foreground pines */}
      <path d={forest(5, -40, 520, 1640, 380, 620, 90)} fill="#050608" />
      <path d={forest(9, 1080, 1660, 1640, 380, 640, 90)} fill="#050608" />
      <path d={forest(13, 420, 1200, 1700, 160, 260, 70)} fill="#06080a" />
    </svg>
  );
}

// ------------------------------------------------------------------ the road in (prologue)

export function RoadScene() {
  const u = useId().replace(/[^a-zA-Z0-9]/g, '');
  const vx = 800;
  const vy = 760;
  const dashes: React.ReactElement[] = [];
  for (let i = 0; i < 12; i++) {
    const t0 = Math.pow(i / 12, 2.2);
    const t1 = Math.pow((i + 0.45) / 12, 2.2);
    const y0 = vy + (1600 - vy) * t0;
    const y1 = vy + (1600 - vy) * t1;
    const w0 = 2 + 26 * t0;
    const w1 = 2 + 26 * t1;
    dashes.push(<path key={i} d={`M${vx - w0 / 2} ${y0}L${vx + w0 / 2} ${y0}L${vx + w1 / 2} ${y1}L${vx - w1 / 2} ${y1}Z`} fill={PAPER} opacity={0.85} />);
  }
  const posts: React.ReactElement[] = [];
  for (let i = 1; i < 14; i++) {
    const t = Math.pow(i / 14, 2);
    const x = vx + (1500 - vx) * t + 40 * t;
    const y = vy + (1600 - vy) * t;
    const h = 6 + 90 * t;
    posts.push(<rect key={i} x={x} y={y - h} width={2 + 10 * t} height={h} fill={PAPER} opacity={0.18 + 0.5 * t} />);
  }
  return (
    <svg {...svgProps}>
      <defs>
        <Halftone u={u} />
        <clipPath id={`road${u}`}>
          <path d={`M${vx - 6} ${vy} L${vx + 6} ${vy} L1480 1600 L120 1600Z`} />
        </clipPath>
        <mask id={`beam${u}`}>
          <path d={`M${vx} ${vy + 40} L1180 1600 L420 1600Z`} fill={`url(#lgUp${u})`} />
        </mask>
      </defs>
      <rect width="1600" height="1600" fill={INK} />
      <Stars seed={21} n={40} maxY={600} />
      <Glow u={u} cx={vx} cy={vy - 20} r={300} k={0.45} />
      <path d={ridge(31, 720, 60, 40, 900)} fill="#141920" />
      <circle cx={vx} cy={vy - 34} r="3" fill={PAPER} />
      <circle cx={vx + 18} cy={vy - 30} r="2" fill={PAPER} opacity="0.8" />
      <circle className="beacon" cx={vx + 30} cy={vy - 70} r="4" fill={RED} />
      <path d={`M0 ${vy}L1600 ${vy}L1600 1600L0 1600Z`} fill="#07090b" />
      <path d={`M${vx - 6} ${vy} L${vx + 6} ${vy} L1480 1600 L120 1600Z`} fill="#12161b" />
      <g clipPath={`url(#road${u})`}>
        <rect width="1600" height="1600" fill={`url(#hM${u})`} mask={`url(#beam${u})`} opacity="0.55" />
      </g>
      {dashes}
      <path d={`M${vx - 5} ${vy} L150 1600 M${vx + 5} ${vy} L1450 1600`} stroke={PAPER} strokeWidth="3" opacity="0.55" />
      {posts}
      <path d={`M${vx + 8} ${vy + 8} L1600 1420`} stroke={PAPER} strokeWidth="5" opacity="0.25" />
      {/* the sign */}
      <g transform="translate(930 790) scale(0.9)">
        <rect x="18" y="70" width="8" height="150" fill="#05070a" />
        <rect x="74" y="70" width="8" height="150" fill="#05070a" />
        <rect x="0" y="0" width="140" height="84" fill={PAPER} />
        <rect x="5" y="5" width="130" height="74" fill="none" stroke={INK} strokeWidth="3" />
        <text x="70" y="32" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontWeight="700" fontSize="17" fill={INK}>
          MARROW CRK
        </text>
        <text x="70" y="62" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontWeight="700" fontSize="22" fill={INK}>
          RT 9 →
        </text>
      </g>
      <path d={forest(41, -60, 640, 1180, 420, 820, 80)} fill="#040506" />
      <path d={forest(43, 1190, 1700, 1160, 420, 820, 80)} fill="#040506" />
      <path d={forest(47, 560, 720, 790, 50, 110, 22)} fill="#090b0e" />
      <path d={forest(53, 880, 1050, 790, 50, 120, 22)} fill="#090b0e" />
    </svg>
  );
}

// ------------------------------------------------------------------ the gate

export function GateScene() {
  const u = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg {...svgProps}>
      <defs>
        <Halftone u={u} />
        <pattern id={`chain${u}`} width="34" height="34" patternUnits="userSpaceOnUse">
          <path d="M0 0L34 34M34 0L0 34" stroke={PAPER} strokeWidth="1.6" />
        </pattern>
        <mask id={`cone${u}`}>
          <path d="M620 512 L360 1110 L880 1110Z" fill={`url(#lgDown${u})`} />
        </mask>
      </defs>
      <rect width="1600" height="1600" fill={INK} />
      <rect y="1060" width="1600" height="540" fill="#0a0c0f" />
      {/* fence */}
      <rect x="0" y="700" width="1600" height="380" fill={`url(#chain${u})`} opacity="0.16" />
      <path d="M0 700 L1600 700 M0 1080 L1600 1080" stroke={PAPER} strokeWidth="3" opacity="0.3" />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={i * 200 - 4} y={640} width="8" height="440" fill="#1c2128" />
      ))}
      <path d={Array.from({ length: 40 }, (_, i) => `M${i * 40} 690 q10 -26 20 0 q10 26 20 0`).join(' ')} stroke={PAPER} strokeWidth="2" fill="none" opacity="0.35" />
      {/* lamp */}
      <rect x="604" y="500" width="10" height="580" fill="#05070a" />
      <rect x="586" y="494" width="70" height="14" fill="#05070a" />
      <rect x="0" y="0" width="1600" height="1600" fill={`url(#hM${u})`} mask={`url(#cone${u})`} opacity="0.5" />
      <Glow u={u} cx={630} cy={512} r={130} />
      {/* sign */}
      <g transform="translate(468 742)">
        <rect x="40" y="170" width="10" height="170" fill="#05070a" />
        <rect x="250" y="170" width="10" height="170" fill="#05070a" />
        <rect width="300" height="180" fill={PAPER} />
        <rect x="6" y="6" width="288" height="168" fill="none" stroke={INK} strokeWidth="3" />
        <g fontFamily="IBM Plex Mono, monospace" fill={INK} textAnchor="middle" fontWeight="700">
          <text x="150" y="38" fontSize="22">MARROW CREEK</text>
          <text x="150" y="62" fontSize="13">BIOLOGICAL RESEARCH ANNEX</text>
          <text x="150" y="86" fontSize="12" fontWeight="400">U.S. DEPARTMENT OF DEFENSE</text>
          <text x="150" y="116" fontSize="14">AUTHORIZED PERSONNEL ONLY</text>
        </g>
        <rect x="14" y="132" width="272" height="30" fill={RED} />
        <text x="150" y="153" fontFamily="IBM Plex Mono, monospace" fontWeight="700" fontSize="12.5" fill={PAPER} textAnchor="middle">
          USE OF DEADLY FORCE AUTHORIZED
        </text>
      </g>
      {/* guard booth */}
      <g transform="translate(830 740)">
        <rect x="-20" y="-24" width="270" height="30" fill="#05070a" />
        <rect x="0" y="0" width="230" height="340" fill="#11151a" />
        <rect x="24" y="40" width="182" height="120" fill={PAPER} />
        <rect x="24" y="40" width="182" height="120" fill={`url(#hI${u})`} opacity="0.35" />
        <path d="M96 160 C96 120 108 104 126 104 C144 104 156 120 156 160Z" fill={INK} />
        <circle cx="126" cy="88" r="18" fill={INK} />
        <path d="M104 78 L148 78 L144 66 L108 66Z" fill={INK} />
        <rect x="24" y="96" width="182" height="4" fill={INK} opacity="0.6" />
        <rect x="-10" y="250" width="40" height="12" fill={RED} />
      </g>
      <Glow u={u} cx={945} cy={840} r={190} k={0.5} />
      {/* barrier arm */}
      <g>
        <rect x="826" y="960" width="26" height="120" fill="#05070a" />
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={420 + i * 40} y={968} width="40" height="18" fill={i % 2 ? PAPER : '#1a1f26'} />
        ))}
        <circle cx="430" cy="977" r="6" fill={RED} />
      </g>
      {/* wet asphalt reflections */}
      <rect x="600" y="1090" width="40" height="420" fill={`url(#hS${u})`} opacity="0.35" />
      <rect x="900" y="1090" width="90" height="300" fill={`url(#hS${u})`} opacity="0.25" />
      {/* our car's hood, POV */}
      <path d="M-40 1600 L-40 1440 C300 1330 1300 1330 1640 1440 L1640 1600Z" fill="#030405" />
      <path d="M180 1400 C500 1350 1100 1350 1420 1400" stroke={PAPER} strokeWidth="2" opacity="0.25" fill="none" />
    </svg>
  );
}

// ------------------------------------------------------------------ the NOC

export function NocScene() {
  const u = useId().replace(/[^a-zA-Z0-9]/g, '');
  const r = rng(77);
  const screens: React.ReactElement[] = [];
  for (let row = 0; row < 3; row++) {
    for (let c = 0; c < 8; c++) {
      const x = 330 + c * 120;
      const y = 430 + row * 104;
      const on = r() > 0.45;
      screens.push(
        <g key={`${row}${c}`}>
          <rect x={x} y={y} width="106" height="88" rx="8" fill="#161b22" />
          <rect x={x + 9} y={y + 8} width="88" height="66" rx="6" fill={on ? '#1d242c' : '#0b0e12'} />
          {on && (
            <>
              <rect x={x + 9} y={y + 8} width="88" height="66" rx="6" fill={`url(#hS${u})`} opacity={0.25 + r() * 0.35} />
              <path d={`M${x + 18} ${y + 22}h${30 + r() * 40}M${x + 18} ${y + 34}h${20 + r() * 50}M${x + 18} ${y + 46}h${30 + r() * 30}`} stroke={PAPER} strokeWidth="3" opacity="0.5" />
            </>
          )}
        </g>,
      );
    }
  }
  return (
    <svg {...svgProps}>
      <defs>
        <Halftone u={u} />
        <pattern id={`scan${u}`} width="4" height="6" patternUnits="userSpaceOnUse">
          <rect width="4" height="3" fill={PAPER} />
        </pattern>
      </defs>
      <rect width="1600" height="1600" fill={INK} />
      <rect x="0" y="380" width="1600" height="420" fill="#0c0f13" />
      {screens}
      {/* door, hallway light */}
      <rect x="1250" y="560" width="160" height="440" fill="#0a0c10" />
      <rect x="1290" y="610" width="80" height="110" fill={PAPER} opacity="0.75" />
      <Glow u={u} cx={1330} cy={665} r={150} k={0.5} />
      {/* desk */}
      <path d="M0 990 L1600 990 L1600 1060 L0 1060Z" fill="#06080b" />
      <path d="M0 990 L1600 990" stroke={PAPER} strokeWidth="2" opacity="0.35" />
      <Glow u={u} cx={800} cy={960} r={420} k={0.65} />
      {/* the CRT */}
      <g>
        <path d="M640 770 L960 770 L990 990 L610 990Z" fill="#1d1f22" />
        <rect x="640" y="760" width="320" height="236" rx="18" fill="#2a2a27" />
        <rect x="640" y="760" width="320" height="236" rx="18" fill={`url(#hS${u})`} opacity="0.35" />
        <rect x="668" y="784" width="264" height="176" rx="14" fill={PAPER} />
        <rect x="668" y="784" width="264" height="176" rx="14" fill={`url(#scan${u})`} opacity="0.3" />
        <g fontFamily="IBM Plex Mono, monospace" fill={INK} fontWeight="700">
          <text x="800" y="860" textAnchor="middle" fontSize="22">SENTINEL 4.0</text>
          <text x="800" y="890" textAnchor="middle" fontSize="12" fontWeight="400">
            PRESS CTRL+ALT+DEL TO LOG ON
          </text>
        </g>
        {/* sticky note */}
        <g transform="rotate(6 930 790)">
          <rect x="890" y="752" width="74" height="70" fill={PAPER} />
          <text x="927" y="784" textAnchor="middle" fontFamily="Permanent Marker, cursive" fontSize="15" fill={INK}>
            ROOKIE
          </text>
          <path d="M902 798 h48 M902 808 h34" stroke={INK} strokeWidth="2" />
        </g>
        <rect x="700" y="1004" width="200" height="24" fill="#1a1b1d" />
      </g>
      <Glow u={u} cx={800} cy={872} r={260} k={0.6} />
      {/* chair */}
      <path d="M680 1600 L700 1260 C700 1180 900 1180 900 1260 L920 1600Z" fill="#030405" />
      <path d="M700 1260 C700 1180 900 1180 900 1260" stroke={PAPER} strokeWidth="2" opacity="0.2" fill="none" />
    </svg>
  );
}

// ------------------------------------------------------------------ dawn (paper-dominant: daylight)

export function DawnScene() {
  const u = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg {...svgProps}>
      <defs>
        <Halftone u={u} />
        <linearGradient id={`sky${u}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`skym${u}`}>
          <rect width="1600" height="1000" fill={`url(#sky${u})`} />
        </mask>
      </defs>
      <rect width="1600" height="1600" fill={PAPER} />
      <rect width="1600" height="1000" fill={`url(#hI${u})`} mask={`url(#skym${u})`} opacity="0.55" />
      <circle cx="1020" cy="860" r="70" fill="none" stroke={INK} strokeWidth="3" opacity="0.5" />
      <path d={ridge(61, 860, 80, 40)} fill={`url(#hI${u})`} opacity="0.55" />
      <path d={ridge(67, 920, 70, 50)} fill="#2b2f35" />
      <path d="M0 1060 C300 1010 480 950 600 925 L980 925 C1120 950 1300 1010 1600 1050 L1600 1600 L0 1600Z" fill={INK} />
      <g fill={INK}>
        <rect x="650" y="868" width="220" height="60" />
        <rect x="870" y="846" width="80" height="82" />
        <rect x="712" y="770" width="14" height="100" />
        <path d="M930 640 L918 846 M930 640 L942 846" stroke={INK} strokeWidth="3" />
      </g>
      <ellipse cx="740" cy="740" rx="60" ry="26" fill={`url(#hI${u})`} opacity="0.45" />
      <path d="M800 1600 C760 1400 980 1300 860 1180 C760 1090 980 1020 900 940" fill="none" stroke={PAPER} strokeWidth="22" opacity="0.15" />
      <path d="M800 1600 C760 1400 980 1300 860 1180 C760 1090 980 1020 900 940" fill="none" stroke={PAPER} strokeWidth="2" strokeDasharray="14 24" opacity="0.6" />
      <g transform="translate(872 1052) scale(0.8)">
        <rect x="-30" y="-14" width="60" height="22" rx="6" fill={PAPER} />
        <rect x="-20" y="-26" width="40" height="16" rx="4" fill={PAPER} />
        <circle cx="-18" cy="10" r="7" fill={PAPER} />
        <circle cx="18" cy="10" r="7" fill={PAPER} />
        <rect x="-26" y="-6" width="10" height="6" fill={RED} />
        <rect x="16" y="-6" width="10" height="6" fill={RED} />
      </g>
      <path d={forest(71, -60, 560, 1640, 380, 640, 90)} fill={INK} />
      <path d={forest(73, 1100, 1700, 1640, 380, 660, 90)} fill={INK} />
    </svg>
  );
}

export const SCENES = {
  ridge: RidgeScene,
  ridgeCar: () => <RidgeScene car />,
  road: RoadScene,
  gate: GateScene,
  noc: NocScene,
  dawn: DawnScene,
  convoy: () => <ConvoyScene />,
  raid: () => <ConvoyScene raid />,
  midnight: () => <MidnightScene />,
  blackout: () => <MidnightScene dark />,
  ledger: LedgerScene,
  mirror: MirrorScene,
  sealed: SealedScene,
  intercept: InterceptScene,
} as const;
export type SceneId = keyof typeof SCENES;
