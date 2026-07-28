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
console.log(`Glyph ID: ${glyph.id}`);
console.log(`Glyph Name: ${glyph.name}`);
console.log(`Glyph Bounding Box:`, glyph.bbox);
