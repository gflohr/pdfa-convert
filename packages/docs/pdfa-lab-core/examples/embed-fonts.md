# Embedding Fonts

Some PDFs, especially older ones, only contain references to some or all of
the fonts they use. This was usually meant as a way to reduce the size of
a document. With `@pdfa-lab/core` you can embed font subsets for all missing
fonts in a document.

Note! If you [convert a PDF to PDF/A](./convert-to-pdfa.html), this happens
automatically.

## Repairing Broken PDFs by Embedding Fonts

Modern PDF viewers render PDFs with non-embedded fonts only if the font is
one of the 14 standard PDF Type 1 fonts:

* Times-Roman
* Times-Bold
* Times-Italic
* Times-BoldItalic
* Courier
* Courier-Bold
* Courier-Oblique
* Courier-BoldOblique
* Helvetica
* Helvetica-Bold
* Helvetica-Oblique
* Helvetica-BoldOblique
* Symbol
* ZapfDingbats

Theoretically, other fonts, notably TrueType fonts, can also be referenced by
name, but documents using this features will appear broken because neither
will PDF viewers render them, nor printers print them correctly.

With `@pdfa-lab/core`, you can embed these fonts, no matter which type they
are.

## Specifying Font Data

In most cases, there is no need to provide font data. The library tries to
locate a best match in this order:

1. Font data explicitly provided.
2. The output of the [`fc-match`](https://man.archlinux.org/man/fc-match.1.en)
   if installed on the system.
3. A hardcoded fallback mapping.

In the browser, only option 1 is available; missing font data always has to
be provided by the user.

In practice, you will only override the automatic font resolution, if the
output is not satisfying.

## Code Example

:::tabs key:language variant:code

== TypeScript
```TypeScript
import * as fs from 'node:fs/promises';
import { PDFALab } from '@pdfa-lab/core';
import { fontkit } from '@pdfa-lab/fontkit';

embedFonts().catch(err => {
	console.error(`Embedding fonts failed: ${err}`);
	process.exit(1);
});

async function embedFonts() {
	const url = 'https://github.com/gflohr/pdfa-lab/raw/refs/heads/main/assets/pdfs/standard-fonts-demo.pdf';
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
	}

	const arrayBuffer = await response.arrayBuffer();
	const pdfBytes = new Uint8Array(arrayBuffer);
	const lab = await PDFALab.from(pdfBytes);

	// We only specify a font for 'Helvetica'.
	const notoFilename = '/path/to/NotoSans-Regular.ttf';

	const notoBytes = await fs.readFile(notoFilename);

	const fontMapping = {
		Helvetica: {
			source: notoBytes,
		},
	};

	await lab.embedFonts(fontkit, {
		fontMap: fontMapping,
	});

	const embeddedBytes = await lab.save();
	await fs.writeFile('output.pdf', embeddedBytes);
}
```

== ES6
```JavaScript
import * as fs from 'node:fs/promises';
import { PDFALab } from '@pdfa-lab/core';
import { fontkit } from '@pdfa-lab/fontkit';

embedFonts().catch(err => {
	console.error(`Embedding fonts failed: ${err}`);
	process.exit(1);
});

async function embedFonts() {
	const url = 'https://github.com/gflohr/pdfa-lab/raw/refs/heads/main/assets/pdfs/standard-fonts-demo.pdf';
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
	}

	const arrayBuffer = await response.arrayBuffer();
	const pdfBytes = new Uint8Array(arrayBuffer);
	const lab = await PDFALab.from(pdfBytes);

	// We only specify a font for 'Helvetica'.
	const notoFilename = '/path/to/NotoSans-Regular.ttf';

	const notoBytes = await fs.readFile(notoFilename);

	const fontMapping = {
		Helvetica: {
			source: notoBytes,
		},
	};

	await lab.embedFonts({
		fontkit,
		fontMap: fontMapping,
	});

	const embeddedBytes = await lab.save();
	await fs.writeFile('output.pdf', embeddedBytes);
}
```

== CommonJS
```JavaScript
const fs = require('node:fs/promises');
const { PDFALab } = require('@pdfa-lab/core');
const { fontkit } = require('@pdfa-lab/fontkit');

embedFonts().catch(err => {
	console.error(`Embedding fonts failed: ${err}`);
	process.exit(1);
});

async function embedFonts() {
	const url = 'https://github.com/gflohr/pdfa-lab/raw/refs/heads/main/assets/pdfs/standard-fonts-demo.pdf';
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
	}

	const arrayBuffer = await response.arrayBuffer();
	const pdfBytes = new Uint8Array(arrayBuffer);
	const lab = await PDFALab.from(pdfBytes);

	// We only specify a font for 'Helvetica'.
	const notoFilename = '/path/to/NotoSans-Regular.ttf';

	const notoBytes = await fs.readFile(notoFilename);

	const fontMapping = {
		Helvetica: {
			source: notoBytes,
		},
	};

	await lab.embedFonts(fontkit, {
		fontMap: fontMapping,
	});

	const embeddedBytes = await lab.save();
	await fs.writeFile('output.pdf', embeddedBytes);
}
```

:::

The method [`embedFonts()`](/pdfa-lab-core/api/classes/PDFALab.html#embedfonts)
embeds all missing fonts into a PDF document.

Embedding fonts requires [`fontkit`](/fontkit/api/variables/fontkit).
This has to be an instance of `@pdfa-lab/fontkit`. Other versions will not
work!

The fontkit instance is passed inside a
[`FontEmbedOptions`](/pdfa-lab-core/api/type-aliases/FontEmbedOptions.html)
object as the first argument to
[`embedFonts()`](/pdfa-lab-core/api/classes/PDFALab.html#embedfonts). This
is usually sufficient.

Only if the automatic font resolution fails, or the rendered results are not
satisfying, font data should be provided in the `fontMap` property of the
object. The `fontMap` property is an object itself. Its keys are the font
names as used in the PDF document, and the values are
[`FontData`](/pdfa-lab-core/api/type-aliases/FontData.html) objects.

Most of the time, the only interesting property of
[`FontData`](/pdfa-lab-core/api/type-aliases/FontData.html) objects is
`source`. This is either a path to a font file on the local file system as
a string, or a `Uint8Array` (or `Buffer`) containing the font data. In the
browser, you always have to provide the raw font data.

If the provided font data is a TrueType collection (`.ttc`), you also have
to specify the PostScript name of the desired font. The same holds true for
the rarely used Datafork font files (`.dfont`), which also contain multiple
fonts at the same time.

Although rarely needed, you can also limit the embedding to particular
font references in the PDF by passing an array of references (for example
`['14 0 R', '17 0 R']`) as an optional second argument, see the API
documentation for
[`embedFonts()`](/pdfa-lab-core/api/classes/PDFALab.html#embedfonts) for
further information.

Both the optional PostScript names and the PDF references can be determined
with one or both of the methods 
[`listFonts()`](/pdfa-lab-core/api/classes/PDFALab.html#listfonts) and
[`extractText()`](/pdfa-lab-core/api/classes/PDFALab.html#extracttext).
