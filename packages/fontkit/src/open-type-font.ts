import type { CFF1Font } from './cff/cff1-font.js';
import type { CFF2Font } from './cff/cff2-font.js';
import type { Font } from './font.js';
import type { BoundingBox } from './glyph/bounding-box.js';
import type { Glyph } from './glyph/glyph.js';
import type { SFNTTableMap } from './tables/directory.js';
import type {
	cmapTable,
	headTable,
	hheaTable,
	hmtxTable,
	locaTable,
	maxpTable,
	nameTable,
} from './tables/index.js';

/**
 * The list of strictly required tables for an OpenType font.
 */
export const requiredOpenTypeTables = [
	'cmap',
	'head',
	'hhea',
	'hmtx',
	'maxp',
	'name',
] as const;

/**
 * Union type for the items in the {@link requiredOpenTypeTables} list.
 */
export type RequiredOpenTypeTableTag = (typeof requiredOpenTypeTables)[number];

/**
 * The list of strictly required tables for an OpenType font with TrueType
 * outlines.
 */
export const requiredOpenTypeTrueTypeTables = [
	'loca',
	...requiredOpenTypeTables,
] as const;

/**
 * Union type for the items in the {@link requiredOpenTypeTables} list.
 */
export type RequiredOpenTypeTrueTypeTableTag =
	(typeof requiredOpenTypeTrueTypeTables)[number];

/**
 * The list of strictly required tables for an OpenType font with PostScript
 * outlines, legacy version.
 */
export const requiredOpenTypeCFF1Tables = [
	'CFF ',
	...requiredOpenTypeTables,
] as const;

/**
 * Union type for the items in the {@link requiredOpenTypeCFF1Tables} list.
 */
export type RequiredOpenTypeCFF1TableTag =
	(typeof requiredOpenTypeCFF1Tables)[number];

/**
 * The list of strictly required tables for an OpenType font with PostScript
 * outlines, modern version.
 * @see {@link requiredOpenTypeCFF1Tables} for legacy tables
 */
export const requiredOpenTypeCFF2Tables = [
	'CFF2',
	...requiredOpenTypeTables,
] as const;

/**
 * Union type for the items in the {@link requiredOpenTypeCFF2Tables} list.
 */
export type RequiredOpenTypeCFF2TableTag =
	(typeof requiredOpenTypeCFF2Tables)[number];

/**
 * These are propertiesthat are guaranteed to be defined, if the font has been
 * upcast to an {@link OpenTypeFont}.
 */
interface OpenTypeHeader {
	ascent: number;
	descent: number;
	lineGap: number;
	underlinePosition: number;
	underlineThickness: number;
	italicAngle: number;
	capHeight: number;
	numGlyphs: number;
	unitsPerEm: number;
	boundingBox: Readonly<BoundingBox>;
	bbox: Readonly<BoundingBox>;
}

type OpenTypeHeaderKeys = keyof OpenTypeHeader;

/**
 * OpenType which has all 8 core tables but lacks one or more of the
 * necessary outline tables.
 *
 * @see {@link requiredOpenTypeTables} for the list of required tables.
 */
export interface OpenTypeNoOutlinesFont
	extends Omit<Font, OpenTypeHeaderKeys>,
		OpenTypeHeader {
	/** Discriminator for the different outline types. */
	readonly outlines: 'none';

	readonly outlineVersion: 0;

	cmap: cmapTable.cmap;
	head: headTable.head;
	hhea: hheaTable.hhea;
	hmtx: hmtxTable.hmtx;
	maxp: maxpTable.maxp;
	name: nameTable.name;
}

/**
 * OpenType font with verified TrueType vector geometry outline components
 * (loca + hmtx).
 */
export interface OpenTypeTrueTypeFont
	extends Omit<Font, OpenTypeHeaderKeys>,
		OpenTypeHeader {
	/** Discriminator for the different outline types. */
	readonly outlines: 'TrueType';

	readonly outlineVersion: 1;

	getGlyph(glyph: number, characters?: readonly number[]): Glyph;
	getBaseGlyph(glyph: number, characters?: readonly number[]): Glyph;

	cmap: cmapTable.cmap;
	head: headTable.head;
	hhea: hheaTable.hhea;
	hmtx: hmtxTable.hmtx;
	maxp: maxpTable.maxp;
	name: nameTable.name;
	loca: locaTable.loca;
}

/**
 * OpenType font with verified PostScript Compact Font Format (CFF) components,
 * legacy version.
 */
export interface OpenTypeCFF1Font
	extends Omit<Font, OpenTypeHeaderKeys>,
		OpenTypeHeader {
	/** Discriminator for the different outline types. */
	readonly outlines: 'PostScript';

	/** Discriminator for CFF versions */
	readonly outlineVersion: 1;

	/**
	 * Alias for the structural {@link OpenTypePostScriptFont } `CFF` table.
	 */
	readonly cff: NonNullable<SFNTTableMap['CFF ']>;

	getGlyph(glyph: number, characters?: readonly number[]): Glyph;
	getBaseGlyph(glyph: number, characters?: readonly number[]): Glyph;

	cmap: cmapTable.cmap;
	head: headTable.head;
	hhea: hheaTable.hhea;
	hmtx: hmtxTable.hmtx;
	maxp: maxpTable.maxp;
	name: nameTable.name;
	'CFF ': CFF1Font;
}

/**
 * OpenType font with verified PostScript Compact Font Format (CFF) version
 * 2 components.
 */
export interface OpenTypeCFF2Font
	extends Omit<Font, OpenTypeHeaderKeys>,
		OpenTypeHeader {
	/** Discriminator for the different outline types. */
	readonly outlines: 'PostScript';

	/** Discriminator for CFF versions */
	readonly outlineVersion: 2;

	getGlyph(glyph: number, characters?: readonly number[]): Glyph;
	getBaseGlyph(glyph: number, characters?: readonly number[]): Glyph;

	cmap: cmapTable.cmap;
	head: headTable.head;
	hhea: hheaTable.hhea;
	hmtx: hmtxTable.hmtx;
	maxp: maxpTable.maxp;
	name: nameTable.name;
	CFF2: CFF2Font;
}

/**
 * Discriminated union representing an OpenType font with PostScript
 * outlines.
 */
export type OpenTypePostScriptFont = OpenTypeCFF1Font | OpenTypeCFF2Font;

/**
 * The final Discriminated Union representing any upcast, structurally
 * conformant OpenType font. You will usually get an object implementing
 * the interface with {@link Font.asOpenTypeFont}.
 *
 * Fonts that implement this interface, have all 8 core OpenType tables
 * (@{link requiredOpenTypeTables}) present and successfully decoded.
 *
 * You can discriminate the different sub types in your code like this:
 *
 * ```TypeScript
 * const openTypeFont = font.asOpenTypeFont();
 *
 * if (!openTypeFont) {
 * 	// This font is a legacy font without the complete set of OpenType core
 * 	// tables.
 * } else if (openTypeFont.outlines === 'TrueType') {
 * 	// openTypeFont is now an OpenTypeTrueTypeFont in the scope of this branch.
 * 	// All tables for TrueType outlines are guaranteed to be present.
 * } else if (openTypeFont.outlines === 'PostScript') {
 *  	// openTypeFont is now an OpenTypePostScriptFont in the scope of this branch.
 * 	// All tables for PostScript outlines are guaranteed to be present.
 * } else if (openTypeFont.outlines === 'none') {
 * 	// openTypeFont is now an OpenTypeNoOutlinesFont in the scope of this
 * 	// branch. All 8 OpenType core tables are present.
 * }
 * ```
 */
export type OpenTypeFont =
	| OpenTypeTrueTypeFont
	| OpenTypePostScriptFont
	| OpenTypeNoOutlinesFont;
