import { describe, expect, it } from 'vitest';
import { XmpDocument } from './xmp-document.js';

describe('XMP document', () => {
	it('should create a fresh XMP document', () => {
		const xmpDoc = new XmpDocument();

		const xmp = xmpDoc.serialize();
		expect(xmp).toMatchSnapshot();
	});
});
