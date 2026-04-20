import {
	isStandardFont,
	PDFArray,
	PDFDict,
	type PDFDocument,
	PDFName,
	PDFRawStream,
	type PDFRef,
} from '@cantoo/pdf-lib';
import { CMapMapper } from '../encoding/mappers/cmap-mapper.js';
import {
	type Encoding,
	type FontInfo,
	FontResolver,
	type FontSubtype,
} from '../font/font-resolver.js';
import { GlyphExtractor } from '../pdf/glyph-extractor.js';
import { SingleByteEncodingMapper } from '../encoding/mappers/single-byte-encoding-mapper.js';

/**
 * The `TextExtractor` implements text extraction from PDF documents.
 */
export class TextExtractor {
	async extract(pdfDoc: PDFDocument,) {
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
			} else if (font.cmapMapper) {
				const cmapMapper = font.cmapMapper;
				text = glyphBlock.glyphs.map((glyph) => cmapMapper.lookup(glyph)).join('');
			} else if (font.encoding) {
				const mapper = new SingleByteEncodingMapper(font.encoding);
				text = glyphBlock.glyphs.map((glyph) => mapper.lookup(glyph)).join('');
			} else {
				// Hopeless case.
				text = glyphBlock.glyphs.map(() => '\uFFFD').join('');
			}
			console.log(`page ${glyphBlock.pageNumber + 1}: ${text}`);
		}
	}

	// FIXME! This must be moved to a FontCollector class.
	private collectFonts(pdfDoc: PDFDocument): Record<string, FontInfo> {
		const fonts: Record<string, FontInfo> = {};
		for (const page of pdfDoc.getPages()) {
			const { Font } = page.node.normalizedEntries();
			for (const [fontName, fontRef] of Font.entries()) {
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
						fontRef as PDFRef,
					);
					if (info) {
						fonts[fontName.decodeText()] = info;
					}
				} else {
					const info = this.getFontInfo(
						subtypeName,
						fontName,
						fontDict,
						fontRef as PDFRef,
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
		subtypeName: string,
		fontName: PDFName,
		fontDict: PDFDict,
		fontRef: PDFRef,
	): FontInfo | undefined {
		let embedded = false;
		const fontDescriptor = fontDict.lookupMaybe(
			PDFName.of('FontDescriptor'),
			PDFDict,
		);
		if (fontDescriptor) {
			embedded =
				fontDescriptor.has(PDFName.of('FontFile')) ||
				fontDescriptor.has(PDFName.of('FontFile2')) ||
				fontDescriptor.has(PDFName.of('FontFile3'));
		}

		const fontInfo: FontInfo = {
			ref: fontRef,
			embedded,
			baseFont: fontName.decodeText(),
			subtype: subtypeName as FontSubtype,
		};

		const toUnicodeStream = fontDict.lookup(PDFName.of('ToUnicode'));
		if (toUnicodeStream && toUnicodeStream instanceof PDFRawStream) {
			const stream = toUnicodeStream.contents;
			fontInfo.cmapMapper = new CMapMapper(stream);
		}

		const encoding = fontDict.lookup(PDFName.of('Encoding'));
		if (encoding) {
			const encodingName = (encoding as PDFName).decodeText();
			if (FontResolver.isStandardEncoding(encodingName)) {
				fontInfo.encoding = encodingName as Encoding;
			}
		} else {
			const baseFont = fontDict.lookupMaybe(PDFName.of('BaseFont'), PDFName);
			if (baseFont && isStandardFont(baseFont.decodeText())) {
				const baseFontName = baseFont.decodeText();
				if (baseFontName === 'Symbol') {
					fontInfo.encoding = 'SymbolEncoding';
				} else if (baseFontName === 'ZapfDingbats') {
					fontInfo.encoding = 'ZapfDingbatsEncoding';
				} else {
					fontInfo.encoding = 'StandardEncoding';
				}
			}
		}

		return fontInfo;
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
		const cmapMapper = new CMapMapper(stream);

		return {
			ref: fontRef,
			embedded,
			baseFont: fontName.decodeText(),
			cmapMapper,
			subtype: 'Type0',
		};
	}
}
