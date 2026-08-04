import type { OpenTypeFont } from '@pdfa-lab/fontkit';

export interface FontFlagOptions {
	fixedPitch?: boolean;
	serif?: boolean;
	symbolic?: boolean;
	script?: boolean;
	nonsymbolic?: boolean;
	italic?: boolean;
	allCap?: boolean;
	smallCap?: boolean;
	forceBold?: boolean;
}

const makeFontFlags = (options: FontFlagOptions) => {
	let flags = 0;

	const flipBit = (bit: number) => {
		flags |= 1 << (bit - 1);
	};

	if (options.fixedPitch) flipBit(1);
	if (options.serif) flipBit(2);
	if (options.symbolic) flipBit(3);
	if (options.script) flipBit(4);
	if (options.nonsymbolic) flipBit(6);
	if (options.italic) flipBit(7);
	if (options.allCap) flipBit(17);
	if (options.smallCap) flipBit(18);
	if (options.forceBold) flipBit(19);

	return flags;
};

export function deriveFontFlags(font: OpenTypeFont): number {
	const os2 = font['OS/2'];
	const familyClass = os2?.sFamilyClass ?? 0;

	const fixedPitch = font.post?.isFixedPitch ?? false;

	let isSerif = false;
	let isScript = false;

	if (os2 && familyClass > 0) {
		// Primary check: IBM Font Class from OS/2.
		// Classes 1-7 are Serif (Oldstyle, Transitional, Modern, Clarendon,
		// Slab, Freeform).
		const classID = familyClass >> 8; // Top byte is class, bottom byte is subclass.
		isSerif = 1 <= classID && classID <= 7;
		isScript = classID === 10;
	} else {
		// Fallback: Infer from font/PostScript name or sub-family name
		const psName = (font.name?.postscriptName || font.name?.fullName || '').toLowerCase();

		isScript = /script|handwriting|cursive|calligraphy/i.test(psName);

		if (!isScript) {
			const isSans = /sans|gothic|arial|helvetica|grotesk/i.test(psName);
			const isExplicitSerif = /serif|roman|times|georgia|garamond|bodoni/i.test(psName);

			// If it explicitly mentions serif or is not a known sans/monospace,
			// fallback logically.
			isSerif = isExplicitSerif || (!isSans && !fixedPitch);
		}
	}

	const isItalic = !!(font.head?.macStyle?.italic || font.post?.italicAngle);

	return makeFontFlags({
		fixedPitch: !!fixedPitch,
		serif: isSerif,
		symbolic: isAdobeStandardSymbolic(font),
		script: isScript,
		italic: isItalic,
	});
}

/**
 * Adobe Standard Encoding Character Set (Unicodes)
 * Basic ASCII printable range (0x20-0x7E) plus standard Latin-1 extensions.
 */
function isAdobeStandardSymbolic(font: OpenTypeFont): boolean {
    // 1. Check if the font uses a dedicated Symbol CMap (Platform 3, Encoding 0)
    // Symbol fonts (like Webdings, Wingdings, Symbol) use this CMap platform/encoding.
    const hasSymbolCMap = font.cmap?.tables.some(
        t => (t.platformID === 3 && t.encodingID === 0) || (t.platformID === 1 && t.encodingID === 0 && font.post?.isFixedPitch === false)
    );
    if (hasSymbolCMap) {
        return true;
    }

    // 2. Check character coverage via code points in the primary CMap
    // If the font contains code points far outside standard Latin, it must be marked Symbolic.
    const unicodePoints = font.characterSet; // or Array.from(font.cmap.getCoverage())

    for (const codePoint of unicodePoints) {
        // Allow ASCII, Latin-1 Supplement, and standard Punctuation/Latin Extended-A
        const isStandardLatin =
            (codePoint >= 0x0020 && codePoint <= 0x007E) || // ASCII Printable
            (codePoint >= 0x00A0 && codePoint <= 0x00FF) || // Latin-1 Supplement
            (codePoint >= 0x0100 && codePoint <= 0x017F);   // Latin Extended-A

        if (!isStandardLatin) {
            // Found non-standard Latin, CJK, Math, or PUA character -> Symbolic!
            return true;
        }
    }

    // All characters fit within standard Latin -> Nonsymbolic.
    return false;
}
