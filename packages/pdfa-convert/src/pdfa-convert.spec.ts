import { describe, expect, it } from 'vitest';
import { PDFAConvert } from './pdfa-convert.js';

describe('PDFAConvert', () => {
	it('should instantiate the class', () => {
		expect(new PDFAConvert()).toBeDefined();
	});
});
