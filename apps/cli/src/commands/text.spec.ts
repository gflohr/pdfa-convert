import type { PDFDocument } from '@cantoo/pdf-lib';
// biome-ignore lint/correctness/useImportExtensions: false positive.
import { TextExtractor } from 'pdf-lab-core';
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type Mock,
	vi,
} from 'vitest';
import type { Arguments } from 'yargs';
import { coerceOptions } from '../optspec.js';

vi.mock('../optspec.js');
vi.mock('./load-pdf.js', () => ({
	loadPDF: vi.fn().mockResolvedValue({
		pdf: true,
	} as unknown as PDFDocument),
}));

import { Text } from './text.js';

describe('Text Command', () => {
	let text: Text;
	const pdfDoc = {} as unknown as PDFDocument;

	beforeEach(() => {
		text = new Text();
		(coerceOptions as Mock).mockReturnValue(true);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('description() should return a valid description', () => {
		expect(text.description()).toBe('Extract text from a PDF document.');
	});

	it('aliases() should return an empty array', () => {
		expect(text.aliases()).toEqual([]);
	});

	it('options() should return options', () => {
		const options = text.options();

		expect(options).toBeDefined();
	});

	it('run() should return 1 if coerceOptions fails', async () => {
		(coerceOptions as Mock).mockReturnValue(false);
		const pdfDoc = {} as PDFDocument;

		const result = await text.run(pdfDoc, {} as Arguments);

		expect(result).toBe(1);
	});

	it('run() should call extract and return 0 on success', async () => {
		(coerceOptions as Mock).mockReturnValue(true);
		const extractMock = vi
			.spyOn(
				TextExtractor.prototype as unknown as { extract: () => Promise<void> },
				'extract',
			)
			.mockResolvedValue(undefined);

		const result = await new Text().run(pdfDoc, {} as Arguments);

		expect(extractMock).toHaveBeenCalledTimes(1);
		expect(result).toBe(0);
	});

	it('run() should return 1 and log an error if doRun throws', async () => {
		(coerceOptions as Mock).mockReturnValue(true);
		const error = new Error('test error');
		vi.spyOn(
			text as unknown as { doRun: () => Promise<void> },
			'doRun',
		).mockRejectedValue(error);

		const consoleErrorSpy = vi
			.spyOn(console, 'error')
			.mockImplementation(() => {});

		const result = await text.run(pdfDoc, {} as Arguments);

		expect(consoleErrorSpy).toHaveBeenCalledWith('pdf-lab: Error: test error');
		expect(result).toBe(1);
	});

	describe('info()', () => {
		let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

		beforeEach(() => {
			consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		});

		afterEach(() => {
			consoleErrorSpy.mockRestore();
		});

		it('should call extract', async () => {
			const extractMock = vi
				.spyOn(
					TextExtractor.prototype as unknown as {
						extract: () => Promise<void>;
					},
					'extract',
				)
				.mockResolvedValue(undefined);

			const options = {} as unknown as Arguments;

			await text.run(pdfDoc, options);

			expect(extractMock).toHaveBeenCalledTimes(1);
			expect(extractMock).toHaveBeenCalledWith(pdfDoc);
		});
	});
});
