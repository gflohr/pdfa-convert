import {
	DOMParser,
	type Document,
	type Element,
	Node,
	XMLSerializer,
} from '@xmldom/xmldom';
import * as rdflib from 'rdflib';

/**
 * Default base IRI.
 */
export const DEFAULT_BASE_IRI = 'urn:xmp:doc';

/**
 * Output formats.
 */
/** Union of all valid key aliases ('xml' | 'html' | 'turtle' | ...) */
export type RdfSerialisationFormat =
	| 'application/rdf+xml'
	| 'text/turtle'
	| 'application/n-triples'
	| 'application/ld+json'
	| 'text/n3'
	| 'application/nquads';

export const rdfSerialisationFormatAlias: Record<
	string,
	RdfSerialisationFormat
> = {
	'application/x-turtle': 'text/turtle',
	'application/n3': 'text/n3',
	'application/n-quads': 'application/nquads',
};

export type RdfSerialisationFormatAlias =
	keyof typeof rdfSerialisationFormatAlias;

/**
 * Serialisation options.
 */
export interface RdfSerialisationOptions {
	/**
	 * Common flags used internally (you can combine them, e.g. 'o k'):
	 *
	 * * s i – used by default for Turtle to suppress =, => notations
	 * * d e i n p r s t u x – used for N-Triples/N-Quads to simplify output
	 * * dr – used with JSON‑LD conversion (no default, no relative prefix)
	 * o – new: do not abbreviate to a prefixed name when the local part contains a dot. This keeps IRIs like http://example.org/ns/subject.example in <...> form instead of ns:subject.example.
	 *
	 * Notes:
	 *
	 * For Turtle and JSON‑LD, user‑provided flags are merged with the defaults so your flags (like o) are honored.
	 * By contrast, passing 'p' disables prefix abbreviations entirely (all terms are written as <...> IRIs).
	 */
	flags?: string;
}

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

/** @internal */
export class XmpDocument {
	private static readonly NS_X = 'adobe:ns:meta/';
	private static readonly NS_RDF =
		'http://www.w3.org/1999/02/22-rdf-syntax-ns#';

	private doc: Document;
	private kb = rdflib.graph();
	private namespaces: Record<string, string> = {};

	constructor(
		xmlString?: string,
		private readonly baseIRI = DEFAULT_BASE_IRI,
	) {
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

	/** @internal */
	public serialise(
		format: RdfSerialisationFormat = 'application/rdf+xml',
		options: RdfSerialisationOptions = {},
	): string {
		const output = rdflib.serialize(null, this.kb, this.baseIRI, format,
			undefined,
			{ ...options, namespaces: this.namespaces },
		);
		if (!output) {
			throw new Error(`Invalid output format '${format}'!`);
		}

		return output;
	}

	/** @internal */
	public serialiseXmp(): string {
		const output = this.serialise('application/rdf+xml', undefined)
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
