// Snapshot Google's public catalog so browsing fonts needs no API key or live catalog request.
import { writeFile } from 'node:fs/promises';
const response = await fetch('https://fonts.google.com/metadata/fonts');
if (!response.ok) throw new Error(`Google Fonts catalog returned ${response.status}`);
const text = await response.text();
const data = JSON.parse(text.slice(text.indexOf('{')));
const families = data.familyMetadataList.map(font => {
  let weights = Object.keys(font.fonts).filter(weight => /^\d+$/.test(weight)).map(Number);
  const italic = !weights.length;
  if (italic) weights = Object.keys(font.fonts).map(weight => Number(weight.replace('i', '')));
  if (!weights.length || weights.some(weight => !Number.isFinite(weight))) throw new Error(`No font style for ${font.family}`);
  return { family: font.family, category: font.category, italic, weight: weights.sort((a, b) => Math.abs(a - 400) - Math.abs(b - 400))[0] };
}).sort((a, b) => a.family.localeCompare(b.family, 'en'));
if (families.length < 1000) throw new Error('Google Fonts catalog appears incomplete');
await writeFile(new URL('../lib/mat/google-fonts.json', import.meta.url), JSON.stringify({ source: 'https://fonts.google.com/metadata/fonts', updated: new Date().toISOString().slice(0, 10), families }, null, 2) + '\n');
console.log(`Saved ${families.length} Google Fonts families`);
