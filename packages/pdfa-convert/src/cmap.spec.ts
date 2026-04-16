import { describe, expect, it } from 'vitest';
import { CMap } from './cmap.js';

function toBytes(str: string): Uint8Array {
	return new TextEncoder().encode(str);
}

describe('CMap', () => {
	describe('Basics', () => {
		it('should instantiate the class', () => {
			expect(new CMap(toBytes(''))).toBeDefined();
		});
	});

	describe('Single Mappings', () => {
		it('should parse single mappings', () => {
			const source = `
/PostScript /gibberish
3 beginfbchar
<0021> <0065>
<00af> <0036>
<abcd> <1234>
endfbchar
`;
			const cmap = new CMap(toBytes(source));
			expect(cmap).toBeDefined();
			expect(cmap.lookup(0)).toStrictEqual([]);
			expect(cmap.lookup(0x21)).toStrictEqual([0x65]);
			expect(cmap.lookup(0x22)).toStrictEqual([]);
			expect(cmap.lookup(0xaf)).toStrictEqual([0x36]);
			expect(cmap.lookup(0xbf)).toStrictEqual([]);
			expect(cmap.lookup(0xabcd)).toStrictEqual([0x1234]);
			expect(cmap.lookup(0xdcba)).toStrictEqual([]);
		});

		it('should decode BTF16-BE Unicode values', () => {
			const source = `
1 beginfbchar
<3AF1> <D840DC3E>
endfbchar
`;
			const cmap = new CMap(toBytes(source));
			expect(cmap).toBeDefined();
			expect(cmap.lookup(0x3af1)).toStrictEqual([0x2003e]);
		});

		it('should parse a ligature mapping', () => {
			const source = `
1 beginfbchar
<0061> [<00660066006C>]
endfbchar
`;
			const cmap = new CMap(toBytes(source));
			expect(cmap).toBeDefined();
			expect(cmap.lookup(0x61)).toStrictEqual([0x66, 0x66, 0x6c]);
		});
	});

	describe('Range Mappings', () => {
		it('should parse range mappings', () => {
			const source = `
/PostScript /gibberish
3 beginfbrange
<0001> <0002> <00a0>
<0021> <0022> <0100>
<0121> <0122> <0200>
<0200> <a000> <0400>
endfbrange
trailing garbage
`;
			const cmap = new CMap(toBytes(source));
			expect(cmap).toBeDefined();
			expect(cmap.lookup(0)).toStrictEqual([]);
			expect(cmap.lookup(0x21)).toStrictEqual([0x100]);
			expect(cmap.lookup(0x22)).toStrictEqual([0x101]);
			expect(cmap.lookup(0x23)).toStrictEqual([]);
		});

		it('should parse ligature ranges', () => {
			const source = `
beginfbrange
<005f> <0061> [<00660066> <00660069> <00660066006C>]
endfbrange`;
			const cmap = new CMap(toBytes(source));
			expect(cmap).toBeDefined();
			expect(cmap.lookup(0x5f)).toStrictEqual([0x66, 0x66]);
			expect(cmap.lookup(0x60)).toStrictEqual([0x66, 0x69]);
			expect(cmap.lookup(0x61)).toStrictEqual([0x66, 0x66, 0x6c]);
		});
	});
});
