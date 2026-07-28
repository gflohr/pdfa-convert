# Inspecting & Querying Metrics

Fonts contain extensive metadata, bounding box dimensions, vertical metric
ratios, and structural indicators.

## Loading a Font

:::tabs key:language variant:code

== TypeScript
```TypeScript
import * as fs from 'node:fs';
import { TrueTypeFont } from '@pdf-lab/fontkit';

const bytes = fs.readFileSync('Arial.ttf');
const font = new TrueTypeFont(bytes);
```

== ES6
```JavaScript
import * as fs from 'node:fs';
import { TrueTypeFont } from '@pdf-lab/fontkit';

const bytes = fs.readFileSync('Arial.ttf');
const font = new TrueTypeFont(bytes);
```

== CommonJS
```JavaScript
const fs = require('node:fs');
const { TrueTypeFont } = require('@pdf-lab/fontkit');

const bytes = fs.readFileSync('Arial.ttf');
const font = new TrueTypeFont(bytes);
```

:::

## Metadata

:::tabs key:language variant:code

== TypeScript
```TypeScript
console.log(`* PostScript name: ${font.postscriptName}`);
console.log(`* Full name: ${font.fullName}`);
console.log(`* Family name: ${font.familyName}`);
console.log(`* Subfamily name: ${font.subfamilyName}`);
console.log(`* Version: ${font.version}`);
```

== ES6
```JavaScript
console.log(`* PostScript name: ${font.postscriptName}`);
console.log(`* Full name: ${font.fullName}`);
console.log(`* Family name: ${font.familyName}`);
console.log(`* Subfamily name: ${font.subfamilyName}`);
console.log(`* Version: ${font.version}`);
```

== CommonJS
```JavaScript
console.log(`* PostScript name: ${font.postscriptName}`);
console.log(`* Full name: ${font.fullName}`);
console.log(`* Family name: ${font.familyName}`);
console.log(`* Subfamily name: ${font.subfamilyName}`);
console.log(`* Version: ${font.version}`);
```

:::

Note that all properties may be `null` if the information is not present in
the font file.

## Metrics

:::tabs key:language variant:code

== TypeScript
```TypeScript
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
```

== ES6
```JavaScript
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
```

== CommonJS
```JavaScript
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
```

:::

You are reminded again that all properties may be `null`.

## Font Type Narrowing

Check for the existence and validity of common table sets:

:::tabs key:language variant:code

== TypeScript
```TypeScript
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
```

== ES6
```JavaScript
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
```

== CommonJS
```JavaScript
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
```

:::
