import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from 'vitest';
import { Package } from './package.js';
import { run } from './run.js';

describe('pdfa-convert-cli', () => {
	let consoleSpy: MockInstance<[...string[]], void>;
	let exitSpy: MockInstance<[code?: string | number | null | undefined], never>;

	beforeEach(() => {
		consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
		exitSpy = vi
			.spyOn(process, 'exit')
			.mockImplementation((() => {}) as unknown as () => never);
	});

	it('option --help', async () => {
		const argv = ['--help'];

		await run(argv);

		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringMatching('Report bugs'),
		);
		expect(exitSpy).toHaveBeenCalledWith(0);
	});

	it('option --version', async () => {
		const argv = ['--version'];

		await run(argv);

		expect(consoleSpy).toHaveBeenCalledWith(Package.version);
		expect(exitSpy).toHaveBeenCalledWith(0);
	});
});
