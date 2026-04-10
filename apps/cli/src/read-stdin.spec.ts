import { describe, expect, it, vi } from 'vitest';

const mockStdin = vi.hoisted(() => {
	const chunks = [
		Buffer.from('Hello '),
		Buffer.from('world'),
		Buffer.from('!'),
	];

	return {
		chunks,
		stdin: {
			async *[Symbol.asyncIterator]() {
				for (const chunk of chunks) {
					yield chunk;
				}
			},
		},
	};
});

vi.mock('node:process', () => ({
	stdin: mockStdin.stdin,
}));

describe('readStdin', () => {
	it('concatenates stdin chunks', async () => {
		const { readStdin } = await import('./read-stdin.js');

		const result = await readStdin();

		expect(result).toEqual(Buffer.from('Hello world!'));
	});
});
