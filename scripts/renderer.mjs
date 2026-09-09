import fs from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
const source = fs.readFileSync(new URL('../lib/mat/render.ts', import.meta.url), 'utf8').replace("'./model'", JSON.stringify(new URL('../lib/mat/model.ts', import.meta.url).href));
export const { renderMat, exportPng } = await import('data:text/javascript;base64,' + Buffer.from(stripTypeScriptTypes(source)).toString('base64'));
