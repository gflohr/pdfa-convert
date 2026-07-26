# Font Collections

## `.dfont` vs. `.ttc` (TrueType Collection)

While both formats serve the same high-level purpose—packing multiple related
fonts (like Regular, Italic, and Bold variations) into a single file
container - they achieve this using completely different file architectures.

## TrueType Collection (`.ttc`)

A TrueType Collection is an official, cross-platform extension of the
OpenType/TrueType specification.

* **How it works**: It uses a single unified binary file structure. It begins
  with a global header containing a table directory that points to the
  individual fonts nested inside.
* **The Magic (Font Sharing)**: If multiple fonts in the collection share
  identical glyph data (for example, the letter "A" looks exactly the same in
  regular and medium weights), the `.ttc` container points both fonts to the
  exact same byte locations in the file.
* **The Benefit**: This data deduplication dramatically reduces file sizes,
  making it very efficient.

## Apple Data Fork Font (`.dfont`)

A `.dfont` file is a legacy, macOS-specific container format introduced during
the transition to Mac OS X to move old classic Mac font data out of the
system's "Resource Fork" and into the standard data fork.

* **How it works**: Architecturally, a .dfont file is not actually a native
  font structure; it is a classic Mac Resource Manager file database stored in
  a standard file layout. Inside this database, individual, fully
  self-contained TrueType files are stored as separate resources (`sfnt`
  resource types).
* **No Sharing**: Unlike a `.ttc`, a `.dfont` file features zero table
  deduplication or smart glyph sharing between fonts. If three fonts inside a
  `.dfont` share identical data, that data is duplicated three times.
* **The Downside**: It is a legacy platform wrapper. Because it relies on the
  old Apple Resource Manager map headers, it is virtually unparseable by
  non-Apple native font engines without specialized unpacking logic.

## How `@pdf-lab/fontkit` Handles Them

`@pdf-lab/fontkit` abstracts away these underlying structural differences
completely. Whether you open a modern cross-platform `.ttc` or a legacy Apple
`.dfont`, the engine parses the structural file tables/resource maps into a
[unified collection API](/fontkit/api/interfaces/FontCollection), letting you
query, list, and extract the individual nested font faces using identical
methods.
