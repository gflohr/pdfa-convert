import { describe, expect, it } from 'vitest'
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
			expect(cmap.lookup(0)).not.toBeDefined();
			expect(cmap.lookup(0x21)).toBe(0x65);
			expect(cmap.lookup(0x22)).not.toBeDefined();
			expect(cmap.lookup(0xaf)).toBe(0x36);
			expect(cmap.lookup(0xbf)).not.toBeDefined();
			expect(cmap.lookup(0xabcd)).toBe(0x1234);
			expect(cmap.lookup(0xdcba)).not.toBeDefined();
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
endfbchar
`;
			const cmap = new CMap(toBytes(source));
			expect(cmap).toBeDefined();
			expect(cmap.lookup(0)).not.toBeDefined();
			expect(cmap.lookup(0x21)).toBe(0x100);
			expect(cmap.lookup(0x22)).toBe(0x101);
			expect(cmap.lookup(0x23)).not.toBeDefined();
		});
	});
});
