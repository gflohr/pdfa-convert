import * as fs from 'node:fs/promises';
import { PDFDocument } from '@cantoo/pdf-lib';
import fontkit from '@pdf-lib/fontkit';
// biome-ignore lint/correctness/useImportExtensions: false positive
import { TextExtractor } from 'pdf-lab-core';
import { readStdin } from './read-stdin.js';

export type ConvertOptions = {
	input: string;
};

export async function convert(options: ConvertOptions) {
	const extractor = new TextExtractor();

	const pdfBytes =
		options.input === '-'
			? await readStdin()
			: await fs.readFile(options.input);
	const pdfDoc = await PDFDocument.load(new Uint8Array(pdfBytes), {
		ignoreEncryption: true,
	});
	pdfDoc.registerFontkit(fontkit);

	await extractor.extract(pdfDoc);
}
