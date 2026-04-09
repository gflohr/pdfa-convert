import type { PDFDocument } from '@cantoo/pdf-lib';

type FontMap = Record<
	string,
	string | ArrayBuffer | Uint8Array<ArrayBufferLike>
>;

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

	async convert(pdfDoc: PDFDocument) {
		if (!pdfDoc) console.error('no document');
	}
}
