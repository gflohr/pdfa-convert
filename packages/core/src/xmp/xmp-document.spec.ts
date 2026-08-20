import { describe, expect, it } from 'vitest';
import { XmpDocument } from './xmp-document.js';

describe('XMP document', () => {
	it('should create a fresh XMP document', () => {
		const xmpDoc = XmpDocument.parse();

		const xmp = xmpDoc.serialize();
		console.log(xmp);
		expect(xmp).toMatchSnapshot();
	});

	it('should be round-trip safe', () => {
		const original = XmpDocument.parse().serialize();

		const processed = XmpDocument.parse(original).serialize();
		expect(processed).toBe(original);
	});

	describe('Dublin Core', () => {
		it('should create Dublin core meta data', () => {
			const xmpDoc = XmpDocument.parse();

			const dc = {
				title: '@pdfa-lab/core metadata',
				creator: ['Yours Truly'],
				description: 'Test metadata for testing.',
				subject: ['https://example.com/test#subject'],
			};

			xmpDoc.setDublinCore(dc);
			const updated = xmpDoc.serialize();

			expect(updated).toMatchSnapshot();
		});
	});
});
