import type { TrueTypeFont } from './true-type-font';

/**
 * A file container for multiple {@link TrueTypeFont} programs.
 */
export interface FontCollection {
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
