// Procedural "photocopied badge photo": two tones, halftone shading, hard side light.
import { useId } from 'react';
import type { PortraitSpec } from '../engine/types';

const INK = '#15181c';
const PAPER = '#ece3cc';

function rng(seed: number) {
  let t = (seed * 2654435761) >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function Portrait({ spec, title }: { spec: PortraitSpec; title?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const r = rng(spec.seed);
  const rx = 16.5 + r() * 3.5; // face width
  const ry = 21 + r() * 3.5; // face height
  const cx = 48;
  const cy = 54;
  const eyeY = cy - 2 + r() * 2;
  const eyeDx = 6.6 + r() * 1.4;
  const browTilt = (r() - 0.5) * 3;
  const mouthW = 4 + r() * 2.5;
  const mouthCurve = (r() - 0.55) * 2.2;
  const tilt = (r() - 0.5) * 3;
  const darkClothes = r() > 0.4;
  const hairFill = spec.gray ? `url(#hl${uid})` : INK;
  const f = spec.sex === 'f';
  const h = spec.hair % 5;
  const top = cy - ry;

  const hairBack = (() => {
    if (!f) return null;
    if (h === 2) return <path d={`M${cx - rx - 5} ${cy - 6} Q${cx - rx - 9} ${cy + 30} ${cx - rx - 4} ${cy + 46} L${cx + rx + 4} ${cy + 46} Q${cx + rx + 9} ${cy + 30} ${cx + rx + 5} ${cy - 6} Z`} fill={hairFill} />;
    if (h === 1) return <path d={`M${cx - rx - 4} ${cy - 8} Q${cx - rx - 6} ${cy + 16} ${cx - rx + 1} ${cy + 20} L${cx + rx - 1} ${cy + 20} Q${cx + rx + 6} ${cy + 16} ${cx + rx + 4} ${cy - 8} Z`} fill={hairFill} />;
    if (h === 4) return <circle cx={cx + 3} cy={top - 4} r={7} fill={hairFill} />;
    return null;
  })();

  const hairFront = (() => {
    const cap = (depth: number, sweep = 0) => (
      <path
        d={`M${cx - rx - 1.5} ${cy - 2} C${cx - rx - 2} ${top - 4}, ${cx + rx + 2} ${top - 6}, ${cx + rx + 1.5} ${cy - 4} C${cx + rx - 3} ${top + depth}, ${cx + sweep} ${top + depth - 2}, ${cx - rx + 4} ${top + depth + 3} Z`}
        fill={hairFill}
      />
    );
    if (!f) {
      if (h === 0) return <path d={`M${cx - rx} ${cy - 6} C${cx - rx} ${top - 2}, ${cx + rx} ${top - 2}, ${cx + rx} ${cy - 6} C${cx + rx - 4} ${top + 5}, ${cx - rx + 4} ${top + 5}, ${cx - rx} ${cy - 6}Z`} fill={`url(#hd${uid})`} />;
      if (h === 1) return cap(9, 6);
      if (h === 2) return cap(6, -4);
      if (h === 3)
        return (
          <>
            <path d={`M${cx - rx - 1} ${cy + 2} Q${cx - rx - 2} ${cy - 12} ${cx - rx + 5} ${cy - 15} L${cx - rx + 3} ${cy + 2}Z`} fill={hairFill} />
            <path d={`M${cx + rx + 1} ${cy + 2} Q${cx + rx + 2} ${cy - 12} ${cx + rx - 5} ${cy - 15} L${cx + rx - 3} ${cy + 2}Z`} fill={hairFill} />
          </>
        );
      return (
        <path
          d={`M${cx - rx - 4} ${cy + 4} C${cx - rx - 6} ${top - 8}, ${cx + rx + 6} ${top - 9}, ${cx + rx + 4} ${cy + 2} L${cx + rx - 1} ${cy - 6} C${cx + 4} ${top + 7}, ${cx - 6} ${top + 9}, ${cx - rx + 1} ${cy - 5}Z`}
          fill={hairFill}
        />
      );
    }
    if (h === 3) {
      const curls = [];
      for (let i = 0; i < 15; i++) {
        const a = Math.PI * (0.95 + (i / 14) * 1.1);
        curls.push(<circle key={i} cx={cx + Math.cos(a) * (rx + 3)} cy={cy - 4 + Math.sin(a) * (ry + 2)} r={5.2} fill={hairFill} />);
      }
      return <>{curls}</>;
    }
    if (h === 0) return cap(8, -8);
    return cap(10, 8);
  })();

  return (
    <svg viewBox="0 0 96 120" role="img" aria-label={title ?? 'Badge photo'}>
      <defs>
        <pattern id={`hd${uid}`} width="3.2" height="3.2" patternUnits="userSpaceOnUse">
          <circle cx="1.6" cy="1.6" r="1.25" fill={INK} />
        </pattern>
        <pattern id={`hl${uid}`} width="3" height="3" patternUnits="userSpaceOnUse">
          <rect width="3" height="3" fill={INK} />
          <circle cx="1.5" cy="1.5" r="1.05" fill={PAPER} />
        </pattern>
        <pattern id={`hs${uid}`} width="3.4" height="3.4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <circle cx="1.7" cy="1.7" r="0.85" fill={INK} />
        </pattern>
        <linearGradient id={`lg${uid}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0.42" stopColor="#000" />
          <stop offset="0.75" stopColor="#fff" />
        </linearGradient>
        <linearGradient id={`bg${uid}`} x1="1" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#000" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <mask id={`sm${uid}`}>
          <rect width="96" height="120" fill={`url(#lg${uid})`} />
        </mask>
        <mask id={`bm${uid}`}>
          <rect width="96" height="120" fill={`url(#bg${uid})`} />
        </mask>
        <clipPath id={`fc${uid}`}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
        </clipPath>
      </defs>

      <rect width="96" height="120" fill={PAPER} />
      <rect width="96" height="120" fill={`url(#hs${uid})`} mask={`url(#bm${uid})`} />

      <g transform={`rotate(${tilt} 48 70)`}>
        {hairBack}
        {/* torso */}
        <path d={`M4 122 C6 100, 22 92, 36 89 L60 89 C74 92, 90 100, 92 122Z`} fill={darkClothes ? INK : `url(#hd${uid})`} />
        {!f && darkClothes && (
          <>
            <path d="M39 89 L48 106 L57 89Z" fill={PAPER} />
            <path d="M46 95 L50 95 L52 116 L48 120 L44 116Z" fill={`url(#hd${uid})`} />
          </>
        )}
        {f && <path d="M38 89 Q48 102 58 89" fill="none" stroke={darkClothes ? PAPER : INK} strokeWidth="1.6" />}
        {/* neck */}
        <rect x={cx - 7} y={cy + ry - 8} width="14" height="18" fill={PAPER} />
        <rect x={cx - 7} y={cy + ry - 8} width="14" height="18" fill={`url(#hd${uid})`} mask={`url(#sm${uid})`} />
        <path d={`M${cx - 7} ${cy + ry - 3} Q${cx} ${cy + ry + 4} ${cx + 7} ${cy + ry - 3}`} fill={INK} opacity="0.9" />
        {/* ears */}
        <ellipse cx={cx - rx + 0.5} cy={cy + 1} rx="3" ry="5" fill={PAPER} stroke={INK} strokeWidth="1" />
        <ellipse cx={cx + rx - 0.5} cy={cy + 1} rx="3" ry="5" fill={`url(#hd${uid})`} />
        {/* face */}
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={PAPER} />
        <g clipPath={`url(#fc${uid})`}>
          <rect x={cx - rx} y={cy - ry} width={rx * 2} height={ry * 2} fill={`url(#hd${uid})`} mask={`url(#sm${uid})`} />
          <ellipse cx={cx + 4} cy={cy + ry + 2} rx={rx} ry="6" fill={`url(#hd${uid})`} />
        </g>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={INK} strokeWidth="1.1" />
        {/* features */}
        <path d={`M${cx - eyeDx - 3.5} ${eyeY - 4.2 - browTilt} L${cx - eyeDx + 3} ${eyeY - 4.6}`} stroke={INK} strokeWidth="1.9" strokeLinecap="round" />
        <path d={`M${cx + eyeDx - 3} ${eyeY - 4.6} L${cx + eyeDx + 3.5} ${eyeY - 4.2 - browTilt}`} stroke={INK} strokeWidth="1.9" strokeLinecap="round" />
        <ellipse cx={cx - eyeDx} cy={eyeY} rx="2.1" ry="1.35" fill={INK} />
        <ellipse cx={cx + eyeDx} cy={eyeY} rx="2.1" ry="1.35" fill={INK} />
        <path d={`M${cx + 1} ${eyeY + 3} L${cx + 3} ${eyeY + 10} L${cx - 1} ${eyeY + 11}`} fill="none" stroke={INK} strokeWidth="1.2" />
        <path d={`M${cx - mouthW} ${cy + 12} Q${cx} ${cy + 12 + mouthCurve} ${cx + mouthW} ${cy + 12}`} fill="none" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
        {spec.glasses && (
          <g fill="none" stroke={INK} strokeWidth="1.5">
            <rect x={cx - eyeDx - 5} y={eyeY - 3.6} width="10" height="7.2" rx="2" />
            <rect x={cx + eyeDx - 5} y={eyeY - 3.6} width="10" height="7.2" rx="2" />
            <path d={`M${cx - eyeDx + 5} ${eyeY - 1} L${cx + eyeDx - 5} ${eyeY - 1}`} />
          </g>
        )}
        {spec.beard && (
          <path
            d={`M${cx - rx + 2} ${cy + 3} Q${cx - rx + 3} ${cy + ry + 3} ${cx} ${cy + ry + 3} Q${cx + rx - 3} ${cy + ry + 3} ${cx + rx - 2} ${cy + 3} Q${cx + 8} ${cy + 8} ${cx + mouthW + 2} ${cy + 9} L${cx - mouthW - 2} ${cy + 9} Q${cx - 8} ${cy + 8} ${cx - rx + 2} ${cy + 3}Z`}
            fill={spec.gray ? `url(#hl${uid})` : `url(#hd${uid})`}
          />
        )}
        {hairFront}
      </g>
      <rect x="0.5" y="0.5" width="95" height="119" fill="none" stroke={INK} strokeWidth="1" />
    </svg>
  );
}
