import { DOMParser, type Document, type Element, Node, XMLSerializer } from '@xmldom/xmldom';
import * as rdflib from 'rdflib';

/**
 * Output formats.
 *
 * You can either use the shortcut keys or the full MIME types.
 */
export const rdfSerialisationFormat: Record<string, string> = {
	xml: 'application/rdf+xml',
	html: 'text/html',
	xhtml: 'application/xhtml+xml',
	turtle: 'text/turtle',
	'turtle-legacy': 'application/x-turtle',
	'x-turtle': 'application/x-turtle',
	'n-triples': 'application/n-triples',
	'json-ld': 'application/ld+json',
	n3: 'text/n3',
	'n3-legacy': 'application/n3',
	'nquads': 'application/nquads',
	'n-quads': 'application/n-quads',
	'sparql-update': 'application/sparql-update',
	'sparql-update-single': 'application/sparql-update-single',
	'sparql-update-s': 'application/sparql-update-single',
};

/** Localised strings (e.g., alt text, titles in rdf:Alt) */
export type XmpLangAlt = Record<string, string>; // e.g., { 'x-default': 'Title', 'de-DE': 'Titel' }

/** Primitives supported in XMP fields */
export type XmpValue =
	| string
	| number
	| boolean
	| XmpLangAlt
	| XmpValue[]
	| { [key: string]: XmpValue };

/**
 * Dublin core metadata.
 *
 * See https://developer.adobe.com/xmp/docs/xmp-namespaces/dc/!
 */
export interface DublinCoreMetadata {
	contributor?: string[];
	coverage?: string;
	creator?: string[];
	date?: Date;
	description?: string;
	format?: string;
	identifier?: string;
	language?: string[];
	publisher?: string[];
	relation?: string[];
	rights?: XmpLangAlt;
	source?: string;
	subject?: string[];
	title?: XmpLangAlt;
	type?: string;
}

const bom = '\uFEFF';

export class XmpDocument {
	private static readonly NS_X = 'adobe:ns:meta/';
	private static readonly NS_RDF =
		'http://www.w3.org/1999/02/22-rdf-syntax-ns#';

	private doc: Document;
	private kb = rdflib.graph();

	constructor(xmlString?: string, private readonly baseIRI = 'urn:xmp:doc', ) {
		if (!xmlString || xmlString.trim() === '') {
			xmlString = XmpDocument.createEmptyXmpMeta();
		}

		this.doc = new DOMParser().parseFromString(xmlString, 'text/xml');

		const relevantNodes: Node[] = [];
		for (const node of this.doc.childNodes) {
			if (
				node.nodeType === Node.ELEMENT_NODE ||
				node.nodeType === Node.PROCESSING_INSTRUCTION_NODE
			) {
				relevantNodes.push(node);
			} else if (
				node.nodeType === Node.TEXT_NODE &&
				node.textContent?.trim() !== ''
			) {
				// This is an error.
				relevantNodes.push(node);
			}
		}

		let xmpMeta: Element;
		if (
			relevantNodes.length !== 3 ||
			relevantNodes[0]?.nodeType !== Node.PROCESSING_INSTRUCTION_NODE ||
			relevantNodes[0]?.nodeName !== 'xpacket' ||
			!this.isXmpMetaElement(relevantNodes[1] as unknown as Element)
		) {
			xmlString = XmpDocument.createEmptyXmpMeta();
			this.doc = new DOMParser().parseFromString(xmlString, 'text/xml');
			xmpMeta = this.doc.childNodes[2] as unknown as Element;
		} else {
			xmpMeta = relevantNodes[1]! as unknown as Element;
		}

		const rdfElement = this.getOrCreateRdfElement(xmpMeta);
		xmlString = new XMLSerializer().serializeToString(rdfElement);

		rdflib.parse(xmlString, this.kb, baseIRI, 'application/rdf+xml');
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

	public serialise(format = 'xml'): string {
		const mimeType = rdfSerialisationFormat[format.toLowerCase()] ?? format;

		const output = rdflib.serialize(null, this.kb, this.baseIRI, mimeType);
		if (!output) {
			throw new Error(`Invalid output format '${format}'!`);
		}

		return output;
	}

	public serialiseXmp(): string {
		const output = this.serialise()
			.replace(/^( {4})+/gm, (match) => '\t'.repeat(match.length / 4))
			.replace(/\n$/, '')
			.replace(/^/gm, '\t');
		return `<?xpacket begin="${bom}" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
${output}</x:xmpmeta>
<?xpacket end="w"?>`;
	}

	private getOrCreateRdfElement(xmpMeta: Element): Element {
		for (const childNode of xmpMeta.childNodes) {
			if (childNode.nodeType === Node.ELEMENT_NODE) {
				const child = childNode as unknown as Element;
				if (child.attributes) {
					for (let i = 0; i < child.attributes.length; ++i) {
						const attr = child.attributes.item(i);
						if (attr?.name.startsWith('xmlns:') && attr.name.length > 6) {
							if (attr.value === XmpDocument.NS_RDF) {
								const prefix = attr.name.slice(6);
								if (child.nodeName === `${prefix}:RDF`) {
									return child;
								}
							}
						}
					}
				}
			}
		}

		// Create and attach <rdf:RDF>
		const newRdf = this.doc.createElementNS(XmpDocument.NS_RDF, 'rdf:RDF');
		xmpMeta.appendChild(newRdf);
		return newRdf;
	}
}
