import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import { PDFDocument } from '@cantoo/pdf-lib';
import { PDFAConvert } from '../../../packages/pdfa-convert/src/index.js';

export async function convert(files: string[]) {
	const converter = new PDFAConvert(os.platform(), {});

	for (let i = 0; i < files.length; ++i) {
		const pdfBytes = await fs.readFile(files[i]);
		const pdfDoc = await PDFDocument.load(new Uint8Array(pdfBytes));

		await converter.convert(pdfDoc);
	}
}
