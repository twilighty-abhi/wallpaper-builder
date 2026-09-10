import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { original, preset, applyPreset, parseDesignFile, serializeDesign, parseRecipe, reducer, randomize, dimensionError, readStorage, writeStorage, clone } from '../lib/mat/model.ts';
const source = fs.readFileSync(new URL('../lib/mat/render.ts', import.meta.url), 'utf8').replace("'./model'", JSON.stringify(new URL('../lib/mat/model.ts', import.meta.url).href));
const { stripTypeScriptTypes } = await import('node:module');
const { renderMat, exportPng } = await import('data:text/javascript;base64,' + Buffer.from(stripTypeScriptTypes(source)).toString('base64'));
function recordingCanvas(blobMode = 'ok') {
  const operations = [];
  const context = new Proxy({}, { set(target, key, value) { operations.push([key, typeof value === 'object' ? 'gradient' : value]); target[key] = value; return true; }, get(target, key) {
    if (key === 'measureText') return text => ({ width: text.length * 9 });
    if (key === 'createRadialGradient') return (...args) => { operations.push([key, ...args]); return { addColorStop(...args) { operations.push(['colorStop', ...args]); } }; };
    return (...args) => operations.push([key, ...args]);
  }});
  return { width: 0, height: 0, getContext: () => context, operations, toBlob(callback) { if (blobMode === 'throw') throw Error('allocation failed'); callback(blobMode === 'null' ? null : new Blob(['png'], { type: 'image/png' })); } };
}
test('all six compositions validate and remain independent', () => { for(let i = 0; i < 6; i++) assert.ok(parseRecipe(preset(i))); const p=preset(0); p.grid.spacing=60; assert.equal(original.grid.spacing,24); });
test('invalid dimensions and dangerous saved values are rejected', () => {
  for(const size of [[0,1080],[1920.5,1080],[NaN,1080],[8193,64],[8192,8192]]) assert.ok(dimensionError(...size));
  for(const size of [[1920,1080],[3840,2160],[1440,3120],[3440,1440],[8192,4000]]) assert.equal(dimensionError(...size),null);
  const bad=clone(original); bad.grid.spacing=0; assert.equal(parseRecipe(bad),null);
  assert.equal(parseRecipe({...original,version:2}),null);
});
test('undo, redo, branching and bounded history', () => {
  let h={past:[],present:original,future:[]}; h=reducer(h,{type:'set',recipe:preset(2)}); const edited=h;
  h=reducer(h,{type:'undo'}); assert.deepEqual(h.present,original); assert.deepEqual(reducer(h,{type:'redo'}),edited);
  h=reducer(h,{type:'set',recipe:preset(3)}); assert.equal(h.future.length,0);
  for(let i=0;i<100;i++) h=reducer(h,{type:'set',recipe:{...original,name:String(i)}}); assert.equal(h.past.length,80);
});
test('randomization respects each lock and preserves canvas, text and quiet zone', () => {
  for(const category of ['palette','grid','guides','material']) { const locks={palette:false,grid:false,guides:false,material:false,[category]:true}; const r=randomize(original,locks,44); assert.deepEqual(r[category],original[category]); assert.deepEqual(r.typography,original.typography); assert.deepEqual(r.quiet,original.quiet); assert.equal(r.width,original.width); }
  assert.deepEqual(randomize(original,{palette:false,grid:false,guides:false,material:false},44),randomize(original,{palette:false,grid:false,guides:false,material:false},44));
});
test('storage round trip, corruption, invalid records and unavailable storage', () => {
  const map=new Map(); const storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};
  assert.ok(writeStorage(storage,'cutting-mat:latest',preset(4))); assert.ok(writeStorage(storage,'cutting-mat:saved',[{id:'1',name:'Phone',recipe:preset(4)},{id:'2',name:'Bad',recipe:{}}]));
  const read=readStorage(storage); assert.deepEqual(read.recipe,preset(4)); assert.equal(read.saved.length,1);
  map.set('cutting-mat:latest','{'); assert.equal(readStorage(storage).error,true);
  assert.equal(readStorage({getItem(){throw Error('denied')}}).error,true);
  assert.equal(writeStorage({setItem(){throw Error('quota')}},'x',{}),false);
});
test('drawing is deterministic and uses the same coordinates at preview and export sizes', () => {
  for(const i of [0,3,4,5]) { const r=preset(i), a=recordingCanvas(), b=recordingCanvas(), c=recordingCanvas(); renderMat(a,r,1200,1200*r.height/r.width); renderMat(b,r,r.width,r.height); renderMat(c,r,1200,1200*r.height/r.width); assert.deepEqual(a.operations,c.operations); assert.deepEqual(a.operations.filter(x=>x[0]!=='scale'),b.operations.filter(x=>x[0]!=='scale')); assert.equal(b.width,r.width); assert.equal(b.height,r.height); }
});
test('PNG export success and failures release the canvas and preserve the recipe', async () => {
  const before=clone(original); for(const mode of ['ok','null','throw']) { const canvas=recordingCanvas(mode); if(mode==='ok') assert.equal((await exportPng(original,()=>canvas)).type,'image/png'); else await assert.rejects(exportPng(original,()=>canvas)); assert.equal(canvas.width,1); assert.deepEqual(original,before); }
  await assert.rejects(exportPng({...original,width:0},()=>recordingCanvas()));
  await assert.rejects(exportPng(original,()=>({width:0,height:0,getContext:()=>null})));
});

test('real PNG exports have exact dimensions and deterministic pixels', async () => {
  const { createCanvas } = await import('@napi-rs/canvas');
  for(const [width,height] of [[1920,1080],[3840,2160],[1440,3120],[3440,1440],[1111,777]]) {
    const recipe={...preset(height>width?4:0),width,height};
    const blob=await exportPng(recipe,()=>createCanvas(1,1)); const bytes=Buffer.from(await blob.arrayBuffer());
    assert.equal(bytes.subarray(1,4).toString(),'PNG'); assert.equal(bytes.readUInt32BE(16),width); assert.equal(bytes.readUInt32BE(20),height);
    assert.ok(bytes.length>10000);
  }
  const a=createCanvas(1,1),b=createCanvas(1,1); renderMat(a,preset(5),1200,675); renderMat(b,preset(5),1200,675); assert.deepEqual(a.toBuffer('image/png'),b.toBuffer('image/png'));
});

test('one slider gesture creates one undo step, including interruption and no-op gestures', () => {
  let h={past:[],present:original,future:[]}; h=reducer(h,{type:'begin'});
  for(let i=25;i<=70;i++) { h=reducer(h,{type:'begin'}); h=reducer(h,{type:'set',recipe:{...original,grid:{...original.grid,spacing:i}}}); }
  assert.equal(h.past.length,0); h=reducer(h,{type:'commit'}); assert.equal(h.past.length,1);
  const edited=h.present; h=reducer(h,{type:'undo'}); assert.deepEqual(h.present,original); h=reducer(h,{type:'redo'}); assert.deepEqual(h.present,edited);
  const before=h; h=reducer(reducer(h,{type:'begin'}),{type:'commit'}); assert.deepEqual(h,before);
  h=reducer(h,{type:'begin'}); h=reducer(h,{type:'set',recipe:preset(3)}); h=reducer(h,{type:'undo'}); assert.deepEqual(h.present,edited);
});
test('preset application keeps chosen dimensions by default and can use native preset dimensions', () => {
  const current={...original,width:1111,height:777};
  for(let i=0;i<6;i++) { const p=applyPreset(i,current); assert.equal(p.width,1111); assert.equal(p.height,777); assert.deepEqual(p.grid,preset(i).grid); }
  assert.deepEqual(applyPreset(4,current,false),preset(4)); assert.equal(current.width,1111);
});
test('portable designs round trip legacy recipes, discard unknown fields, and reject invalid files', () => {
  for(let i=0;i<6;i++) assert.deepEqual(parseDesignFile(serializeDesign(preset(i))),preset(i));
  const withExtra={...original,unexpected:'ignored',grid:{...original.grid,unknown:7}};
  assert.deepEqual(parseDesignFile(JSON.stringify(withExtra)),original);
  for(const data of ['{','null','[]','"hello"',JSON.stringify({...original,version:99}),JSON.stringify({...original,grid:{...original.grid,spacing:0}}),' '.repeat(65537)]) assert.throws(()=>parseDesignFile(data));
});
test('corrupt latest session does not erase healthy saved designs, and vice versa', () => {
  const rows=[{id:'kept',name:'Favorite',recipe:preset(2)}];
  const a=readStorage({getItem:key=>key.endsWith('latest')?'{':JSON.stringify(rows)}); assert.equal(a.error,true); assert.equal(a.saved.length,1); assert.deepEqual(a.saved[0].recipe,preset(2));
  const b=readStorage({getItem:key=>key.endsWith('latest')?JSON.stringify(original):'{'}); assert.deepEqual(b.recipe,original); assert.equal(b.error,true);
});
test('zero-opacity legend leaves no opaque plaque behind', () => {
  const a=recordingCanvas(),b=recordingCanvas(); renderMat(a,{...original,typography:{...original.typography,opacity:0}},1200,675); renderMat(b,{...original,typography:{...original.typography,title:'',subtitle:''}},1200,675); assert.deepEqual(a.operations,b.operations);
});
