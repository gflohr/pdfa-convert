[![licence](https://img.shields.io/badge/licence-WTFPL-blue)](http://www.wtfpl.net/)
[![price](https://img.shields.io/badge/price-FREE-green)](https://github.com/gflohr/pdfa-lab/blob/main/LICENSE)
[![coverage](https://img.shields.io/coverallsCoverage/github/gflohr/pdfa-lab?branch=main)](https://coveralls.io/github/gflohr/pdfa-lab?branch=main)
[![stand with](https://img.shields.io/badge/stand%20with-Ukraine🇺🇦-ffc107)](https://www.standwithukraineeurope.com/en/)
<!-- Disabled until package is documented and published. -->
<!--[![downloads](https://img.shields.io/npm/dw/%40pdfa-lab%2Fcore)](https://www.npmjs.com/package/@pdfa-lab/core)-->
<!--[![documentation](https://img.shields.io/badge/documentation-read-green)](https://gflohr.github.io/pdfa-lab)-->

# PDFA-lab<!--omit-from-toc-->

This project is currently a work in progress. It is a supplement
to the Cantoo fork of [pdf-lib](https://github.com/cantoo-scribe/pdf-lib).

- [PDFA-lab](#pdfa-lab)
	- [Description](#description)
	- [Background](#background)
	- [Status](#status)
	- [`fontkit` Replacement](#fontkit-replacement)
	- [Limitations and Caveats](#limitations-and-caveats)
		- [CJK Scripts](#cjk-scripts)
		- [Non-fixable PDF/A Violations](#non-fixable-pdfa-violations)

## Description

* upgrading regular PDFs to PDF/A-1b, PDF/A-2b, or PDF/A-3b (work in progress)
* replacing/embedding fonts in PDFs
* subsetting fonts in PDFs
* manipulation of XMP metadata in PDFs (work in progress)
* ...

The software is written in TypeScript. It consists of a command-line
interface and a library.

## Background

The original goal of pdfa-lab was to transform standard PDF documents into
PDF/A-compliant files. The PDF/A standard adds a number of constraints to the 
base PDF specification designed to ensure that a document renders identically on
any device at any time. While absolute visual equivalence across all future
soft- and hardware is practically impossible, many legal jurisdictions and 
regulatory bodies still require electronic business documents to be archived as
PDF/A to prevent unintended visual changes over time.

The main constraints that the PDF/A standard defines compared to regular PDFs include:

* **Font Embedding**: All fonts used in the document must be fully embedded or 
  embedded as a subset.

* **Color Device Independence**: All colors must be specified in a 
  device-independent manner using embedded ICC profiles, Output Intents, or 
  standardized color spaces (sRGB, Grayscale).

* **Metadata Requirements**: Documents must contain standardized XMP metadata 
  detailing the specific PDF/A conformance level (e.g., PDF/A-1b, PDF/A-2u, PDF/
  A-3b).

Embedding externally referenced fonts into a PDF is rarely necessary for modern
PDF documents. However, it is by far the most complicated step of the process.
It requires extracting all text, identifying missing or unembedded fonts, and 
re-encoding the text so that replacement fonts can be safely embedded. Because
these individual capabilities are useful on their own, pdfa-lab exposes them as 
standalone routines within the toolchain.

## Status

The toolchain will convert typical business documents to PDF/A. But several
aspects of the PDF/A standard are currently not handled at all. It is, for
example forbidden to reference external images or to encrypt the document.

Feel free to file a bug if you encounter such problems. But in many cases,
the only thing that the tools can do is issue a warning.

## `fontkit` Replacement

In order to embed fonts, the toolchain needs a font manipulation library.
The original dependency
[`@pdf-lib/fontkit`](https://www.npmjs.com/package/@pdf-lib/fontkit)
is unmaintained and known to have bugs that prevent font embedding from
working reliably. The original upstream
[`fontkit`](https://www.npmjs.com/package/fontkit) is only semi-maintained.
Besides, both packages are hard to work with, because they are written in
JavaSCript.

This project contains a drop-in replacement for `fontkit`, see its
[README](./packages/fontkit/README.md). The replacement contains all known
bugfixes for other `fontkit` versions and is ported to fully type-safe
TypeScript.

## Limitations and Caveats

### CJK Scripts

Documents that use CJK scripts will probably not work. If they do not work,
please provide at least one example file that reproduces the issue.

If they work, the author is grateful to hear from you about it.

### Non-fixable PDF/A Violations

As mentioned above, many violations of the PDF/A standard that are either not
fixable at all, or only with a lot of effort, are currently ignored.
