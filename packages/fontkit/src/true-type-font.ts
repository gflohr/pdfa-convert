import { SFNTBaseFont } from './sfnt-base-font';
import type { SFNTDirectory } from './tables/directory';

export interface TrueTypeFont {
	readonly type: 'TTF';
}

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
