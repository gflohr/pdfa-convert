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
