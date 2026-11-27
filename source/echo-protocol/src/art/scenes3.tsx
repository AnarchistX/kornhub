// Act III scenes: the convoy, midnight on the ridge, the Ledger, Route 9 in the mirror, the sealed corridor,
// the intercept. Same rules as scenes.tsx: 1600×1600, subject in the centre-safe box.
import { useId } from 'react';
import { Glow, Halftone, INK, PAPER, RED, Stars, forest, ridge, rng, svgProps } from './scenes';

/** A refrigerated box truck, three-quarters front, at a given scale. */
function BoxTruck({ x, y, k = 1, lights = true, u }: { x: number; y: number; k?: number; lights?: boolean; u: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <ellipse cx="0" cy="250" rx="420" ry="40" fill="#030405" opacity="0.8" />
      {/* box */}
      <path d="M-380 -120 L60 -150 L60 220 L-380 230Z" fill="#1a1f26" />
      <path d="M-380 -120 L60 -150 L60 -120 L-380 -95Z" fill="#262d36" />
      <rect x="-330" y="-60" width="300" height="70" fill={PAPER} opacity="0.9" transform="skewY(-3.5)" />
      <text x="-180" y="-10" textAnchor="middle" transform="skewY(-3.5)" fontFamily="IBM Plex Mono, monospace" fontWeight="700" fontSize="40" fill={INK}>
        HALVARD-LOWE
      </text>
      <text x="-180" y="40" textAnchor="middle" transform="skewY(-3.5)" fontFamily="IBM Plex Mono, monospace" fontWeight="700" fontSize="20" fill={PAPER} opacity="0.6">
        LOGISTICS · REFRIGERATED
      </text>
      <rect x="-20" y="-200" width="70" height="52" fill="#262d36" />
      {/* cab */}
      <path d="M60 -40 L240 -30 L300 70 L300 210 L60 220Z" fill="#11151a" />
      <path d="M80 -24 L226 -16 L272 66 L80 70Z" fill={`url(#hS${u})`} opacity="0.55" />
      <path d="M80 -24 L226 -16 L272 66 L80 70Z" fill="none" stroke={PAPER} strokeWidth="3" opacity="0.4" />
      <rect x="150" y="96" width="140" height="70" fill="#07090b" />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={158 + i * 22} y={104} width="10" height="54" fill="#1a1f26" />
      ))}
      {/* wheels */}
      <circle cx="-250" cy="226" r="54" fill="#05070a" stroke="#262d36" strokeWidth="8" />
      <circle cx="-110" cy="224" r="54" fill="#05070a" stroke="#262d36" strokeWidth="8" />
      <circle cx="200" cy="222" r="54" fill="#05070a" stroke="#262d36" strokeWidth="8" />
      {lights && (
        <>
          <circle cx="292" cy="130" r="20" fill={PAPER} />
          <circle cx="292" cy="196" r="12" fill="#e7c07a" />
          <Glow u={u} cx={x + 292 * k} cy={y + 130 * k} r={300 * k} k={0.9} />
        </>
      )}
      {/* exhaust */}
      <path d="M-20 -200 q-40 -80 20 -150 q60 -70 0 -160" stroke={PAPER} strokeWidth="26" fill="none" opacity="0.08" strokeLinecap="round" />
    </g>
  );
}

// ------------------------------------------------------------------ the convoy at Gate 1

export function ConvoyScene({ raid = false }: { raid?: boolean }) {
  const u = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg {...svgProps}>
      <defs>
        <Halftone u={u} />
        <pattern id={`chain${u}`} width="34" height="34" patternUnits="userSpaceOnUse">
          <path d="M0 0L34 34M34 0L0 34" stroke={PAPER} strokeWidth="1.6" />
        </pattern>
        <mask id={`cone${u}`}>
          <path d="M1180 420 L860 1240 L1500 1240Z" fill={`url(#lgDown${u})`} />
        </mask>
      </defs>
      <rect width="1600" height="1600" fill={INK} />
      <Stars seed={91} n={30} maxY={420} />
      <path d={ridge(97, 560, 50, 40, 900)} fill="#141920" />
      {/* snowy ground */}
      <rect y="1120" width="1600" height="480" fill="#1a1f26" />
      <rect y="1120" width="1600" height="480" fill={`url(#hS${u})`} opacity="0.28" />
      {/* fence */}
      <rect x="0" y="700" width="1600" height="420" fill={`url(#chain${u})`} opacity="0.13" />
      <path d="M0 700 L1600 700" stroke={PAPER} strokeWidth="3" opacity="0.3" />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={i * 200 - 4} y={640} width="8" height="480" fill="#1c2128" />
      ))}
      <path d={Array.from({ length: 40 }, (_, i) => `M${i * 40} 690 q10 -26 20 0 q10 26 20 0`).join(' ')} stroke={PAPER} strokeWidth="2" fill="none" opacity="0.35" />
      {/* floodlight */}
      <rect x="1176" y="420" width="10" height="700" fill="#05070a" />
      <rect x="1150" y="410" width="70" height="16" fill="#05070a" />
      <rect width="1600" height="1600" fill={`url(#hM${u})`} mask={`url(#cone${u})`} opacity="0.4" />
      <Glow u={u} cx={1186} cy={424} r={150} />
      <BoxTruck x={760} y={880} k={1} u={u} />
      {/* barrier arm across the truck's path */}
      <g>
        <rect x="1138" y="1040" width="26" height="120" fill="#05070a" />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={660 + i * 40} y={1046} width="40" height="18" fill={i % 2 ? PAPER : '#1a1f26'} />
        ))}
        <circle cx="670" cy="1055" r="7" fill={RED} />
      </g>
      {raid &&
        [380, 1260].map((cx, i) => (
          <g key={i} transform={`translate(${cx} 1250)`}>
            <path d="M-170 40 L-140 -30 L130 -30 L170 40 L170 90 L-170 90Z" fill="#07090b" />
            <path d="M-120 -26 L-96 -76 L96 -76 L120 -26Z" fill="#11151a" />
            <rect x="-60" y="-96" width="120" height="20" fill="#11151a" />
            <rect x="-56" y="-94" width="54" height="16" fill={RED} className="beacon" />
            <rect x="2" y="-94" width="54" height="16" fill={PAPER} opacity="0.85" />
            <Glow u={u} cx={cx - 30} cy={1166} r={170} k={0.6} />
          </g>
        ))}
      {raid && (
        <g fill="#05070a">
          {[560, 640, 980].map((x, i) => (
            <g key={i} transform={`translate(${x} ${1160 + (i % 2) * 20})`}>
              <circle cx="0" cy="-150" r="22" />
              <path d="M-38 -120 L38 -120 L46 30 L-46 30Z" />
              <path d="M-26 30 L-20 120 L-4 120 L0 40 L4 120 L20 120 L26 30Z" />
              <text x="0" y="-60" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontWeight="700" fontSize="22" fill={PAPER}>
                FBI
              </text>
            </g>
          ))}
        </g>
      )}
      <path d={forest(101, -80, 380, 1250, 380, 700, 90)} fill="#040506" />
      <path d={forest(103, 1300, 1700, 1250, 380, 700, 90)} fill="#040506" />
    </svg>
  );
}

// ------------------------------------------------------------------ midnight over Kessick County

export function MidnightScene({ dark = false }: { dark?: boolean }) {
  const u = useId().replace(/[^a-zA-Z0-9]/g, '');
  const r = rng(113);
  const bursts = dark
    ? []
    : [
        { x: 520, y: 520, s: 1, c: PAPER },
        { x: 1080, y: 430, s: 0.8, c: PAPER },
        { x: 820, y: 330, s: 0.6, c: RED },
        { x: 1290, y: 600, s: 0.5, c: PAPER },
        { x: 330, y: 380, s: 0.45, c: RED },
      ];
  const windows: React.ReactElement[] = [];
  for (let i = 0; i < 26; i++) windows.push(<rect key={i} x={600 + (i % 13) * 30} y={1010 + Math.floor(i / 13) * 34} width="12" height="14" fill={PAPER} opacity={r() > 0.35 ? 0.9 : 0.15} />);
  return (
    <svg {...svgProps}>
      <defs>
        <Halftone u={u} />
      </defs>
      <rect width="1600" height="1600" fill={INK} />
      <Stars seed={117} n={90} maxY={900} />
      {bursts.map((b, i) => (
        <g key={i} transform={`translate(${b.x} ${b.y}) scale(${b.s})`}>
          {Array.from({ length: 22 }, (_, k) => {
            const a = (k / 22) * Math.PI * 2;
            return (
              <g key={k}>
                <path d={`M${Math.cos(a) * 40} ${Math.sin(a) * 40} L${Math.cos(a) * 170} ${Math.sin(a) * 170 + 18}`} stroke={b.c} strokeWidth="5" strokeLinecap="round" opacity="0.8" strokeDasharray="2 18" />
                <circle cx={Math.cos(a) * 190} cy={Math.sin(a) * 190 + 26} r="7" fill={b.c} />
              </g>
            );
          })}
          <Glow u={u} cx={b.x} cy={b.y} r={220 * b.s} k={0.4} />
        </g>
      ))}
      {/* the valley: Kessick's lights far below */}
      <path d={ridge(121, 900, 70, 40, 1600)} fill="#141920" />
      <g fill={PAPER}>
        {Array.from({ length: 70 }, (_, i) => (
          <circle key={i} cx={200 + r() * 1200} cy={930 + r() * 50} r={1.5 + r() * 2} opacity={dark ? 0.15 : 0.6} />
        ))}
      </g>
      {/* the Annex on the ridge, foreground */}
      <path d="M0 1180 C300 1110 500 1080 640 1080 L1060 1080 C1200 1090 1400 1130 1600 1180 L1600 1600 L0 1600Z" fill="#07090b" />
      <rect x="580" y="990" width="420" height="96" fill="#0b0e12" />
      {windows}
      <rect x="1000" y="940" width="120" height="146" fill="#0b0e12" />
      <rect x="1040" y="740" width="10" height="200" fill="#0b0e12" />
      <path d="M1045 640 L1030 940 M1045 640 L1060 940" stroke="#0b0e12" strokeWidth="6" />
      <circle className="beacon" cx="1045" cy="640" r="7" fill={RED} />
      <rect x="1080" y="980" width="16" height="20" fill={dark ? RED : PAPER} opacity="0.9" />
      <path d={forest(127, -60, 520, 1640, 420, 700, 90)} fill={INK} />
      <path d={forest(131, 1130, 1700, 1640, 420, 700, 90)} fill={INK} />
    </svg>
  );
}

// ------------------------------------------------------------------ the Ledger, January 2nd

export function LedgerScene() {
  const u = useId().replace(/[^a-zA-Z0-9]/g, '');
  const lines = (x: number, y: number, w: number, n: number, seed: number) => {
    const r = rng(seed);
    return Array.from({ length: n }, (_, i) => <rect key={i} x={x} y={y + i * 22} width={w * (i === n - 1 ? 0.5 : 0.82 + r() * 0.18)} height="9" fill={INK} opacity="0.55" />);
  };
  return (
    <svg {...svgProps}>
      <defs>
        <Halftone u={u} />
      </defs>
      <rect width="1600" height="1600" fill="#2b2f35" />
      <rect width="1600" height="1600" fill={`url(#hI${u})`} opacity="0.35" />
      <g transform="rotate(-4 800 800)">
        <rect x="330" y="190" width="940" height="1260" fill={PAPER} />
        <rect x="330" y="190" width="940" height="1260" fill={`url(#hI${u})`} opacity="0.06" />
        <text x="800" y="300" textAnchor="middle" fontFamily="Stardos Stencil, serif" fontSize="86" fill={INK}>
          The Washington Ledger
        </text>
        <path d="M370 326 H1230 M370 362 H1230" stroke={INK} strokeWidth="3" />
        <text x="380" y="352" fontFamily="IBM Plex Mono, monospace" fontSize="20" fill={INK}>
          SUNDAY, JANUARY 2, 2000
        </text>
        <text x="1220" y="352" textAnchor="end" fontFamily="IBM Plex Mono, monospace" fontSize="20" fill={INK}>
          FINAL · 50¢
        </text>
        <text x="800" y="470" textAnchor="middle" fontFamily="IBM Plex Sans, sans-serif" fontWeight="700" fontSize="78" fill={INK}>
          LAB ON THE RIDGE
        </text>
        <text x="800" y="530" textAnchor="middle" fontFamily="Courier Prime, monospace" fontSize="30" fill={INK}>
          Records show a banned germ stock at a W.Va. Army annex
        </text>
        <text x="800" y="568" textAnchor="middle" fontFamily="Courier Prime, monospace" fontSize="30" fill={INK}>
          was to leave the country on New Year&apos;s Eve
        </text>
        {/* the photo: Gate 1 */}
        <rect x="380" y="610" width="520" height="380" fill={INK} />
        <rect x="380" y="610" width="520" height="380" fill={`url(#hL${u})`} opacity="0.25" />
        <rect x="430" y="800" width="300" height="150" fill="#1a1f26" />
        <rect x="455" y="830" width="150" height="34" fill={PAPER} opacity="0.85" />
        <circle cx="760" cy="900" r="26" fill={PAPER} />
        <path d="M380 950 H900" stroke={PAPER} strokeWidth="6" strokeDasharray="30 30" opacity="0.8" />
        <text x="390" y="1020" fontFamily="IBM Plex Mono, monospace" fontSize="17" fill={INK}>
          A refrigerated truck held at the Marrow Creek gate, 12:31 a.m.
        </text>
        {lines(930, 620, 290, 17, 7)}
        {lines(380, 1060, 410, 15, 11)}
        {lines(820, 1060, 400, 15, 13)}
        <text x="930" y="1018" fontFamily="IBM Plex Sans, sans-serif" fontWeight="700" fontSize="24" fill={INK}>
          A scientist&apos;s letter, A6
        </text>
      </g>
      {/* coffee */}
      <g transform="translate(1270 1290)">
        <ellipse cx="0" cy="40" rx="190" ry="60" fill="#1a1f26" />
        <ellipse cx="0" cy="0" rx="130" ry="52" fill={PAPER} />
        <ellipse cx="0" cy="0" rx="104" ry="38" fill={INK} />
        <path d="M120 -10 q80 0 70 60 q-10 40 -70 30" fill="none" stroke={PAPER} strokeWidth="22" />
        <path d="M-40 -90 q-30 -60 10 -120 M30 -80 q-20 -50 10 -110" stroke={PAPER} strokeWidth="6" fill="none" opacity="0.4" />
      </g>
    </svg>
  );
}

// ------------------------------------------------------------------ Route 9, headlights in the mirror

export function MirrorScene() {
  const u = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg {...svgProps}>
      <defs>
        <Halftone u={u} />
        <clipPath id={`mir${u}`}>
          <rect x="520" y="300" width="560" height="190" rx="40" />
        </clipPath>
      </defs>
      <rect width="1600" height="1600" fill={INK} />
      {/* the road ahead through the windshield */}
      <path d="M0 1000 L1600 1000 L1600 1600 L0 1600Z" fill="#07090b" />
      <path d="M760 1000 L840 1000 L1500 1600 L100 1600Z" fill="#12161b" />
      <path d="M800 1000 L800 1600" stroke={PAPER} strokeWidth="10" strokeDasharray="60 80" opacity="0.6" />
      <rect x="0" y="1000" width="1600" height="600" fill={`url(#hS${u})`} opacity="0.2" />
      <path d={forest(137, -60, 700, 1010, 180, 380, 60)} fill="#040506" />
      <path d={forest(139, 900, 1700, 1010, 180, 380, 60)} fill="#040506" />
      <Glow u={u} cx={800} cy={1180} r={420} k={0.5} />
      {/* windshield frame and dash */}
      <path d="M0 0 L1600 0 L1600 260 C1200 200 400 200 0 260Z" fill="#030405" />
      <path d="M0 1280 C400 1220 1200 1220 1600 1280 L1600 1600 L0 1600Z" fill="#030405" />
      <path d="M0 260 L180 1300 L0 1300Z M1600 260 L1420 1300 L1600 1300Z" fill="#030405" />
      <g transform="translate(560 1330)">
        <circle cx="0" cy="0" r="80" fill="none" stroke={PAPER} strokeWidth="4" opacity="0.35" />
        <path d="M0 0 L50 -40" stroke={RED} strokeWidth="6" />
        <circle cx="480" cy="0" r="80" fill="none" stroke={PAPER} strokeWidth="4" opacity="0.35" />
        <path d="M480 0 L436 -46" stroke={PAPER} strokeWidth="6" opacity="0.7" />
      </g>
      {/* the mirror */}
      <rect x="790" y="240" width="20" height="70" fill="#05070a" />
      <rect x="508" y="288" width="584" height="214" rx="48" fill="#05070a" />
      <g clipPath={`url(#mir${u})`}>
        <rect x="520" y="300" width="560" height="190" fill="#0b0e12" />
        <path d="M520 430 L1080 430 L1080 490 L520 490Z" fill="#12161b" />
        <path d={forest(143, 500, 1100, 440, 40, 110, 26)} fill="#040506" />
        <circle cx="740" cy="410" r="16" fill={PAPER} />
        <circle cx="860" cy="410" r="16" fill={PAPER} />
        <Glow u={u} cx={740} cy={410} r={90} />
        <Glow u={u} cx={860} cy={410} r={90} />
      </g>
      <rect x="520" y="300" width="560" height="190" rx="40" fill="none" stroke={PAPER} strokeWidth="3" opacity="0.25" />
    </svg>
  );
}

// ------------------------------------------------------------------ B3, sealed

export function SealedScene() {
  const u = useId().replace(/[^a-zA-Z0-9]/g, '');
  const vx = 800;
  const vy = 780;
  return (
    <svg {...svgProps}>
      <defs>
        <Halftone u={u} />
      </defs>
      <rect width="1600" height="1600" fill={INK} />
      {/* corridor in one-point perspective */}
      <path d={`M0 0 L${vx - 220} ${vy - 300} L${vx + 220} ${vy - 300} L1600 0Z`} fill="#11151a" />
      <path d={`M0 1600 L${vx - 220} ${vy + 260} L${vx + 220} ${vy + 260} L1600 1600Z`} fill="#0b0e12" />
      <path d={`M0 0 L${vx - 220} ${vy - 300} L${vx - 220} ${vy + 260} L0 1600Z`} fill="#161b21" />
      <path d={`M1600 0 L${vx + 220} ${vy - 300} L${vx + 220} ${vy + 260} L1600 1600Z`} fill="#161b21" />
      {Array.from({ length: 5 }, (_, i) => {
        const t = (i + 1) / 6;
        const x0 = vx - 220 - (vx - 220) * (1 - t) ** 1.6;
        return <path key={i} d={`M${x0} ${vy - 300 - (vy - 300) * (1 - t) ** 1.6} L${x0} ${vy + 260 + (1600 - vy - 260) * (1 - t) ** 1.6}`} stroke="#0b0e12" strokeWidth={6 + 20 * (1 - t)} />;
      })}
      {/* red strobe wash */}
      <rect width="1600" height="1600" fill={RED} opacity="0.16" className="strobe" />
      <Glow u={u} cx={vx} cy={vy - 360} r={420} k={0.5} />
      <circle cx={vx} cy={vy - 340} r="30" fill={RED} className="beacon" />
      {/* the door */}
      <rect x={vx - 220} y={vy - 300} width="440" height="560" fill="#1a1f26" />
      <rect x={vx - 200} y={vy - 280} width="400" height="520" fill="none" stroke={PAPER} strokeWidth="3" opacity="0.35" />
      <rect x={vx - 70} y={vy - 240} width="140" height="80" fill="#07090b" stroke={PAPER} strokeWidth="2" opacity="0.6" />
      <g transform={`translate(${vx} ${vy - 10})`} fill="none" stroke={RED} strokeWidth="14">
        <circle r="34" />
        {[0, 120, 240].map((a) => (
          <circle key={a} r="58" cx={Math.cos(((a - 90) * Math.PI) / 180) * 54} cy={Math.sin(((a - 90) * Math.PI) / 180) * 54} />
        ))}
      </g>
      <rect x={vx - 200} y={vy + 120} width="400" height="64" fill={RED} />
      <text x={vx} y={vy + 164} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontWeight="700" fontSize="32" fill={PAPER}>
        B3 · SEALED
      </text>
      {/* tape across the door */}
      <path d={`M${vx - 260} ${vy - 120} L${vx + 260} ${vy + 60}`} stroke={PAPER} strokeWidth="34" opacity="0.85" />
      <path d={`M${vx - 260} ${vy - 120} L${vx + 260} ${vy + 60}`} stroke={INK} strokeWidth="34" strokeDasharray="40 40" opacity="0.6" />
    </svg>
  );
}

// ------------------------------------------------------------------ Route 9, the intercept

export function InterceptScene() {
  const u = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg {...svgProps}>
      <defs>
        <Halftone u={u} />
      </defs>
      <rect width="1600" height="1600" fill={INK} />
      <Stars seed={151} n={40} maxY={700} />
      <path d={ridge(157, 760, 60, 40, 1000)} fill="#141920" />
      <path d="M0 900 L1600 900 L1600 1600 L0 1600Z" fill="#07090b" />
      <path d="M700 900 L900 900 L1600 1500 L0 1500Z" fill="#12161b" />
      <rect y="900" width="1600" height="700" fill={`url(#hS${u})`} opacity="0.18" />
      {/* the truck, from behind, stopped */}
      <g transform="translate(800 1000)">
        <rect x="-170" y="-200" width="340" height="250" fill="#1a1f26" />
        <path d="M-170 -200 H170 M0 -200 V50" stroke="#0b0e12" strokeWidth="6" />
        <rect x="-150" y="30" width="40" height="22" fill={RED} />
        <rect x="110" y="30" width="40" height="22" fill={RED} />
        <Glow u={u} cx={670} cy={1041} r={80} k={0.6} />
        <Glow u={u} cx={930} cy={1041} r={80} k={0.6} />
        <rect x="-60" y="60" width="120" height="16" fill={PAPER} opacity="0.8" />
      </g>
      {/* a sedan across the road ahead, hazards on */}
      <g transform="translate(1040 900)">
        <path d="M-160 20 L-130 -30 L120 -30 L160 20 L160 60 L-160 60Z" fill="#05070a" />
        <rect x="-150" y="10" width="26" height="14" fill="#e7c07a" className="beacon" />
        <rect x="124" y="10" width="26" height="14" fill="#e7c07a" className="beacon" />
      </g>
      {/* figures in the headlights */}
      <g fill="#05070a">
        {[1180, 1260].map((x, i) => (
          <g key={i} transform={`translate(${x} 960)`}>
            <circle cx="0" cy="-110" r="16" />
            <path d="M-26 -90 L26 -90 L32 20 L-32 20Z" />
            <path d="M-20 20 L-14 90 L-2 90 L0 30 L2 90 L14 90 L20 20Z" />
          </g>
        ))}
      </g>
      <text x="800" y="1440" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontWeight="700" fontSize="26" fill={PAPER} opacity="0.5">
        STATE ROUTE 9 · MILE 14
      </text>
      <path d={forest(161, -60, 560, 1000, 300, 600, 80)} fill="#040506" />
      <path d={forest(163, 1300, 1700, 1000, 300, 600, 80)} fill="#040506" />
    </svg>
  );
}
