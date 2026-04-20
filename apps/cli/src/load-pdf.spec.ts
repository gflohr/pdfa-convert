import * as fs from 'node:fs/promises';
import { PDFDocument } from '@cantoo/pdf-lib';
import { describe, expect, it, vi } from 'vitest';

const mockStdin = vi.hoisted(() => {
	const chunks = [
		Buffer.from('Hello '),
		Buffer.from('world'),
		Buffer.from('!'),
	];

	return {
		chunks,
		stdin: {
			async *[Symbol.asyncIterator]() {
				for (const chunk of chunks) {
					yield chunk;
				}
			},
		},
	};
});

vi.mock('node:process', () => ({
	stdin: mockStdin.stdin,
}));

vi.mock('node:fs/promises', () => ({
	readFile: vi.fn(),
}));

vi.mock('@cantoo/pdf-lib', () => ({
	PDFDocument: {
		load: vi.fn(),
	},
}));

describe('PDF loading', () => {
	it('should load a PDF from the file system', async () => {
		const { loadPDF } = await import('./load-pdf.js');
		const mockBuffer = Buffer.from('fake-pdf-content');
		const mockDoc = { title: 'Mock PDF' };

		vi.mocked(fs.readFile).mockResolvedValue(mockBuffer);
		vi.mocked(PDFDocument.load).mockResolvedValue(
			mockDoc as unknown as PDFDocument,
		);

		const result = await loadPDF('test.pdf');

		expect(fs.readFile).toHaveBeenCalledWith('test.pdf');
		expect(PDFDocument.load).toHaveBeenCalledWith(new Uint8Array(mockBuffer), {
			ignoreEncryption: true,
		});
		expect(result).toBe(mockDoc);
	});

	it('should load a PDF from stdin when filename is "-"', async () => {
		const { loadPDF } = await import('./load-pdf.js');
		const mockDoc = { title: 'Stdin PDF' };

		vi.mocked(PDFDocument.load).mockResolvedValue(
			mockDoc as unknown as PDFDocument,
		);

		const result = await loadPDF('-');

		// Verify stdin was concatenated: "Hello world!"
		const expectedBytes = new Uint8Array(Buffer.from('Hello world!'));

		expect(fs.readFile).not.toHaveBeenCalled();
		expect(PDFDocument.load).toHaveBeenCalledWith(expectedBytes, {
			ignoreEncryption: true,
		});
		expect(result).toBe(mockDoc);
	});
});
