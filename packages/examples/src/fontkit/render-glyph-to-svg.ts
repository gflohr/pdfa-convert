import * as fs from 'node:fs';
import { TrueTypeFont } from '@pdfa-lab/fontkit';
import { findFontkitTestFont } from '../util.js';

const filename = 'OpenSans/OpenSans-Regular.ttf';
const fullName = findFontkitTestFont(filename);
const bytes = fs.readFileSync(fullName);
const font = new TrueTypeFont(bytes);

const glyph = font.glyphForCodePoint('€'.charCodeAt(0));
if (!glyph) {
	throw new Error('No glyph found for the Euro sign!');
}

const svgPath = glyph.path.toSVG();
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${glyph.bbox.minX} ${glyph.bbox.minY} ${glyph.bbox.width} ${glyph.bbox.height}">
  <path d="${svgPath}" fill="black" />
</svg>
`.trim();

console.log(svg);
