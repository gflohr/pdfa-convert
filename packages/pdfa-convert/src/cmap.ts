import { Lexer, type Token } from './lexer.js';

type Mapping = [number, number] | [number, number, number];

export class CMap {
	private mappings: Mapping[];

	constructor(source: string | Uint8Array<ArrayBufferLike> | Uint8ClampedArray<ArrayBufferLike>) {
		if (source instanceof Uint8Array) {
			this.mappings = [...this.parse(source)].sort((a, b) => a[0] - b[0]);
		} else {
			throw new Error(`unsupported CMap source type '${typeof source}'`);
		}
	}

	private parse(source: Uint8Array<ArrayBufferLike> | Uint8ClampedArray<ArrayBufferLike>): Mapping[] {
		const lexer = new Lexer();
		const tokens = lexer.tokenize(source);

		const mappings: Mapping[] = [];

		for (let i = 0; i < tokens.length; ++i) {
			const token = tokens[i];
			if (token.type !== 'token') continue;

			const value = this.decodeNumberArray(token.value);
			if (value === 'beginfbchar') {
				i += this.consumeMappings(mappings, tokens, 2, i + 1);
			} else if (value === 'beginfbrange') {
				i += this.consumeMappings(mappings, tokens, 3, i + 1);
			}
		}

		return mappings;
	}

	private consumeMappings(mappings: Mapping[], tokens: Token[], cardinality: number, start: number): number {
		const mapping: Mapping = [] as unknown as Mapping;
		for (let i = start; i < tokens.length; ++i) {
			const token = tokens[i];

			if (token.type === 'token') {
				const value = this.decodeNumberArray(token.value);
				if (cardinality === 2 && value === 'endfbchar') {
					if (mappings.length && mappings[mappings.length - 1].length < 2) {
						mappings.pop();
					}
					return i - start + 1;
				} else if (cardinality === 3 && value === 'endfbrange') {
					if (mappings.length && mappings[mappings.length - 1].length < 3) {
						mappings.pop();
					}
					return i - start + 1;
				}
			} else if (token.type === 'string') {
				mapping.push(this.numberArrayToNumber(token.value));
				if (mapping.length >= cardinality) {
					mappings.push([...mapping]);
					(mapping as Array<number>).length = 0;
				}
			} else {
				// biome-ignore lint/complexity/noUselessContinue: JavaScript.
				continue;
			}
		}

		return tokens.length - start + 1;
	}

	private decodeNumberArray(value: number[]): string {
		return value.map((c) => String.fromCharCode(c)).join('');
	}

	private numberArrayToNumber(octets: number[]): number {
		let factor = 1;
		let value = 0;
		octets.reverse().forEach(octet => {
			value += factor * octet;
			factor *= 256;
		});

		return value;
	}

	// The CMap tables can become very big. Instead of a (sparse) array, we
	// do a binary search over the sorted entries.
	public lookup(glyph: number): number | undefined {
		let low = 0;
		let high = this.mappings.length - 1;
		while (high >= low) {
			const mid = low + ((high - low) >> 1);
			const mapping = this.mappings[mid];
			if (glyph < mapping[0]) {
				high = mid - 1;
			} else if (mapping.length > 2) {
				if (mapping[0] <= glyph && mapping[1] >= glyph) {
					// biome-ignore lint/style/noNonNullAssertion: false positive.
					return glyph - mapping[0] + mapping[2]!;
				} else {
					low = mid + 1;
				}
			} else {
				if (mapping[0] === glyph) {
					return mapping[1];
				} else {
					low = mid + 1;
				}
			}
		}
	}
}
