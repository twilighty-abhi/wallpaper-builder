import googleCatalog from './google-fonts.json' with { type: 'json' };
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
export const textFonts = [
  { id: 'mono', name: 'Monospace', family: 'monospace' },
  { id: 'sans', name: 'Sans serif · Arial', family: 'Arial, Helvetica, sans-serif' },
  { id: 'serif', name: 'Serif · Georgia', family: 'Georgia, serif' },
  { id: 'classic', name: 'Classic · Times', family: '"Times New Roman", Times, serif' },
] as const;
export const googleFonts = googleCatalog.families;
const googleFontMap = new Map(googleFonts.map(font => [`google:${font.family}`, font]));
export type TextFont = typeof textFonts[number]['id'] | `google:${string}`;
export function isTextFont(font: unknown): font is TextFont { return typeof font === 'string' && (textFonts.some(option => option.id === font) || googleFontMap.has(font)); }
export function textFontFamily(font: TextFont) { const google = googleFontMap.get(font); return google ? `${JSON.stringify(google.family)}, sans-serif` : textFonts.find(option => option.id === font)?.family ?? 'monospace'; }
export function googleFontUrl(font: TextFont): string | null {
  const google = googleFontMap.get(font); if (!google) return null;
  const family = `${google.family}:${google.italic ? 'ital,wght@1,' : 'wght@'}${google.weight}`;
  return `https://fonts.googleapis.com/css2?${new URLSearchParams({ family, display: 'swap' })}`;
}
const fontStylesheets = new Map<string, Promise<void>>();
export async function ensureTextFont(font: TextFont, text: string): Promise<void> {
  const url = googleFontUrl(font); if (!url) return;
  if (typeof document === 'undefined' || !document.fonts) throw new Error('Google Fonts require a browser with web font support.');
  const message = 'Could not load the selected Google font. Check your connection and retry, or choose a built-in font.';
  let stylesheet = fontStylesheets.get(font);
  if (!stylesheet) {
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = url;
    stylesheet = new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => fail(), 15000);
      function fail() { clearTimeout(timer); link.remove(); fontStylesheets.delete(font); reject(new Error(message)); }
      link.onload = () => { clearTimeout(timer); resolve(); }; link.onerror = fail;
      document.head.appendChild(link);
    });
    fontStylesheets.set(font, stylesheet);
  }
  await stylesheet;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    // Loading with the actual words also fetches the required non-Latin subsets.
    await Promise.race([
      Promise.all([400, 500].map(async weight => {
        const faces = await document.fonts.load(`${weight} 16px ${JSON.stringify(googleFontMap.get(font)!.family)}`, text || 'Aa');
        if (!faces.length || faces.some(face => face.status !== 'loaded')) throw new Error(message);
      })),
      new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error(message)), 15000); }),
    ]);
  } catch { throw new Error(message); } finally { clearTimeout(timer); }
}
export type WallpaperRecipe = {
  version: 1; name: string; width: number; height: number; palette: Palette;
  grid: { spacing: number; majorEvery: number; minorWidth: number; majorWidth: number; minorOpacity: number; majorOpacity: number; dotted: boolean; offsetX: number; offsetY: number };
  guides: { top: boolean; right: boolean; bottom: boolean; left: boolean; angle30: boolean; angle45: boolean; angle60: boolean; circles: boolean; border: boolean };
  typography: { font: TextFont; title: string; subtitle: string; size: number; opacity: number; x: number; y: number };
  material: { seed: number; grain: number; wear: number };
  quiet: { enabled: boolean; x: number; y: number; width: number; height: number; strength: number };
};
export const original: WallpaperRecipe = {
  version: 1, name: 'Original', width: 3840, height: 2160, palette: palettes[0],
  grid: { spacing: 24, majorEvery: 5, minorWidth: .55, majorWidth: 1, minorOpacity: .3, majorOpacity: .58, dotted: false, offsetX: 0, offsetY: 0 },
  guides: { top: true, right: false, bottom: false, left: true, angle30: false, angle45: true, angle60: false, circles: false, border: true },
  typography: { font: 'mono', title: 'CUTTING MAT', subtitle: 'PRECISION SURFACE  /  SERIES 01', size: 16, opacity: .85, x: 100, y: 100 },
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
export type History = { past: WallpaperRecipe[]; present: WallpaperRecipe; future: WallpaperRecipe[]; pending?: WallpaperRecipe };
export type Action = { type: 'set' | 'restore'; recipe: WallpaperRecipe } | { type: 'undo' | 'redo' | 'begin' | 'commit' };
export function reducer(state: History, action: Action): History {
  if (action.type === 'begin') return state.pending ? state : { ...state, pending: state.present };
  if (action.type === 'commit') {
    if (!state.pending) return state;
    const { pending, ...rest } = state;
    return JSON.stringify(pending) === JSON.stringify(state.present) ? rest : { ...rest, past: [...state.past.slice(-79), pending], future: [] };
  }
  if (state.pending && (action.type === 'undo' || action.type === 'redo')) return reducer(reducer(state, { type: 'commit' }), action);
  if (action.type === 'restore') return { past: [], present: action.recipe, future: [] };
  if (action.type === 'set') { if (state.pending) return { ...state, present: action.recipe }; if (JSON.stringify(state.present) === JSON.stringify(action.recipe)) return state; return { past: [...state.past.slice(-79), state.present], present: action.recipe, future: [] }; }
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
  const input = value as WallpaperRecipe;
  // Older version-1 designs predate movable text.
  const r = { ...input, typography: input.typography && { ...input.typography, font: input.typography.font === undefined ? 'mono' : input.typography.font, x: input.typography.x === undefined ? 100 : input.typography.x, y: input.typography.y === undefined ? 100 : input.typography.y } };
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
  if (!isTextFont(r.typography.font)) return null;
  if (!Number.isInteger(r.grid.majorEvery) || !Number.isInteger(r.material.seed)) return null;
  const clean = clone(original);
  clean.name = r.name; clean.width = r.width; clean.height = r.height;
  for (const section of ['palette', 'grid', 'guides', 'typography', 'material', 'quiet'] as const) {
    for (const key of Object.keys(original[section])) (clean[section] as Record<string, unknown>)[key] = (r[section] as Record<string, unknown>)[key];
  }
  return clean;
}
export type SavedDesign = { id: string; name: string; recipe: WallpaperRecipe };
export function readStorage(storage: Pick<Storage, 'getItem'>): { recipe: WallpaperRecipe | null; saved: SavedDesign[]; error: boolean } {
  let error = false;
  function read(key: string): unknown { try { const raw = storage.getItem(key); return raw ? JSON.parse(raw) : null; } catch { error = true; return null; } }
  const latest = read('cutting-mat:latest'), rows = read('cutting-mat:saved');
  const recipe = parseRecipe(latest); if (latest && !recipe) error = true;
  const saved: SavedDesign[] = [];
  if (Array.isArray(rows)) for (const row of rows.slice(0, 30)) {
    const parsed = parseRecipe(row?.recipe);
    if (parsed && typeof row.id === 'string' && typeof row.name === 'string' && row.name.length <= 100) saved.push({ id: row.id, name: row.name, recipe: parsed });
    else error = true;
  }
  else if (rows !== null) error = true;
  return { recipe, saved, error };
}
export function applyPreset(index: number, current: WallpaperRecipe, keepCanvas = true): WallpaperRecipe {
  const next = preset(index); return keepCanvas ? { ...next, width: current.width, height: current.height } : next;
}
export function parseDesignFile(text: string): WallpaperRecipe {
  if (text.length > 65536) throw new Error('Choose a Cutting Mat design file smaller than 64 KB.');
  let data: unknown; try { data = JSON.parse(text); } catch { throw new Error('This is not a valid JSON design file.'); }
  const recipe = parseRecipe(data); if (!recipe) throw new Error('This file is not a supported Cutting Mat design.');
  return recipe;
}
export function serializeDesign(recipe: WallpaperRecipe): string { return JSON.stringify(recipe, null, 2); }
export function writeStorage(storage: Pick<Storage, 'setItem'>, key: string, value: unknown): boolean { try { storage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } }

// Position is a percentage of the available travel, keeping the whole plaque visible.
export function legendLayout(r: WallpaperRecipe) {
  const w = Math.max(1200, 360 * r.width / r.height), h = w * r.height / r.width;
  const width = Math.min(w - 84, Math.max(Array.from(r.typography.title).length * r.typography.size * .62, Array.from(r.typography.subtitle).length * r.typography.size * .55 * .62) + 50);
  const height = r.typography.size + 43;
  const travelX = Math.max(0, w - width), travelY = Math.max(0, h - height);
  const left = (r.typography.x ?? 100) / 100 * Math.max(0, travelX - 52);
  const top = (r.typography.y ?? 100) / 100 * Math.max(0, travelY - 58);
  return { w, h, width, height, left, top, travelX: Math.max(0, travelX - 52), travelY: Math.max(0, travelY - 58) };
}
