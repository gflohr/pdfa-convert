import * as fs from 'node:fs';
import { type FontkitCanvas, TrueTypeFont } from '@pdfa-lab/fontkit';
import { createCanvas } from 'canvas';
import { findFontkitTestFont } from '../util.js';

const filename = 'OpenSans/OpenSans-Regular.ttf';
const fullName = findFontkitTestFont(filename);
const bytes = fs.readFileSync(fullName);
const font = new TrueTypeFont(bytes);

const glyph = font.glyphForCodePoint('€'.charCodeAt(0));
if (!glyph) {
	throw new Error('No glyph found for the Euro sign!');
}

const f = glyph.path.toFunction();

const canvas = createCanvas(400, 400)
const ctx = canvas.getContext('2d')

const fontSize = 150;
const scale = fontSize / font.unitsPerEm;

ctx.save();
ctx.translate(20, 200);
ctx.scale(scale, -scale);
ctx.beginPath();
// FIXME! This does not work with COLR or sbix glyphs, see
// https://github.com/gflohr/pdfa-lab/issues/105!
f(ctx as unknown as FontkitCanvas);
ctx.fillStyle = '#1d4ed8';
ctx.fill();
ctx.restore();

const png = canvas.toBuffer();
fs.writeFileSync('euro.png', png);
console.log("Written 'euro.png'");
