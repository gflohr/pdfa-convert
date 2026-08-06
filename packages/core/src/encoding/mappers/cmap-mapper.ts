import { Lexer } from '../../parser/lexer.js';
import type { Token } from '../../parser/types.js';
import type { GlyphMapper } from './glyph-mapper.js';

type Mapping =
	| [number, number]
	| [number, number, number]
	| [number, number, number[][]]
	| [number, number[]];

type CodeSpaceRange = {
	byteWidth: number;
	min: number;
	max: number;
};

export class CMapMapper implements GlyphMapper {
	private mappings: Mapping[];
	private codeSpaceRanges: CodeSpaceRange[] = [];
	private defaultByteWidth = 2; // Fallback default for CMap keys
	private _highest: number;

	constructor(
		source:
			| string
			| Uint8Array<ArrayBufferLike>
			| Uint8ClampedArray<ArrayBufferLike>,
	) {
		if (typeof source === 'string') {
			source = new TextEncoder().encode(source);
		}

		if (source instanceof Uint8Array) {
			this.mappings = [...this.parse(source)].sort((a, b) => a[0] - b[0]);

			this._highest = this.mappings.reduce(
				(max, mapping) =>
					Math.max(max, mapping.length === 2 ? mapping[0] : mapping[1]),
				0,
			);
		} else {
			throw new Error(`unsupported CMap source type '${typeof source}'`);
		}
	}

	public get name(): 'Identity-H' {
		return 'Identity-H';
	}

	public get highest(): number {
		return this._highest;
	}

	public getCodeBytesWidth(octets: Uint8Array, idx: number): number {
		// 1. Try explicit begincodespacerange blocks first
		if (this.codeSpaceRanges.length > 0) {
			for (const range of this.codeSpaceRanges) {
				const width = range.byteWidth;
				if (idx + width > octets.length) continue;

				let code = 0;
				for (let j = 0; j < width; ++j) {
					code = (code << 8) | (octets[idx + j]! & 0xff);
				}
				code = code >>> 0;

				if (code >= range.min && code <= range.max) {
					return width;
				}
			}
		}

		// 2. Fallback: infer from CMap default byte width or highest mapped key
		const remaining = octets.length - idx;
		if (this._highest > 0xff || this.defaultByteWidth === 2) {
			return remaining >= 2 ? 2 : remaining;
		}

		return 1;
	}

	private parse(
		source: Uint8Array<ArrayBufferLike> | Uint8ClampedArray<ArrayBufferLike>,
	): Mapping[] {
		const lexer = new Lexer();
		const tokens = lexer.tokenize(source);

		const mappings: Mapping[] = [];
		this.codeSpaceRanges = [];

		for (let i = 0; i < tokens.length; ++i) {
			const token = tokens[i]!;
			if (token.type !== 'token') continue;

			const value = this.decodeUint8Array(token.value);
			if (value === 'beginbfchar') {
				i += this.consumeMappings(mappings, tokens, 2, i + 1);
			} else if (value === 'beginbfrange') {
				i += this.consumeMappings(mappings, tokens, 3, i + 1);
			} else if (value === 'begincodespacerange') {
				i += this.consumeRanges(this.codeSpaceRanges, tokens, i + 1);
			}
		}

		return mappings;
	}

	private consumeMappings(
		mappings: Mapping[],
		tokens: Token[],
		cardinality: number,
		start: number,
	): number {
		let mapping: Mapping = [] as unknown as Mapping;
		for (let i = start; i < tokens.length; ++i) {
			const token = tokens[i]!;

			if (token.type === 'token') {
				const value = this.decodeUint8Array(token.value);
				if (cardinality === 2 && value === 'endbfchar') {
					return i - start + 1;
				} else if (
					cardinality === 2 &&
					mapping.length === cardinality - 1 &&
					value === '['
				) {
					i += this.consumeLigature(mappings, mapping, tokens, i + 1);
					mapping = [] as unknown as Mapping;
				} else if (cardinality === 3 && value === 'endbfrange') {
					return i - start + 1;
				} else if (
					cardinality === 3 &&
					mapping.length === cardinality - 1 &&
					value === '['
				) {
					i += this.consumeLigatures(mappings, mapping, tokens, i + 1);
					mapping = [] as unknown as Mapping;
				}
			} else {
				// String. Detect token byte width (e.g. <0001> = 2 bytes).
				if ((mapping as number[]).length === 0 && token.value.length === 2) {
					this.defaultByteWidth = 2;
				}
				mapping.push(this.uint8ArrayToNumber(token.value));
				if (mapping.length >= cardinality) {
					mappings.push(mapping);
					mapping = [] as unknown as Mapping;
				}
			}
		}

		return tokens.length - start + 1;
	}

	private consumeRanges(
		ranges: CodeSpaceRange[],
		tokens: Token[],
		start: number,
	): number {
		let minToken: Token | null = null;

		for (let i = start; i < tokens.length; ++i) {
			const token = tokens[i]!;

			if (token.type === 'token') {
				const value = this.decodeUint8Array(token.value);
				if (value === 'endcodespacerange') {
					return i - start + 1;
				}
			} else {
				if (!minToken) {
					minToken = token;
				} else {
					ranges.push({
						byteWidth: minToken.value.length,
						min: this.uint8ArrayToNumber(minToken.value),
						max: this.uint8ArrayToNumber(token.value),
					});
					minToken = null;
				}
			}
		}

		return tokens.length - start + 1;
	}

	private consumeLigature(
		mappings: Mapping[],
		mapping: Mapping,
		tokens: Token[],
		start: number,
	): number {
		(mapping[1] as number[]) = [];
		for (let i = start; i < tokens.length && i < start + 2; ++i) {
			const token = tokens[i]!;

			if (
				token.type === 'token' &&
				this.decodeUint8Array(token.value) === ']'
			) {
				mappings.push(mapping);
				return i - start + 1;
			} else if (token.type === 'string') {
				const v = token.value;
				for (let j = 0; j < v.length - 1; j += 2) {
					(mapping[1] as number[]).push((v[j]! << 8) | v[j + 1]!);
				}
			}
		}

		return tokens.length - start + 1;
	}

	private consumeLigatures(
		mappings: Mapping[],
		mapping: Mapping,
		tokens: Token[],
		start: number,
	): number {
		mapping[2] = [];
		for (let i = start; i < tokens.length; ++i) {
			const token = tokens[i]!;

			if (
				token.type === 'token' &&
				this.decodeUint8Array(token.value) === ']'
			) {
				mappings.push(mapping);
				return i - start + 1;
			} else if (token.type === 'string') {
				const words: number[] = [];
				const v = token.value;
				for (let j = 0, k = 0; j < v.length - 1; j += 2, ++k) {
					words[k] = (v[j]! << 8) | v[j + 1]!;
				}
				mapping[2].push(words);
			}
		}

		return tokens.length - start + 1;
	}

	private decodeUint8Array(value: Uint8Array): string {
		return String.fromCodePoint(...value);
	}

	private uint8ArrayToNumber(octets: Uint8Array): number {
		let value = 0;
		let nonZeroSeen = false;
		let count = 0;

		for (let i = 0; i < octets.length; ++i) {
			const octet = octets[i]! & 0xff;

			if (!nonZeroSeen) {
				if (octet === 0) continue;
				nonZeroSeen = true;
			}

			if (count >= 4) return 0;

			value = (value << 8) | octet;
			++count;
		}

		return nonZeroSeen ? value >>> 0 : 0;
	}

	public lookup(glyph: number): string {
		const codePoints = this.lookupCodePoints(glyph);
		if (codePoints.length) {
			return codePoints.map((c) => String.fromCharCode(c)).join('');
		} else {
			return '\uFFFD';
		}
	}

	public lookupCodePoints(glyph: number): number[] {
		let low = 0;
		let high = this.mappings.length - 1;
		while (high >= low) {
			const mid = low + ((high - low) >> 1);
			const mapping = this.mappings[mid]!;
			if (glyph < mapping[0]) {
				high = mid - 1;
			} else if (mapping.length > 2) {
				if (mapping[0] <= glyph && (mapping[1] as number) >= glyph) {
					return this.lookupRangeValue(glyph, mapping);
				} else {
					low = mid + 1;
				}
			} else {
				if (mapping[0] === glyph) {
					if (typeof mapping[1] === 'number') {
						return this.decodeUTF16BE(mapping[1]);
					} else {
						return mapping[1];
					}
				} else {
					low = mid + 1;
				}
			}
		}

		return [];
	}

	private lookupRangeValue(glyph: number, mapping: Mapping): number[] {
		if (typeof mapping[2] === 'number') {
			return this.decodeUTF16BE(glyph - mapping[0] + mapping[2]!);
		} else {
			const offset = glyph - mapping[0];
			if (Array.isArray(mapping[2]) && offset < mapping[2].length) {
				return mapping[2][offset]!;
			} else {
				return [];
			}
		}
	}

	private decodeUTF16BE(value: number): number[] {
		if (value <= 0xffff) {
			return [value];
		}

		const high = (value >> 16) & 0xffff;
		const low = value & 0xffff;

		if (high >= 0xd800 && high <= 0xdbff && low >= 0xdc00 && low <= 0xdfff) {
			const codePoint = ((high - 0xd800) << 10) + (low - 0xdc00) + 0x10000;
			return [codePoint];
		}

		return [];
	}
}
