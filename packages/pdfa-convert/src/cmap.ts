import { Lexer, Token } from './lexer.js';

type Mapping = [number, number] | [number, number, number];

export class CMap {
	private mappings: Mapping[];

	constructor(source: string | Uint8Array<ArrayBufferLike> | Uint8ClampedArray<ArrayBufferLike>) {
		if (source instanceof Uint8Array) {
			this.mappings = [...this.parse(source)].sort((a, b) => a[0] - b[0]);
		} else {
			throw new Error(`unsupported CMap source type '${typeof source}'`);
		}

		console.log(this.mappings);
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
				if (value === 'endfbchar') {
					if (mappings.length && mappings[mappings.length - 1].length < 2) {
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

	public lookup(glyph: number): number | undefined {
		for (let i = 0; i < this.mappings.length; ++i) {
			if (glyph === this.mappings[i][0]) return this.mappings[i][1];
		}
	}
}
