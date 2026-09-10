'use client';
import { useState } from 'react';
import { Search, ChevronDown, Monitor, Smartphone, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { deviceSizes, deviceGroups, searchDevices, resolveDevice } from '@/lib/mat/devices';

type Props = { width: number; height: number; custom: boolean; onSelect: (width: number, height: number) => void; onCustom: () => void };
export function DevicePicker({ width, height, custom, onSelect, onCustom }: Props) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('4k');
  const selected = resolveDevice(selectedId, width, height);
  const filtered = searchDevices(query);
  const value = custom ? 'custom' : selected?.id ?? 'current';
  return <div className="device-picker">
    <div className="device-search"><Search size={13} aria-hidden="true" /><Input type="search" aria-label="Search device resolutions" placeholder="Search iPhone, MacBook, 2560…" value={query} onChange={e => setQuery(e.target.value)} />{query && <Button variant="ghost" size="icon-xs" aria-label="Clear device search" onClick={() => setQuery('')}><X /></Button>}</div>
    <div className="select-wrap">{height > width ? <Smartphone size={15} /> : <Monitor size={15} />}<select aria-label="Canvas size" aria-describedby="device-search-status" value={value} onChange={e => {
      if (e.target.value === 'custom') { onCustom(); return; }
      const device = deviceSizes.find(s => s.id === e.target.value); if (!device) return;
      setSelectedId(device.id); setQuery(''); onSelect(device.width, device.height);
    }}>
      {!custom && !selected && <option value="current">Current size · {width} × {height}</option>}
      {selected && !filtered.some(s => s.id === selected.id) && <optgroup label="Current selection"><option value={selected.id}>{selected.name} · {width} × {height}</option></optgroup>}
      {deviceGroups.map(group => { const devices = filtered.filter(s => s.group === group); return devices.length ? <optgroup label={group} key={group}>{devices.map(s => <option key={s.id} value={s.id}>{s.name} · {s.width} × {s.height}</option>)}</optgroup> : null; })}
      <option value="custom">Custom dimensions…</option>
    </select><ChevronDown size={13} /></div>
    <p className="device-status" id="device-search-status" aria-live="polite">{query ? filtered.length ? `${filtered.length} matching presets — choose below Search.` : 'No matching devices. Try another search or use Custom dimensions.' : `${deviceSizes.length} presets · native display pixels`}</p>
    {!custom && selected?.source && <a className="device-spec-link" href={selected.source} target="_blank" rel="noreferrer">Manufacturer display specifications ↗</a>}
    <p className="device-note">Phones and tablets start in portrait. Use Rotate for landscape.</p>
  </div>;
}
