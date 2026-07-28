import * as fs from 'node:fs';
import { TrueTypeFont } from '@pdf-lab/fontkit';
import { findFontkitTestFont } from '../util.js';

const filename = 'NotoSansCJK/NotoSansCJKkr-Regular.otf';
const fullName = findFontkitTestFont(filename);
const bytes = fs.readFileSync(fullName);
const font = new TrueTypeFont(bytes);

console.log(`# ${filename}\n`);
console.log('## Meta Data\n');
console.log(`* PostScript name: ${font.postscriptName}`);
console.log(`* Full name: ${font.fullName}`);
console.log(`* Family name: ${font.familyName}`);
console.log(`* Subfamily name: ${font.subfamilyName}`);
console.log(`* Version: ${font.version}`);

console.log('\n## Metrics\n');
console.log(`* Ascent: ${font.ascent}`);
console.log(`* Descent: ${font.descent}`);
console.log(`* Units per em: ${font.unitsPerEm}`);
const bbox = font.boundingBox;
if (bbox) {
	console.log('* Bounding box');
	console.log(`\to x: ${bbox.minX} to ${bbox.maxX}`);
	console.log(`\to y: ${bbox.minY} to ${bbox.maxY}`);
	console.log(`\to width: ${bbox.width}`);
	console.log(`\to height: ${bbox.height}`);
}
console.log(`* CapHeight: ${font.capHeight}`);
console.log(`* Number of glyphs: ${font.numGlyphs}`);
console.log(`* Number of characters: ${font.characterSet.length}`);
console.log(`* Legal blurb: ${font.copyright}`);
console.log(`* Italic angle: ${font.italicAngle}`);
console.log(`* Line gap: ${font.lineGap}`);
console.log(`* Underline position: ${font.underlinePosition}`);
console.log(`* Underline thickness: ${font.underlineThickness}`);
console.log(`* X-height: ${font.xHeight}`);

console.log(`\n## Table Sets\n`);
const otFont = font.asOpenTypeFont();
if (otFont) {
	console.log('* OpenType core tables: yes');
	if (otFont.outlines === 'TrueType') {
		console.log('* OpenType outlines: TrueType');
	} else if (otFont.outlines === 'PostScript') {
		console.log('* OpenType outlines: PostScript');
		console.log(`* OpenType outline version: CFF version ${otFont.outlineVersion}`);
	}
} else {
	console.log('* OpenType core tables: no');
}

const isAAT = !!font.asAATFont();
console.log(`* AAT core tables: ${isAAT}`);
