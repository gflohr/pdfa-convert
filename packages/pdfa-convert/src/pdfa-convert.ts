import {
	PDFArray,
	PDFDict,
	type PDFDocument,
	PDFName,
	PDFRawStream,
	PDFRef,
} from '@cantoo/pdf-lib';
import type { Encoding, FontInfo } from './font-resolver.js';
import { CMap } from './cmap.js';
import { GlyphExtractor } from './glyph-extractor.js';

/**
 * PDF/A conformance level and version.
 */
export type PDFAStandard = 'PDF/A-1b' | 'PDF/A-2b' | 'PDF/A-3b';

export type FontMap = Record<
	string,
	string | ArrayBuffer | Uint8Array<ArrayBufferLike>
>;

/**
 * These options control the conversion.
 */
export type PDFAConvertOptions = {
	/**
	 * The requested PDF/A conformance level and version, default is 'PDF/A-3b'.
	 */
	standard: PDFAStandard;
};

/**
 * The `PDFAConvert` class is the wrapper around the PDF/A conversion
 * functionality.
 */
export class PDFAConvert {
	private readonly os: string | undefined;
	private readonly fontMap: FontMap = {};
	/**
	 * Instantiate a PDF/A converter.
	 *
	 * @param os the operating system as returned by os.platform() or undefined for the browser
	 * @param fontMap a map of font names to font data
	 */
	constructor(os: string | undefined = undefined, fontMap: FontMap = {}) {
		this.os = os;

		for (const name in fontMap) {
			this.fontMap[name.toLowerCase()] = fontMap[name];
		}
	}

	async convert(
		pdfDoc: PDFDocument,
		options: PDFAConvertOptions = {} as PDFAConvertOptions,
	) {
		options.standard ??= 'PDF/A-3b';

		if (!pdfDoc) {
			throw new Error('No document!');
		}

		const fonts = this.collectFonts(pdfDoc);
		const extractor = new GlyphExtractor();

		const glyphBlocks = extractor.parseDocument(pdfDoc);
		for (let i = 0; i < glyphBlocks.length; ++i) {
			const glyphBlock = glyphBlocks[i];
			const font = fonts[glyphBlock.fontResource];
			let text: string;
			if (typeof font === 'undefined') {
				text = glyphBlock.glyphs.map(() => '\uFFFD').join('');
			} else if (font.cmap) {
				text = glyphBlock.glyphs.map(glyph => font.cmap.lookup(glyph)).join('');
			} else if (font.encoding) {
				throw new Error('TODO! Convert to text with encoding.')
			} else {
				// Hopeless case.
				text = glyphBlock.glyphs.map(() => '\uFFFD').join('');
			}
			console.log(`page ${glyphBlock.pageNumber + 1}: ${text}`);
		}
	}

	private collectFonts(pdfDoc: PDFDocument): Record<string, FontInfo> {
		const fonts: Record<string, FontInfo> = {};
		for (const page of pdfDoc.getPages()) {
			const { Font } = page.node.normalizedEntries();
			for (const [fontName, fontRef] of Font.entries()) {
				if (!(fontRef instanceof PDFRef)) continue;

				const fontDict = pdfDoc.context.lookupMaybe(fontRef, PDFDict);
				if (!fontDict) continue;

				const subtype = fontDict.lookupMaybe(PDFName.of('Subtype'), PDFName);
				if (!subtype) continue;

				const subtypeName = subtype.decodeText();
				if (subtypeName === 'Type0') {
					const info = this.getFontType0Info(
						pdfDoc,
						fontName,
						fontDict,
						fontRef,
					);
					if (info) {
						fonts[fontName.decodeText()] = info;
					}
				} else {
					const info = this.getFontInfo(
						fontName,
						fontDict,
						fontRef
					);
					if (info) {
						fonts[fontName.decodeText()] = info;
					}
				}
			}
		}

		return fonts;
	}

	private getFontInfo(
		fontName: PDFName,
		fontDict: PDFDict,
		fontRef: PDFRef,
	): FontInfo | undefined {
		let embedded = false;
		const fontDescriptor = fontDict.lookup(
			PDFName.of('FontDescriptor'),
			PDFDict,
		);
		if (fontDescriptor) {
			embedded =
				fontDescriptor.has(PDFName.of('FontFile')) ||
				fontDescriptor.has(PDFName.of('FontFile2')) ||
				fontDescriptor.has(PDFName.of('FontFile3'));
		}

		const toUnicodeStream = fontDict.lookup(PDFName.of('ToUnicode'));
		if (!(toUnicodeStream && toUnicodeStream instanceof PDFRawStream)) return;

		const stream = toUnicodeStream.contents;
		const cmap = new CMap(stream);

		return {
			ref: fontRef,
			embedded,
			baseFont: fontName.decodeText(),
			cmap,
			subtype: 'TrueType',
		};
	}

	private getFontType0Info(
		pdfDoc: PDFDocument,
		fontName: PDFName,
		fontDict: PDFDict,
		fontRef: PDFRef,
	): FontInfo | undefined {
		const descendantFonts = fontDict.lookup(PDFName.of('DescendantFonts'));
		if (!(descendantFonts instanceof PDFArray && descendantFonts.size()))
			return;
		const descendantFontRef = descendantFonts.get(0);
		const descendantFontDict = pdfDoc.context.lookupMaybe(
			descendantFontRef,
			PDFDict,
		);
		if (!descendantFontDict) return;

		const descendantFontDescriptor = descendantFontDict.lookup(
			PDFName.of('FontDescriptor'),
			PDFDict,
		);
		if (!descendantFontDescriptor) return;

		const embedded =
			descendantFontDescriptor.has(PDFName.of('FontFile')) ||
			descendantFontDescriptor.has(PDFName.of('FontFile2')) ||
			descendantFontDescriptor.has(PDFName.of('FontFile3'));

		const toUnicodeStream = fontDict.lookup(PDFName.of('ToUnicode'));
		if (!(toUnicodeStream && toUnicodeStream instanceof PDFRawStream)) return;

		const stream = toUnicodeStream.contents;
		const cmap = new CMap(stream);

		return {
			ref: fontRef,
			embedded,
			baseFont: fontName.decodeText(),
			cmap,
			subtype: 'Type0',
		};
	}
}
