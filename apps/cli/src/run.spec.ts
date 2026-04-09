import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from 'vitest';
import { run } from './run.js';

vi.mock('./package.js', () => ({
	Package: {
		name: 'pdfa-convert',
		bugTrackerUrl: 'https://example.com/bugs',
	},
}));

describe('pdfa-convert-cli', () => {
	let consoleSpy: MockInstance<[...string[]], void>;
	let exitSpy: MockInstance<[code?: string | number | null | undefined], never>;

	beforeEach(() => {
		consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
		exitSpy = vi
			.spyOn(process, 'exit')
			.mockImplementation((() => {}) as unknown as () => never);
	});

	it('help', async () => {
		const argv = ['--help'];

		await run(argv);

		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringMatching('Report bugs'),
		);
		expect(exitSpy).toHaveBeenCalledWith(0);
	});
});
