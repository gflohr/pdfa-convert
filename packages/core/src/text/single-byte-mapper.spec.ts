import { describe, expect, it } from 'vitest';
import { SingleByteMapper } from './single-byte-mapper.js';

describe('8-bit mappers', () => {
	describe('basic', () => {
		it('should support the MacExpert encoding', () => {
			const mapper = new SingleByteMapper('MacExpertEncoding');

			expect(mapper).toBeDefined();
			expect(mapper).toBeInstanceOf(SingleByteMapper);
		});

		it('should support the MacRoman encoding', () => {
			const mapper = new SingleByteMapper('MacRomanEncoding');

			expect(mapper).toBeDefined();
			expect(mapper).toBeInstanceOf(SingleByteMapper);
		});

		it('should support the PDF encoding', () => {
			const mapper = new SingleByteMapper('PDFEncoding');

			expect(mapper).toBeDefined();
			expect(mapper).toBeInstanceOf(SingleByteMapper);
		});

		it('should support the Standard encoding', () => {
			const mapper = new SingleByteMapper('StandardEncoding');

			expect(mapper).toBeDefined();
			expect(mapper).toBeInstanceOf(SingleByteMapper);
		});

		it('should support the Symbol encoding', () => {
			const mapper = new SingleByteMapper('SymbolEncoding');

			expect(mapper).toBeDefined();
			expect(mapper).toBeInstanceOf(SingleByteMapper);
		});

		it('should support the WinAnsi encoding', () => {
			const mapper = new SingleByteMapper('WinAnsiEncoding');

			expect(mapper).toBeDefined();
			expect(mapper).toBeInstanceOf(SingleByteMapper);
		});

		it('should throw an exception for unknown encodings', () => {
			expect(() => new SingleByteMapper('AtariST')).toThrow();
		});
	});

	describe('MacExpert encoding', () => {
		const mapper = new SingleByteMapper('MacExpertEncoding');

		it('should map a comma', () => {
			expect(mapper.lookup(0x2c)).toBe(',');
		});

		it('should not find character 0x41', () => {
			expect(mapper.lookup(0x41)).toBe('\uFFFD');
		});
	});

	describe('MacRoman encoding', () => {
		const mapper = new SingleByteMapper('MacRomanEncoding');

		it('should map a German double s', () => {
			expect(mapper.lookup(0xa7)).toBe('ß');
		});

		it('should not find character 0x1a', () => {
			expect(mapper.lookup(0x1a)).toBe('\uFFFD');
		});
	});

	describe('PDF encoding', () => {
		const mapper = new SingleByteMapper('PDFEncoding');

		it('should map a trademark sign', () => {
			expect(mapper.lookup(0x92)).toBe('™');
		});

		it('should not find a newline character', () => {
			expect(mapper.lookup(0x0a)).toBe('\uFFFD');
		});
	});

	describe('Standard encoding', () => {
		const mapper = new SingleByteMapper('StandardEncoding');

		it('should map a perthousand sign', () => {
			expect(mapper.lookup(0xbd)).toBe('‰');
		});

		it('should not find a newline character', () => {
			expect(mapper.lookup(0x0a)).toBe('\uFFFD');
		});
	});

	describe('Symbol encoding', () => {
		const mapper = new SingleByteMapper('SymbolEncoding');

		it('should map a Greek capital Omega', () => {
			expect(mapper.lookup(0x57)).toBe('Ω');
		});

		it('should not find the character 0x8e', () => {
			expect(mapper.lookup(0x8e)).toBe('\uFFFD');
		});
	});

	describe('WinAnsi encoding', () => {
		const mapper = new SingleByteMapper('WinAnsiEncoding');

		it('should map a Euro sign', () => {
			expect(mapper.lookup(0x80)).toBe('€');
		});

		it('should not find the character 0x8e', () => {
			expect(mapper.lookup(0x81)).toBe('\uFFFD');
		});
	});

	describe('ZapfDingbats encoding', () => {
		const mapper = new SingleByteMapper('ZapfDingbatsEncoding');

		it('should map a scissors sign', () => {
			expect(mapper.lookup(0x24)).toBe('✄');
		});

		it('should not find the character 0x19', () => {
			expect(mapper.lookup(0x19)).toBe('\uFFFD');
		});
	});
});
