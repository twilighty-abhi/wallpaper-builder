import { createCanvas } from '@napi-rs/canvas';
import fs from 'node:fs';
import { renderMat } from './renderer.mjs';
import { preset } from '../lib/mat/model.ts';
fs.mkdirSync('outputs', { recursive: true });
for (const i of [0, 3, 4, 5]) { const r = preset(i), canvas = createCanvas(1,1); renderMat(canvas,r,1200,Math.round(1200*r.height/r.width)); fs.writeFileSync(`outputs/mat-${i}.png`,canvas.toBuffer('image/png')); }
const canvas = createCanvas(1200,630), r = preset(0); r.width=1200; r.height=630; r.typography.title=''; r.typography.subtitle=''; renderMat(canvas,r,1200,630);
const c=canvas.getContext('2d'); c.resetTransform(); const fade=c.createLinearGradient(0,0,1200,0); fade.addColorStop(0,'#15211ff5'); fade.addColorStop(.55,'#15211fee'); fade.addColorStop(1,'#15211f00'); c.fillStyle=fade;c.fillRect(0,0,1200,630); c.fillStyle='#c2db9c'; c.font='15px monospace';c.textAlign='left';c.fillText('WALLPAPER STUDIO / 01',75,170);c.fillStyle='#eaece3';c.font='64px sans-serif';c.fillText('Cutting Mat',70,267);c.font='25px sans-serif';c.fillStyle='#b9c9b4';c.fillText('A little structure for your screen.',75,324);c.font='14px monospace';c.fillStyle='#b6cda3';c.fillText('GRIDS. GUIDES. GOOD GEOMETRY.',75,455);fs.writeFileSync('public/og.png',canvas.toBuffer('image/png'));
