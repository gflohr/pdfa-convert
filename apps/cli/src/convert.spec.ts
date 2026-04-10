import * as fs from 'node:fs/promises';
import { PDFDocument } from '@cantoo/pdf-lib';
import { PDFAConvert } from 'pdfa-convert';
import { beforeEach, describe, expect, it, type MockedClass, vi } from 'vitest';

vi.mock('node:fs/promises', () => ({
	readFile: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
}));

vi.mock('pdfa-convert');
vi.mock('@pdf-lib/fontkit', () => ({ default: {} }));

import { type ConvertOptions, convert } from './convert.js';

describe('convert', () => {
	let convertMock: (...args: unknown[]) => Promise<void>;
	const registerFontkitMock = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		vi.spyOn(PDFDocument, 'load').mockResolvedValue({
			registerFontkit: registerFontkitMock,
		} as unknown as PDFDocument);

		const PDFAConvertMock = PDFAConvert as unknown as MockedClass<
			typeof PDFAConvert
		>;

		convertMock = vi.fn().mockResolvedValue(undefined);

		PDFAConvertMock.mockImplementation(function (
			this: PDFAConvert,
			_os?: string,
			_fontMap?: object,
		) {
			this.convert = convertMock;
		});
	});

	it('reads files, loads PDFs, registers fontkit, and converts', async () => {
		const options: ConvertOptions = {
			input: 'a.pdf',
			output: '-',
			standard: 'PDF/A-3b',
			fonts: {},
		};

		await convert(options);

		expect(fs.readFile).toHaveBeenCalledTimes(1);
		expect(fs.readFile).toHaveBeenCalledWith('a.pdf');

		expect(PDFDocument.load).toHaveBeenCalledTimes(1);

		expect(convertMock).toHaveBeenCalledTimes(1);
	});
});
