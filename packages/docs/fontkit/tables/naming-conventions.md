# Naming Conventions

## Table Accessors

The [`TrueTypeFont`](../api/classes/TrueTypeFont) class is the base class of
all font formats. For each supported table in `@pdf-lab/fontkit`, a property
of the same name (tag) exists. Example:

```TypeScript
const numSubtables = font.cmap?.numSubtables;
```

If this is the first access to the property `cmap`, the table is lazily
loaded.

Because @pdf-lab/fontkit may support more tables in the future, all property
names with four characters are considered reserved. This is the reason, why
the [`type`](../api/classes/TrueTypeFont#properties) property is deprecated
in favour of the [`objType`](../api/classes/TrueTypeFont#properties)
property.

In order to save you from typing `font['CFF ']`, an alias `font.cff` exists.

## Namespaces

For each table a namespace with the table tag followed by `Table` exists.
For example, the `avar` table has the namespace
[`avarTable`](../api/@pdf-lab/namespaces/avarTable/). Inside the namespace,
the actual table object uses the table tag as its name. For example,
the `avar` table object is
[`avarTable.avar`](../api/@pdf-lab/namespaces/avarTable/interfaces/avar).

Consequently, the definition of the `avar` table in the
[`TrueTypeFont`](../api/classes/TrueTypeFont) class looks like this:

```TypeScript
class TrueTypeFont {
	// ...
	public avar: avarTable.avar | null;
	// ...
}
```

Exceptions:

* `OS/2`: The namespace is [`OS2Table`](../api/@pdf-lab/namespaces/OS2Table),
  and the type is [`OS2Table.OS2`](../api/@pdf-lab/namespaces/OS2Table/type-aliases/OS2).
* `cvt `: The namespace is [`cvtTable`](../api/@pdf-lab/namespaces/cvtTable),
  and the interface is [`cvtTable.cvt`](../api/@pdf-lab/namespaces/cvtTable/interfaces/cvt).
* `CFF /cff`: There is a namespace [`CFFTable`](../api/@pdf-lab/namespaces/CFFTable/),
  but the font property `CFF `, and its alias `cff` have the type
  [`CFF1Font`](../api/classes/CFF1Font).
* `CFF2`: There is no namespace `CFF2Table`, and the font property has the type
  [`CFF2Font`](../api/classes/CFF2Font).
  
## `interface` vs `type`

Hint! This section is for TypeScript only!

As a convention, `@pdf-lab` prefers `interface` over `type`. Therefore, all
table objects are by default defined as an `interface`.

However, tables that have different versions are defined as a union type.
For example the [`OS/2`](../api/@pdf-lab/namespaces/OS2Table/type-aliases/OS2)
table is a union:

```TypeScript
export namespace OS2Table {
	// ...
	export type OS2 = OS2V0 | OS2V1 | OS2V2 | OS2V3 | OS2V4 | OS2V5;
}
```
