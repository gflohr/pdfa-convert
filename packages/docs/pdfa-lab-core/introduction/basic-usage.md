# Basic Usage

## Create an Instance

You can create a `PDFALab` instance like this::

:::tabs key:language variant:code

== TypeScript
```TypeScript
import * as fs from 'node:fs';
import { PDFALab } from '@pdfa-lab/core';

const bytes = fs.readFileSync('example.pdf');
const lab = await PDFALab.from(bytes);

// Do something with the instance like extracting text or converting the
// document to PDF/A.
```

== ES6
```JavaScript
import * as fs from 'node:fs';
import { PDFALab } from '@pdfa-lab/core';

const bytes = fs.readFileSync('example.pdf');
const lab = await PDFALab.from(bytes);

// Do something with the instance like extracting text or converting the
// document to PDF/A.
```

== CommonJS
```JavaScript
const fs = require('node:fs');
const { PDFALab } = require('@pdfa-lab/core');

const bytes = fs.readFileSync('example.pdf');
const lab = await PDFALab.from(bytes);

// Do something with the instance like extracting text or converting the
// document to PDF/A.
```

== UMD
```HTML
<!DOCTYPE html>
<html lang="en" dir="ltr">
	<head>
		<title>Test for `@pdfa-lab/core</title>
		<meta charset="utf-8">
	</head>
	<body>
		<h1>Test for `@pdfa-lab/core</h1>
		<script src="./dist/index.browser.js"></script>
		<script>
const { PDFALab } = window.pdfalab;
loadPDF().catch(err => {
	alert(`Loading PDF failed: ${err}`);
});

async function loadPDF() {
	const url = 'https://raw.githubusercontent.com/gflohr/pdfa-lab/main/assets/pdfs/type1-fonts-missing.pdf';
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
	}

	const arrayBuffer = await response.arrayBuffer();
	const bytes = new Uint8Array(arrayBuffer);

	const lab = await PDFALab.from(bytes);
	// Do something with the instance like extracting text or converting the
	// document to PDF/A.
		</script>
	</body>
</html>
```

You have several options, to get a global `window.pdfalab`. You can build
the software and load `packages/core/dist/index.browser.min.js` into the
browser. Or you use a CDN:

* https://unpkg.com/@pdfa-lab/core/dist/index.browser.js
* https://unpkg.com/@pdfa-lab/core/dist/index.browser.min.js

If you want a specific version:

* https://unpkg.com/@pdfa-lab/core@1.0.0/dist/index.browser.js
* https://unpkg.com/@pdfa-lab/core@1.0.0/dist/index.browser.min.js
You can also use jsDelivr as an alternative CDN:

* https://cdn.jsdelivr.net/npm/@pdfa-lab/core/dist/index.browser.js
* https://cdn.jsdelivr.net/npm/@pdfa-lab/core/dist/index.browser.min.js
* https://cdn.jsdelivr.net/npm/@pdfa-lab/core@1.0.0/dist/index.browser.js
* https://cdn.jsdelivr.net/npm/@pdfa-lab/core@1.0.0/dist/index.browser.min.js
:::
