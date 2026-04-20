import * as fs from 'node:fs/promises';
import { PDFDocument } from '@cantoo/pdf-lib';
// biome-ignore lint/correctness/useImportExtensions: false positive
import { TextExtractor } from 'pdf-lab-core';
import { beforeEach, describe, expect, it, type MockedClass, vi } from 'vitest';

vi.mock('node:fs/promises', () => ({
	readFile: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
}));

vi.mock('pdf-lab-core');
vi.mock('@pdf-lib/fontkit', () => ({ default: {} }));

vi.mock('./read-stdin.js', () => ({
	readStdin: vi.fn().mockResolvedValue(new TextEncoder().encode('%PDF-1.7')),
}));

import { type ConvertOptions, convert } from './convert.js';
import { readStdin } from './read-stdin.js';

describe('convert', () => {
	let extractMock: (...args: unknown[]) => Promise<void>;
	const registerFontkitMock = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		vi.resetAllMocks();

		vi.spyOn(PDFDocument, 'load').mockResolvedValue({
			registerFontkit: registerFontkitMock,
		} as unknown as PDFDocument);

		const TextExtractorMock = TextExtractor as unknown as MockedClass<
			typeof TextExtractor
		>;

		extractMock = vi.fn().mockResolvedValue(undefined);

		TextExtractorMock.mockImplementation(function (this: TextExtractor) {
			this.extract = extractMock;
		});
	});

	it('reads files, loads PDFs, registers fontkit, and extracts text', async () => {
		const options: ConvertOptions = {
			input: 'a.pdf',
		};

		await convert(options);

		expect(fs.readFile).toHaveBeenCalledTimes(1);
		expect(fs.readFile).toHaveBeenCalledWith('a.pdf');

		expect(PDFDocument.load).toHaveBeenCalledTimes(1);
		expect(registerFontkitMock).toHaveBeenCalledTimes(1);

		expect(extractMock).toHaveBeenCalledTimes(1);
	});

	it('reads from standard input', async () => {
		const options: ConvertOptions = {
			input: '-',
		};

		await convert(options);

		expect(readStdin).toHaveBeenCalledTimes(1);

		expect(PDFDocument.load).toHaveBeenCalledTimes(1);
		expect(registerFontkitMock).toHaveBeenCalledTimes(1);

		expect(extractMock).toHaveBeenCalledTimes(1);
	});
});
