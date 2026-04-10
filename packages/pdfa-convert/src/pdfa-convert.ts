import { PDFDict, PDFName, PDFRef, type PDFDocument } from '@cantoo/pdf-lib';
import { FontResolver } from './font-resolver.js';

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

type Encoding = 'StandardEncoding' | 'MacRomanEncoding' | 'WinAnsiEncoding'
		| 'MacExpertEncoding';

type FontInfo = {
	baseFont: string;
	ref: PDFRef;
	embedded: boolean;
	encoding?: Encoding;
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
		// For testing, we embed all fonts and not just the missing ones.
		await this.embedFonts(pdfDoc, fonts);
	}

	private async embedFonts(pdfDoc: PDFDocument, fonts: FontInfo[]) {
		const resolver = new FontResolver(this.os, this.fontMap);

		for (let i = 0; i < fonts.length; ++i) {
			console.log(`embedding ${fonts[i].baseFont}`);
			console.log(await resolver.resolve(fonts[i].baseFont));

			if (!fonts[i].encoding) {
				const font = fonts[i];
				const fontDict: PDFDict = pdfDoc.context.lookup(font.ref) as PDFDict;
				const toUnicode = fontDict.lookup(
					PDFName.of('ToUnicode')
				);

				console.dir(toUnicode);
			}
		}
	}

	private collectFonts(pdfDoc: PDFDocument): FontInfo[] {
		const fonts: FontInfo[] = [];
		for (const page of pdfDoc.getPages()) {
			const { Font } = page.node.normalizedEntries();
			for (const [fontName, fontRef] of Font.entries()) {
				if (!(fontRef instanceof PDFRef)) continue;

				const fontDict = pdfDoc.context.lookupMaybe(fontRef, PDFDict);
				if (!fontDict) continue;

				const fontInfo: FontInfo = {
					ref: fontRef
				} as FontInfo;
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
					const encoding = fontDict.lookupMaybe(PDFName.of('Encoding'), PDFName);

					fontInfo.baseFont = baseFontName;
					fontInfo.encoding = encoding as unknown as Encoding;
					fontInfo.embedded = false;
				}

				fonts.push(fontInfo);
			}
		}

		return fonts;
	}
}
