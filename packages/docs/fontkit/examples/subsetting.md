# Subsetting

Modern PDF documents usually do not embed entire fonts but only those parts
that are needed to render the text written with that font. This is called
a font subset.

## Incomplete Subsets

`@pdfa-lab/fontkit` is able to create font subsets for embedding in PDF
documents but they are currently missing some required tables for being
universally usable. They can only be embedded as CID fonts.

If you embed fonts via
[`@cantoo/pdf-lib`](https://www.npmjs.com/package/@cantoo/pdf-lib) or the
original, now unmaintained
[`pdf-lib`](https://www.npmjs.com/package/@cantoo/pdf-lib), this happens
automatically, and the resulting PDFs are fully usable.

## Creating Subsets

:::tabs key:language variant:code

== TypeScript
```TypeScript
import * as fs from 'node:fs';
import { TrueTypeFont } from '@pdfa-lab/fontkit';

const filename = 'OpenSans/OpenSans-Regular.ttf';
const bytes = fs.readFileSync(filename);
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
```

== ES6
```JavaScript
import * as fs from 'node:fs';
import { TrueTypeFont } from '@pdfa-lab/fontkit';

const filename = 'OpenSans/OpenSans-Regular.ttf';
const bytes = fs.readFileSync(filename);
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
```

== CommonJS
```JavaScript
const fs = require('node:fs');
const { TrueTypeFont } = require('@pdfa-lab/fontkit');

const filename = 'OpenSans/OpenSans-Regular.ttf';
const bytes = fs.readFileSync(filename);
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
```

:::

You start by creating an empty subset with
[`createSubset()`](../api/classes/TrueTypeFont#createsubset).

Next, you have to create an array of [`Glyph`](../api/classes/Glyph) objects,
that the subset should contain. In the example code, this is achieved with
[`glyphsForString()](../api/classes/TrueTypeFont#glyphsforstring), but there
are other ways to achive this.

Each of the required glyphs is then passed to the method
[`includeGlyph()`](../api/classes/Subset#includeglyph) of the
[Subset](../api/classes/Subset) class. The method automatically filters out
duplicate glyphs.

Finally, the subset is serialised with
[`encode()`](../api/classes/Subset#encode) into a buffer.
