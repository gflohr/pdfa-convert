# Basic Usage

## Load a Font 
You can load a font file like this:

:::tabs key:language variant:code

== TypeScript
```TypeScript
import * as fs from 'node:fs';
import { TrueTypeFont } from '@pdfa-lab/fontkit';

const bytes = fs.readFileSync('Helvetica.ttf');
const font = new TrueTypeFont(bytes);
// Do something with the font.
```

== ES6
```JavaScript
import * as fs from 'node:fs';
import { TrueTypeFont } from '@pdfa-lab/fontkit';

const bytes = fs.readFileSync('Helvetica.ttf');
const font = new TrueTypeFont(bytes);
// Do something with the font.
```

== CommonJS
```JavaScript
const fs = require('fs');
const { TrueTypeFont } = require('@pdfa-lab/fontkit');

const bytes = fs.readFileSync('Helvetica.ttf');
const font = new TrueTypeFont(bytes);
// Do something with the font.
```

== UMD
```JavaScript
const fontkit = window.fontkit;

window.fetch('Helvetica.ttf')
	.then(response => {
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		return response.arrayBuffer();
	})
	.then(buffer => {
		const fontData = new Uint8Array(buffer);
		// The UMD package only features the legacy API!
		const font = fontkit.create(fontData);
	})
	.catch(error => console.error('Error loading font:', error));
```

:::

Note that for UMD builds, you can only access the default export `fontkit` but no
utility exports like [`BoundingBox`](../../api/classes/BoundingBox) or
[`Glyph`](../../api/classes/Glyph). This constraint is an
intentional architectural design choice to preserve the legacy
`window.fontkit.create()` global API footprint for backward compatibility.

If you require standalone browser access to those individual helper classes,
please use a modern module bundler instead of relying on raw UMD script
injections. Alternatively, file a pull request that removes this limitation.

## Metadata 

Various getters for querying metadata exist:

* [`font.postscriptName`](../api/classes/TrueTypeFont#postscriptname) - the
  font's unique PostScript name, for example "NotoSans-Regular"
* [`font.fullName`](../api/classes/TrueTypeFont#fullname) - the font's full
  name, for example "Noto Sans Regular"
* [`font.familyName`](../api/classes/TrueTypeFont#familyname) - the font's
  family name, for example "Noto Sans Regular"
* [`font.subfamilyName`](../api/classes/TrueTypeFont#subfamilyname) - the
  font's subfamily name, for example "Regular"
* [`font.copyright`](../api/classes/TrueTypeFont#copyright) - the font's
  legal blurb, for example "Copyright (C) by Acme Ltd."
* [`font.version`](../api/classes/TrueTypeFont#version) - the font's version,
  for example "v1.2.3"

All of these properties may be `null`!

## Metrics

* [`font.unitsPerEm`](../api/classes/TrueTypeFont#unitsperem) -
   the size of the font’s internal coordinate grid
* [`font.ascent`](../api/classes/TrueTypeFont#ascent) - the font’s
  [ascender](http://en.wikipedia.org/wiki/Ascender_(typography))
* [`font.descent`](../api/classes/TrueTypeFont#descent) - the font’s
  [descender](http://en.wikipedia.org/wiki/Descender
* [`font.lineGap`](../api/classes/TrueTypeFont#linegap) - the amount of space that
  should be included between lines
* [`font.underlinePosition`](../api/classes/TrueTypeFont#underlineposition) - the
  offset from the normal underline position that should be used
* [`font.underlineThickness`](../api/classes/TrueTypeFont#underlinethickness) - the
  weight of the underline that should be used
* [`font.italicAngle`](../api/classes/TrueTypeFont#italicangle) - if this is an
  italic font, the angle the cursor should be drawn at to match the font design
* [`font.capHeight`](../api/classes/TrueTypeFont#capheight) - the height of capital
  letters above the baseline. See here for more details.
* [`font.xHeight`](../api/classes/TrueTypeFont#xheight) - the height of lower case
  letters. See [this Wikipedia entry](http://en.wikipedia.org/wiki/X-height)
  for more details.
* [`font.boundingBox`](../api/classes/TrueTypeFont#boundingbox) - the font’s
  bounding box, i.e. the box that encloses all glyphs in the font

## Other Properties

* [`font.numGlyphs`](../api/classes/TrueTypeFont#numglyphs) -
  the number of glyphs in the font
* [`font.characterSet`](../api/classes/TrueTypeFont#characterset) -
  an array of all of the unicode code points supported by the font
* [`font.availableFeatures`](../api/classes/TrueTypeFont#availablefeatures) -
   an array of
   [OpenType features](../api/@pdfa-lab/namespaces/OpenType/interfaces/Feature)

## Character to Glyph Mapping

Fontkit includes several methods for character to glyph mapping, including
support for advanced OpenType and AAT substitutions.

* [`font.glyphForCodePoint(codepoint)`](../api/classes/TrueTypeFont#glyphforcodepoint) -
  Maps a single unicode code point (number) to a Glyph object. Does not perform
  any advanced substitutions (there is no context to do so).
* [`font.hasGlyphForCodePoint(codepoint)`](../api/classes/TrueTypeFont#hasglyphforcodepoint) -
  Returns whether there is glyph in the font for the given unicode code point.
* [`font.glyphsForString(text)`](../api/classes/TrueTypeFont#glyphsforstring) -
  This method returns an array of [`Glyph`](../api/classes/Glyph) objects for
  the given string. This is only a one-to-one mapping from characters to
  glyphs. For most uses, you should use
  [`font.layout()`](../api/classes/TrueTypeFont#layout), which provides a much
  more advanced mapping supporting AAT and OpenType shaping.
* [`font.getGlyph(glyph_id, codepoints = [])`](../api/classes/TrueTypeFont#getglyph) -
  Returns a glyph object for a given glyph id that has been determined in
  another way. You can pass the array of code points this glyph represents for
  your use later, and it will be stored in the glyph object.

## Glyph Metrics and Layout

* [`font.widthOfGlyph(glyph_id)`](../api/classes/TrueTypeFont#widthofglyph) -
  Returns the advance width for a single glyph id.
* [`font.layout(string, features)`](../api/classes/TrueTypeFont#layout) -
  Returns a [`GlyphRun`](../api/classes/GlyphRun.md) object, which includes an
  array of [`Glyph`](../api/classes/Glyph.md)s and
  [`GlyphPosition`](../api/classes/GlyphPosition.md)s for the given string. 

## Variation Fonts

Fontkit has support for AAT variation fonts, where glyphs can adjust their
shape according to user defined settings along various axes including weight,
width, and slant. Font designers specify the minimum, default, and maximum
values for each axis they support, and allow the user fine grained control over
the rendered text.

* [`font.variationAxes`](../api/classes/TrueTypeFont#variationaxes) -
  Returns an object describing the available variation axes. Keys are 4 letter
  axis tags, and values include `name`, `min`, `default`, and `max` properties
  for the axis.

* [`font.namedVariations`](../api/classes/TrueTypeFont#namedVariations) - The
  font designer may have picked out some variations that they think look
  particularly good, for example a light, regular, and bold weight which would
  traditionally be separate fonts. This property returns an object describing
  these named variation instances that the designer has specified. Keys are
  variation names, and values are objects with axis settings.

* [`font.getVariation(variation)`](../api/classes/TrueTypeFont#namedVariations) -
  Returns a new font object representing this variation, from which you can
  get glyphs and perform layout as normal. The variation parameter can either
  be a variation settings object or a string variation name. Variation settings
  objects have axis names as keys, and numbers as values (should be in the
  range specified by font.variationAxes).

## Font Collections

For font collection files that contain multiple fonts in a single file, such
as TrueType Collection (`.ttc`) and Datafork TrueType (`.dfont`) files, a font
collection object can be returned by Fontkit.

* [`collection.getFont(postscriptName)`](../api/interfaces/FontCollection#getfont) -
  Gets a font from the collection by its postscript name. Returns a
  [`TrueTypeFont`](../api/classes/TrueTypeFont.md )object.
* [`collection.fonts`](../api/interfaces/FontCollection#fonts) -
  This property is a lazily-loaded array of all of the fonts in the collection.

## Glyph Objects

Glyph objects represent a glyph in the font. They have various properties for
accessing metrics and the actual vector path the glyph represents, and methods
for rendering the glyph to a graphics context.

You do not create glyph objects directly. They are created by various methods
on the font object, described above. There are several subclasses of the base
[`Glyph`](../api/classes/Glyph) class internally that may be returned depending
on the font format, but they all include the following API.

### Properties

* [`id`](../api/classes/Glyph#id) - the glyph id in the font
* [`name`](../api/classes/Glyph#name) - the glyph name in the font
* [`codePoints`](../api/classes/Glyph#codePoints) - an array of unicode code
  points that are represented by this glyph. There can be multiple code points
  in the case of ligatures and other glyphs that represent multiple visual
  characters.
* [`path`](../api/classes/Glyph#path) - a vector Path object representing the
  glyph.
* [`bbox`](../api/classes/Glyph#bbox) - the glyph’s bounding box, i.e. the
  rectangle that encloses the glyph outline as tightly as possible.
* [`cbox`](../api/classes/Glyph#cbox) - the glyph’s control box. This is often the
  same as the bounding box, but is faster to compute. Because of the way
  bezier curves are defined, some of the control points can be outside of
  the bounding box. Where bbox takes this into account, cbox does not. Thus,
  cbox is less accurate, but faster to compute. See
  [this
  documentation](http://www.freetype.org/freetype2/docs/glyphs/glyphs-6.html#section-2)
  for a more detailed description.
* [`advanceWidth`](../api/classes/Glyph#advancewidth) - the glyph’s advance width.

## Color Glyphs (e.g. emoji)

Fontkit has support for several different color emoji font formats. Currently, these include Apple’s SBIX table (as used by the “Apple Color Emoji” font), and Microsoft’s COLR table (supported by Windows 8.1). Here is an overview of the various color font formats out there.

* [`glyph.getImageForSize(size)`](../api/classes/SBIXGlyph#getimageforsize) -
  For SBIX glyphs, which are bitmap based, this returns an object containing
  some properties about the image, along with the image data itself (usually PNG).

* [`glyph.layers`](../api/classes/COLRGlyph#layers) - For COLR glyphs, which
  are vector based, this returns an array of objects representing the glyphs
  and colors for each layer in render order.

## Path Objects

Path objects are returned by glyphs and represent the actual vector outlines
for each glyph in the font. Paths can be converted to SVG path data strings, or
to functions that can be applied to render the path to a graphics context.

* [`path.moveTo(x, y)`](../api/classes/Path#moveto) - Moves the virtual pen to
  the given `x`, `y` coordinates.
* [`path.lineTo(x, y)`](../api/classes/Path#lineto) - Adds a line to the path
  from the current point to the given `x`, `y` coordinates.
* [`path.quadraticCurveTo(cpx, cpy, x, y)`](../api/classes/Path#quadraticcurveto)
  Adds a quadratic curve to the path from the current point to the given `x`,
  `y` coordinates using `cpx`, `cpy` as a control point.
* [`path.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y)`](../api/classes/Path#beziercurveto) -
  Adds a bezier curve to the path from the current point to the given `x`, `y`
  coordinates using `cp1x`, `cp1y` and `cp2x`, `cp2y` as control points.
* [`path.closePath()`](../api/classes/Path#closepath) - Closes the current
  sub-path by drawing a straight line back to the starting point.
* [`path.toFunction()`](../api/classes/Path#tofunction) - Compiles the path to
  a JavaScript function that can be applied with a graphics context in order
  to render the path.
* [`path.toSVG()`](../api/classes/Path#tosvg) - Converts the path to an SVG
  path data string.
* [`path.bbox`](../api/classes/Path#bbox) - This property represents the
  path’s bounding box, i.e. the smallest rectangle that contains the entire
  path shape. This is the exact bounding box, taking into account control
  points that may be outside the visible shape.
* [`path.cbox`](../api/classes/Path#) - This property represents the path’s
  control box. It is like the bounding box, but it includes all points of the
  path, including control points of bezier segments. It is much faster to
  compute than the real bounding box, but less accurate if there are control
  points outside of the visible shape.

## Subsets

Fontkit can perform font subsetting, i.e. the process of creating a new font
from an existing font where only the specified glyphs are included. This is
useful to reduce the size of large fonts, such as in PDF generation or for web
use.

Currently, subsets produce minimal fonts designed for PDF embedding that may
not work as standalone files. They have no cmap tables and other essential
tables for standalone use.

You create a Subset object by calling
[`font.createSubset()`](../api/classes/TrueTypeFont#createsubset). The API on
[`Subset`](../api/classes/Subset) objects is as follows.

* [`subset.includeGlyph(glyph_or_glyph_id)`](../api/classes/Subset#includeglyph) 
  Includes the given glyph object or glyph ID in the subset.

* [`subset.encode()`](../api/classes/Subset#encode) - Returns a `Uint8Array` 
  containing the encoded font file.
