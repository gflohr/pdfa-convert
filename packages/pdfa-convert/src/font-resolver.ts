import { isStandardFont, StandardFonts } from '@cantoo/pdf-lib';
import { FontLoader } from './font-loader.js';

export type FontMap = Record<
	string,
	string | ArrayBuffer | Uint8Array<ArrayBufferLike>
>;

export type FontCategory =
	| 'sans'
	| 'serif'
	| 'mono'
	| 'symbol'
	| 'zapfdingbats';
export type FontWeight = 'normal' | 'bold';
export type FontStyle = 'roman' | 'italic';
export type FontDescription = {
	category: FontCategory;
	weight: FontWeight;
	style: FontStyle;
	standardName?: StandardFonts;
};

const FontDescriptionByName: Record<string, FontDescription> = {
	helvetica: {
		category: 'sans',
		weight: 'normal',
		style: 'roman',
		standardName: StandardFonts.Helvetica,
	},
	'helvetica-oblique': {
		category: 'sans',
		weight: 'normal',
		style: 'italic',
		standardName: StandardFonts.HelveticaOblique,
	},
	'helvetica-bold': {
		category: 'sans',
		weight: 'bold',
		style: 'roman',
		standardName: StandardFonts.HelveticaBold,
	},
	'helvetica-boldoblique': {
		category: 'sans',
		weight: 'bold',
		style: 'italic',
		standardName: StandardFonts.HelveticaBoldOblique,
	},
	timesroman: {
		category: 'serif',
		weight: 'normal',
		style: 'roman',
		standardName: StandardFonts.TimesRoman,
	},
	'timesroman-italic': {
		category: 'serif',
		weight: 'normal',
		style: 'italic',
		standardName: StandardFonts.TimesRomanItalic,
	},
	'timesroman-bold': {
		category: 'serif',
		weight: 'bold',
		style: 'roman',
		standardName: StandardFonts.TimesRomanBold,
	},
	'timesroman-bolditalic': {
		category: 'serif',
		weight: 'bold',
		style: 'italic',
		standardName: StandardFonts.TimesRomanBoldItalic,
	},
	courier: {
		category: 'mono',
		weight: 'normal',
		style: 'roman',
		standardName: StandardFonts.Courier,
	},
	'courier-oblique': {
		category: 'mono',
		weight: 'normal',
		style: 'italic',
		standardName: StandardFonts.CourierOblique,
	},
	'courier-bold': {
		category: 'mono',
		weight: 'bold',
		style: 'roman',
		standardName: StandardFonts.CourierBold,
	},
	'courier-boldoblique': {
		category: 'mono',
		weight: 'bold',
		style: 'italic',
		standardName: StandardFonts.CourierBoldOblique,
	},
	symbol: {
		category: 'symbol',
		weight: 'normal',
		style: 'roman',
		standardName: StandardFonts.Symbol,
	},
	zapfdingbats: {
		category: 'zapfdingbats',
		weight: 'normal',
		style: 'roman',
		standardName: StandardFonts.ZapfDingbats,
	},
};

const FontMatrix: Record<
	FontCategory,
	Record<FontWeight, Record<FontStyle, string>>
> = {
	sans: {
		normal: {
			roman: 'helvetica',
			italic: 'helvetica-oblique',
		},
		bold: {
			roman: 'helvetica-bold',
			italic: 'helvetica-boldoblique',
		},
	},
	serif: {
		normal: {
			roman: 'times-roman',
			italic: 'times-italic',
		},
		bold: {
			roman: 'times-bold',
			italic: 'times-bolditalic',
		},
	},
	mono: {
		normal: {
			roman: 'courier',
			italic: 'courier-oblique',
		},
		bold: {
			roman: 'courier-bold',
			italic: 'courier-boldoblique',
		},
	},
	symbol: {
		normal: {
			roman: 'symbol',
			italic: 'symbol',
		},
		bold: {
			roman: 'symbol',
			italic: 'symbol',
		},
	},
	zapfdingbats: {
		normal: {
			roman: 'zapfdingbats',
			italic: 'zapfdingbats',
		},
		bold: {
			roman: 'zapfdingbats',
			italic: 'zapfdingbats',
		},
	},
};

const FontFamilyAliases: Record<string, FontCategory> = {
	// Sans-serif.
	arial: 'sans',
	helvetica: 'sans',
	liberationsans: 'sans',
	'dejavu sans': 'sans',
	dejavusans: 'sans',
	calibri: 'sans',
	verdana: 'sans',
	tahoma: 'sans',
	segoeui: 'sans',
	roboto: 'sans',
	opensans: 'sans',
	'noto sans': 'sans',
	notosans: 'sans',
	// Serif.
	times: 'serif',
	timesnewroman: 'serif',
	'times new roman': 'serif',
	georgia: 'serif',
	garamond: 'serif',
	palatino: 'serif',
	bookantiqua: 'serif',
	cambria: 'serif',
	liberationserif: 'serif',
	'noto serif': 'serif',
	notoserif: 'serif',
	// Monospace.
	courier: 'mono',
	couriernew: 'mono',
	'courier new': 'mono',
	consolas: 'mono',
	lucidaconsole: 'mono',
	liberationmono: 'mono',
	'dejavu sans mono': 'mono',
	dejavusansmono: 'mono',
	'noto mono': 'mono',
	notomono: 'mono',
} as const;

export class FontResolver {
	private readonly fontMap: FontMap = {};
	private readonly fontLoader: FontLoader;

	constructor(platform: string, fontMap: FontMap) {
		this.fontLoader = new FontLoader(platform);

		for (const name in fontMap) {
			this.fontMap[name.toLowerCase()] = fontMap[name];
		}
	}

	async resolve(fontName: string): Promise<string | Uint8Array | ArrayBuffer> {
		if (Object.hasOwn(this.fontMap, fontName.toLowerCase())) {
			return this.fontMap[fontName.toLowerCase()];
		}

		const description = this.parseName(fontName);
		const searchList = this.createSearchList(description);

		for (let i = 0; i < searchList.length; ++i) {
			const desc = searchList[i];
			const tryName = FontMatrix[desc.category][desc.weight][desc.style];
			if (Object.hasOwn(this.fontMap, tryName)) {
				return this.fontMap[tryName];
			}

			const fontBytes = await this.fontLoader.load(desc, fontName);
			if (typeof fontBytes !== 'undefined') return fontBytes;
		}

		throw new Error(
			`The font '${fontName}' is not embedded, no replacement font has been specified, and no fallback font has been found.`,
		);
	}

	private parseName(name: string): FontDescription {
		// Strip leading slash.
		name = name.replace(/^\//, '');

		// Strip subset prefix (ABCDEF+).
		name = name.replace(/^[A-Z]{6}\+-/, '');

		if (isStandardFont(name)) {
			return FontDescriptionByName[name.toLowerCase()];
		}

		// Heuristic parse.
		const lname = name.toLowerCase();
		const weight: FontWeight = lname.includes('bold') ? 'bold' : 'normal';
		const style: FontStyle =
			lname.includes('italic') || lname.includes('oblique')
				? 'italic'
				: 'roman';

		// Strip weight/style tokens to isolate family
		let family = name.replace(
			/[-,]?(Bold|Italic|Oblique|Regular|Medium|Light|Semi|Demi|Extra|Condensed|MT|PS)/gi,
			'',
		);

		family = family.replace(/^-+|-+$/g, '').trim();

		const familyLower = family.toLowerCase().replace(/[\s-]/g, '');

		let category: FontCategory | undefined = FontFamilyAliases[familyLower];

		if (!category) {
			category = FontFamilyAliases[family.toLowerCase()];
		}

		if (!category) {
			category = 'sans';
		}

		return { category, weight, style };
	}

	private createSearchList(desc: FontDescription): FontDescription[] {
		const searchList: FontDescription[] = [desc];

		// These cannot be replaced.
		if (desc.category === 'symbol' || desc.category === 'zapfdingbats') {
			const standardName =
				desc.category === 'symbol' ? 'Symbol' : 'ZapfDingbats';
			return [
				{
					category: desc.category,
					weight: 'normal',
					style: 'roman',
					standardName,
				},
			];
		}

		for (const weight in ['normal', 'bold']) {
			if (desc.weight === weight) continue;
			for (const style in ['roman', 'itallic']) {
				if (desc.style === style) continue;
				for (const category in ['sans', 'serif', 'mono']) {
					if (desc.category === category) continue;
					searchList.push({ category, weight, style } as FontDescription);
				}
			}
		}

		return searchList;
	}
}
