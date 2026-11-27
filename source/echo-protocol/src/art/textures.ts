// Generates film grain and paper fibre textures once at startup (no image downloads).
function noise(size: number, pixel: (v: number) => [number, number, number, number]) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  if (!ctx) return '';
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const [r, g, b, a] = pixel(Math.random());
    img.data[i] = r;
    img.data[i + 1] = g;
    img.data[i + 2] = b;
    img.data[i + 3] = a;
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL('image/png');
}

export function installTextures() {
  const root = document.documentElement.style;
  const grain = noise(180, (v) => {
    const g = Math.floor(v * 255);
    return [g, g, g, 255];
  });
  const paper = noise(160, (v) => {
    const dark = v > 0.5;
    return dark ? [120, 100, 60, Math.floor((v - 0.5) * 34)] : [255, 250, 235, Math.floor(v * 20)];
  });
  if (grain) root.setProperty('--grain', `url(${grain})`);
  if (paper) root.setProperty('--paper-tex', `url(${paper})`);
}
