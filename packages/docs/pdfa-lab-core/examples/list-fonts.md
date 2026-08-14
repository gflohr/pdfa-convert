# Extracting Text

Extracting text from PDFs is a best-effort approach and may still miss a
number of edge cases.

:::tabs key:language variant:code

== TypeScript
```TypeScript
import { PDFALab } from '@pdfa-lab/core';

listFonts().catch(err => {
	console.error(`Listing fonts failed: ${err}`);
	process.exit(1);
});

async function listFonts() {
	const url = 'https://github.com/gflohr/pdfa-lab/raw/refs/heads/main/assets/pdfs/type1-fonts-missing.pdf';
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
	}

	const arrayBuffer = await response.arrayBuffer();
	const bytes = new Uint8Array(arrayBuffer);

	const lab = await PDFALab.from(bytes);
	const fonts = await lab.collectFonts();

	fonts.forEach((font, pdfRef) => {
		console.log(`# PDF Reference '${pdfRef}'\n`);
		console.log(`Subtype: ${font.subtype}`);
		console.log(`Font name: ${font.fontName}`);
		console.log(`Base font: ${font.baseFont}`);
		console.log(`Embedded: ${font.embedded}`);
		console.log(`Encoding: ${font.encodingMapper.name}`);

		console.log();
	});
}
```

== ES6
```JavaScript
import { PDFALab } from '@pdfa-lab/core';

listFonts().catch(err => {
	console.error(`Extracting text failed: ${err}`);
	process.exit(1);
});

async function listFonts() {
	const url = 'https://github.com/gflohr/pdfa-lab/raw/refs/heads/main/assets/pdfs/type1-fonts-missing.pdf';
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
	}

	const arrayBuffer = await response.arrayBuffer();
	const bytes = new Uint8Array(arrayBuffer);

	const lab = await PDFALab.from(bytes);
	const fonts = await lab.collectFonts();

	fonts.forEach((font, pdfRef) => {
		console.log(`# PDF Reference '${pdfRef}'\n`);
		console.log(`Subtype: ${font.subtype}`);
		console.log(`Font name: ${font.fontName}`);
		console.log(`Base font: ${font.baseFont}`);
		console.log(`Embedded: ${font.embedded}`);
		console.log(`Encoding: ${font.encodingMapper.name}`);

		console.log();
	});
}
```

== CommonJS
```JavaScript
const { PDFALab } = require('@pdfa-lab/core');

listFonts().catch(err => {
	console.error(`Extracting text failed: ${err}`);
	process.exit(1);
});

async function listFonts() {
	const url = 'https://github.com/gflohr/pdfa-lab/raw/refs/heads/main/assets/pdfs/type1-fonts-missing.pdf';
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
	}

	const arrayBuffer = await response.arrayBuffer();
	const bytes = new Uint8Array(arrayBuffer);

	const lab = await PDFALab.from(bytes);
	const fonts = await lab.collectFonts();

	fonts.forEach((font, pdfRef) => {
		console.log(`# PDF Reference '${pdfRef}'\n`);
		console.log(`Subtype: ${font.subtype}`);
		console.log(`Font name: ${font.fontName}`);
		console.log(`Base font: ${font.baseFont}`);
		console.log(`Embedded: ${font.embedded}`);
		console.log(`Encoding: ${font.encodingMapper.name}`);

		console.log();
	});
}
```

:::

The method [`collectFonts()`](/pdfa-lab-core/api/classes/PDFALab.html#collectfonts)
finds all fonts in a PDF document as a
[`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map). The keys are the references of the PDF objects in
which the font is defined as a string. The values are
[`FontInfo`](/pdfa-lab-core/api/type-aliases/FontInfo.html) objects.

The output should be this:

```text
# PDF Reference '12 0 R'

Subtype: TrueType
Font name: NotoSans-Regular
Base font: BAAAAA+NotoSans-Regular
Embedded: true
Encoding: Identity-H

# PDF Reference '13 0 R'

Subtype: TrueType
Font name: NotoSerif-Regular
Base font: CAAAAA+NotoSerif-Regular
Embedded: true
Encoding: Identity-H

# PDF Reference '14 0 R'

Subtype: TrueType
Font name: CourierNewPSMT
Base font: DAAAAA+CourierNewPSMT
Embedded: true
Encoding: Identity-H
```
