import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from 'vitest';
import * as convertModule from './convert.js';
import { Package } from './package.js';
import { run } from './run.js';

describe('pdfa-convert-cli', () => {
	let consoleLogSpy: MockInstance<(...args: unknown[]) => void>;
	let consoleErrorSpy: MockInstance<(...args: unknown[]) => void>;
	let exitSpy: MockInstance<
		(...args: [code?: string | number | null | undefined]) => never
	>;

	beforeEach(() => {
		consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
		consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
			throw new Error('process.exit');
		}) as unknown as () => never);
	});

	it('option --help', async () => {
		const argv = ['--help'];

		const exitCode = await run(argv);

		expect(exitCode).toBe(2);
		expect(consoleLogSpy).toHaveBeenCalledWith(
			expect.stringMatching('Report bugs'),
		);
		expect(exitSpy).toHaveBeenCalledWith(0);
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			`${Package.name}: unhandled exception: Error: process.exit`,
		);
	});

	it('option --version', async () => {
		const argv = ['--version'];

		const exitCode = await run(argv);

		expect(exitCode).toBe(2);
		expect(consoleLogSpy).toHaveBeenCalledWith(Package.version);
		expect(exitSpy).toHaveBeenCalledWith(0);
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			`${Package.name}: unhandled exception: Error: process.exit`,
		);
	});

	it('convert files', async () => {
		const argv = ['a.pdf', 'b.pdf', 'c.pdf'];

		const convertSpy = vi
			.spyOn(convertModule, 'convert')
			.mockResolvedValue(undefined);
		const exitCode = await run(argv);

		expect(exitCode).toBe(0);
		expect(convertSpy).toHaveBeenCalledTimes(1);
		expect(convertSpy).toHaveBeenCalledWith(argv);
	});

	it('exit with code 1 if an error occurs', async () => {
		const argv = ['a.pdf', 'b.pdf', 'c.pdf'];

		vi.spyOn(convertModule, 'convert').mockRejectedValue('boum');
		const exitCode = await run(argv);

		expect(exitCode).toBe(1);
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			`${Package.name}: conversion failed: boum`,
		);
	});
});
