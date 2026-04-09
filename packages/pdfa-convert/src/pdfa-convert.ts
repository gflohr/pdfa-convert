import type { PDFDocument } from '@cantoo/pdf-lib';
import type { FontMap } from './font-mapper.js';

/**
 * These options control the conversion.
 */
type ConvertOptions = {
	/**
	 * The requested PDF/A conformance level, default is 'PDF/A-3b'.
	 */
	level: 'PDF/A-1b' | 'PDF/A-2b' | 'PDF/A-3b';
};

/**
 * The `PDFAConvert` class is the wrapper around the PDF/A conversion
 * functionality.
 */
export class PDFAConvert {
	private readonly _os: string | undefined;
	private readonly _fontMap: FontMap;

	/**
	 * Instantiate a PDF/A converter.
	 *
	 * @param os the operating system as returned by os.platform() or undefined for the browser
	 * @param fontMap a map of font names to font data
	 */
	constructor(os: string | undefined = undefined, fontMap: FontMap = {}) {
		this._os = os;
		this._fontMap = fontMap;
	}

	/**
	 * Get the configured operating system or undefined in the browser.
	 */
	get os(): string | undefined {
		return this._os;
	}

	/**
	 * Get the font mapping.
	 */
	get fontMap(): FontMap {
		return this._fontMap;
	}

	async convert(
		pdfDoc: PDFDocument,
		options: ConvertOptions = {} as ConvertOptions,
	) {
		options.level ??= 'PDF/A-3b';
		if (!pdfDoc) console.error('no document');
	}
}
