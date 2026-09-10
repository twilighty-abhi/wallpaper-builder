import test from 'node:test';
import assert from 'node:assert/strict';
import { deviceSizes, searchDevices, resolveDevice } from '../lib/mat/devices.ts';
import { dimensionError } from '../lib/mat/model.ts';

test('every device has a unique ID, exportable dimensions, and a manufacturer source', () => {
  assert.equal(new Set(deviceSizes.map(s=>s.id)).size, deviceSizes.length);
  assert.ok(deviceSizes.length >= 50);
  for(const s of deviceSizes) { assert.equal(dimensionError(s.width,s.height),null,s.name); if(s.group !== 'Common sizes') assert.match(s.source,/^https:\/\//); }
});
test('major phone and MacBook native sizes match the verified catalog', () => {
  for(const [id,w,h] of [['iphone-17-pro-max',1320,2868],['s26-ultra',1440,3120],['pixel-10-pro',1280,2856],['air-13',2560,1664],['air-15',2880,1864],['pro-14',3024,1964],['pro-16',3456,2234],['ipad-pro-13',2064,2752]]) assert.ok(resolveDevice(id,w,h),id);
});
test('search supports brand, model, dimensions, punctuation and empty results', () => {
  assert.ok(searchDevices('macbook air').every(s=>s.name.includes('MacBook Air')));
  assert.ok(searchDevices('2560×1664').some(s=>s.id==='air-13'));
  assert.deepEqual(searchDevices('2560 x 1664'),searchDevices('2560×1664'));
  assert.ok(searchDevices('Samsung S26+').some(s=>s.id==='s26-plus'));
  assert.equal(searchDevices('nonsense unavailable').length,0);
  assert.equal(searchDevices('  ').length,deviceSizes.length);
});
test('duplicate resolutions preserve selected model identity, and changed dimensions never show a false model', () => {
  assert.equal(resolveDevice('s25-ultra',1440,3120)?.id,'s25-ultra');
  assert.equal(resolveDevice('s26-ultra',1440,3120)?.id,'s26-ultra');
  assert.equal(resolveDevice('s26-ultra',3120,1440),undefined);
  assert.equal(resolveDevice('missing',1440,3120),undefined);
});
