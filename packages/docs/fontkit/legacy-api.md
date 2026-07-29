# Legacy API

Historically, the only documented entry point into the `fontkit` library was
the factory function [`fontkit.create()`](./api/variables/fontkit#create):

:::tabs key:language variant:code

== TypeScript
```TypeScript
import * as fs from 'node:fs';
import fontkit from '@pdfa-lab/fontkit';

const fontBytes = fs.readFileSync('Helvetica.ttf');
const font = fontkit.create(fontBytes);
console.log(font.fullName);
```

== ES6
```JavaScript
import * as fs from 'node:fs';
import fontkit from '@pdfa-lab/fontkit';

const fontBytes = fs.readFileSync('Helvetica.ttf');
const font = fontkit.create(fontBytes);
console.log(font.fullName);
```

== CommonJS
```JavaScript
const fs = require('node:fs');
const { fontkit } = require('@pdfa-lab/fontkit');

const fontBytes = fs.readFileSync('Helvetica.ttf');
const font = fontkit.create(fontBytes);
console.log(font.fullName);
```

**Important!** You cannot use the default import with CommonJS (`const
fontkit = require('@pdfa-lab/fontkit')`). It is not possible to offer
a default export and named exports simultaneously with CommonJS.

:::

The `fontkit.create()` returns either a font, a font collection, or nothing.

This usage is still supported for compatibility reasons but it is considered
deprecated.

## What Really Happens

The library checks the first couple of bytes of the input and tries to
determine the file format from this. Depending on these bytes, it returns one
of these objects:

- a [TrueType font](/fontkit/api/classes/TrueTypeFont)
- a [WOFF font](/fontkit/api/classes/WOFFFont)
- a [WOFF2 font](/fontkit/api/classes/WOFFFont)
- a [TrueType font collection](/fontkit/api/classes/TrueTypeCollection)
- a [legacy Apple data fork font collection/container](/fontkit/api/classes/DFont)

A [TrueType](/fontkit/api/classes/TrueTypeFont),
[WOFF](/fontkit/api/classes/WOFFFont), and
[WOFF2](/fontkit/api/classes/WOFFFont) font all implement the
[Font](/fontkit/api/interfaces/Font) interface, and in fact, WOFF and
WOFF2 fonts are just subclasses of a TrueType font.

On the other hand, a [TrueType font
collection](/fontkit/api/classes/TrueTypeCollection) or a
[legacy Apple data fork font collection/container](/fontkit/api/classes/DFont)
are actually containers for multiple font faces, which support a totally
different interface
[FontCollection](/fontkit/api/interfaces/FontCollection). If you pass
data for these formats to
[`fontkit.create()`](/fontkit/api/variables/fontkit#create), and do not
pass a second argument, then the
[FontCollection](/fontkit/api/interfaces/FontCollection) object is returned,
and that has an API that differs completely from that of a
[TrueTypeFont](/fontkit/api/classes/TrueTypeFont) font. That means, you have to
pass the PostScript name of the desired font as a second argument in order to
get back a [TrueTypeFont](/fontkit/api/classes/TrueTypeFont). However, if
you specified a PostScript name of a font that does not exist in the collection,
the function returns `null`:

:::tabs key:language variant:code

== TypeScript
```TypeScript
import * as fs from 'node:fs';
import fontkit from '@pdfa-lab/fontkit';

const fontBytes = fs.readFileSync('Times.ttc');
const font = fontkit.create(fontBytes, 'Times-Italic');
console.log(font?.fullName);
```

== ES6
```JavaScript
import * as fs from 'node:fs';
import fontkit from '@pdfa-lab/fontkit';

const fontBytes = fs.readFileSync('Times.ttc');
const font = fontkit.create(fontBytes, 'Times-Italic');
console.log(font?.fullName);
```

== CommonJS
```JavaScript
const fs = require('node:fs');
const fontkit = require('@pdfa-lab/fontkit');

const fontBytes = fs.readFileSync('Times.ttc');
const font = fontkit.create(fontBytes, 'Times-Italic');
console.log(font?.fullName);
```

:::

## Why Deprecated?

If you understand the legacy API, and it is useful for you, go ahead and use
it. There is nothing wrong with it.

In almost all use cases, you either want to load a font but not a
font collection. Or you want to load a font collection but not a font. The
legacy factory function [`fontkit.create()`](./api/variables/fontkit#create)
may return either a font, a font collection, or `null`. You always have to
check the return value of it, before you can use it.

That means that you have to know your input data beforehand
in order to use this API correctly. You have to know whether the file contains
a single font or a collection of fonts. And when it is a collection of fonts,
you have to know which of the contained fonts you want to load. And in order
to do so, you have to know the `postscriptName` property of that particular
font.

It all boils down to "know your data". And because parsing font data from
unknown or untrusted sources implies a considerable security risk (see
[Security](/fontkit/introduction/security)), it is considered better, to use
the factory functions
[`fontkit.loadFont()`](./api/variables/fontkit#loadfont) or
[`fontkit.loadFontCollection()`](./api/variables/fontkit#loadfontcollection).
The first will load a font, the second a font collection.

Alternatively, if you know the data format, you can also simply use the
designated constructors for
[TrueTypeFont](/fontkit/api/classes/TrueTypeFont),
[WOFF](/fontkit/api/classes/WOFFFont), or
[WOFF2](/fontkit/api/classes/WOFFFont) fonts, and for the container formats
[`TrueTypeCollection`](/fontkit/api/classes/TrueTypeCollection) and
[`DFont`](/fontkit/api/classes/DFont).

## Using the legacy API

A typical usage looks like this:

:::tabs key:language variant:code

== TypeScript
```TypeScript
import * as fs from 'node:fs';
import { fontkit } from '@pdfa-lab/fontkit';

if (process.argv.length < 3) {
	console.error(`Usage: ${process.argv[1]} FONT_OR_COLLECTION`);
	process.exit(1);
}

const bytes = fs.readFileSync(process.argv[2]!);

try {
	const something = fontkit.create(bytes, process.argv[3]);
	if (!something) {
		console.error(`The font or font collection has no variation with the name '${process.argv[3]}'!`);
	} else if (something.objType === 'TTC' || something.objType === 'DFont') {
		console.log('File contains a font collection.');
	} else if (process.argv[3]?.length) {
		console.log('Font variation or font from collection.');
	} else {
		console.log('Single font file.');
	}
} catch(e) {
	console.error(`Not a font file or font collection (${e})!`);
}
```

== ES6
```JavaScript
import * as fs from 'node:fs';
import { fontkit } from '@pdfa-lab/fontkit';

if (process.argv.length < 3) {
	console.error(`Usage: ${process.argv[1]} FONT_OR_COLLECTION`);
	process.exit(1);
}

const bytes = fs.readFileSync(process.argv[2]!);

try {
	const something = fontkit.create(bytes, process.argv[3]);
	if (!something) {
		console.error(`The font or font collection has no variation with the name '${process.argv[3]}'!`);
	} else if (something.objType === 'TTC' || something.objType === 'DFont') {
		console.log('File contains a font collection.');
	} else if (process.argv[3]?.length) {
		console.log('Font variation or font from collection.');
	} else {
		console.log('Single font file.');
	}
} catch(e) {
	console.error(`Not a font file or font collection (${e})!`);
}
```

== CommonJS
```JavaScript
const fs = require('node:fs');
const { fontkit } = require('@pdfa-lab/fontkit');

if (process.argv.length < 3) {
	console.error(`Usage: ${process.argv[1]} FONT_OR_COLLECTION`);
	process.exit(1);
}

const bytes = fs.readFileSync(process.argv[2]!);

try {
	const something = fontkit.create(bytes, process.argv[3]);
	if (!something) {
		console.error(`The font or font collection has no variation with the name '${process.argv[3]}'!`);
	} else if (something.objType === 'TTC' || something.objType === 'DFont') {
		console.log('File contains a font collection.');
	} else if (process.argv[3]?.length) {
		console.log('Font variation or font from collection.');
	} else {
		console.log('Single font file.');
	}
} catch(e) {
	console.error(`Not a font file or font collection (${e})!`);
}
```

:::

That makes more sense, if you look into how the `create()` method is
implemented:

It first tries to identify the file format, from the first couple of bytes.
If that does not yield a positive result, an exception is thrown.

Otherwise, the currently selected object is either a 
[`Font`](/fontkit/api/interfaces/Font) or a
[`FontCollection`](/fontkit/api/interfaces/FontCollection). The code then checks
whether an additional argument was given. If it was then the method
`getFont()` is called. That method is defined for both types. For a
collection, it returns the specified font if it exists. For a single font,
it returns a font variation if it exists.

Under normal circumstance, you probably do not want all that magic to happen.
Instead, you should check your input data, and then call the right constructor.
