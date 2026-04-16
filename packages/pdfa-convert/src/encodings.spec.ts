import { describe, expect, it } from 'vitest';
import { CMap } from './cmap.js';
import { MacExpertEncodingCmap, MacRomanEncodingCMap, PDFEncodingCMap, StandardEncodingCMap, WinAnsiEncodingCMap } from './encodings.js';

describe('Encodings', () => {
	describe ('StandardEncoding', () => {
		it('should have a CMap', () => {
			expect(StandardEncodingCMap).toBeInstanceOf(CMap);
		});

		it('should not have a glyph for backspace', () => {
			expect(StandardEncodingCMap.lookup(0x08)).toStrictEqual([]);
		});

		it('should map an A to an A', () => {
			expect(StandardEncodingCMap.lookup(0x41)).toStrictEqual([0x41]);
		});

		it('should map 0xb2 to a dagger', () => {
			expect(StandardEncodingCMap.lookup(0xb2)).toStrictEqual([0x2020]);
		});
	});

	describe ('MacRomanEncoding', () => {
		it('should have a CMap', () => {
			expect(MacRomanEncodingCMap).toBeInstanceOf(CMap);
		});

		it('should not have a glyph for backspace', () => {
			expect(MacRomanEncodingCMap.lookup(0x08)).toStrictEqual([]);
		});

		it('should map an A to an A', () => {
			expect(MacRomanEncodingCMap.lookup(0x41)).toStrictEqual([0x41]);
		});

		it('should map 0xd8 to a ydiaresis', () => {
			expect(MacRomanEncodingCMap.lookup(0xd8)).toStrictEqual([0xff]);
		});

		it('should map the legacy Apple logo to 0xf8ff', () => {
			expect(MacRomanEncodingCMap.lookup(0xf0)).toStrictEqual([0xf8ff]);
		});
	});

	describe ('WinAnsiEncoding', () => {
		it('should have a CMap', () => {
			expect(WinAnsiEncodingCMap).toBeInstanceOf(CMap);
		});

		it('should not have a glyph for backspace', () => {
			expect(WinAnsiEncodingCMap.lookup(0x08)).toStrictEqual([]);
		});

		it('should map an A to an A', () => {
			expect(WinAnsiEncodingCMap.lookup(0x41)).toStrictEqual([0x41]);
		});

		it('should map 0x80 to the Euro sign', () => {
			expect(WinAnsiEncodingCMap.lookup(0x80)).toStrictEqual([0x20ac]);
		});
	});

	describe ('PDFEncoding', () => {
		it('should have a CMap', () => {
			expect(PDFEncodingCMap).toBeInstanceOf(CMap);
		});

		it('should not have a glyph for backspace', () => {
			expect(PDFEncodingCMap.lookup(0x08)).toStrictEqual([]);
		});

		it('should map an A to an A', () => {
			expect(PDFEncodingCMap.lookup(0x41)).toStrictEqual([0x41]);
		});

		it('should map 0xa0 to the Euro sign', () => {
			expect(PDFEncodingCMap.lookup(0xa0)).toStrictEqual([0x20ac]);
		});
	});

	describe ('MacExportEncoding', () => {
		it('should have a CMap', () => {
			expect(MacExpertEncodingCmap).toBeInstanceOf(CMap);
		});

		it('should not have a glyph for backspace', () => {
			expect(MacExpertEncodingCmap.lookup(0x08)).toStrictEqual([]);
		});

		it('should map 0x61 to a small capital A', () => {
			expect(MacExpertEncodingCmap.lookup(0x61)).toStrictEqual([0x1d00]);
		});
	});
});
