import * as fs from 'node:fs';
import { type GlyphRun, TrueTypeFont } from '@pdfa-lab/fontkit';
import { findFontkitTestFont } from '../util.js';

const filename = 'OpenSans/OpenSans-Regular.ttf';
const fullName = findFontkitTestFont(filename);
const bytes = fs.readFileSync(fullName);
const font = new TrueTypeFont(bytes);

const text = 'Hello, World!';

const run: GlyphRun = font.layout(text);

console.log(`Text: "${text}"`);
console.log(`Number of glyphs: ${run.glyphs.length}`);

let totalWidth = 0;
for (let i = 0; i < run.glyphs.length; i++) {
	const glyph = run.glyphs[i]!;
	const position = run.positions[i]!;

	// xAdvance is the horizontal distance to move before placing the next
	// glyph.
	totalWidth += position.xAdvance;

	console.log(
		`Glyph #${i}: ID=${glyph.id}, Name=${glyph.name}, xAdvance=${position.xAdvance}, xOffset=${position.xOffset}`,
	);
}

console.log(`\nTotal Advance Width (font units): ${totalWidth}`);

const fontSize = 16;
const widthInPoints = (totalWidth / font.unitsPerEm) * fontSize;
console.log(`Total Width at ${fontSize}pt: ${widthInPoints.toFixed(2)}pt`);
