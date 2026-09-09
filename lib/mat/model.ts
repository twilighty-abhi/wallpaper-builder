export type Palette = { name: string; background: string; grid: string; label: string; accent: string };
export const palettes: Palette[] = [
  { name: 'Forest', background: '#174c3c', grid: '#a4c9a0', label: '#e2dfb4', accent: '#cdd9a0' },
  { name: 'Workshop', background: '#24634c', grid: '#bee2b7', label: '#eee8c7', accent: '#e0d49c' },
  { name: 'Fresh mat', background: '#348256', grid: '#d0eacc', label: '#fff4d8', accent: '#e4ea9b' },
  { name: 'Vintage olive', background: '#505c35', grid: '#bfc394', label: '#ede2b2', accent: '#e3c36f' },
  { name: 'Blueprint', background: '#173858', grid: '#85b5d3', label: '#d1e6f2', accent: '#9cdbf3' },
  { name: 'Graphite', background: '#262b2b', grid: '#7b8885', label: '#d8ded4', accent: '#bcc9ac' },
  { name: 'Oxide', background: '#633e45', grid: '#c4969c', label: '#f0d7cb', accent: '#eebdac' },
  { name: 'Drafting paper', background: '#e6e1cc', grid: '#7c9294', label: '#3c5355', accent: '#576f8b' },
];
export type WallpaperRecipe = {
  version: 1; name: string; width: number; height: number; palette: Palette;
  grid: { spacing: number; majorEvery: number; minorWidth: number; majorWidth: number; minorOpacity: number; majorOpacity: number; dotted: boolean; offsetX: number; offsetY: number };
  guides: { top: boolean; right: boolean; bottom: boolean; left: boolean; angle30: boolean; angle45: boolean; angle60: boolean; circles: boolean; border: boolean };
  typography: { title: string; subtitle: string; size: number; opacity: number };
  material: { seed: number; grain: number; wear: number };
  quiet: { enabled: boolean; x: number; y: number; width: number; height: number; strength: number };
};
export const original: WallpaperRecipe = {
  version: 1, name: 'Original', width: 3840, height: 2160, palette: palettes[0],
  grid: { spacing: 24, majorEvery: 5, minorWidth: .55, majorWidth: 1, minorOpacity: .3, majorOpacity: .58, dotted: false, offsetX: 0, offsetY: 0 },
  guides: { top: true, right: false, bottom: false, left: true, angle30: false, angle45: true, angle60: false, circles: false, border: true },
  typography: { title: 'CUTTING MAT', subtitle: 'PRECISION SURFACE  /  SERIES 01', size: 16, opacity: .85 },
  material: { seed: 4721, grain: .16, wear: .03 },
  quiet: { enabled: false, x: 50, y: 30, width: 45, height: 25, strength: .85 },
};
export const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
export const presetNames = ['Original', 'Angle Study', 'Night Shift', 'Toolmaker', 'Pocket Mat', 'Well Used'];
export function preset(index: number): WallpaperRecipe {
  const r = clone(original); r.name = presetNames[index] ?? 'Original';
  if (index === 1) { r.guides.angle30 = true; r.guides.angle60 = true; r.guides.circles = true; r.grid.spacing = 32; r.grid.minorOpacity = .17; }
  if (index === 2) { r.palette = { ...palettes[0], name: 'Night forest', background: '#10251f', grid: '#748f7a', label: '#9ba68b', accent: '#a7b696' }; r.guides.angle45 = false; r.grid.minorOpacity = .18; }
  if (index === 3) { r.guides = { ...r.guides, right: true, bottom: true, circles: true, angle30: true, angle60: true }; r.typography.subtitle = 'TOOLMAKER EDITION  /  SERIES 04'; }
  if (index === 4) { r.width = 1440; r.height = 3120; r.quiet = { enabled: true, x: 50, y: 22, width: 82, height: 26, strength: .95 }; r.guides.angle45 = false; r.grid.spacing = 36; }
  if (index === 5) { r.palette = palettes[3]; r.material.wear = .8; r.material.grain = .4; r.typography.subtitle = 'WORKSHOP ARCHIVE  /  SERIES 06'; }
  return r;
}
export type LockCategory = 'palette' | 'grid' | 'guides' | 'material';
export type Locks = Record<LockCategory, boolean>;
export function seededRandom(seed: number) { let a = seed | 0; return () => { a |= 0; a = a + 0x6d2b79f5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function randomize(r: WallpaperRecipe, locks: Locks, seed: number): WallpaperRecipe {
  const next = clone(r), rand = seededRandom(seed); next.name = 'Custom';
  if (!locks.palette) next.palette = clone(palettes[Math.floor(rand() * palettes.length)]);
  if (!locks.grid) next.grid = { ...r.grid, spacing: [18, 24, 30, 36, 48][Math.floor(rand() * 5)], majorEvery: rand() > .5 ? 5 : 4, minorOpacity: .15 + rand() * .2, majorOpacity: .4 + rand() * .3, dotted: rand() > .8 };
  if (!locks.guides) next.guides = { ...r.guides, angle30: rand() > .7, angle45: rand() > .45, angle60: rand() > .7, circles: rand() > .6, border: true };
  if (!locks.material) next.material = { seed, grain: .1 + rand() * .25, wear: rand() * .4 };
  return next;
}
export type History = { past: WallpaperRecipe[]; present: WallpaperRecipe; future: WallpaperRecipe[] };
export type Action = { type: 'set' | 'restore'; recipe: WallpaperRecipe } | { type: 'undo' | 'redo' };
export function reducer(state: History, action: Action): History {
  if (action.type === 'restore') return { past: [], present: action.recipe, future: [] };
  if (action.type === 'set') { if (JSON.stringify(state.present) === JSON.stringify(action.recipe)) return state; return { past: [...state.past.slice(-79), state.present], present: action.recipe, future: [] }; }
  if (action.type === 'undo' && state.past.length) return { past: state.past.slice(0, -1), present: state.past.at(-1)!, future: [state.present, ...state.future] };
  if (action.type === 'redo' && state.future.length) return { past: [...state.past, state.present], present: state.future[0], future: state.future.slice(1) };
  return state;
}
export function dimensionError(width: number, height: number): string | null {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 64 || height < 64) return 'Use whole pixel dimensions of at least 64 × 64.';
  if (width > 8192 || height > 8192) return 'Each side must be 8192 pixels or smaller.';
  if (width * height > 34_000_000) return 'Keep the total image size below 34 megapixels.';
  return null;
}
const ranges: Record<string, [number, number]> = { spacing: [12, 80], majorEvery: [2, 10], minorWidth: [.2, 2], majorWidth: [.3, 3], minorOpacity: [0, 1], majorOpacity: [0, 1], offsetX: [0, 100], offsetY: [0, 100], size: [8, 30], opacity: [0, 1], seed: [0, 2147483647], grain: [0, 1], wear: [0, 1], x: [0, 100], y: [0, 100], width: [5, 100], height: [5, 100], strength: [0, 1] };
export function parseRecipe(value: unknown): WallpaperRecipe | null {
  if (!value || typeof value !== 'object') return null;
  const r = value as WallpaperRecipe;
  if (r.version !== 1 || typeof r.name !== 'string' || r.name.length > 100 || dimensionError(r.width, r.height)) return null;
  for (const section of ['palette', 'grid', 'guides', 'typography', 'material', 'quiet'] as const) {
    if (!r[section] || typeof r[section] !== 'object') return null;
    for (const [key, defaultValue] of Object.entries(original[section])) {
      const v = (r[section] as Record<string, unknown>)[key];
      if (typeof v !== typeof defaultValue) return null;
      if (typeof v === 'number' && (!Number.isFinite(v) || (ranges[key] && (v < ranges[key][0] || v > ranges[key][1])))) return null;
      if (typeof v === 'string' && v.length > 120) return null;
      if (section === 'palette' && key !== 'name' && !/^#[0-9a-f]{6}$/i.test(v as string)) return null;
    }
  }
  if (!Number.isInteger(r.grid.majorEvery) || !Number.isInteger(r.material.seed)) return null;
  return clone(r);
}
export type SavedDesign = { id: string; name: string; recipe: WallpaperRecipe };
export function readStorage(storage: Pick<Storage, 'getItem'>): { recipe: WallpaperRecipe | null; saved: SavedDesign[]; error: boolean } {
  try {
    const latest = storage.getItem('cutting-mat:latest'), saved = storage.getItem('cutting-mat:saved');
    const rows: unknown = saved ? JSON.parse(saved) : [];
    return { recipe: latest ? parseRecipe(JSON.parse(latest)) : null, saved: Array.isArray(rows) ? rows.filter((s): s is SavedDesign => !!s && typeof s.id === 'string' && typeof s.name === 'string' && s.name.length <= 100 && !!parseRecipe(s.recipe)).slice(0, 30) : [], error: false };
  } catch { return { recipe: null, saved: [], error: true }; }
}
export function writeStorage(storage: Pick<Storage, 'setItem'>, key: string, value: unknown): boolean { try { storage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } }
