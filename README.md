[![licence](https://img.shields.io/badge/licence-WTFPL-blue)](http://www.wtfpl.net/)
[![price](https://img.shields.io/badge/price-FREE-green)](https://github.com/gflohr/pdf-lab/blob/main/LICENSE)
[![coverage](https://img.shields.io/coverallsCoverage/github/gflohr/pdf-lab?branch=main)](https://coveralls.io/github/gflohr/pdf-lab?branch=main)
[![downloads](https://img.shields.io/npm/dw/%40pdf-lab%2Fcore)](https://www.npmjs.com/package/@pdf-lab/core)
[![documentation](https://img.shields.io/badge/documentation-read-green)](https://gflohr.github.io/pdf-lab)
[![help](https://img.shields.io/badge/help-ask--a--question-green)](https://notebooklm.google.com/notebook/f5783dde-ebe6-4610-bac1-f181fdf45f94)
[![stand with](https://img.shields.io/badge/stand%20with-Ukraine🇺🇦-ffc107)](https://www.standwithukraineeurope.com/en/)

# PDF-Lab<!--omit-from-toc-->

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

