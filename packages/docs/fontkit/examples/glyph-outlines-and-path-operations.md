# Glyph Outlines & Path Operations

You can convert the glyphs contained in a font into SVG paths.

## Rendering Glyphs as SVG

:::tabs key:language variant:code

== TypeScript
```TypeScript
import * as fs from 'node:fs';
import { TrueTypeFont } from '@pdfa-lab/fontkit';

const filename = 'OpenSans/OpenSans-Regular.ttf';
const bytes = fs.readFileSync(filename);
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
```

== ES6
```JavaScript
import * as fs from 'node:fs';
import { TrueTypeFont } from '@pdfa-lab/fontkit';

const filename = 'OpenSans/OpenSans-Regular.ttf';
const bytes = fs.readFileSync(filename);
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
```

== CommonJS
```JavaScript
const fs = require('node:fs');
const { TrueTypeFont } = require('@pdfa-lab/fontkit');

const filename = 'OpenSans/OpenSans-Regular.ttf';
const bytes = fs.readFileSync(filename);
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
```

:::

## Rendering Glyphs into a PDF

You can also render it into a PDF document created with
[`pdfkit`](https://www.npmjs.com/package/pdfkit):

== TypeScript
```TypeScript
import PDFDocument from 'pdfkit';
import * as fs from 'node:fs';
import { TrueTypeFont } from '@pdfa-lab/fontkit';

const filename = 'OpenSans/OpenSans-Regular.ttf';
const bytes = fs.readFileSync(filename);
const font = new TrueTypeFont(bytes);

const doc = new PDFDocument();

doc.pipe(fs.createWriteStream('output.pdf'));

const filename = 'OpenSans-Regular.ttf';
const bytes = fs.readFileSync(filename);
const font = new TrueTypeFont(bytes);

const glyph = font.glyphForCodePoint('€'.charCodeAt(0));
if (!glyph) {
	throw new Error('No glyph found for the Euro sign!');
}

const f = glyph.path.toFunction();
f(doc);
doc.end();
```

== ES6
```JavaScript
import PDFDocument from 'pdfkit';
import * as fs from 'node:fs';
import { TrueTypeFont } from '@pdfa-lab/fontkit';

const filename = 'OpenSans/OpenSans-Regular.ttf';
const bytes = fs.readFileSync(filename);
const font = new TrueTypeFont(bytes);

const doc = new PDFDocument();

doc.pipe(fs.createWriteStream('output.pdf'));

const filename = 'OpenSans-Regular.ttf';
const bytes = fs.readFileSync(filename);
const font = new TrueTypeFont(bytes);

const glyph = font.glyphForCodePoint('€'.charCodeAt(0));
if (!glyph) {
	throw new Error('No glyph found for the Euro sign!');
}

const f = glyph.path.toFunction();
f(doc);
doc.end();
```

== CommonJS
```JavaScript
const PDFDocument = require('pdfkit');
const fs = require('node:fs');

const doc = new PDFDocument();

doc.pipe(fs.createWriteStream('output.pdf'));

const filename = 'OpenSans-Regular.ttf';
const bytes = fs.readFileSync(filename);
const font = new TrueTypeFont(bytes);

const glyph = font.glyphForCodePoint('€'.charCodeAt(0));
if (!glyph) {
	throw new Error('No glyph found for the Euro sign!');
}

const f = glyph.path.toFunction();
f(doc);
doc.end();
```

:::

## Rendering Glyphs into a Canvas

**Warning** This feature may currently crash your application! See
https://github.com/gflohr/pdfa-lab/issues/105!

To a certain extent, it is also possible to render a glyph to an HTML5
[`Canvas`](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API),
or a `Canvas` implementation for Node.js, for example
https://www.npmjs.com/package/canvas.

However, rendering colour glyphs will invoke methods `fillColor()` and
`image()` which are not present in the `Canvas` interface. Your application
will crash on it.

For regular glyphs, this works:

== TypeScript
```TypeScript
import * as fs from 'node:fs';
import { type FontkitCanvas, TrueTypeFont } from '@pdfa-lab/fontkit';
import { createCanvas } from 'canvas';

const filename = 'OpenSans-Regular.ttf';
const bytes = fs.readFileSync(filename);
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
f(ctx as unknown as FontkitCanvas);
ctx.fillStyle = '#1d4ed8';
ctx.fill();
ctx.restore();

const png = canvas.toBuffer();
fs.writeFileSync('euro.png', png);
```

== ES6
```JavaScript
import * as fs from 'node:fs';
import { TrueTypeFont } from '@pdfa-lab/fontkit';
import { createCanvas } from 'canvas';

const filename = 'OpenSans-Regular.ttf';
const bytes = fs.readFileSync(filename);
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
f(ctx);
ctx.fillStyle = '#1d4ed8';
ctx.fill();
ctx.restore();

const png = canvas.toBuffer();
fs.writeFileSync('euro.png', png);
```

== CommonJS
```JavaScript
const fs = require('node:fs');
const { TrueTypeFont } = require('@pdfa-lab/fontkit');
const { createCanvas } = require('canvas');

const filename = 'OpenSans-Regular.ttf';
const bytes = fs.readFileSync(filename);
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
f(ctx);
ctx.fillStyle = '#1d4ed8';
ctx.fill();
ctx.restore();

const png = canvas.toBuffer();
fs.writeFileSync('euro.png', png);
```

:::
