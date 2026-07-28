import type { TrueTypeFont } from './true-type-font.js';

/**
 * A file container for multiple {@link TrueTypeFont} programs.
 */
export interface FontCollection {
	/**
	 * Identifier for the collection. One of 'TTC' or 'DFont'.
	 */
	readonly objType: 'TTC' | 'DFont';

	/**
	 * @deprecated Use `objType` instead!
	 */
	readonly type: 'TTC' | 'DFont';

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
