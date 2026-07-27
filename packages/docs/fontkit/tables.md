# Tables

The SFNT font format is table-based. Each table is identified by a 4-byte
tag, usually all uppercase or all lowercase ASCII alphabetic characters.
Notable examples are the [`OS/2`](./api/@pdf-lab/namespaces/OS2Table) and the
[`CFF `](./api/@pdf-lab/namespaces/CFFTable/) (note the trailing space!)
tables.

A table is a binary data structure. `@pdf-lab/fontkit` loads this data
structure lazily. Initially, when a font is loaded, the library only checks
which tables are present in the font table directory. They get loaded and
decoded, when they are first accessed.

The base class of all font formats [`TrueTypeFont`](./api/classes/TrueTypeFont)
therefore defines all tables as nullable, and robust code should always check
for a particular table's existence, before trying to access its properties.

It should be mentioned that some large tables are not fully decoded when
accessed. Parts of these tables, usually bulk data, may be loaded lazily, when
the corresponding substructures are accessed.
