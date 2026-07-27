# Font Type Narrowing

All table properties of a [`TrueTypeFont`](../api/classes/TrueTypeFont) are
marked as nullable. This is different to other versions of `fontkit` where
a mostly arbitrary subset of the supported tables is defined as non-nullable,
although the library does not guarantee that.

This leads to a lot of code like this:

```TypeScript
if (font.cmap) {
	// Do something ...
} else {
	throw new Error('Font lacks the cmap table!');
}


// Modern JavaScript/TypeScript only: Nullish coalescing guards (optional
// chaining):
const familyName = this.name?.records.fullName?.en;
```

## OpenType Fonts

OpenType fonts must have 8 core tables present (see
[`requiredOpenTypeTables`](../api/variables/requiredOpenTypeTables)):

* [`cmap`](../api/@pdf-lab/namespaces/cmapTable/interfaces/cmap)
* [`head`](../api/@pdf-lab/namespaces/headTable/interfaces/head)
* [`hhea`](../api/@pdf-lab/namespaces/hheaTable/interfaces/hhea)
* [`hmtx`](../api/@pdf-lab/namespaces/hmtxTable/interfaces/hmtx)
* [`maxp`](../api/@pdf-lab/namespaces/maxpTable/interfaces/maxp)
* [`name`](../api/@pdf-lab/namespaces/nameTable/type-aliases/name)
* [`OS/2`](../api/@pdf-lab/namespaces/OS2Table/type-aliases/OS2)
* [`post`](../api/@pdf-lab/namespaces/postTable/type-aliases/post)

You can get a font object, where these tables are guaranted to be present
and decodable with the
[`asOpenTypeFont()`](../api/classes/TrueTypeFont#asopentypefont) method:

```TypeScript
const openTypeFont = font.asOpenTypeFont();
if (!openTypeFont) {
	// Fail early and just once!
	throw new Error('Font misses one or more required tables!');
}

// Safely access the font tables without optional chaining!
const numSubtables = openTypeFont.cmap.numSubtables;
```

The method decodes all required OpenType tables, and they can now be accessed
without non-null guards. If one of the required tables is missing or corrupt,
the method returns `null`.

### OpenType Fonts with TrueType Outlines

The type [`OpenTypeFont`](../api/type-aliases/OpenTypeFont) is a union type:

```
export type OpenTypeFont = OpenTypeTrueTypeFont | OpenTypePostscriptFont
	| OpenTypeNoOutlinesFont;
```

An OpenType font with TrueType outlines, also requires the
[`loca`](../api/@pdf-lab/namespaces/locaTable/type-aliases/loca) table. The
[`asOpenTypeFont()`](../api/classes/TrueTypeFont#asopentypefont) method has
already checked for the presence of this type, and you can get an
[`OpenTypeTrueTypeFont`](../api/interfaces/OpenTypeTrueTypeFont) from its
return value without a cast:

```TypeScript
const otFont = font.asOpenTypeFont(); // otFont is an `OpenTypeFont` or `null`.
if (otFont && otFont.outlines === 'TrueType') {
	 // otFont is now an `OpenTypeTrueTypeFont` without a cast. And the `loca`
	 // is guaranteed to exist and be decodable.
	const locaVersion = otFont.loca.version;
}
```

This uses a TypeScript feature called *discriminating unions*. Because the
property [`outlines`](../api/interfaces/OpenTypeTrueTypeFont#outlines) of an
[`OpenTypeTrueTypeFont`](../api/interfaces/OpenTypeTrueTypeFont) has the fixed
value 'TrueType', TypeScript can narrow the type of the variable inside the
`if` branch.

You can try that out in your IDE by hovering the mouse over the variable name
`otFont`. Before the `if` branch, the variable has the type
[`OpenTypeFont`](../api/type-aliases/OpenTypeFont). Inside, it has the type
[`OpenTypeTrueTypeFont`](../api/interfaces/OpenTypeTrueTypeFont).

### OpenType Fonts with PostScript Outlines

You can detect an OpenTypeFont with PostScript outlines in the same fashion.
In fact, [`OpenTypePostScriptFont`](../api/type-aliases/OpenTypePostScriptFont),
is again a union type. If the font has the
[`CFF2`](../api/classes/CFF2Font) table, it is an
[`OpenTypeCFF2Font`](../api/interfaces/OpenTypeCFF2Font). If the font has the 
[`CFF `](../api/classes/CFF1Font) table, it is an
[`OpenTypeCFF1Font`](../api/interfaces/OpenTypeCFF1Font):

```TypeScript
const otFont = font.asOpenTypeFont(); // otFont is an `OpenTypeFont` or `null`.
if (otFont && otFont.outlines === 'PostScript') {
	 // otFont is now an `OpenTypePostScriptFont` without a cast. And either
	 // the `CFF ` or `CFF2` font is guaranteed to exist and be decodable.
	 if (otFont.outlineVersion === 1) {
		// otFont is now an OpenTypeCFF1Font. It has the `CFF ` table.
	 } else {
		// otFont is now an OpenTypeCFF2Font. It has the `CFF2` table.
	 }
}
```

The discriminating property is now the numeric property `outlineVersion`,
which one of the fixed values `1` or `2`.

### OpenTypeFonts without Outlines

There can also be fonts without outline tables. They are of type 
[`OpenTypeNoOutlinesFont`](../api/interfaces/OpenTypeNoOutlinesFont):

```TypeScript
const otFont = font.asOpenTypeFont(); // otFont is an `OpenTypeFont` or `null`.
if (otFont && otFont.outlines === 'none') {
	 // otFont is now an `OpenTypeNoOutlinesFont` without a cast. Neither the
	 // `loca` table, nor `CFF ` or `CFF2` exist.
}
```

## AAT Fonts

AAT (Apple Advanced Typography) fonts must have 3 tables present, see
[`requiredAATTables`](../api/variables/requiredAATTables):

* [`morx`](../api/@pdf-lab/namespaces/morxTable/interfaces/morx)
* [`loca`](../api/@pdf-lab/namespaces/locaTable/interfaces/loca)
* [`hmtx`](../api/@pdf-lab/namespaces/hmtxTable/interfaces/hmtx)

You can validate and cast a
[`TrueTypeFont`](../api/classes/TrueTypeFont) to an
[`AATFont`](../api/interfaces/AATFont) with the method
[`asAATFont`](../api/classes/TrueTypeFont#asaatfont):

```TypeScript
const aatFont = font.asAATFont(); // aatFont is an `AATFont` or `null`.
if (aatFont) {
	 // aatFont is now an `AATFont` without a cast. The `loca`, `hmtx`, and
	 // `morx` tables are guaranteed to exist and be decodable.
	const locaVersion = otFont.loca.version;
}
```

## TrueType Subset Fonts

The minimal set of tables required to instantiate and run a
[`TrueTypeGlyph`](../api/classes/TrueTypeGlyph) are the
[`loca`](../api/@pdf-lab/namespaces/locaTable/interfaces/loca) and
[`hmtx`](../api/@pdf-lab/namespaces/hmtxTable/interfaces/hmtx) tables, see
[`requiredTrueTypeSubsetTables`](../api/variables/requiredTrueTypeSubsetTables).

You can validate and cast a
[`TrueTypeFont`](../api/classes/TrueTypeFont) to a
[`TrueTypeSubsetFont`](../api/interfaces/TrueTypeSubsetFont) with the method
[`asTrueTypeSubsetFont`](../api/classes/TrueTypeFont#astruetypesubsetfont):

```TypeScript
const subsetFont = font.asTrueTypeSubsetFont(); // aatFont is a `TrueTypeSubsetFont` or `null`.
if (subsetFont) {
	 // `subsetFont` is now a `TrueTypeSubsetFont` without a cast. The `loca`
	 // and `hmtx` tables are guaranteed to exist and be decodable.
	const locaVersion = otFont.loca.version;
}
```
