---
name: repo-fonts
description: >
  Teaches AI agents about the different types of fonts used in PDFs.
---

# PDF Font Types

The PDF specification lists the following font types:

* `Type0`: composite fonts with descendant fonts.
* `Type1`: the legacy Adobe font format.
* `Type3`: a font that defines glyphs with streams of PDF graphics operators
* `TrueType`: Apple's TrueType format
* `CIDFont`: CID fonts either based on `Type1` or `TrueType`

Note that `Type0` fonts in PDFs can only contain one descendant font.

## Font Dictionaries

For each font (resp. subset) a font dictionary shall be present. It includes
properties like the font name, glyph widths and optionally an encoding. It may
also contain a reference (`PDFRef`) to a `FontDictionary` with additional
information.

## Glyph Mapping

For the purposes of pdf-lab, the most important features is to build a
glyph mapper. Possible glyph mappers are:

* A `ToUnicode` CMAP found in a `FontDescriptor` referenced from a font dictionary.
* A pre-defined encoding like `WinAnsiEncoding` or `ZapfDingbatsEncoding`.
* the `StandardEncoding` as a fallback, if no other mapping can be found.

## Standard vs Embedded vs Missing Fonts

The PDF specification stipulates that all conforming PDF viewers must ship with
14 standard fonts:

* Times-Roman
* Times-Bold
* Time-Italic
* Time-BoldItalic
* Courier
* Courier
* Courier-Bold
* Courier-Oblique
* Helvetica®
* Helvetica®-Bold
* Helvetica®-Oblique
* Helvetica®-BoldOblique
* Symbol
* ZapfDingbats

These fonts do not have to be embedded into PDFs.

The by far most common case today are either `TrueType` or `OpenType` font
programs. They may be embedded into the PDF or missing.

In case of missing fonts, PDF viewers differ in behaviour. Adobe Acrobat
seems to not support missing fonts. All characters are rendered as bullet
points but preserving the glyph widths. The visual appearance resembles an
irregular string of black pearls like this:

  • •• •••••  • ••

However, you can still successfully search for text and when you copy and
paste the bullets and paste it into another application, the original text
can be recovered.

Apples "Preview" application displays white text on white background, but
otherwise behave like Adobe Acrobat.

Firefox and Chrome render the text normally falling back to a replacement font,
if the original font is not present.

## Embedded Font Subsets

Font programs often contain definitions for thousands of glyphs and can be
very large in terms of file size. However, the PDF standard allows embedding
only a subset of the font program containing only the glyph definitions that are
actually required for showing the text in question.

## Font Embedding in `@cantoo/pdf-lib`

The 3rd party library `@cantoo/pdf-lib` already provides functionality for
encoding font programs into a PDF. It is also possible to either embed the
entire font program or just a subset of glyphs.

Fonts referenced like this can be used to add new text to a PDF document.
It is not possible, however, to replace an existing font that is not
embedded with an embedded one. This will be a feature that has to be
implemented in `pdf-lab-core`.

Experiments that manipulate PDFs with missing fonts manually show that this
is feasible. The required process differs depending on the type of font:

### PDF Standard Fonts

The 14 standard fonts are usually not embedded in the PDF. What has to be done
is:

1. Determine the family of the font like "Verdana" or "Courier New".
2. Try to find (resolve) the font locally.
3. Determine the glyphs required for the subset by extracting the glyph IDs of each text block using the font.
4. Embed the subset of the font program into the PDF.
5. Add a `FontDescriptor` PDF dictionary for the font if not already present.
6. Insert a reference to the content stream containing the font program binary data.

## Key Takeaways for Agents

* The PDF specification allows a wide range of font programs.
* Fonts can be embedded or can be missing in a PDF.
* PDFs with missing fonts are not fully supported by many PDF viewers.
* It is possible to save space by embedding only a subset of a font.
