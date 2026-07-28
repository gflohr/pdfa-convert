import * as r from 'restructure';

export namespace glyfTable {
	/**
	 * Glyph Data Table. Describes TrueType glyph outlines, including contour
	 * coordinates, composite glyph components, and hinting instructions.
	 */
	export type glyph = Uint8Array[];
}

// Only used for encoding.
/** @internal */
export const glyf = new r.Array(new r.Buffer());
