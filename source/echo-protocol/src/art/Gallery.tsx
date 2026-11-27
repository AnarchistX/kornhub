// Dev-only portrait sheet: open the game with ?gallery to review every face at once.
import { Portrait } from './Portrait';
import { PEOPLE } from '../content/world';

export function Gallery() {
  const variants = [0, 1, 2, 3, 4].flatMap((hair) => [
    { key: `f${hair}`, label: `F hair ${hair}`, spec: { seed: 100 + hair, sex: 'f' as const, hair } },
    { key: `m${hair}`, label: `M hair ${hair}`, spec: { seed: 200 + hair, sex: 'm' as const, hair } },
  ]);
  const cell = (key: string, label: string, node: React.ReactNode) => (
    <figure key={key} style={{ margin: 0, width: 120 }}>
      <div style={{ width: 120, height: 150, border: '1px solid #000' }}>{node}</div>
      <figcaption style={{ font: '11px monospace', color: '#e9dfc8', marginTop: 4 }}>{label}</figcaption>
    </figure>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'auto', padding: 16, background: '#1d272f' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
        {Object.values(PEOPLE).map((p) => cell(p.id, `${p.last} (${p.photo.sex})`, <Portrait spec={p.photo} />))}
        {variants.map((v) => cell(v.key, v.label, <Portrait spec={v.spec} />))}
      </div>
    </div>
  );
}
