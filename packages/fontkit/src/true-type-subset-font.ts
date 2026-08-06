import type { Font } from './font.js';
import type { Glyph } from './glyph/index.js';
import type { hmtxTable } from './tables/hmtx.js';
import type { locaTable } from './tables/loca.js';

/**
 * Minimal operational capability needed to instantiate and run a TrueTypeGlyph.
 * Overrides glyph accessor methods to promise non-null returns.
 */
export const requiredTrueTypeSubsetTables = ['loca', 'hmtx'] as const;

/**
 * Union type for the items in the {@link requiredOpenTypeTables} list.
 */
export type RequiredTrueTypeSubsetTableTag =
	(typeof requiredTrueTypeSubsetTables)[number];

/**
 * TrueType font with verified vector geometry outline components
 * (glyf + loca).
 */
export interface TrueTypeSubsetFont extends Font {
	getGlyph(glyph: number, characters?: readonly number[]): Glyph;
	getBaseGlyph(glyph: number, characters?: readonly number[]): Glyph;

	loca: locaTable.loca;
	hmtx: hmtxTable.hmtx;
}
