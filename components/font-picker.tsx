'use client';
import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { textFonts, googleFonts, textFontFamily, ensureTextFont, isTextFont, type TextFont } from '@/lib/mat/model';

export function FontPicker({ value, text, onChange }: { value: TextFont; text: string; onChange: (font: TextFont) => void }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [load, setLoad] = useState({ key: '', state: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const key = `${value}\n${text}`;
  const state = load.key === key ? load.state : 'loading';
  const categories = [...new Set(googleFonts.map(font => font.category))].sort();
  const filtered = googleFonts.filter(font => (category === 'All' || font.category === category) && `${font.family} ${font.category}`.toLowerCase().includes(query.trim().toLowerCase()));
  const selectedGoogle = value.startsWith('google:') ? value.slice(7) : null;
  useEffect(() => {
    let active = true;
    ensureTextFont(value, text).then(() => { if (active) setLoad({ key, state: 'ready' }); }).catch(() => { if (active) setLoad({ key, state: 'error' }); });
    return () => { active = false; };
  }, [value, text, key, attempt]);
  return <div className="font-picker">
    <label className="text-field" htmlFor="font-search">Search fonts<Input id="font-search" type="search" placeholder="Try Inter, handwriting, or Noto…" value={query} onChange={e => setQuery(e.target.value)} /></label>
    <label className="text-field" htmlFor="font-category">Style<span className="select-wrap font-select"><select id="font-category" value={category} onChange={e => setCategory(e.target.value)}><option>All</option>{categories.map(name => <option key={name}>{name}</option>)}</select><ChevronDown size={13} /></span></label>
    <label className="text-field" htmlFor="legend-font">Font<span className="select-wrap font-select"><select id="legend-font" value={value} aria-describedby="font-status" onChange={e => { if (isTextFont(e.target.value)) onChange(e.target.value); }}>
      <optgroup label="Built-in · available offline">{textFonts.map(font => <option key={font.id} value={font.id}>{font.name}</option>)}</optgroup>
      {selectedGoogle && !filtered.some(font => font.family === selectedGoogle) && <optgroup label="Current selection"><option value={value}>{selectedGoogle}</option></optgroup>}
      {!!filtered.length && <optgroup label={`Google Fonts · ${filtered.length} families`}>{filtered.map(font => <option key={font.family} value={`google:${font.family}`}>{font.family}</option>)}</optgroup>}
    </select><ChevronDown size={13} /></span></label>
    <output className="font-status" id="font-status" aria-live="polite">{selectedGoogle && state === 'loading' ? 'Loading selected font…' : selectedGoogle && state === 'error' ? 'Font could not load. Check your connection or choose a built-in font.' : `${filtered.length.toLocaleString()} of ${googleFonts.length.toLocaleString()} Google font families${filtered.length ? '' : ' — try another search or style'}.`}</output>
    {selectedGoogle && state === 'error' && <Button variant="outline" onClick={() => { setLoad({ key, state: 'loading' }); setAttempt(n => n + 1); }}>Retry font</Button>}
    <p className="font-sample" style={{ fontFamily: textFontFamily(value) }}>{text || 'Make it your own. Aa 0123'}</p>
    <p className="field-hint">Google Fonts load on demand and need an internet connection. Your selection is saved with your design.</p>
  </div>;
}
