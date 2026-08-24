import {
	DOMParser,
	type Document,
	type Element,
	Node,
	XMLSerializer,
} from '@xmldom/xmldom';

export interface PdfaIdentification {
	part: 1 | 2 | 3 | 4;
	conformance: 'A' | 'B' | 'U' | 'E';
}

export interface DublinCoreMetadata {
	title?: string;
	creator?: string[];
	description?: string;
	subject?: string[];
}

export class XmpDocument {
	private static readonly NS_X = 'adobe:ns:meta/';
	private static readonly NS_RDF =
		'http://www.w3.org/1999/02/22-rdf-syntax-ns#';

	private doc: Document;
	private xmpMeta: Element;
	private rdfPrefix;
	private rdfElement: Element;

	constructor (xmlString?: string) {
		if (!xmlString || xmlString.trim() === '') {
			xmlString = XmpDocument.createEmptyXmpMeta();
		}

		this.doc = new DOMParser().parseFromString(xmlString, 'text/xml');

		const relevantNodes: Node[] = [];
		for (const node of this.doc.childNodes) {
			if (node.nodeType === Node.ELEMENT_NODE
				|| node.nodeType === Node.PROCESSING_INSTRUCTION_NODE
			) {
				relevantNodes.push(node);
			} else if (
				node.nodeType === Node.TEXT_NODE && node.textContent?.trim() !== ''
			) {
				// This is an error.
				relevantNodes.push(node);
			}
		}

		if (relevantNodes.length !== 3
			|| relevantNodes[0]?.nodeType !== Node.PROCESSING_INSTRUCTION_NODE
			|| relevantNodes[0]?.nodeName !== 'xpacket'
			|| !this.isXmpMetaElement(relevantNodes[1] as unknown as Element)) {
			xmlString = XmpDocument.createEmptyXmpMeta();
			this.doc = new DOMParser().parseFromString(xmlString, 'text/xml');
			this.xmpMeta = this.doc.childNodes[2] as unknown as Element;
		} else {
			this.xmpMeta = relevantNodes[1]! as unknown as Element;
		}

		[this.rdfElement, this.rdfPrefix] = this.getOrCreateRdfElement();
	}

	private static createEmptyXmpMeta(): string {
		const bom = '\uFEFF';

		return `<?xpacket begin="${bom}" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="${XmpDocument.NS_X}">
</x:xmpmeta>
<?xpacket end="w"?>`;
	}


	private isXmpMetaElement(elem?: Element): boolean {
		if (!elem || elem.nodeType !== Node.ELEMENT_NODE || !elem.attributes) {
			return false;
		}

		let xmpMetaPrefix: string | undefined;
		const attributes = elem.attributes;
		for (let i = 0; i < attributes.length; ++i) {
			const attr = attributes.item(i);
			if (!attr?.name.startsWith('xmlns:') || attr?.name.length <= 6) continue;
			if (attr.value !== 'adobe:ns:meta/') continue;
			xmpMetaPrefix = attr.name.slice(6);
		}

		if (typeof xmpMetaPrefix === 'undefined') return false;

		if (elem.nodeName !== `${xmpMetaPrefix}:xmpmeta`) return false;

		return true;
	}

	public serialize(): string {
		return new XMLSerializer().serializeToString(this.doc);
	}

	private getOrCreateRdfElement(): [Element, string] {
		for (const childNode of this.xmpMeta.childNodes) {
			if (childNode.nodeType === Node.ELEMENT_NODE
			) {
				const child = childNode as unknown as Element;
				if (child.attributes) {
					for (let i = 0; i < child.attributes.length; ++i) {
						const attr = child.attributes.item(i);
						if (attr?.name.startsWith('xmlns:')
						    && attr.name.length > 6) {
							if (attr.value === XmpDocument.NS_RDF) {
								const prefix = attr.name.slice(6);
								if (child.nodeName === `${prefix}:RDF`) {
									return [child, prefix];
								}
							}
						}
					}
				}
			}
		}

		// Create and attach <rdf:RDF>
		const newRdf = this.doc.createElementNS(XmpDocument.NS_RDF, 'rdf:RDF');
		this.appendIndented(this.xmpMeta, newRdf, 0);

		return [newRdf, 'rdf'];
	}

	private appendIndented(parent: Element, child: Element, level: number) {
		parent.appendChild(this.doc.createTextNode(`${'\t'.repeat(level + 1)}`));
		parent.appendChild(child);
		parent.appendChild(this.doc.createTextNode(`\n${'\t'.repeat(level)}`));
	}
}
