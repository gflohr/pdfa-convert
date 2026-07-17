import type { SFNTFont } from './sfnt-font';

/**
 * A file container for multiple {@link SFNTFont} programs.
 */
export interface SFNTFontCollection {
	/**
	 * A lazily loaded array of fonts contained in the collection.
	 */
	fonts: SFNTFont[];

	/**
	 * Get a specific font with a known PostScript name.
	 *
	 * @param postscriptName the PostScript name of the font
	 */
	getFont(postscriptName: string): SFNTFont | null;
}
