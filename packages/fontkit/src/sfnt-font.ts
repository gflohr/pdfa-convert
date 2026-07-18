import type { TrueTypeFont } from './true-type-font';
import type { WOFFFont } from './woff-font';
import type { WOFF2Font } from './woff2-font';

/**
 * An `SFNTFont` is the union of all TrueType/OpenType font formats. These
 * formats can be discriminated by their `type` property in TypeScript:
 *
 * ```TypeScript
 * function identifyFont(font: SFNTFont) {
 * 	const name = font.fullName;
 *
 *	if (font.type === 'TTF') {
 *		console.log(`${font.name} is a TrueType font.`);
 *	} else if (font.type === 'WOFF2') {
 *		console.log(`${font.name} is a WOFF2 font.`);
 *	} else if (font.type === 'WOFF') {
 *		console.log(`${font.name} is a WOFF font.`);
 *	}
 * ```
 *
 * Inside each of the `if`/`else` branches, TypeScript automatically infers
 * the correct type {@link TrueTypeFont}, {@link WOFF2Font}, or
 * {@link WOFFFont}.
 */
export type SFNTFont = TrueTypeFont | WOFFFont | WOFF2Font;
