import * as fs from 'node:fs/promises';
import { PDFDocument } from '@cantoo/pdf-lib';
import { PDFAConvert } from 'pdfa-convert';
import { beforeEach, describe, expect, it, type MockedClass, vi } from 'vitest';
import { convert } from './convert.js';

vi.mock('node:fs/promises', () => ({
	readFile: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
}));

vi.mock('@cantoo/pdf-lib', async () => {
	const actual =
		await vi.importActual<typeof import('@cantoo/pdf-lib')>('@cantoo/pdf-lib');
	return {
		...actual,
		PDFDocument: {
			load: vi.fn().mockResolvedValue({ registerFontkit: vi.fn() }),
		},
	};
});

vi.mock('pdfa-convert');
vi.mock('@pdf-lib/fontkit', () => ({ default: {} }));

describe('convert', () => {
	let convertMock: (...args: unknown[]) => Promise<void>;

	beforeEach(() => {
		vi.clearAllMocks();

		const PDFAConvertMock = PDFAConvert as unknown as MockedClass<typeof PDFAConvert>;

		convertMock = vi.fn().mockResolvedValue(undefined);

		PDFAConvertMock.mockImplementation(function (this: PDFAConvert, _os?: string, _fontMap?: object) {
			this.convert = convertMock;
		});
	});

	it('reads files, loads PDFs, registers fontkit, and converts', async () => {
		const files = ['a.pdf', 'b.pdf'];
		await convert(files);

		expect(fs.readFile).toHaveBeenCalledTimes(files.length);
		expect(fs.readFile).toHaveBeenCalledWith('a.pdf');
		expect(fs.readFile).toHaveBeenCalledWith('b.pdf');

		expect(PDFDocument.load).toHaveBeenCalledTimes(files.length);

		expect(convertMock).toHaveBeenCalledTimes(files.length);
	});
});
