import {
	decodePDFRawStream,
	PDFArray,
	PDFDict,
	type PDFDocument,
	PDFName,
	PDFObject,
	type PDFPage,
	PDFRawStream,
} from '@cantoo/pdf-lib';

export class PDFTextExtractor {
	parseDocument(pdfDoc: PDFDocument) {
		const pages = pdfDoc.getPages();
		for (let i = 0; i < pages.length; ++i) {
			this.parsePage(pages[i], pdfDoc);
		}
	}

	parseRecursively(obj: PDFObject, pdfDoc: PDFDocument) {
		if (obj instanceof PDFRawStream) {
			this.parseStream(obj);
			this.parseDictionary(obj.dict, pdfDoc);
		} else if (obj instanceof PDFDict) {
			this.parseDictionary(obj, pdfDoc);
		} else if (obj instanceof PDFArray) {
			for (let i = 0; i < obj.size(); ++i) {
				const item = obj.get(i);
				const resolved = pdfDoc.context.lookup(item);
				if (resolved) {
					this.parseRecursively(resolved, pdfDoc);
				}
			}
		}
	}

	parseDictionary(dict: PDFDict, pdfDoc: PDFDocument) {
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
				this.parseStream(resolved);
			}
		});
	}

	parsePage(page: PDFPage, pdfDoc: PDFDocument) {
		const node = page.node;

		const contents = node.get(PDFName.of('Contents'));
		if (!contents) return;

		this.parseRecursively(contents, pdfDoc);
	}

	parseStream(stream: PDFRawStream) {
		const decoded = decodePDFRawStream(stream);
		const bytes = decoded.getBytes(0);

		type Token = {
			type: 'string' | 'token';
			value: number[];
		};
		const tokens: Token[] = [];
		let token: Token = {
			type: 'token',
			value: [],
		};
		let state: 'initial' | 'string' | 'hexstring' = 'initial';
		for (let i = 0; i < bytes.length; ++i) {
			const byte = bytes[i];
			if (state === 'initial') {
				switch (byte) {
					case 40: // Open parenthesis.
						tokens.push(token);
						token = {
							type: 'string',
							value: [],
						};
						state = 'string';
						break;
					case 60: // Left angle bracket.
						tokens.push(token);
						token = {
							type: 'string',
							value: [],
						};
						state = 'hexstring';
						break;
					case 37: // Percent (comment).
						for (let j = i; j < bytes.length; ++j) {
							if (bytes[j] === 10 || bytes[j] === 13) {
								i = j + 1;
								break;
							}
						}
						break;
					default:
						if (byte <= 32) {
							if (token.value.length) {
								tokens.push(token);
							}
							token = { type: 'token', value: [] };
						} else {
							token.value.push(byte);
						}
						break;
				}
			} else if (state === 'string') {
				switch (byte) {
					case 92: // Backslash.
						++i;
						break;
					case 41: // End of string.
						tokens.push(token);
						token = { type: 'token', value: [] };
						state = 'initial';
						break;
					default:
						token.value.push(byte);
						break;
				}
			} else if (state === 'hexstring') {
				if (byte === 62) {
					const value: number[] = [];
					for (let j = 0; j < token.value.length - 1; j += 2) {
						value.push(
							16 * this.hexCharToNumber(token.value[j]) +
								this.hexCharToNumber(token.value[j + 1]),
						);
					}
					token.value = [...value];
					tokens.push(token);
					token = { type: 'token', value: [] };
					state = 'initial';
				} else if (
					(byte >= 48 && byte <= 57) ||
					(byte >= 65 && byte <= 70) ||
					(byte >= 97 && byte <= 102)
				) {
					token.value.push(byte);
				}
			}
		}

		for (let i = 1; i < tokens.length; ++i) {
			token = tokens[i];
			if (
				token.type === 'token' &&
				token.value.length === 2 &&
				token.value[0] === 84 &&
				token.value[1] === 106
			) {
				const buffer = Uint8Array.from(tokens[i - 1].value);
				console.log(tokens[i - 1]);
				console.log(new TextDecoder('utf-8').decode(buffer));
			}
		}
	}

	private hexCharToNumber(hex: number): number {
		if (hex >= 97) {
			return hex - 87;
		} else if (hex >= 65) {
			return hex - 55;
		} else {
			return hex - 48;
		}
	}
}
