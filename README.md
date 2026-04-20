# PDF-Lab

This project is currently a work in progress. It is a supplement
to the Cantoo fork of [pdf-lib](https://github.com/cantoo-scribe/pdf-lib).

In the future, it will hopefully help with these things:

* upgrading regular PDFs to PDF/A-1b, PDF/A-2b, or PDF/A-3b
* replacing/embedding fonts in PDFs
* subsetting fonts in PDFs
* manipulation of XMP metadata in PDFs
* allow access to the Adobe Glyph List Specification
* ...

The software is written in TypeScript. It consists of a command-line
interface and a library.

## Current State

### Text Extraction

The software can extract text from many, but not all PDFs:

```
pnpm install
cd apps/cli
pnpm start:dev text PATH_TO_PDF
```

Missing:

* Encodings with "differences".

Documents using legacy CJL fonts/encodings may work or not.

