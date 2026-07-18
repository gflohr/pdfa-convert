import { SFNTBaseFont } from './sfnt-base-font';
import type { SFNTDirectory } from './tables/directory';

export interface TrueTypeFont {
	readonly type: 'TTF';
}

/**
 * This is the base class for all SFNT-based font formats in fontkit.
 * It supports TrueType, and PostScript glyphs, and several color glyph formats.
 *
 * It is functionally identical to a {@link SFNTBaseFont} but has the
 * discriminating `type` attribute.
 *
 * @see {@link SFNTFont}
 * @see {@link TrueTypeFont#type}
 * @see {@link WOFFFont#type}
 * @see {@link WOFF2Font#type}
 */
export class TrueTypeFont<
	TDirectory extends SFNTDirectory = SFNTDirectory,
> extends SFNTBaseFont<TDirectory> {
	public readonly type: 'TTF' = 'TTF';
}

/**
 * The class TTFFont is a compatibility alias for {@link TrueTypeFont}
 *
 * @deprecated Use {@link TrueTypeFont} instead!
 */
export class TTFFont extends TrueTypeFont {}
