import * as fs from 'node:fs/promises';
import { stdin } from 'node:process';
import { PDFDocument } from '@cantoo/pdf-lib';

export async function loadPDF(filename: string): Promise<PDFDocument> {
	const pdfBytes =
		filename === '-' ? await readStdin() : await fs.readFile(filename);

	return await PDFDocument.load(new Uint8Array(pdfBytes), {
		ignoreEncryption: true,
	});
}

async function readStdin(): Promise<Uint8Array> {
	const chunks: Buffer[] = [];

	for await (const chunk of stdin) chunks.push(chunk);

	return Buffer.concat(chunks);
}
