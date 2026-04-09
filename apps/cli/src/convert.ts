import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import { PDFDocument } from '@cantoo/pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { PDFAConvert } from 'pdfa-convert';

export async function convert(files: string[]) {
	const converter = new PDFAConvert(os.platform(), {});

	for (let i = 0; i < files.length; ++i) {
		const pdfBytes = await fs.readFile(files[i]);
		const pdfDoc = await PDFDocument.load(new Uint8Array(pdfBytes));
		pdfDoc.registerFontkit(fontkit);

		await converter.convert(pdfDoc);
	}
}
