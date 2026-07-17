# Legacy API

Historically, the only documented entry point into the `fontkit` library was
this:

:::tabs key:language variant:code

== TypeScript
```TypeScript
import * as fs from 'node:fs';
import fontkit from '@pdf-lab/fontkit';

const fontBytes = fs.readFileSync('Helvetica.ttf');
const font = fontkit.create(fontBytes);
console.log(font.fullName);
```

== ES6
```JavaScript
import * as fs from 'node:fs';
import fontkit from '@pdf-lab/fontkit';

const fontBytes = fs.readFileSync('Helvetica.ttf');
const font = fontkit.create(fontBytes);
console.log(font.fullName);
```

== CommonJS
```JavaScript
const fs = require('node:fs');
const fontkit = require('@pdf-lab/fontkit');

const fontBytes = fs.readFileSync('Helvetica.ttf');
const font = fontkit.create(fontBytes);
console.log(font.fullName);
```

:::

The default export has one single documented method `create` which returns
an object that has something to do with fonts.

This usage is still supported for compatibility reasons but it is considered
deprecated.

## What Really Happens!

The library checks the first couple of bytes of the input and tries to
determine the file format from this. Depending on these bytes, it returns one
of these objects:

- a [TrueType font](/fontkit/api/classes/TrueTypeFont)
- a [WOFF font](/fontkit/api/classes/WOFFFont)
- a [WOFF2 font](/fontkit/api/classes/WOFFFont)
- a [TrueType font collection](/fontkit/api/classes/TrueTypeCollection)
- a [legacy Apple data fork font collection/container](/fontkit/api/classes/DFont)

A [TrueType](/fontkit/api/classes/TrueTypeCollection),
[WOFF](/fontkit/api/classes/WOFFFont), and
[WOFF2](/fontkit/api/classes/WOFFFont) font all implement the
[SFNTFont](/fontkit/api/interfaces/SFNTFont) interface, and in fact, WOFF and
WOFF2 fonts are just subclasses of a TrueType font.

On the other hand, a [TrueType font
collection](/fontkit/api/classes/TrueTypeCollection) or a
[legacy Apple data fork font collection/container](/fontkit/api/classes/DFont)
are actually containers for multiple font faces, which support a totally
different interface
[SFNTFontCollection](/fontkit/api/interfaces/SFNTFontCollection). If you pass
data for these formats to
[`fontkit.create()`](/fontkit/api/variables/fontkit#create),
you have to pass the PostScript name of the desired font as a second argument
in order to get back an [SFNTFont](/fontkit/api/interfaces/SFNTFont):

:::tabs key:language variant:code

== TypeScript
```TypeScript
import * as fs from 'node:fs';
import fontkit from '@pdf-lab/fontkit';

const fontBytes = fs.readFileSync('Times.ttc');
const font = fontkit.create(fontBytes, 'Times-Italic');
console.log(font.fullName);
```

== ES6
```JavaScript
import * as fs from 'node:fs';
import fontkit from '@pdf-lab/fontkit';

const fontBytes = fs.readFileSync('Times.ttc');
const font = fontkit.create(fontBytes, 'Times-Italic');
console.log(font.fullName);
```

== CommonJS
```JavaScript
const fs = require('node:fs');
const fontkit = require('@pdf-lab/fontkit');

const fontBytes = fs.readFileSync('Times.ttc');
const font = fontkit.create(fontBytes, 'Times-Italic');
console.log(font.fullName);
```

:::

## Why Deprecated?

If you understand the legacy API, and it is useful for you, go ahead and use
it. There is nothing wrong with it.

However, in most of the cases, you have to know your input data beforehand
in order to use this API correctly. You have to know whether the file contains
a single font or a collection of fonts. And when it is a collection of fonts,
you have to know which of the contained fonts you want to load. And in order
to do so, you have to know the `postscriptName` property of that particular
font.

It could be argued that the probing approach works well for single-font
files. Decoding a regular TrueType `.ttf` file, or a `.woff` or
`.woff2` does not make a difference. They are all decoded into the same
internal structure. On the other hand, these files serve very different
purposes. The WOFF/WOFF2 font format is a web font format, whereas your
operating system will only ship with `.ttf` (or `.otf`) font files.

It all boils down to "know your data". And because parsing font data from
unknown or untrusted sources implies a considerable security risk (see
[Security](/fontkit/introduction/security)), it is considered better to use the specialised
constructors for [TrueType](/fontkit/api/classes/TrueTypeCollection),
[WOFF](/fontkit/api/classes/WOFFFont), or
[WOFF2](/fontkit/api/classes/WOFFFont) fonts, and for the container formats
[`TrueTypeCollection`](/fontkit/api/classes/TrueTypeCollection) and
[`DFont`](/fontkit/api/classes/DFont).
