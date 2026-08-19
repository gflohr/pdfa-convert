# About `pdfa-lab`

The `pdfa-lab` toolchain is a software suite for advanced PDF manipulations.
It consists of a command-line interface, a TypeScript/JavaScript library
[`@pdfa-lab/core`](/pdfa-lab-core) and a font processing library
[`@pdfa-lab/fontkit`](/fontkit), based on prior work by
[Devon Gavett](https://github.com/devongavett).

## Features

* Supports upgrading of PDF documents to [PDF/A](https://pdfa.org/) (work in progress).
* Get information about all fonts (embedded and external) used in a PDF.
* Extract text from a PDF.
* Embed external fonts into PDFs as subsets.

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

## About This Documentation

This documentation is a work in progress, and your contributions are highly
welcome! If you spot any factual errors, notice missing sections, or have ideas
for stylistic improvements, please feel free to open an issue or submit a pull
request directly to the [pdfa-lab GitHub
repository](https://github.com/gflohr/pdfa-lab).
