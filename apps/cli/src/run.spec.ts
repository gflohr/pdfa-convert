import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from 'vitest';
import { Text } from './commands/text.js';
import type { ConvertOptions } from './convert.js';
import * as convertModule from './convert.js';
import { Package } from './package.js';
import { run } from './run.js';

describe('pdf-lab-cli', () => {
	let consoleErrorSpy: MockInstance<(...args: unknown[]) => void>;

	beforeEach(() => {
		consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	describe('normal operation', () => {
		it('convert files', async () => {
			const argv = ['text', 'sample.pdf'];

			const convertSpy = vi
				.spyOn(convertModule, 'convert')
				.mockResolvedValue(undefined);
			const exitCode = await run(argv);

			expect(exitCode).toBe(0);
			expect(convertSpy).toHaveBeenCalledTimes(1);
			expect(convertSpy).toHaveBeenCalledWith({
				input: 'sample.pdf',
			});
		});

		it('should log exceptions', async () => {
			const argv = ['text', 'sample.pdf'];

			vi.spyOn(convertModule, 'convert').mockRejectedValue('boum');
			await run(argv);

			expect(consoleErrorSpy).toHaveBeenCalledWith(`${Package.name}: boum`);
		});

		it('should use defaults', async () => {
			const convertSpy = vi
				.spyOn(convertModule, 'convert')
				.mockResolvedValue(undefined);

			const exitCode = await run(['text']);

			expect(exitCode).toBe(0);
			expect(convertSpy).toHaveBeenCalledTimes(1);

			const defaultOptions: ConvertOptions = {
				input: '-',
			};
			expect(convertSpy).toHaveBeenCalledWith(defaultOptions);
		});

		it('should allow a custom synopsis', async () => {
			const consoleLogSpy: MockInstance<(...args: unknown[]) => void> = vi
				.spyOn(console, 'log')
				.mockImplementation(() => {});
			const processExitSpy: MockInstance<(...args: unknown[]) => never> = vi
				.spyOn(process, 'exit')
				.mockImplementation(() => {
					throw new Error('exit');
				});
			const synopsisSpy = vi.fn().mockReturnValueOnce('help yourself');
			Object.defineProperty(Text.prototype, 'synopsis', {
				value: synopsisSpy,
				configurable: true,
			});

			await expect(run(['text', '--help'])).rejects.toThrow('exit');

			expect(synopsisSpy).toHaveBeenCalledTimes(1);
			expect(consoleLogSpy).toHaveBeenCalledTimes(1);
			expect(consoleLogSpy).toHaveBeenCalledWith(
				expect.stringMatching(/help yourself/),
			);

			delete (Text.prototype as { synopsis?: unknown }).synopsis;
			processExitSpy.mockRestore();
		});

		it('should honour command-line options', async () => {
			const convertSpy = vi
				.spyOn(convertModule, 'convert')
				.mockResolvedValue(undefined);

			const exitCode = await run(['text', '--input=example.pdf']);

			expect(exitCode).toBe(0);
			expect(convertSpy).toHaveBeenCalledTimes(1);

			const defaultOptions: ConvertOptions = {
				input: 'example.pdf',
			};
			expect(convertSpy).toHaveBeenCalledWith(defaultOptions);
		});

		it('should fix lone hyphen as a positional argument', async () => {
			const convertSpy = vi
				.spyOn(convertModule, 'convert')
				.mockResolvedValue(undefined);

			const exitCode = await run(['text', '-']);

			expect(exitCode).toBe(0);
			expect(convertSpy).toHaveBeenCalledTimes(1);

			const defaultOptions: ConvertOptions = {
				input: '-',
			};
			expect(convertSpy).toHaveBeenCalledWith(defaultOptions);
		});

		it('should re-throw exceptions', async () => {
			const optionsSpy = vi
				.spyOn(Text.prototype, 'options')
				.mockImplementation(() => {
					throw new Error('boum');
				});

			await expect(run(['text'])).rejects.toThrow('boum');

			expect(optionsSpy).toHaveBeenCalledTimes(1);
			expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'pdf-lab: unhandled exception: Error: boum',
			);
		});
	});
});
