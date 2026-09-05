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
			xmpDoc.setMetaInfo('pdf', 'Keywords', 'PDF/A, TypeScript');

			const xmp = xmpDoc.serialiseXmp();
			expect(xmp).toContain('pdf:Keywords');
			expect(xmp).toMatchSnapshot();
		});

		it('should overwrite an existing property value', () => {
			const xmpDoc = new XmpDocument(defaultPacket);
			xmpDoc.setMetaInfo('pdf', 'Producer', 'Custom PDF Generator');

			const xmp = xmpDoc.serialiseXmp();
			expect(xmp).toContain('Custom PDF Generator');
			expect(xmp).not.toContain('@pdfa-lab/core');
			expect(xmp).toMatchSnapshot();
		});

		it('should throw when providing an unregistered namespace prefix', () => {
			const xmpDoc = new XmpDocument();
			expect(() => xmpDoc.setMetaInfo('unknown', 'Foo', 'Bar')).toThrow(
				"Unknown prefix: 'unknown'",
			);
		});
	});
});
