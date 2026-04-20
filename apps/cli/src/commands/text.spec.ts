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
import yargs from 'yargs';
import { coerceOptions } from '../optspec.js';
import { Package } from '../package.js';
import { Text } from './text.js';

vi.mock('../optspec');
vi.mock('../package');

describe('Text Command', () => {
	let text: Text;
	let consoleSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		text = new Text();
		consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
		(coerceOptions as Mock).mockReturnValue(true);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('description() should return a valid description', () => {
		expect(text.description()).toBe(
			'List and describe supported formats.',
		);
	});

	it('aliases() should return an empty array', () => {
		expect(text.aliases()).toEqual([]);
	});

	it('build() should add expected options to yargs', () => {
		const mockArgv = yargs([]);
		const optionsSpy = vi.spyOn(mockArgv, 'options');

		text.build(mockArgv);

		expect(optionsSpy).toHaveBeenCalledWith({
			list: expect.objectContaining({
				group: 'Operation mode',
				alias: ['l'],
				type: 'boolean',
				conflicts: 'info',
				demandOption: false,
				describe: 'list all supported formats',
			}),
			info: expect.objectContaining({
				group: 'Operation mode',
				alias: ['i'],
				type: 'string',
				conflicts: 'list',
				demandOption: false,
				describe: 'show detailed information about one format',
			}),
		});
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

		(Package.getName as Mock).mockReturnValue('pdf-lab');

		const result = await text.run({} as Arguments);

		expect(consoleErrorSpy).toHaveBeenCalledWith(
			'pdf-lab: Error: test error',
		);
		expect(result).toBe(1);

		consoleErrorSpy.mockRestore();
	});

	describe('info()', () => {
		let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

		beforeEach(() => {
			consoleErrorSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});
		});

		afterEach(() => {
			consoleErrorSpy.mockRestore();
		});

		it('should display detailed information about each text snippet', async () => {
			const options = { info: 'FormatC' } as unknown as Arguments;

			await text.run(options);

			expect(consoleSpy).toHaveBeenCalledWith('name: FormatC');
		});
	});
});
