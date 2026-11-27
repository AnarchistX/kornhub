// Black-and-white security camera stills, drawn in code.
import type { CamId } from '../engine/types';
export type { CamId };

export const CAMS: Record<CamId, { id: string; name: string }> = {
  gate: { id: 'GATE-CAM-1', name: 'Main gate' },
  corridor: { id: 'OPS-CAM-3', name: 'Operations corridor' },
  b3east: { id: 'B3-EAST-CAM-2', name: 'B3 east airlock' },
};

const G1 = '#0d0f0e';
const G2 = '#2a2e2c';
const G3 = '#59605b';
const G4 = '#a7aea6';

function Corridor() {
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="300" fill={G1} />
      <path d="M0 0 L160 110 L240 110 L400 0Z" fill={G2} />
      <path d="M0 300 L160 175 L240 175 L400 300Z" fill="#1c201e" />
      <rect x="160" y="110" width="80" height="65" fill={G3} />
      <rect x="185" y="122" width="30" height="53" fill={G1} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={120 + i * 22} y={38 + i * 22} width={160 - i * 44} height={6 - i * 1.5} fill={G4} opacity={0.9 - i * 0.2} />
      ))}
      <path d="M60 60 L60 250 L95 222 L95 82Z" fill={G2} stroke={G3} />
      <path d="M340 60 L340 250 L305 222 L305 82Z" fill={G2} stroke={G3} />
      <path d="M0 300 L160 175 M400 300 L240 175" stroke={G3} strokeWidth="1.5" />
    </svg>
  );
}

function Gate() {
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="300" fill={G1} />
      <rect y="190" width="400" height="110" fill="#181b1a" />
      <ellipse cx="300" cy="120" rx="90" ry="70" fill={G2} opacity="0.7" />
      <rect x="250" y="120" width="80" height="80" fill={G3} />
      <rect x="262" y="134" width="56" height="30" fill={G4} />
      <rect x="40" y="168" width="230" height="8" fill={G4} />
      <rect x="40" y="168" width="230" height="8" fill="url(#stripes)" />
      <defs>
        <pattern id="stripes" width="20" height="8" patternUnits="userSpaceOnUse">
          <rect width="10" height="8" fill={G1} />
        </pattern>
      </defs>
      <rect x="262" y="160" width="10" height="40" fill={G2} />
      {Array.from({ length: 16 }).map((_, i) => (
        <path key={i} d={`M${i * 26} 60 L${i * 26 + 13} 190`} stroke={G3} strokeWidth="1" opacity="0.6" />
      ))}
      <path d="M0 60 H400" stroke={G3} strokeWidth="2" />
    </svg>
  );
}

function Airlock({ figure }: { figure?: boolean }) {
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="300" fill={G1} />
      <rect x="110" y="40" width="180" height="230" fill={G2} stroke={G3} strokeWidth="3" />
      <rect x="130" y="60" width="140" height="200" fill={G3} />
      <circle cx="200" cy="120" r="26" fill={G1} stroke={G4} strokeWidth="3" />
      <rect x="300" y="140" width="16" height="26" fill={G4} />
      {Array.from({ length: 9 }).map((_, i) => (
        <path key={i} d={`M${110 + i * 22} 270 l22 -18 h-10 l-22 18z`} fill={G4} />
      ))}
      {figure && (
        <g>
          <defs>
            <pattern id="cc-hair" width="3" height="3" patternUnits="userSpaceOnUse">
              <rect width="3" height="3" fill="#cfd6cd" />
              <circle cx="1.5" cy="1.5" r="0.9" fill={G3} />
            </pattern>
          </defs>
          {/* a figure at the east reader, three-quarters from behind */}
          <path d="M262 142 C262 132 308 132 312 142 L322 262 L250 262 Z" fill="#b9c1b7" />
          <path d="M286 142 L290 262" stroke={G3} strokeWidth="2" opacity="0.6" />
          <path d="M306 150 C312 150 314 152 316 154" stroke="#b9c1b7" strokeWidth="9" strokeLinecap="round" />
          <rect x="312" y="146" width="9" height="12" fill={G4} stroke={G1} strokeWidth="1" />
          <rect x="276" y="128" width="20" height="16" fill="#8e968c" />
          <ellipse cx="286" cy="114" rx="15" ry="17" fill="#8e968c" />
          <path d="M271 112 C270 96 302 94 302 110 C298 104 280 104 271 112Z" fill="url(#cc-hair)" />
          <path d="M271 110 C268 120 270 126 274 128" stroke="url(#cc-hair)" strokeWidth="5" fill="none" />
          <path d="M296 116 L304 115" stroke="#f4f7f2" strokeWidth="2" />
          <rect x="244" y="88" width="88" height="182" fill="none" stroke="#e8efe6" strokeWidth="1.5" strokeDasharray="6 5" />
          <text x="246" y="84" fill="#e8efe6" fontFamily="VT323, monospace" fontSize="16">MOTION</text>
        </g>
      )}
    </svg>
  );
}

export function Cctv({ cam, date, time, unavailable, figure }: { cam: CamId; date: string; time: string; unavailable?: string; figure?: boolean }) {
  return (
    <figure className="cctv" style={{ margin: 0 }}>
      {unavailable ? (
        <>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'var(--grain)', backgroundSize: '120px', opacity: 0.55 }} />
          <div className="nosig">
            FEED UNAVAILABLE
            <small>{unavailable}</small>
          </div>
        </>
      ) : cam === 'gate' ? (
        <Gate />
      ) : cam === 'corridor' ? (
        <Corridor />
      ) : (
        <Airlock figure={figure} />
      )}
      <div className="osd top">
        <span>{CAMS[cam].id}</span>
        <span>
          {date} {time}
        </span>
      </div>
      <div className="osd bottom">{unavailable ? 'NO SIGNAL' : 'REC ●'}</div>
    </figure>
  );
}
