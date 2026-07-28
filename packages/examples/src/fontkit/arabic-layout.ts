import * as fs from 'node:fs';
import { TrueTypeFont } from '@pdfa-lab/fontkit';
import { findFontkitTestFont } from '../util.js';

const filename = 'amiri/amiri-regular.ttf';
const fullName = findFontkitTestFont(filename);
const bytes = fs.readFileSync(fullName);
const font = new TrueTypeFont(bytes);

const arabicText = 'مرحبا بالعالم'; // "Hello World" in Arabic.

const features = {
	init: true, // Initial forms
	medi: true, // Medial forms
	fina: true, // Final forms
	liga: true, // Standard ligatures
};

const run = font.layout(arabicText, features, 'arab');

console.log(`RTL Text Layout Output (${run.glyphs.length} glyphs):`);

for (let i = 0; i < run.glyphs.length; i++) {
	const glyph = run.glyphs[i]!;
	const position = run.positions[i]!;

	console.log(
		`Glyph #${i}: ID=${glyph.id}, Name=${glyph.name}, xAdvance=${position.xAdvance}, xOffset=${position.xOffset}`,
	);
}

console.log(`Writing direction: ${run.direction}`);
