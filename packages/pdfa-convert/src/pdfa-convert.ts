import {
	PDFArray,
	PDFDict,
	type PDFDocument,
	PDFName,
	PDFRawStream,
	PDFRef,
} from '@cantoo/pdf-lib';
import type { Encoding, FontInfo } from './font-resolver.js';
import { PDFTextExtractor } from './pdf-text-extractor.js';
import { CMap } from './cmap.js';

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
		console.dir(fonts, { depth: null });
		const extractor = new PDFTextExtractor();

		const textBlocks = extractor.parseDocument(pdfDoc);
		console.dir(textBlocks);
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

				const fontInfo: FontInfo = {
					ref: fontRef,
				} as FontInfo;

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
					continue;
				} else if (subtypeName === 'TrueType') {
					const info = this.getFontTrueTypeInfo(
						pdfDoc,
						fontName,
						fontDict,
						fontRef
					);
					if (info) {
						fonts[fontName.decodeText()] = info;
					}
					continue;
				}

				const descriptor = fontDict.lookupMaybe(
					PDFName.of('FontDescriptor'),
					PDFDict,
				);
				if (descriptor) {
					if (!descriptor.has(PDFName.of('FontName'))) continue;
					const name = descriptor.lookup(PDFName.of('FontName'), PDFName);
					if (!name) continue;
					fontInfo.baseFont = name.decodeText();

					fontInfo.embedded =
						descriptor.has(PDFName.of('FontFile')) ||
						descriptor.has(PDFName.of('FontFile2')) ||
						descriptor.has(PDFName.of('FontFile3'));
				} else {
					// Standard font.
					const baseFont = fontDict.lookup(PDFName.of('BaseFont'), PDFName);
					const baseFontName = baseFont?.decodeText() ?? fontName.decodeText();
					const encoding = fontDict.lookupMaybe(
						PDFName.of('Encoding'),
						PDFName,
					);

					fontInfo.baseFont = baseFontName;
					fontInfo.encoding = encoding as unknown as Encoding;
					fontInfo.embedded = false;
				}

				fonts[fontName.decodeText()] = fontInfo;
			}
		}

		return fonts;
	}

	private getFontTrueTypeInfo(
		pdfDoc: PDFDocument,
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
