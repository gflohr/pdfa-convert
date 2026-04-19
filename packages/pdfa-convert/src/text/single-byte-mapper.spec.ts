import { describe, expect, it } from 'vitest';
import { SingleByteMapper } from './single-byte-mapper.js';

describe('8-bit mappers', () => {
	describe('basic', () => {
		it('should support the MacExpert encoding', () => {
			const mapper = new SingleByteMapper('MacExpert');

			expect(mapper).toBeDefined();
			expect(mapper).toBeInstanceOf(SingleByteMapper);
		});

		it('should support the MacRoman encoding', () => {
			const mapper = new SingleByteMapper('MacRoman');

			expect(mapper).toBeDefined();
			expect(mapper).toBeInstanceOf(SingleByteMapper);
		});

		it('should throw an exception for unknown encodings', () => {
			expect(() => new SingleByteMapper('AtariST')).toThrow();
		})
	});
});
