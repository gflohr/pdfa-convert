import { MacExpertEncoding } from '../encodings/mac-expert.js';
import { MacRomanEncoding } from '../encodings/mac-roman.js';
import { PDFEncoding } from '../encodings/pdf.js';
import { StandardEncoding } from '../encodings/standard.js';
import { SymbolEncoding } from '../encodings/symbol.js';
import { WinAnsiEncoding } from '../encodings/win-ansi.js';
import { ZapfDingbatsEncoding } from '../encodings/zapf-dingbats.js';
import { adobeGlyphs } from './agl.js';
import type { GlyphMapper } from './glyph-mapper.js';

export class SingleByteMapper implements GlyphMapper {
	private readonly encoding: string[];

	constructor(encodingName: string) {
		switch(encodingName.toLowerCase()) {
			case 'macexpertencoding':
				this.encoding = MacExpertEncoding;
				break;
			case 'macromanencoding':
				this.encoding = MacRomanEncoding;
				break;
			case 'pdfencoding':
				this.encoding = PDFEncoding;
				break;
			case 'standardencoding':
				this.encoding = StandardEncoding;
				break;
			case 'symbolencoding':
				this.encoding = SymbolEncoding;
				break;
			case 'winansiencoding':
				this.encoding = WinAnsiEncoding;
				break;
			case 'zapfdingbatsencoding':
				this.encoding = ZapfDingbatsEncoding;
				break;
			default:
				throw new Error(`unsupported encoding '${encodingName}`);
		}
	}

	public lookup(glyph: number): string {
		const codepoints = this.lookupCodepoints(glyph);
		if (codepoints.length) {
			return codepoints.map(c => String.fromCharCode(c)).join('');
		} else {
			return '\uFFFD';
		}
	}

	public lookupCodepoints(glyph: number): number[] {
		if (glyph < 0 || glyph > this.encoding.length) {
			throw new Error(`glyph ID ${glyph} out of range`);
		}

		const name = this.encoding[glyph];
		if (name === '.notdef') return [];

		const adobeGlyph = adobeGlyphs[name];
		if (!adobeGlyph) return [];

		return typeof adobeGlyph.u === 'number' ? [adobeGlyph.u] : adobeGlyph.u;
	}
}
