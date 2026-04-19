import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import { PDFDocument } from '@cantoo/pdf-lib';
import fontkit from '@pdf-lib/fontkit';
// biome-ignore lint/correctness/useImportExtensions: false positive
import { PDFAConvert, type PDFAStandard } from 'pdf-lab-core';
import { readStdin } from './read-stdin.js';

export type ConvertOptions = {
	input: string;
	output: string;
	standard: PDFAStandard;
	fonts: Record<string, string>;
};

export async function convert(options: ConvertOptions) {
	const converter = new PDFAConvert(os.platform(), {});

	const pdfBytes =
		options.input === '-'
			? await readStdin()
			: await fs.readFile(options.input);
	const pdfDoc = await PDFDocument.load(new Uint8Array(pdfBytes), {
		ignoreEncryption: true,
	});
	pdfDoc.registerFontkit(fontkit);

	await converter.convert(pdfDoc);
}
