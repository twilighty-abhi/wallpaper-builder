import { seededRandom, dimensionError, legendLayout, textFontFamily, ensureTextFont, type WallpaperRecipe } from './model';
const textureCache = new Map<number, { dots: number[][]; cuts: number[][] }>();
function texture(seed: number) {
  if (textureCache.has(seed)) return textureCache.get(seed)!;
  const random = seededRandom(seed);
  const data = { dots: Array.from({ length: 28000 }, () => [random(), random(), random()]), cuts: Array.from({ length: 220 }, () => [random(), random(), random(), random(), random()]) };
  if (textureCache.size >= 12) textureCache.delete(textureCache.keys().next().value!);
  textureCache.set(seed, data); return data;
}
export function renderMat(canvas: HTMLCanvasElement, r: WallpaperRecipe, width: number, height: number) {
  canvas.width = width; canvas.height = height;
  const c = canvas.getContext('2d'); if (!c) throw new Error('Canvas drawing is unavailable in this browser.');
  const w = Math.max(1200, 360 * r.width / r.height), h = w * r.height / r.width, s = r.grid.spacing, margin = 42;
  c.scale(width / w, height / h); c.fillStyle = r.palette.background; c.fillRect(0, 0, w, h);
  const line = (x: number, y: number, xx: number, yy: number) => { c.beginPath(); c.moveTo(x, y); c.lineTo(xx, yy); c.stroke(); };
  c.save(); c.beginPath(); c.rect(margin, margin, w - margin * 2, h - margin * 2); c.clip(); c.strokeStyle = r.palette.grid;
  const ox = margin + r.grid.offsetX / 100 * s, oy = margin + r.grid.offsetY / 100 * s;
  for (let i = -1, x = ox - s; x <= w; i++, x += s) {
    const major = i % r.grid.majorEvery === 0; c.globalAlpha = major ? r.grid.majorOpacity : r.grid.minorOpacity; c.lineWidth = major ? r.grid.majorWidth : r.grid.minorWidth; c.setLineDash(r.grid.dotted ? [.7, 4] : []); line(x, margin, x, h - margin);
  }
  for (let i = -1, y = oy - s; y <= h; i++, y += s) {
    const major = i % r.grid.majorEvery === 0; c.globalAlpha = major ? r.grid.majorOpacity : r.grid.minorOpacity; c.lineWidth = major ? r.grid.majorWidth : r.grid.minorWidth; c.setLineDash(r.grid.dotted ? [.7, 4] : []); line(margin, y, w - margin, y);
  }
  c.setLineDash([]); c.globalAlpha = .5; c.lineWidth = .8; c.strokeStyle = r.palette.accent; c.fillStyle = r.palette.label; c.font = '11px monospace';
  [30, 45, 60].forEach(angle => {
    if (!r.guides[`angle${angle}` as 'angle30']) return;
    const length = Math.min(w - 2 * margin, (h - 2 * margin) / Math.tan(angle * Math.PI / 180));
    line(margin, h - margin, margin + length, h - margin - Math.tan(angle * Math.PI / 180) * length);
    c.save(); c.translate(margin + 50, h - margin - 50 * Math.tan(angle * Math.PI / 180)); c.rotate(-angle * Math.PI / 180); c.fillText(`${angle}°`, 0, -7); c.restore();
    if (angle === 45) { const diagonal = Math.min(w - 2 * margin, h - 2 * margin); line(w - margin, margin, w - margin - diagonal, margin + diagonal); }
  });
  if (r.guides.circles) {
    const cx = w * .73, cy = h * .51;
    for (const radius of [36, 60, 96, 144, 204]) { c.beginPath(); c.arc(cx, cy, radius, 0, Math.PI * 2); c.stroke(); c.fillText(`Ø ${radius * 2}`, cx + 7, cy - radius + 15); }
    line(cx - 230, cy, cx + 230, cy); line(cx, cy - 230, cx, cy + 230);
  }
  c.restore(); c.globalAlpha = .7; c.strokeStyle = r.palette.label; c.fillStyle = r.palette.label; c.lineWidth = .7; c.font = '9px monospace'; c.textAlign = 'center';
  if (r.guides.border) c.strokeRect(margin, margin, w - margin * 2, h - margin * 2);
  for (let n = 0, x = margin; x <= w - margin; n++, x += s / 2) {
    const major = n % 2 === 0, len = major ? 8 : 4;
    if (r.guides.top) { line(x, margin - len, x, margin); if (major) c.fillText(String(n / 2).padStart(2, '0'), x, margin - 15); }
    if (r.guides.bottom) { line(x, h - margin, x, h - margin + len); if (major) c.fillText(String(n / 2).padStart(2, '0'), x, h - margin + 22); }
  }
  for (let n = 0, y = margin; y <= h - margin; n++, y += s / 2) {
    const major = n % 2 === 0, len = major ? 8 : 4;
    if (r.guides.left) { line(margin - len, y, margin, y); if (major) c.fillText(String(n / 2).padStart(2, '0'), margin - 23, y + 3); }
    if (r.guides.right) { line(w - margin, y, w - margin + len, y); if (major) c.fillText(String(n / 2).padStart(2, '0'), w - margin + 22, y + 3); }
  }
  const q = r.quiet;
  if (q.enabled) {
    const cx = q.x / 100 * w, cy = q.y / 100 * h, rx = q.width / 200 * w, ry = q.height / 200 * h;
    c.save(); c.translate(cx, cy); c.scale(rx, ry); const fade = c.createRadialGradient(0, 0, 0, 0, 0, 1); fade.addColorStop(0, r.palette.background); fade.addColorStop(.55, r.palette.background); fade.addColorStop(1, `${r.palette.background}00`); c.fillStyle = fade; c.globalAlpha = q.strength; c.fillRect(-1, -1, 2, 2); c.restore();
  }
  const t = texture(r.material.seed);
  c.fillStyle = '#fff'; c.globalAlpha = r.material.grain * .23;
  for (const [x, y, a] of t.dots) c.fillRect(x * w, y * h, .35 + a * .45, .35 + a * .45);
  c.strokeStyle = r.palette.label; c.lineWidth = .4;
  for (const [x, y, angle, length, opacity] of t.cuts.slice(0, Math.round(r.material.wear * t.cuts.length))) { c.globalAlpha = (.02 + opacity * .11) * r.material.wear; const len = 20 + length * 190; line(x * w, y * h, x * w + Math.cos(angle * Math.PI * 2) * len, y * h + Math.sin(angle * Math.PI * 2) * len); }
  if (r.typography.opacity > 0 && (r.typography.title || r.typography.subtitle)) {
    const box = legendLayout(r), x = box.left + box.width - 14, y = box.top + r.typography.size + 11;
    c.textAlign = 'right'; c.font = `500 ${r.typography.size}px ${textFontFamily(r.typography.font)}`;
    c.globalAlpha = .97; c.fillStyle = r.palette.background; c.fillRect(box.left, box.top, box.width, box.height);
    c.globalAlpha = r.typography.opacity; c.fillStyle = r.palette.label; c.fillText(r.typography.title, x, y, box.width - 26); c.font = `${r.typography.size * .55}px ${textFontFamily(r.typography.font)}`; c.fillText(r.typography.subtitle, x, y + 20, box.width - 26);
  }
  c.globalAlpha = 1;
}
export async function exportPng(r: WallpaperRecipe, factory: () => HTMLCanvasElement = () => document.createElement('canvas')): Promise<Blob> {
  const error = dimensionError(r.width, r.height); if (error) throw new Error(error);
  if (r.typography.opacity > 0 && (r.typography.title || r.typography.subtitle)) await ensureTextFont(r.typography.font, r.typography.title + r.typography.subtitle);
  const canvas = factory();
  try { renderMat(canvas, r, r.width, r.height); return await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Your browser could not create this PNG. Try a smaller size.')), 'image/png')); }
  finally { canvas.width = 1; canvas.height = 1; }
}
