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
});
