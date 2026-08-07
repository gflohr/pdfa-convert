# Extracting Text

Extracting text from PDFs is a best-effort approach and may still miss a
number of edge cases.

:::tabs key:language variant:code

== TypeScript
```TypeScript
import { PDFALab } from '@pdfa-lab/core'
const run = font.layout('Hello, world!');
console.log(`Number of glyphs: ${run.glyphs.length}`);

let totalWidth = 0;
for (let i = 0; i < run.glyphs.length; i++) {
	const glyph = run.glyphs[i]!;
	const position = run.positions[i]!;

	totalWidth += position.xAdvance;

	console.log(
		`Glyph #${i}: ID=${glyph.id}, Name=${glyph.name}, xAdvance=${position.xAdvance}, xOffset=${position.xOffset}`,
	);
}

console.log(`\nTotal Advance Width (font units): ${totalWidth}`);

const fontSize = 16;
const widthInPoints = (totalWidth / font.unitsPerEm) * fontSize;
console.log(`Total Width at ${fontSize}pt: ${widthInPoints.toFixed(2)}pt`);
```

== ES6
```JavaScript
const run = font.layout('Hello, world!');
console.log(`Number of glyphs: ${run.glyphs.length}`);

let totalWidth = 0;
for (let i = 0; i < run.glyphs.length; i++) {
	const glyph = run.glyphs[i];
	const position = run.positions[i];

	totalWidth += position.xAdvance;

	console.log(
		`Glyph #${i}: ID=${glyph.id}, Name=${glyph.name}, xAdvance=${position.xAdvance}, xOffset=${position.xOffset}`,
	);
}

console.log(`\nTotal Advance Width (font units): ${totalWidth}`);

const fontSize = 16;
const widthInPoints = (totalWidth / font.unitsPerEm) * fontSize;
console.log(`Total Width at ${fontSize}pt: ${widthInPoints.toFixed(2)}pt`);
```

== CommonJS
```JavaScript
const run = font.layout('Hello, world!');
console.log(`Number of glyphs: ${run.glyphs.length}`);

let totalWidth = 0;
for (let i = 0; i < run.glyphs.length; i++) {
	const glyph = run.glyphs[i];
	const position = run.positions[i];

	totalWidth += position.xAdvance;

	console.log(
		`Glyph #${i}: ID=${glyph.id}, Name=${glyph.name}, xAdvance=${position.xAdvance}, xOffset=${position.xOffset}`,
	);
}

console.log(`\nTotal Advance Width (font units): ${totalWidth}`);

const fontSize = 16;
const widthInPoints = (totalWidth / font.unitsPerEm) * fontSize;
console.log(`Total Width at ${fontSize}pt: ${widthInPoints.toFixed(2)}pt`);
```

:::

A [GlyphRun](../api/classes/GlyphRun) has properties `glyphs` and `positions`
which are arrays of identical length. You can use these to get the metrics
of the rendered layout.

The above example assumes text using a Latin script with left-to-right
writing direction. But the library can also handle more complex scripts like
Arabic:

:::tabs key:language variant:code

== TypeScript
```TypeScript
const text = 'مرحبا بالعالم'; // "Hello World" in Arabic.

const features = {
	init: true, // Initial forms.
	medi: true, // Medial forms.
	fina: true, // Final forms.
	liga: true, // Standard ligatures.
};

const run = font.layout(text, features, 'arab');
console.log(`Writing direction: ${run.direction}`);

for (let i = 0; i < run.glyphs.length; i++) {
	const glyph = run.glyphs[i]!;
	const position = run.positions[i]!;

	console.log(
		`Glyph #${i}: ID=${glyph.id}, Name=${glyph.name}, xAdvance=${position.xAdvance}, xOffset=${position.xOffset}`,
	);
}
```

== ES6
```JavaScript
const text = 'مرحبا بالعالم'; // "Hello World" in Arabic.

const features = {
	init: true, // Initial forms.
	medi: true, // Medial forms.
	fina: true, // Final forms.
	liga: true, // Standard ligatures.
};

const run = font.layout(text, features, 'arab');
console.log(`Writing direction: ${run.direction}`);

for (let i = 0; i < run.glyphs.length; i++) {
	const glyph = run.glyphs[i];
	const position = run.positions[i];

	console.log(
		`Glyph #${i}: ID=${glyph.id}, Name=${glyph.name}, xAdvance=${position.xAdvance}, xOffset=${position.xOffset}`,
	);
}
```

== CommonJS
```JavaScript
const text = 'مرحبا بالعالم'; // "Hello World" in Arabic.

const features = {
	init: true, // Initial forms.
	medi: true, // Medial forms.
	fina: true, // Final forms.
	liga: true, // Standard ligatures.
};

const run = font.layout(text, features, 'arab');
console.log(`Writing direction: ${run.direction}`);

for (let i = 0; i < run.glyphs.length; i++) {
	const glyph = run.glyphs[i];
	const position = run.positions[i];

	console.log(
		`Glyph #${i}: ID=${glyph.id}, Name=${glyph.name}, xAdvance=${position.xAdvance}, xOffset=${position.xOffset}`,
	);
}
```

:::

The code will output "rtl" as the writing direction.

Note that for Right-to-Left (RTL) layout runs, the order of glyphs in
`run.glyphs` reflects the visual rendering order from left to right. In other
words: The last letter of the Arabic sentence is represented by the first
glyph.
