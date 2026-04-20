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
import { Text } from './text.js';

vi.mock('../optspec.js');
vi.mock('../convert.js', () => ({
	convert: vi.fn(),
}));

import { convert } from '../convert.js';

describe('Text Command', () => {
	let text: Text;

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

		const result = await text.run({} as Arguments);

		expect(result).toBe(1);
	});

	it('run() should call doRun and return 0 on success', async () => {
		(coerceOptions as Mock).mockReturnValue(true);
		const doRunSpy = vi
			.spyOn(text as unknown as { doRun: () => Promise<void> }, 'doRun')
			.mockResolvedValue(undefined);

		const result = await text.run({} as Arguments);

		expect(doRunSpy).toHaveBeenCalled();
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

		const result = await text.run({} as Arguments);

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

		it('should call convert', async () => {
			const options = { input: 'sample.pdf' } as unknown as Arguments;

			await text.run(options);

			expect(convert).toHaveBeenCalledTimes(1);
			expect(convert).toHaveBeenCalledWith(options);
		});
	});
});
