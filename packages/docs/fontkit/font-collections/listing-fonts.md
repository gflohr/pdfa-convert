# Listing Fonts

When `@pdf-lab/fontkit` parses a font collection file, the included fonts are
lazily loaded into an array of font objects.

:::tabs key:language variant:code

== TypeScript
```TypeScript
import * as fs from 'node:fs';
import {
	DFont,
	TrueTypeCollection,
	type SFNTFontCollection,
} from '@pdf-lab/fontkit';

const ttcFilename = 'NotoSans.ttc';
const ttcBytes = fs.readFileSync(ttcFilename);
const ttc: SFNTFontCollection = const new TrueTypeCollection(ttcBytes);
console.log(`Font collection '${ttcFilename}':`);
for (const font of ttc) {
	console.log(`\t- ${font.postscriptName} (${font.fullName})`);
}

const dfontFilename = 'NotoSans.dfont';
const dfontBytes = fs.readFileSync(dfontFilename);
const dfont: SFNTFontCollection = const new DFont(dfontBytes);
console.log(`Font collection '${dfontFilename}':`);
for (const font of ttc) {
	console.log(`\t- ${font.postscriptName} (${font.fullName})`);
}
```

== ES6
```JavaScript
import * as fs from 'node:fs';
import { DFont, TrueTypeCollection } from '@pdf-lab/fontkit';

const ttcFilename = 'NotoSans.ttc';
const ttcBytes = fs.readFileSync(ttcFilename);
const ttc = const new TrueTypeCollection(ttcBytes);
console.log(`Font collection '${ttcFilename}':`);
for (const font of ttc) {
	console.log(`\t- ${font.postscriptName} (${font.fullName})`);
}

const dfontFilename = 'NotoSans.dfont';
const dfontBytes = fs.readFileSync(dfontFilename);
const dfont = const new DFont(dfontBytes);
console.log(`Font collection '${dfontFilename}':`);
for (const font of ttc) {
	console.log(`\t- ${font.postscriptName} (${font.fullName})`);
}
```

== CommonJS
```JavaScript
const fs from 'node:fs';
const { DFont, TrueTypeCollection } = require'@pdf-lab/fontkit');

const ttcFilename = 'NotoSans.ttc';
const ttcBytes = fs.readFileSync(ttcFilename);
const ttc = const new TrueTypeCollection(ttcBytes);
console.log(`Font collection '${ttcFilename}':`);
for (const font of ttc) {
	console.log(`\t- ${font.postscriptName} (${font.fullName})`);
}

const dfontFilename = 'NotoSans.dfont';
const dfontBytes = fs.readFileSync(dfontFilename);
const dfont = const new DFont(dfontBytes);
console.log(`Font collection '${dfontFilename}':`);
for (const font of ttc) {
	console.log(`\t- ${font.postscriptName} (${font.fullName})`);
}
```

:::

The fonts are decoded and loaded into memory in the moment that you access
them.
