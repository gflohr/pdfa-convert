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

		it('should ignore garbage', () => {
			const source = `
(misplaced string)
1 beginfbchar
<0021> <0065>
endfbchar
`;
			const cmap = new CMap(toBytes(source));
			expect(cmap).toBeDefined();
			expect(cmap.lookup(0x21)).toStrictEqual([0x65]);
		});

		it('should ignore missing end markers', () => {
			const source = `
(misplaced string)
1 beginfbchar
<0021> <0065>
`;
			const cmap = new CMap(toBytes(source));
			expect(cmap).toBeDefined();
			expect(cmap.lookup(0x21)).toStrictEqual([0x65]);
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

		it('should ignore incomplete single mappings', () => {
			const source = `
3 beginfbchar
<0021> <0065>
<00af> <0036>
<abcd>
endfbchar
`;
			const cmap = new CMap(toBytes(source));
			expect(cmap).toBeDefined();
			expect(cmap.lookup(0x21)).toStrictEqual([0x65]);
			expect(cmap.lookup(0xaf)).toStrictEqual([0x36]);
			expect(cmap.lookup(0xabcd)).toStrictEqual([]);
		});

		it('should ignore incomplete range mappings', () => {
			const source = `
3 beginfbrange
<0001> <0002> <00a0>
<0021> <0022> <0100>
<0121> <0122> <0200>
<0200> <a000>
endfbrange
`;
			const cmap = new CMap(toBytes(source));
			expect(cmap).toBeDefined();
			expect(cmap.lookup(0x22)).toStrictEqual([0x101]);
			expect(cmap.lookup(0x201)).toStrictEqual([]);
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

		it('should ignore invalid surrogate pairs', () => {
			const source = `
1 beginfbchar
<3AF1> <E840DC3E>
<3AF2> <D840EC3E>
endfbchar
`;
			const cmap = new CMap(toBytes(source));
			expect(cmap).toBeDefined();
			expect(cmap.lookup(0x3af1)).toStrictEqual([]);
			expect(cmap.lookup(0x3af2)).toStrictEqual([]);
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

		it('should discard an invalid ligature', () => {
			// We could also try to heal this error, but why bother repairing
			// broken input?
			const source = `
1 beginfbchar
<0061> [<00660066006C>
endfbchar
`;
			const cmap = new CMap(toBytes(source));
			expect(cmap).toBeDefined();
			expect(cmap.lookup(0x61)).toStrictEqual([]);
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
			expect(cmap.lookup(0x62)).toStrictEqual([]);
		});

		it('should ignore out-of-range glyphs', () => {
			const source = `
beginfbrange
<005f> <0061> [<00660066> <00660069>]
endfbrange`;
			const cmap = new CMap(toBytes(source));
			expect(cmap).toBeDefined();
			expect(cmap.lookup(0x5f)).toStrictEqual([0x66, 0x66]);
			expect(cmap.lookup(0x60)).toStrictEqual([0x66, 0x69]);
			expect(cmap.lookup(0x61)).toStrictEqual([]);
		});

		it('should discard invalid ligature specifications', () => {
			const source = `
beginfbrange
<005f> <0061> I should not be here!
endfbrange`;
			const cmap = new CMap(toBytes(source));
			expect(cmap).toBeDefined();
			expect(cmap.lookup(0x5f)).toStrictEqual([]);
			expect(cmap.lookup(0x60)).toStrictEqual([]);
			expect(cmap.lookup(0x61)).toStrictEqual([]);
		});

		it('should discard incomplete ligatures', () => {
			// We could also try to heal this error, but why bother repairing
			// broken input?
			const source = `
beginfbrange
<005f> <0061> [<00660066> <00660069> <00660066006C>
endfbrange`;
			const cmap = new CMap(toBytes(source));
			expect(cmap).toBeDefined();
			expect(cmap.lookup(0x5f)).toStrictEqual([]);
			expect(cmap.lookup(0x60)).toStrictEqual([]);
			expect(cmap.lookup(0x61)).toStrictEqual([]);
		});
	});

	describe('String source', () => {
		it('should parse strings', () => {
			const source = `
/PostScript /gibberish
3 beginfbchar
<0021> <0065>
<00af> <0036>
<abcd> <1234>
endfbchar
`;
			const cmap = new CMap(source);
			expect(cmap).toBeDefined();
			expect(cmap.lookup(0)).toStrictEqual([]);
			expect(cmap.lookup(0x21)).toStrictEqual([0x65]);
			expect(cmap.lookup(0x22)).toStrictEqual([]);
			expect(cmap.lookup(0xaf)).toStrictEqual([0x36]);
			expect(cmap.lookup(0xbf)).toStrictEqual([]);
			expect(cmap.lookup(0xabcd)).toStrictEqual([0x1234]);
			expect(cmap.lookup(0xdcba)).toStrictEqual([]);
		});

		it('should bail out on everything else', () => {
			const source = { foo: 'bar' };

			expect(() => new CMap(source as unknown as string)).toThrow(
				"unsupported CMap source type 'object'",
			);
		});
	});
});
