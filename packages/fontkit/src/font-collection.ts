import type { TrueTypeFont } from './true-type-font';

/**
 * A file container for multiple {@link SFNTFont} programs.
 */
export interface FontCollection {
	/**
	 * A lazily loaded array of fonts contained in the collection.
	 */
	fonts: TrueTypeFont[];

	/**
	 * Get a specific font with a known PostScript name.
	 *
	 * @param postscriptName the PostScript name of the font
	 */
	getFont(postscriptName: string): TrueTypeFont | null;
}
