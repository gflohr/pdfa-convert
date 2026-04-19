import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from 'vitest';
import type { ConvertOptions } from './convert.js';
import * as convertModule from './convert.js';
import { Package } from './package.js';
import { run } from './run.js';

describe('pdf-lab-cli', () => {
	let consoleErrorSpy: MockInstance<(...args: unknown[]) => void>;

	beforeEach(() => {
		consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		vi.spyOn(process, 'exit').mockImplementation((() => {
			throw new Error('process.exit');
		}) as unknown as () => never);
	});

	describe('normal operation', () => {
		it('convert files', async () => {
			const argv = ['sample.pdf'];

			const convertSpy = vi
				.spyOn(convertModule, 'convert')
				.mockResolvedValue(undefined);
			const exitCode = await run(argv);

			expect(exitCode).toBe(0);
			expect(convertSpy).toHaveBeenCalledTimes(1);
			expect(convertSpy).toHaveBeenCalledWith({
				input: 'sample.pdf',
				output: '-',
				standard: 'PDF/A-3b',
				fonts: {},
			});
		});

		it('should log exceptions', async () => {
			const argv = ['sample.pdf'];

			vi.spyOn(convertModule, 'convert').mockRejectedValue('boum');

			await expect(run(argv)).rejects.toThrow('boum');

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				`${Package.name}: conversion failed`,
			);
		});

		it('should use defaults', async () => {
			const convertSpy = vi
				.spyOn(convertModule, 'convert')
				.mockResolvedValue(undefined);

			const exitCode = await run([]);

			expect(exitCode).toBe(0);
			expect(convertSpy).toHaveBeenCalledTimes(1);

			const defaultOptions: ConvertOptions = {
				input: '-',
				output: '-',
				standard: 'PDF/A-3b',
				fonts: {},
			};
			expect(convertSpy).toHaveBeenCalledWith(defaultOptions);
		});

		it('should honour command-line options', async () => {
			const convertSpy = vi
				.spyOn(convertModule, 'convert')
				.mockResolvedValue(undefined);

			const exitCode = await run([
				'--input=example.pdf',
				'--output=converted.pdf',
				'--standard=PDF/A-2b',
			]);

			expect(exitCode).toBe(0);
			expect(convertSpy).toHaveBeenCalledTimes(1);

			const defaultOptions: ConvertOptions = {
				input: 'example.pdf',
				output: 'converted.pdf',
				standard: 'PDF/A-2b',
				fonts: {},
			};
			expect(convertSpy).toHaveBeenCalledWith(defaultOptions);
		});

		it('should fix lone hyphen as a positional argument', async () => {
			const convertSpy = vi
				.spyOn(convertModule, 'convert')
				.mockResolvedValue(undefined);

			const exitCode = await run(['-']);

			expect(exitCode).toBe(0);
			expect(convertSpy).toHaveBeenCalledTimes(1);

			const defaultOptions: ConvertOptions = {
				input: '-',
				output: '-',
				standard: 'PDF/A-3b',
				fonts: {},
			};
			expect(convertSpy).toHaveBeenCalledWith(defaultOptions);
		});
	});

	describe('font mapping', () => {
		it('should accept font mappings', async () => {
			const convertSpy = vi
				.spyOn(convertModule, 'convert')
				.mockResolvedValue(undefined);

			const argv = [
				'--font=Helvetica=h.ttf',
				'--font=Courier=c.otf',
				'--font',
				'Times Roman=t.ttf',
			];
			const exitCode = await run(argv);

			expect(exitCode).toBe(0);
			expect(convertSpy).toHaveBeenCalledTimes(1);

			const defaultOptions: ConvertOptions = {
				input: '-',
				output: '-',
				standard: 'PDF/A-3b',
				fonts: {
					Helvetica: 'h.ttf',
					Courier: 'c.otf',
					'Times Roman': 't.ttf',
				},
			};
			expect(convertSpy).toHaveBeenCalledWith(defaultOptions);
		});

		it('should reject invalid font mappings', async () => {
			const convertSpy = vi
				.spyOn(convertModule, 'convert')
				.mockResolvedValue(undefined);

			const argv = ['--font=Times Roman|t.ttf', '--font=Helvetica:h.ttf'];
			const exitCode = await run(argv);

			expect(exitCode).toBe(1);
			expect(convertSpy).not.toHaveBeenCalled();
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				expect.stringMatching('invalid font map specification'),
			);
		});
	});
});
