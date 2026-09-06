import { describe, expect, it } from 'vitest';
import { XmpDocument } from './xmp-document.js';

const bom = '\uFEFF';
const defaultPacket = `<?xpacket begin="${bom}" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
	<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
		<rdf:Description xmlns:dc="http://purl.org/dc/elements/1.1/" rdf:about="">
			<dc:format>application/pdf</dc:format>
		</rdf:Description>
		<rdf:Description xmlns:pdf="http://ns.adobe.com/pdf/1.3/" rdf:about="">
			<pdf:Producer>@pdfa-lab/core</pdf:Producer>
			<pdf:PDFVersion>1.7</pdf:PDFVersion>
		</rdf:Description>
	</rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>
`;

describe('XMP document', () => {
	describe('serialise XMP', () => {
		it('should create a fresh XMP document', () => {
			const xmpDoc = new XmpDocument();

			const xmp = xmpDoc.serialiseXmp();
			expect(xmp).toMatchSnapshot();
		});

		it('should accept an existing XMP document', () => {
			const xmpDoc = new XmpDocument(defaultPacket);

			const xmp = xmpDoc.serialiseXmp();
			expect(xmp).toMatchSnapshot();
		});
	});

	describe('Serialisation Formats', () => {
		it('should serialise to application/rdf+xml', () => {
			const xmpDoc = new XmpDocument(defaultPacket);

			const xmp = xmpDoc.serialise('application/rdf+xml');
			expect(xmp).toMatchSnapshot();
		});

		it('should serialise to text/turtle', () => {
			const xmpDoc = new XmpDocument(defaultPacket);

			const xmp = xmpDoc.serialise('text/turtle');
			expect(xmp).toMatchSnapshot();
		});

		it('should serialise to applidation/n-triples', () => {
			const xmpDoc = new XmpDocument(defaultPacket);

			const xmp = xmpDoc.serialise('application/n-triples');
			expect(xmp).toMatchSnapshot();
		});

		it('should serialise to applidation/ld+json', () => {
			const xmpDoc = new XmpDocument(defaultPacket);

			const xmp = xmpDoc.serialise('application/ld+json');
			expect(xmp).toMatchSnapshot();
		});

		it('should serialise to text/n3', () => {
			const xmpDoc = new XmpDocument(defaultPacket);

			const xmp = xmpDoc.serialise('text/n3');
			expect(xmp).toMatchSnapshot();
		});

		it('should serialise to application/nquads', () => {
			const xmpDoc = new XmpDocument(defaultPacket);

			const xmp = xmpDoc.serialise('application/nquads');
			expect(xmp).toMatchSnapshot();
		});
	});

	describe('setMetaInfo', () => {
		it('should add a new property to a fresh document', () => {
			const xmpDoc = new XmpDocument();
			xmpDoc.setMetaInfo('dc:format', 'text/plain');

			const xmp = xmpDoc.serialiseXmp();
			expect(xmp).toContain('<dc:format>text/plain</dc:format>');
			expect(xmp).toMatchSnapshot();
		});

		it('should honour the `noOverwrite` option', () => {
			const xmpDoc = new XmpDocument(defaultPacket);
			xmpDoc.setMetaInfo('dc:format', 'text/plain', { noOverwrite: true });

			const xmp = xmpDoc.serialiseXmp();
			expect(xmp).not.toContain('<dc:format>text/plain</dc:format>');
			expect(xmp).toMatchSnapshot();
		});

		it('should set Seq items', () => {
			const xmpDoc = new XmpDocument();

			xmpDoc.setMetaInfo('dc:creator[0]', 'Jane Doe');
			xmpDoc.setMetaInfo('dc:creator[1]', 'John Doe');

			const xmp = xmpDoc.serialiseXmp();

			expect(xmp).toContain('<rdf:li>Jane Doe</rdf:li>');
			expect(xmp).toContain('<rdf:li>John Doe</rdf:li>');
			expect(xmp).toMatchSnapshot();
		});
	});

	describe('getMetaInfo', () => {
		it('should get an existing property', () => {
			const xmpDoc = new XmpDocument(defaultPacket);

			expect(xmpDoc.getMetaInfo('dc:format')).toBe('application/pdf');
		});

		it('should return null for non-existing properties', () => {
			const xmpDoc = new XmpDocument(defaultPacket);

			expect(xmpDoc.getMetaInfo('dc:identifier')).toBeNull();
		});
	});
});
