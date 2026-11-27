// Procedural "photocopied badge photo": two tones, halftone shading, hard side light.
// Men get square jaws, straight brows and ties; women get tapered faces, framing hair,
// arched brows, lashes, lips and necklines, so the two read differently at a glance.
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

export function Portrait({ spec, title, talking }: { spec: PortraitSpec; title?: string; talking?: boolean }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const r = rng(spec.seed);
  const f = spec.sex === 'f';
  const h = spec.hair % 5;
  const cx = 48;
  const cy = 54;
  const rx = f ? 15 + r() * 2.4 : 16.5 + r() * 3.5;
  const ry = f ? 20.5 + r() * 2.4 : 21 + r() * 3.5;
  const jawW = rx * (f ? 0.6 + r() * 0.08 : 0.86 + r() * 0.08);
  const chinW = rx * (f ? 0.15 + r() * 0.06 : 0.36 + r() * 0.1);
  const top = cy - ry;
  const eyeY = cy - 1.5 + r() * 2;
  const eyeDx = f ? 6.2 + r() * 1 : 6.6 + r() * 1.4;
  const browTilt = (r() - 0.5) * 3;
  const mw = f ? 3.6 + r() * 1 : 4 + r() * 2.5;
  const my = cy + 12.5;
  const mouthCurve = (r() - 0.55) * 2.2;
  const tilt = (r() - 0.5) * 3;
  const darkClothes = r() > 0.4;
  const lightRoll = r();
  const lightHair = !spec.gray && f && (h === 1 || h === 2) && lightRoll > 0.6; // short cuts stay solid so they read
  const hairFill = spec.gray ? `url(#hl${uid})` : lightHair ? `url(#hd${uid})` : INK;
  const necklace = f && r() > 0.45;
  const hoops = f && r() > 0.5;
  const blazer = f && r() > 0.55;
  const stubble = !f && !spec.beard && r() > 0.7;

  const face = `M${cx} ${top} C${cx + rx * 0.92} ${top} ${cx + rx} ${cy - ry * 0.5} ${cx + rx} ${cy - ry * 0.08} C${cx + rx} ${cy + ry * 0.38} ${cx + jawW} ${cy + ry * 0.7} ${cx + chinW} ${cy + ry * 0.96} Q${cx} ${cy + ry * 1.05} ${cx - chinW} ${cy + ry * 0.96} C${cx - jawW} ${cy + ry * 0.7} ${cx - rx} ${cy + ry * 0.38} ${cx - rx} ${cy - ry * 0.08} C${cx - rx} ${cy - ry * 0.5} ${cx - rx * 0.92} ${top} ${cx} ${top}Z`;

  // Women: does the hairstyle leave the ears visible?
  const earsVisible = !f || h === 0 || h === 4;

  const cap = (depth: number, sweep = 0) => (
    <path
      d={`M${cx - rx - 1.5} ${cy - 2} C${cx - rx - 2} ${top - 4}, ${cx + rx + 2} ${top - 6}, ${cx + rx + 1.5} ${cy - 4} C${cx + rx - 3} ${top + depth}, ${cx + sweep} ${top + depth - 2}, ${cx - rx + 4} ${top + depth + 3} Z`}
      fill={hairFill}
    />
  );

  const hairBack = (() => {
    if (!f) return null;
    if (h === 1)
      return <path d={`M${cx - rx - 6} ${cy - 10} Q${cx - rx - 8} ${cy + ry * 0.55} ${cx - rx - 3} ${cy + ry * 0.82} L${cx + rx + 3} ${cy + ry * 0.82} Q${cx + rx + 8} ${cy + ry * 0.55} ${cx + rx + 6} ${cy - 10} Z`} fill={hairFill} />;
    if (h === 2)
      return <path d={`M${cx - rx - 6} ${cy - 8} Q${cx - rx - 11} ${cy + 30} ${cx - rx - 7} ${cy + 52} L${cx + rx + 7} ${cy + 52} Q${cx + rx + 11} ${cy + 30} ${cx + rx + 6} ${cy - 8} Z`} fill={hairFill} />;
    if (h === 3) {
      const curls = [];
      for (let i = 0; i < 22; i++) {
        const a = Math.PI * (0.82 + (i / 21) * 1.36);
        curls.push(<circle key={i} cx={cx + Math.cos(a) * (rx + 5)} cy={cy + 2 + Math.sin(a) * (ry + 4)} r={6.4} fill={hairFill} />);
      }
      for (let i = 0; i < 4; i++) {
        curls.push(<circle key={`l${i}`} cx={cx - rx - 3 + (i % 2)} cy={cy + 4 + i * 6} r={5.4} fill={hairFill} />);
        curls.push(<circle key={`r${i}`} cx={cx + rx + 3 - (i % 2)} cy={cy + 4 + i * 6} r={5.4} fill={hairFill} />);
      }
      return <>{curls}</>;
    }
    if (h === 4) return <circle cx={cx + 2} cy={top - 5} r={8} fill={hairFill} />;
    return null;
  })();

  const hairFront = (() => {
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
    // Side locks that frame the face and cover the ears.
    const locks = (len: number) => (
      <>
        <path d={`M${cx - rx - 3} ${cy - 12} Q${cx - rx - 4} ${cy + len * 0.6} ${cx - rx + 1} ${cy + len} L${cx - rx + 6} ${cy + len - 2} Q${cx - rx + 2} ${cy + 4} ${cx - rx + 4} ${cy - 10}Z`} fill={hairFill} />
        <path d={`M${cx + rx + 3} ${cy - 12} Q${cx + rx + 4} ${cy + len * 0.6} ${cx + rx - 1} ${cy + len} L${cx + rx - 6} ${cy + len - 2} Q${cx + rx - 2} ${cy + 4} ${cx + rx - 4} ${cy - 10}Z`} fill={hairFill} />
      </>
    );
    if (h === 0)
      // pixie: side-swept fringe dipping over one brow
      return (
        <path
          d={`M${cx - rx - 2} ${cy - 1} C${cx - rx - 3} ${top - 6}, ${cx + rx + 3} ${top - 7}, ${cx + rx + 2} ${cy - 3} C${cx + rx - 2} ${top + 6}, ${cx + 6} ${top + 4}, ${cx - 2} ${eyeY - 6} C${cx - 8} ${eyeY - 4}, ${cx - rx + 2} ${top + 10}, ${cx - rx + 1} ${cy - 2}Z`}
          fill={hairFill}
        />
      );
    if (h === 1)
      // bob with blunt bangs
      return (
        <>
          <path d={`M${cx - rx - 3} ${cy - 3} C${cx - rx - 3} ${top - 6}, ${cx + rx + 3} ${top - 6}, ${cx + rx + 3} ${cy - 3} L${cx + rx - 2} ${eyeY - 6.5} L${cx - rx + 2} ${eyeY - 6}Z`} fill={hairFill} />
          {locks(ry * 0.78)}
        </>
      );
    if (h === 2)
      // long, centre part
      return (
        <>
          <path d={`M${cx - rx - 3} ${cy - 2} C${cx - rx - 3} ${top - 6}, ${cx + rx + 3} ${top - 6}, ${cx + rx + 3} ${cy - 2} C${cx + rx - 2} ${top + 6}, ${cx + 3} ${top + 3}, ${cx} ${top + 3} C${cx - 3} ${top + 3}, ${cx - rx + 2} ${top + 6}, ${cx - rx - 3} ${cy - 2}Z`} fill={hairFill} />
          {locks(ry * 1.25)}
        </>
      );
    if (h === 3)
      return (
        <path d={`M${cx - rx - 2} ${cy - 2} C${cx - rx - 4} ${top - 8}, ${cx + rx + 4} ${top - 8}, ${cx + rx + 2} ${cy - 2} C${cx + 6} ${top + 7}, ${cx - 6} ${top + 7}, ${cx - rx - 2} ${cy - 2}Z`} fill={hairFill} />
      );
    // updo: tight, centre part
    return (
      <path d={`M${cx - rx - 1} ${cy - 3} C${cx - rx - 2} ${top - 4}, ${cx + rx + 2} ${top - 4}, ${cx + rx + 1} ${cy - 3} C${cx + rx - 4} ${top + 4}, ${cx + 2} ${top + 2}, ${cx} ${top + 2.5} C${cx - 2} ${top + 2}, ${cx - rx + 4} ${top + 4}, ${cx - rx - 1} ${cy - 3}Z`} fill={hairFill} />
    );
  })();

  const eye = (ex: number, side: 1 | -1) =>
    f ? (
      <g key={ex}>
        <path d={`M${ex - 3} ${eyeY} Q${ex} ${eyeY - 2.8} ${ex + 3} ${eyeY} Q${ex} ${eyeY + 1.7} ${ex - 3} ${eyeY}Z`} fill={PAPER} stroke={INK} strokeWidth="0.9" />
        <circle cx={ex} cy={eyeY - 0.3} r="1.35" fill={INK} />
        <path d={`M${ex - 3.2} ${eyeY + 0.1} Q${ex} ${eyeY - 3} ${ex + 3.2} ${eyeY + 0.1}`} fill="none" stroke={INK} strokeWidth="1.7" strokeLinecap="round" />
        <path d={`M${ex + 3 * side} ${eyeY} l${1.8 * side} -1.4`} stroke={INK} strokeWidth="1.1" strokeLinecap="round" />
      </g>
    ) : (
      <ellipse key={ex} cx={ex} cy={eyeY} rx="2.1" ry="1.35" fill={INK} />
    );

  const brow = (ex: number, side: 1 | -1) =>
    f ? (
      <path key={`b${ex}`} d={`M${ex - 3.8 * side} ${eyeY - 3.6} Q${ex - 0.6 * side} ${eyeY - 6.4} ${ex + 3.8 * side} ${eyeY - 4.4}`} fill="none" stroke={INK} strokeWidth="1.15" strokeLinecap="round" />
    ) : (
      <path key={`b${ex}`} d={`M${ex - 3.5 * side} ${eyeY - 4.2 - (side === -1 ? browTilt : 0)} L${ex + 3 * side} ${eyeY - 4.6 - (side === 1 ? browTilt : 0)}`} stroke={INK} strokeWidth="2.1" strokeLinecap="round" />
    );

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
        <pattern id={`hf${uid}`} width="2.4" height="2.4" patternUnits="userSpaceOnUse">
          <circle cx="1.2" cy="1.2" r="0.45" fill={INK} />
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
          <path d={face} />
        </clipPath>
      </defs>

      <rect width="96" height="120" fill={PAPER} />
      <rect width="96" height="120" fill={`url(#hs${uid})`} mask={`url(#bm${uid})`} />

      <g transform={`rotate(${tilt} 48 70)`}>
        {hairBack}
        {/* torso */}
        {f ? (
          <>
            <path d="M10 122 C12 104 25 95 37 92 L59 92 C71 95 84 104 86 122Z" fill={darkClothes ? INK : `url(#hd${uid})`} />
            <path d={`M37 92 Q48 ${blazer ? 112 : 105} 59 92Z`} fill={PAPER} />
            <path d={`M37 92 Q48 ${blazer ? 112 : 105} 59 92`} fill="none" stroke={darkClothes ? PAPER : INK} strokeWidth="1" opacity="0.8" />
            {blazer && <path d="M37 92 L44 114 M59 92 L52 114" stroke={darkClothes ? PAPER : INK} strokeWidth="1.2" />}
            {necklace && (
              <>
                <path d="M40.5 93 Q48 101.5 55.5 93" fill="none" stroke={INK} strokeWidth="0.8" />
                <circle cx="48" cy="99.8" r="1.4" fill={INK} />
              </>
            )}
          </>
        ) : (
          <>
            <path d="M4 122 C6 100, 22 92, 36 89 L60 89 C74 92, 90 100, 92 122Z" fill={darkClothes ? INK : `url(#hd${uid})`} />
            {darkClothes && (
              <>
                <path d="M39 89 L48 106 L57 89Z" fill={PAPER} />
                <path d="M46 95 L50 95 L52 116 L48 120 L44 116Z" fill={`url(#hd${uid})`} />
              </>
            )}
          </>
        )}
        {/* neck */}
        <rect x={cx - (f ? 5.5 : 7)} y={cy + ry - 8} width={f ? 11 : 14} height="18" fill={PAPER} />
        <rect x={cx - (f ? 5.5 : 7)} y={cy + ry - 8} width={f ? 11 : 14} height="18" fill={`url(#hd${uid})`} mask={`url(#sm${uid})`} />
        {/* ears */}
        {earsVisible && (
          <>
            <ellipse cx={cx - rx + 0.5} cy={cy + 1} rx="3" ry={f ? 4.4 : 5} fill={PAPER} stroke={INK} strokeWidth="1" />
            <ellipse cx={cx + rx - 0.5} cy={cy + 1} rx="3" ry={f ? 4.4 : 5} fill={`url(#hd${uid})`} />
            {f &&
              (hoops ? (
                <>
                  <circle cx={cx - rx + 0.5} cy={cy + 8} r="2.6" fill="none" stroke={INK} strokeWidth="1" />
                  <circle cx={cx + rx - 0.5} cy={cy + 8} r="2.6" fill="none" stroke={INK} strokeWidth="1" />
                </>
              ) : (
                <>
                  <circle cx={cx - rx + 0.5} cy={cy + 6.4} r="1.5" fill={INK} />
                  <circle cx={cx + rx - 0.5} cy={cy + 6.4} r="1.5" fill={INK} />
                </>
              ))}
          </>
        )}
        {/* face */}
        <path d={face} fill={PAPER} />
        <g clipPath={`url(#fc${uid})`}>
          <rect x={cx - rx} y={cy - ry} width={rx * 2} height={ry * 2} fill={`url(#hd${uid})`} mask={`url(#sm${uid})`} />
          <ellipse cx={cx + 4} cy={cy + ry + 2} rx={rx} ry="6" fill={`url(#hd${uid})`} />
          {stubble && <path d={`M${cx - jawW} ${cy + 6} Q${cx} ${cy + ry + 6} ${cx + jawW} ${cy + 6}L${cx + jawW} ${cy + ry + 4}L${cx - jawW} ${cy + ry + 4}Z`} fill={`url(#hf${uid})`} />}
        </g>
        <path d={face} fill="none" stroke={INK} strokeWidth="1.1" />
        {/* features */}
        {brow(cx - eyeDx, -1)}
        {brow(cx + eyeDx, 1)}
        {eye(cx - eyeDx, -1)}
        {eye(cx + eyeDx, 1)}
        {f ? (
          <path d={`M${cx + 0.8} ${eyeY + 4.5} L${cx + 2} ${eyeY + 9.4} L${cx - 0.6} ${eyeY + 9.9}`} fill="none" stroke={INK} strokeWidth="1" />
        ) : (
          <path d={`M${cx + 1} ${eyeY + 3} L${cx + 3} ${eyeY + 10} L${cx - 1} ${eyeY + 11}`} fill="none" stroke={INK} strokeWidth="1.2" />
        )}
        {f ? (
          <>
            <path d={`M${cx - mw * 0.85} ${my + 0.3} Q${cx} ${my + 3.6} ${cx + mw * 0.85} ${my + 0.3}Z`} fill={`url(#hd${uid})`} />
            <path d={`M${cx - mw} ${my} Q${cx - mw * 0.5} ${my - 1.5} ${cx} ${my - 0.5} Q${cx + mw * 0.5} ${my - 1.5} ${cx + mw} ${my}`} fill="none" stroke={INK} strokeWidth="1.2" strokeLinecap="round" />
            <path d={`M${cx - mw} ${my} Q${cx} ${my + 0.9} ${cx + mw} ${my}`} fill="none" stroke={INK} strokeWidth="0.9" />
          </>
        ) : (
          <path d={`M${cx - mw} ${my} Q${cx} ${my + mouthCurve} ${cx + mw} ${my}`} fill="none" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
        )}
        {talking && <ellipse className="talk" cx={cx} cy={my + (f ? 1 : 0.6)} rx={mw * 0.55} ry="1.9" fill={INK} />}
        {spec.glasses && (
          <g fill="none" stroke={INK} strokeWidth="1.5">
            <rect x={cx - eyeDx - 5} y={eyeY - 3.6} width="10" height="7.2" rx={f ? 3.2 : 2} />
            <rect x={cx + eyeDx - 5} y={eyeY - 3.6} width="10" height="7.2" rx={f ? 3.2 : 2} />
            <path d={`M${cx - eyeDx + 5} ${eyeY - 1} L${cx + eyeDx - 5} ${eyeY - 1}`} />
          </g>
        )}
        {spec.beard && !f && (
          <path
            d={`M${cx - jawW} ${cy + 3} Q${cx - jawW + 1} ${cy + ry + 3} ${cx} ${cy + ry + 3} Q${cx + jawW - 1} ${cy + ry + 3} ${cx + jawW} ${cy + 3} Q${cx + 8} ${cy + 8} ${cx + mw + 2} ${cy + 9} L${cx - mw - 2} ${cy + 9} Q${cx - 8} ${cy + 8} ${cx - jawW} ${cy + 3}Z`}
            fill={spec.gray ? `url(#hl${uid})` : `url(#hd${uid})`}
          />
        )}
        {hairFront}
      </g>
      <rect x="0.5" y="0.5" width="95" height="119" fill="none" stroke={INK} strokeWidth="1" />
    </svg>
  );
}
