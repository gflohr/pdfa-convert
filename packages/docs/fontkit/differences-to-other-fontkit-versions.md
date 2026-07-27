# Differences to Other `fontkit` Versions

## Other Versions

There are a number of other versions of `fontkit` available:

* [`fontkit`](https://www.npmjs.com/package/fontkit), the original fontkit (upstream)
* [`@pdf-lib/fontkit`](https://www.npmjs.com/package/@pdf-lib/fontkit), the
  `fontkit` version used by [`pdf-lib`](https://www.npmjs.com/package/pdf-lib)
* [`@foliojs-fork`](https://www.npmjs.com/package/@foliojs-fork/fontkit),
  a popular fork of the original fontkit

## Notable Differences

The most important differences are:

* **Fully Typed:** Written from the ground up in TypeScript, eliminating the
  need for external `@types/fontkit` definitions.
* **Modernised Module Structure:** Full API exposed via clean named exports
  (`TrueTypeFont`, `TrueTypeCollection`, other individual font classes, etc.),
  alongside a default export for backwards compatibility.
* **Static Format Identifiers:** Font classes and font collections expose a
  `static readonly objType` (e.g., `WOFF2Font.objType === font.objType`) matching
  instance `.objType` properties to enable type-safe format checks without
  string literal guessing.
* **Strongly Typed Font Tables:** Low-level font tables and structures (such
  as [`cmap`](./api/@pdf-lab/namespaces/cmapTable/interfaces/cmap), 
  [`hmtx`](./api/@pdf-lab/namespaces/hmtxTable/interfaces/hmtx),
  [`OS2`](./api/@pdf-lab/namespaces/OS2Table/type-aliases/OS2),
  or [`morx`](./api/@pdf-lab/namespaces/morxTable/interfaces/morx))
  have been refactored into strict, strongly typed interfaces and
  (discriminated) unions.
* **Modern Tooling & Zero Legacy Dependencies:** Updated build pipelines,
  package exports, and test suites targeting modern Node.js runtime
  environments and ESM/CJS dual-package resolution.
* **Ported Bugfixes:** All known bugfixes from the other fontkit versions have
  been ported to `@pdf-lab/fontkit`.
* **Actively Maintained:** This fork will receive regular dependency updated.
  Bugfixes and other pull requests are welcome!
* **Flexible Subset Streaming:** You can use the new and simple
  [`encode()`](./api/classes/Subset.html#encode) or the legacy
  [`encodeStream()`](./api/classes/Subset.html#encodestream) method for
  subset serialisation.

## Incompatibilities

An effort has been made to maintain maximum compatibility with upstream
`fontkit` and other versions. The following known incompatibilities exist:

* All tables in `@pdf-lab/fontkit` are nullable! When you access a table, you
  always have to check whether it is actually present. The hand-crafted
  interfaces for other `fontkit` versions, suggest that some tables like
  `CFF `, `OS/2`, `head`, `hhea`, or `post` are always present, which is by no
  means guaranteed by the library. But the library contains methods that
  elegantly validate font features and cast at the same time so that you
  can safely access certain subsets of tables, see
  [Font Type Narrowing](./tables/font-type-narrowing)!
* The CommonJS module does not have a default export: You have to change
  `const fontkit = require('@pdf-lab/fontkit')` to `const { fontkit } =
  require('@df-lab/fontkit')`.
* The discriminating property `objType` is preferred over `type`.
