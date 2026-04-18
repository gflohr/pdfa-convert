import {
	decodePDFRawStream,
	PDFArray,
	PDFDict,
	type PDFDocument,
	PDFName,
	type PDFObject,
	type PDFPage,
	PDFRawStream,
} from '@cantoo/pdf-lib';
import { Lexer } from './lexer.js';

type TextCollector = Record<string, string[]>;

export class PDFTextExtractor {
	parseDocument(pdfDoc: PDFDocument): TextCollector {
		const collector: TextCollector = {};
		const pages = pdfDoc.getPages();
		for (let i = 0; i < pages.length; ++i) {
			this.parsePage(collector, pages[i], pdfDoc);
		}

		return collector;
	}

	private parseRecursively(
		collector: TextCollector,
		obj: PDFObject,
		pdfDoc: PDFDocument,
	) {
		if (obj instanceof PDFRawStream) {
			this.parseStream(collector, obj);
			this.parseDictionary(collector, obj.dict, pdfDoc);
		} else if (obj instanceof PDFDict) {
			this.parseDictionary(collector, obj, pdfDoc);
		} else if (obj instanceof PDFArray) {
			for (let i = 0; i < obj.size(); ++i) {
				const item = obj.get(i);
				const resolved = pdfDoc.context.lookup(item);
				if (resolved) {
					this.parseRecursively(collector, resolved, pdfDoc);
				}
			}
		}
	}

	private parseDictionary(
		collector: TextCollector,
		dict: PDFDict,
		pdfDoc: PDFDocument,
	) {
		const resources = dict.get(PDFName.of('Resources'));
		if (!resources) return;

		const res = pdfDoc.context.lookup(resources);
		if (!(res instanceof PDFDict)) return;

		const xObject = res?.get(PDFName.of('XObject'));
		if (!xObject) return;

		const xo = pdfDoc.context.lookupMaybe(xObject, PDFDict);
		if (!xo) return;

		xo.keys().forEach((key) => {
			const ref = xo.get(key);
			const resolved = pdfDoc.context.lookup(ref);
			if (resolved instanceof PDFRawStream) {
				this.parseStream(collector, resolved);
			}
		});
	}

	private parsePage(
		collector: TextCollector,
		page: PDFPage,
		pdfDoc: PDFDocument,
	) {
		const node = page.node;

		const contents = node.get(PDFName.of('Contents'));
		if (!contents) return;

		this.parseRecursively(collector, contents, pdfDoc);
	}

	private parseStream(collector: TextCollector, stream: PDFRawStream) {
		const decoded = decodePDFRawStream(stream);
		const bytes = decoded.getBytes(0);

		const lexer = new Lexer();
		const tokens = lexer.tokenize(bytes);

		let inText = false;
		let fontResource = '';
		for (let i = 1; i < tokens.length; ++i) {
			const token = tokens[i];
			if (token.type === 'token') {
				const value = this.decodeNumberArray(token.value);
				switch (value) {
					case 'BT':
						inText = true;
						console.log('start text block');
						break;
					case 'ET':
						inText = false;
						fontResource = '';
						console.log('end text block');
						break;
					case 'Tf':
						if (inText && i > 1 && tokens[i - 2].type === 'token') {
							fontResource = this.decodeNumberArray(tokens[i - 2].value);
							console.log(`font resource name: ${fontResource}`);
							collector[fontResource] ??= [];
						}
						break;
					case 'Tj':
					case '"':
					case "'":
						if (inText) {
							console.log(tokens[i - 1]);
						}
						break;
				}
			}
		}
	}

	private decodeNumberArray(value: number[]): string {
		return value.map((c) => String.fromCharCode(c)).join('');
	}
}
