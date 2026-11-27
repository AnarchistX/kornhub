import { useEffect, useRef } from 'react';

/** Canvas rain streaks. density 0..1. Cheap enough for phones. */
export function Rain({ density }: { density: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || density <= 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;
    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);
    const count = Math.round((w * h) / 9000 * density) + 20;
    const drops = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      l: 10 + Math.random() * 26,
      v: 9 + Math.random() * 10,
      a: 0.08 + Math.random() * 0.22,
    }));
    let raf = 0;
    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1.2;
      ctx.lineCap = 'round';
      for (const d of drops) {
        ctx.strokeStyle = `rgba(233,223,200,${d.a})`;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.l * 0.18, d.y + d.l);
        ctx.stroke();
        d.y += d.v;
        d.x -= d.v * 0.18;
        if (d.y > h) {
          d.y = -d.l;
          d.x = Math.random() * (w + 60);
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [density]);
  if (density <= 0) return null;
  return <canvas ref={ref} className="rain" aria-hidden="true" />;
}
