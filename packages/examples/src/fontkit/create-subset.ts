import * as fs from 'node:fs';
import { TrueTypeFont } from '@pdfa-lab/fontkit';
import { findFontkitTestFont } from '../util.js';

const filename = 'OpenSans/OpenSans-Regular.ttf';
const fullName = findFontkitTestFont(filename);
const bytes = fs.readFileSync(fullName);
const font = new TrueTypeFont(bytes);

const subset = font.createSubset();

const glyphs = font.glyphsForString('Hello, world!');
for (let i = 0; i < glyphs.length; ++i) {
	const glyph = glyphs[i];
	if (!glyph) {
		throw new Error('Font is missing glyphs!');
	}
	subset.includeGlyph(glyph);
}

const outBytes = subset.encode();

fs.writeFileSync('subset.ttf', outBytes);
console.log('Wrote subset.ttf');
