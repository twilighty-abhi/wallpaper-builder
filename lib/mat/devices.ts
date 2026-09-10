/** Native display pixels, verified against manufacturer specifications in September 2026.
 * Source links are kept with each device; phones and tablets default to portrait.
 * IDs distinguish models with identical panels. Recipes continue to store dimensions only.
 */
export type DeviceSize = { id: string; name: string; group: string; width: number; height: number; source?: string };
const apple = 'https://www.apple.com';
const pixel = 'https://support.google.com/pixelphone/answer/7158570?hl=en';
const galaxy = 'https://www.samsung.com/uk/mobile-phone-buying-guide/introducing-samsung-galaxy-s26/';
const rows: [string, string, string, number, number, string?][] = [
  ['4k', 'Desktop · 4K UHD', 'Common sizes', 3840, 2160],
  ['1080p', 'Desktop · Full HD', 'Common sizes', 1920, 1080],
  ['1440p', 'Desktop · QHD', 'Common sizes', 2560, 1440],
  ['portrait', 'Phone · QHD portrait', 'Common sizes', 1440, 3120],
  ['ultrawide', 'Ultrawide · QHD', 'Common sizes', 3440, 1440],
  ['super-ultrawide', 'Super ultrawide · Dual QHD', 'Common sizes', 5120, 1440],
  ['5k', 'Desktop · 5K', 'Common sizes', 5120, 2880],
  ['8k', 'Desktop · 8K UHD', 'Common sizes', 7680, 4320],
  ['iphone-17', 'iPhone 17', 'Apple iPhone', 1206, 2622, `${apple}/iphone-17/specs/`],
  ['iphone-17-pro', 'iPhone 17 Pro', 'Apple iPhone', 1206, 2622, `${apple}/iphone-17-pro/specs/`],
  ['iphone-17-pro-max', 'iPhone 17 Pro Max', 'Apple iPhone', 1320, 2868, `${apple}/iphone-17-pro/specs/`],
  ['iphone-air', 'iPhone Air', 'Apple iPhone', 1260, 2736, `${apple}/iphone-air/specs/`],
  ['iphone-16', 'iPhone 16', 'Apple iPhone', 1179, 2556, `${apple}/cz/iphone-16/specs/`],
  ['iphone-16-plus', 'iPhone 16 Plus', 'Apple iPhone', 1290, 2796, `${apple}/cz/iphone-16/specs/`],
  ['iphone-16-pro', 'iPhone 16 Pro', 'Apple iPhone', 1206, 2622, 'https://developer.apple.com/design/human-interface-guidelines/layout'],
  ['iphone-16-pro-max', 'iPhone 16 Pro Max', 'Apple iPhone', 1320, 2868, 'https://developer.apple.com/design/human-interface-guidelines/layout'],
  ['iphone-15', 'iPhone 15', 'Apple iPhone', 1179, 2556, 'https://support.apple.com/en-us/111831'],
  ['iphone-15-pro-max', 'iPhone 15 Pro Max', 'Apple iPhone', 1290, 2796, 'https://developer.apple.com/design/human-interface-guidelines/layout'],
  ['iphone-14-pro', 'iPhone 14 Pro', 'Apple iPhone', 1179, 2556, 'https://support.apple.com/en-us/111849'],
  ['iphone-14-plus', 'iPhone 14 Plus', 'Apple iPhone', 1284, 2778, 'https://support.apple.com/en-us/111854'],
  ['iphone-13-mini', 'iPhone 13 mini', 'Apple iPhone', 1080, 2340, 'https://support.apple.com/en-us/111873'],
  ['iphone-se-3', 'iPhone SE · 3rd generation', 'Apple iPhone', 750, 1334, 'https://support.apple.com/en-us/111866'],
  ['s26', 'Galaxy S26', 'Samsung Galaxy', 1080, 2340, galaxy],
  ['s26-plus', 'Galaxy S26+', 'Samsung Galaxy', 1440, 3120, galaxy],
  ['s26-ultra', 'Galaxy S26 Ultra', 'Samsung Galaxy', 1440, 3120, galaxy],
  ['s25', 'Galaxy S25', 'Samsung Galaxy', 1080, 2340, galaxy],
  ['s25-plus', 'Galaxy S25+', 'Samsung Galaxy', 1440, 3120, galaxy],
  ['s25-ultra', 'Galaxy S25 Ultra', 'Samsung Galaxy', 1440, 3120, galaxy],
  ['a56', 'Galaxy A56 5G', 'Samsung Galaxy', 1080, 2340, 'https://www.samsung.com/ie/smartphones/galaxy-a/galaxy-a56-5g-awesome-graphite-256gb-sm-a566bzkceub/'],
  ['pixel-10', 'Pixel 10', 'Google Pixel', 1080, 2424, pixel],
  ['pixel-10-pro', 'Pixel 10 Pro', 'Google Pixel', 1280, 2856, pixel],
  ['pixel-10-pro-xl', 'Pixel 10 Pro XL', 'Google Pixel', 1344, 2992, pixel],
  ['pixel-10a', 'Pixel 10a', 'Google Pixel', 1080, 2424, pixel],
  ['pixel-9', 'Pixel 9', 'Google Pixel', 1080, 2424, pixel],
  ['pixel-9-pro', 'Pixel 9 Pro', 'Google Pixel', 1280, 2856, pixel],
  ['pixel-9-pro-xl', 'Pixel 9 Pro XL', 'Google Pixel', 1344, 2992, pixel],
  ['pixel-9a', 'Pixel 9a', 'Google Pixel', 1080, 2424, pixel],
  ['pixel-8', 'Pixel 8', 'Google Pixel', 1080, 2400, pixel],
  ['pixel-8-pro', 'Pixel 8 Pro', 'Google Pixel', 1344, 2992, pixel],
  ['pixel-8a', 'Pixel 8a', 'Google Pixel', 1080, 2400, pixel],
  ['oneplus-13', 'OnePlus 13', 'Other Android phones', 1440, 3168, 'https://www.oneplus.com/au/13/specs'],
  ['xiaomi-15', 'Xiaomi 15', 'Other Android phones', 1200, 2670, 'https://www.mi.com/om/product/xiaomi-15/specs/'],
  ['air-13', 'MacBook Air · 13.6-inch', 'MacBook', 2560, 1664, `${apple}/macbook-air/specs/`],
  ['air-15', 'MacBook Air · 15.3-inch', 'MacBook', 2880, 1864, `${apple}/macbook-air/specs/`],
  ['air-m1', 'MacBook Air M1 · 13.3-inch', 'MacBook', 2560, 1600, 'https://support.apple.com/en-us/111883'],
  ['pro-14', 'MacBook Pro · 14.2-inch', 'MacBook', 3024, 1964, `${apple}/macbook-pro/specs/`],
  ['pro-16', 'MacBook Pro · 16.2-inch', 'MacBook', 3456, 2234, `${apple}/macbook-pro/specs/`],
  ['pro-13-m2', 'MacBook Pro M2 · 13.3-inch', 'MacBook', 2560, 1600, 'https://support.apple.com/en-us/111869'],
  ['studio-display', 'Apple Studio Display · 27-inch', 'Apple desktop displays', 5120, 2880, `${apple}/studio-display/specs/`],
  ['imac-24', 'iMac · 24-inch Retina 4.5K', 'Apple desktop displays', 4480, 2520, `${apple}/ca/imac/specs/`],
  ['ipad-pro-11', 'iPad Pro · 11-inch OLED', 'iPad', 1668, 2420, `${apple}/ipad-pro/specs/`],
  ['ipad-pro-13', 'iPad Pro · 13-inch OLED', 'iPad', 2064, 2752, `${apple}/ipad-pro/specs/`],
  ['ipad-air-11', 'iPad Air · 11-inch', 'iPad', 1640, 2360, `${apple}/ipad-air/specs/`],
  ['ipad-air-13', 'iPad Air · 13-inch', 'iPad', 2048, 2732, `${apple}/ipad-air/specs/`],
  ['ipad-mini', 'iPad mini · A17 Pro / 6th gen', 'iPad', 1488, 2266, `${apple}/ipad-mini/specs/`],
];
export const deviceSizes: DeviceSize[] = rows.map(([id, name, group, width, height, source]) => ({ id, name, group, width, height, source }));
export const deviceGroups = [...new Set(deviceSizes.map(s => s.group))];
const normalize = (text: string) => text.toLowerCase().replace(/\+/g, ' plus ').replace(/[×x](?=\s*\d)/g, ' ').replace(/[^a-z0-9.]+/g, ' ').trim();
export function searchDevices(query: string): DeviceSize[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  return deviceSizes.filter(s => { const haystack = normalize(`${s.name} ${s.group} ${s.width} ${s.height}`); return terms.every(term => haystack.includes(term)); });
}
export function resolveDevice(id: string, width: number, height: number): DeviceSize | undefined {
  return deviceSizes.find(s => s.id === id && s.width === width && s.height === height);
}
