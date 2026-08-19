import type { PDFDocument } from '@cantoo/pdf-lib';
import { OverlayMapper } from '../encoding/mappers/overlay-mapper.js';
import type { Encoding } from '../encoding/types.js';
import { isStandardEncoding } from '../encoding/util/is-standard-encoding.js';
import { octetsToGlyphIds } from '../encoding/util/octets-to-glyph-ids.js';
import type { FontUsage } from '../font/collect-resources.js';
import type { FontInfo } from '../font/types.js';
import { LiteralParser } from '../parser/literal-parser.js';
import { extractGlyphs } from '../text/extract-glyphs.js';
import { TextBlock } from '../pdfa-lab.js';

/**
 * Extract text from a PDF document. This is best effort, and may not
 * catch all text blocks.
 *
 * @param pdfDoc the input as a PDFDocument
 * @param fonts the fonts used as a `Map` (key: reference, value: `FontInfo`)
 * @param resources the font resources as an array of `FontUsage` objects
 * @returns an array of the text blocks found
 */
export async function extractText(
	pdfDoc: PDFDocument,
	fonts: Map<string, FontInfo>,
	resources: FontUsage[],
): Promise<TextBlock[]> {
	const glyphBlocks = extractGlyphs(pdfDoc);
	const textBlocks: TextBlock[] = [];
	for (const glyphBlock of glyphBlocks) {
		const fontRef = resources[glyphBlock.pageNumber]?.[glyphBlock.fontResource];
		if (!fontRef) continue;

		const font = fonts.get(fontRef.toString());
		if (!font) continue;

		// Select the appropriate mapper.
		const mapper =
			isStandardEncoding(font.encodingMapper.name, true) && font.toUnicodeMapper
				? new OverlayMapper(font.encodingMapper, font.toUnicodeMapper)
				: font.toUnicodeMapper
					? font.toUnicodeMapper
					: font.encodingMapper;

		// Un-escape raw bytes for literal strings BEFORE glyph segmentation.
		let rawOctets: Uint8Array;

		if (glyphBlock.type === 'lstring') {
			const rawArray = Array.from(glyphBlock.glyphs);
			const parsedArray = new LiteralParser(
				font.encodingMapper.name as Encoding,
			).parse(rawArray);
			rawOctets = new Uint8Array(parsedArray);
		} else {
			rawOctets = glyphBlock.glyphs;
		}

		// Segment un-escaped octets into glyph IDs based on mapper byte width.
		const glyphs = octetsToGlyphIds(rawOctets, mapper);

		// Map glyph IDs to Unicode text exactly once.
		const text = glyphs.map((glyph) => mapper.lookup(glyph)).join('');

		textBlocks.push({
			text,
			font,
			pageNumber: glyphBlock.pageNumber,
			glyphs,
		});
	}

	return textBlocks;
}
