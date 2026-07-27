# Tables

The SFNT font format is table-based. Each table is identified by a 4-byte
tag, usually all uppercase or all lowercase ASCII alpabetic characters.
Notable examples or the [`OS/2`](./api/@pdf-lab/namespaces/OS2Table) and the
[`CFF `](./api/@pdf-lab/namespaces/CFFTable/) (note the trailing slash!)
tables.

A table is a binary data structure. `@pdf-lab/fontkit` loads this data
structure lazily. Initially, when a font is loaded, the library only checks
which tables are present in the font directory. They get loaded, and decoded,
when they are first accessed.

The base class of all font formats [`TrueTypeFont`](./api/classes/TrueTypeFont)
therefore defines all tables as nullable, and robust code should always check
for a particular table's existance, before trying to access properties of it.
