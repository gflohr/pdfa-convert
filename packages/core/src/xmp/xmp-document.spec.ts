import { describe, expect, it } from 'vitest';
import { XmpDocument } from './xmp-document.js';

const bom = '\uFEFF';

describe('XMP document', () => {
	it('should create a fresh XMP document', () => {
		const xmpDoc = new XmpDocument();

		const xmp = xmpDoc.serialiseXmp();
console.log(xmp);
		expect(xmp).toMatchSnapshot();
	});

	it('should accept an existing XMP document', () => {
		const packet = `<?xpacket begin="${bom}" id="W5M0MpCehiHzreSzNTczkc9d"?>
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

		const xmpDoc = new XmpDocument(packet);

		const xmp = xmpDoc.serialiseXmp();
		expect(xmp).toMatchSnapshot();
	});
});
