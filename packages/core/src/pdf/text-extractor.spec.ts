import { describe, expect, it } from 'vitest';
import { TextExtractor } from './text-extractor.js';

describe('PDFAConvert', () => {
	it('should instantiate the class', () => {
		expect(new TextExtractor()).toBeDefined();
	});
});
