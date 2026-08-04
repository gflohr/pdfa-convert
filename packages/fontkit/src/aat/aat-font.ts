import type { Font } from '../font.js';
import type { Glyph } from '../glyph/glyph.js';
import type { morxTable } from '../tables/index.js';
import { requiredTrueTypeSubsetTables } from '../true-type-subset-font';

/**
 * Minimal operational capability needed Apple Advanced Typography (AAT).
 */
export const requiredAATTables = [
	'morx',
	...requiredTrueTypeSubsetTables,
] as const;

/**
 * Union type for the items in the {@link requiredAATTables} list.
 */
export type RequiredAATTableTag = (typeof requiredAATTables)[number];

/**
 * Represents an SFNT font containing Apple Advanced Typography (AAT) layout
 * extensions.
 *
 * AAT fonts utilise state machines inside specialized tables (like
 * {@link morxTable.morx | morx}) to handle glyph substitution, contextual
 * tracking, and text reordering, primarily on Apple platforms.
 */
export interface AATFont extends Font {
	getGlyph(glyph: number, characters?: readonly number[]): Glyph;
	getBaseGlyph(glyph: number, characters?: readonly number[]): Glyph;

	morx: morxTable.morx;
}
