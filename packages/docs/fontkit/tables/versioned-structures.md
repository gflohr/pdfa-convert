# Versioned Structures

`@pdfa-lab/fontkit` attempts to fully type all table objects, so that library
users can benefit from type-safety and auto-completion. The types have been
created manually and have errors. Please report any problems at
https://github.com/gflohr/pdfa-lab/issues!

However, a lot of tables or parts of it have changed over time, and they
often use versioning. Different versions have different properties, and this
may disrupt the library user experience, because auto-completion stops,
wherever versions divert.

## General Layout

A typical and simple example is the
[`CPAL`](../api/@pdfa-lab/namespaces/CPALTable):

```TypeScript
export namespace CPALTable {
	export interface ColorRecord {
		blue: number;
		green: number;
		red: number;
		alpha: number;
	}

	export interface CPALHeader {
		numPaletteEntries: number;
		numPalettes: number;
		numColorRecords: number;
		colorRecords: ColorRecord[];
		colorRecordIndices: number[];
	}

	export interface CPALV0 extends CPALHeader {
		version: 0;
	}

	export interface CPALV1 extends CPALHeader {
		version: 1;
		offsetPaletteTypeArray: number[];
		offsetPaletteLabelArray: number[];
		offsetPaletteEntryLabelArray: number[];
	}

	export type CPAL = CPALV0 | CPALV1;
}
```

Starting from the bottom, it is clear that
[`CPAL`](../api/@pdfa-lab/namespaces/CPALTable/type-aliases/CPAL) is a union
type. It is either a
[`CPALV0`](../api/@pdfa-lab/namespaces/CPALTable/interfaces/CPALV0) or a
[`CPALV1`](../api/@pdfa-lab/namespaces/CPALTable/interfaces/CPALV1)
interface.

Each version, extends
[`CPALHeader`](../api/@pdfa-lab/namespaces/CPALTable/interfaces/CPALHeader). In
other words,
[`CPALHeader`](../api/@pdfa-lab/namespaces/CPALTable/interfaces/CPALHeader)
defines the properties that are present in *all* versions.

Both subtypes have a property `version` with a fixed `number` value `0` or `1`.
This is very common but there are some structures, that use other properties
than `version`, for example `format`.

## Discrimination

TypeScript allows discriminating union types, when an appropriate
discriminating property is present. You can then do things like this:

```TypeScript
const cpal = font.CPAL; // `cpal` is a `CPALTable.CPAL` or `null`.
if (cpal) {
	// `cpal` is a `CPALTable.CPAL`, and not `null`!
	console.log(`font has ${cpal.numColorRecords} colour records!`);
	if (cpal.version === 1) {
		// `cpal` is now narrows to `CPALTable.CPALV1`!
		console.log('offsetPaletteTypeArray:');
		console.dir(cpal.offsetPaletteTypeArray);
	}
}
```

If you load this code into your IDE, and move the mouse over variable `cpal`,
you can see how it changes its inferred type. Because of this, you can
access the property `offsetPaletteTypeArray` without a non-null assertion,
because the type has been narrowed to
[`CPALV1`](../api/@pdfa-lab/namespaces/CPALTable/interfaces/CPALV1) inside of
the inner `if` branch.

This feature is called *union discrimination*. It is also used for
[`font type narrowing`](./font-type-narrowing.md).

## Details and Caveats

The condition `cpal.version === 1` is in this case equivalent to
`cpal.version !== 0`. The type
[`CPAL`](../api/@pdfa-lab/namespaces/CPALTable/type-aliases/CPAL) is either a
[`CPALV0`](../api/@pdfa-lab/namespaces/CPALTable/interfaces/CPALV0) or a
[`CPALV1`](../api/@pdfa-lab/namespaces/CPALTable/interfaces/CPALV1). That
means that the version number can only be `0` or `1`.

This is not just a static typing feature. The library guarantees that your code
works without guards against other values for the `version` property.
Decoding simply fails, if it is neither `0` nor `1`.

You can also use `switch` statements:

```TypeScript
const cpal = font.CPAL;
if (cpal) {
	switch(cpal.version) {
		case 0:
			console.log(`font has ${cpal.numColorRecords} colour records!`);
			break;
		case 1:
			console.log(`font has ${cpal.numColorRecords} colour records!`);
			console.log('offsetPaletteTypeArray:');
			console.dir(cpal.offsetPaletteTypeArray);
			break;
	}
}
```

Again, TypeScript is able to narrow the type based on the value of the
discriminating property `version` at compile-time.

However, you cannot use relational operators like `<`, `>`, `<=`, `>=`.
This could actually be possible, but it is not:

```TypeScript
const cpal = font.CPAL;
if (cpal) {
	console.log(`font has ${cpal.numColorRecords} colour records!`);
	if (cpal.version >= 1) {
		console.log('offsetPaletteTypeArray:');
		// Error: The property may not exist.
		console.dir(cpal.offsetPaletteTypeArray);
	}
}
```

The above code would not compile with current TypeScript versions:

```text
Property 'offsetPaletteTypeArray' does not exist on type 'CPAL'.
  Property 'offsetPaletteTypeArray' does not exist on type 'CPALV0'.
```

TypeScript tell you that the variable may be of type
[`CPALV0`](../api/@pdfa-lab/namespaces/CPALTable/interfaces/CPALV0) and that
does not have the property `offsetPaletteTypeArray`. The reasoning behind this
is probably that `version` may have other values like `2` or `3.1415927`.

Maybe, that will change in future TypeScript versions but for the time being,
stick to exact comparisons `===` or `!==`, or use `switch` statements.
