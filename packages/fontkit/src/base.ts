import { DFont } from './d-font.js';
import type { FontCollection } from './font-collection.js';
import { TrueTypeCollection } from './true-type-collection.js';
import { TrueTypeFont } from './true-type-font.js';
import { WOFFFont } from './woff-font.js';
import { WOFF2Font } from './woff2-font.js';

export interface FontContainerInstance {
	getFont(postscriptName: string): TrueTypeFont | null;
}

/**
 * Describes the static constructor pattern required to plug a font parser into
 * the engine.
 */
export interface FontContainer {
	/**
	 * The static probing function.
	 * @returns `true` if the input buffer seems to be of the expect type.
	 */
	probe(buffer: Uint8Array): boolean;

	/**
	 * The constructor signature accepting a Restructure `DecodeStream`.
	 */
	new (stream: Uint8Array): FontContainerInstance;
}

const formats: FontContainer[] = [];
const fontFormats = [TrueTypeFont, WOFF2Font, WOFFFont];
const collectionFormats = [TrueTypeCollection, DFont];

/**
 * The factory entry point into the library.
 *
 * Available both as a default import and as the named import `fontkit`.
 * Exception: The CommonJS bundle only has the named import `fontkit`.
 */
export const fontkit = {
	/**
	 * Set to `true` for verbose error logging.
	 */
	logErrors: false,

	/**
	 * The default language to use.
	 */
	defaultLanguage: 'en',

	setDefaultLanguage: (lang = 'en') => {
		fontkit.defaultLanguage = lang;
	},

	/**
	 * Register a new font format.
	 *
	 * @param format
	 *
	 * @deprecated Remove this!
	 * @hidden
	 */
	registerFormat: (format: FontContainer) => {
		formats.push(format);
	},

	/**
	 * Load a font from raw input data. You can either load a
	 * {@link TrueTypeFont}, {@link WOFF2Font}, or {@link @WOFFFont}.
	 * Alternatively, you can pass a {@link TrueTypeCollection} or
	 * {@link DFont} along with the PostScript name of a font inside that
	 * collection.
	 *
	 * That means: The second argument `postscriptName` is mandatory for a
	 * {@link FontCollection} and forbidden for a {@link Font}. Not following
	 * the calling convention will result in an exception!
	 *
	 * The function throws an exception, if the input data is not in a
	 * recognised format.
	 *
	 * @param bytes the raw input data for either a font file or a font collection
	 * @param postscriptName the PostScript name of the font in a collection
	 * @returns a {@link TrueTypeFont}
	 */
	loadFont: (bytes: Uint8Array, postscriptName?: string): TrueTypeFont => {
		if (typeof postscriptName === 'undefined') {
			for (let i = 0; i < fontFormats.length; i++) {
				const format = fontFormats[i];
				if (format.probe(bytes)) {
					const font = new format(bytes);

					return font as TrueTypeFont;
				}
			}
			throw new Error('Not a font file!');
		} else {
			for (let i = 0; i < collectionFormats.length; i++) {
				const format = collectionFormats[i];
				if (format.probe(bytes)) {
					const collection = new format(bytes) as FontCollection;
					const font = collection.getFont(postscriptName);
					if (!font) {
						const fonts = collection.fonts
							.map((f) => `'${f.postscriptName}'`)
							.join(', ');
						throw new Error(
							`Font collection does not contain '${postscriptName}'! Try one of ${fonts} instead!`,
						);
					}

					return font;
				}
			}
			throw new Error('Not a font collection!');
		}
	},

	/**
	 * Load a font collection from raw input data. You can either load a
	 * {@link TrueTypeCollection} or {@link DFont}.

	 * The function throws an exception, if the input data is not in a
	 * recognised format.
	 *
	 * @param bytes the raw input data for the font collection
	 * @returns a {@link FontCollection}
	 */
	loadFontCollection: (bytes: Uint8Array): FontCollection => {
		for (let i = 0; i < collectionFormats.length; i++) {
			const format = collectionFormats[i];
			if (format.probe(bytes)) {
				return new format(bytes);
			}
		}
		throw new Error('Not a font collection!');
	},

	/**
	 * @deprecated Use {@link fontkit.loadFont} or {@link fontkit.loadFontCollection} instead!
	 *
	 * Create an instance of a font or a font collection.
	 *
	 * For a {@link FontCollection}, you may specify the
	 * PostScript name of one of the fonts contained in the collection.
	 * Otherwise, you get the collection itself. You can then get the list
	 * of included fonts with the method `getFonts`.
	 *
	 * If the font is a regular font program file and you specify a PostScript
	 * name, an attempt is made to get a font variation of that name. That is
	 * only possible if:
	 *
	 * 1. The font has an {@link fvarTable.fvar} table.
	 * 2. The font either has a {@link CFFFont | CFF2} table, or it has both a {@link gvarTable.gvar | gvar} and `glyf` table.
	 *
	 * The resolution may still fail if the requested variation is not present
	 * in the font.
	 *
	 * The function is deprecated, because it forces users to check the type
	 * of the returned object. They will normally either expect a font or a font
	 * collection, but not both.
	 *
	 * @param bytes the raw font byte
	 * @param postscriptName the optional PostScript name
	 * @returns the font or font collection
	 *
	 * {@link TrueTypeFont}, {@link WOFFFont}, {@link WOFF2Font},
	 * {@link TrueTypeCollection}, {@link DFont} instead!
	 */
	create: (
		bytes: Uint8Array,
		postscriptName?: string,
	): TrueTypeFont | FontCollection | null => {
		for (let i = 0; i < formats.length; i++) {
			const format = formats[i];
			if (format.probe(bytes)) {
				const font = new format(bytes);
				if (postscriptName) {
					return font.getFont(postscriptName);
				}

				return font as TrueTypeFont | FontCollection;
			}
		}
		throw new Error('Unknown font format');
	},
};
