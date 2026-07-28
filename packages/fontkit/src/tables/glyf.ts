import * as r from 'restructure';

export namespace glyfTable {
	/**
	 * Glyph Data Table. Stores coordinate boundaries outlining standard
	 * TrueType geometric shapes.
	 */
	export type glyph = Uint8Array[];
}

// Only used for encoding.
/** @internal */
export const glyf = new r.Array(new r.Buffer());
