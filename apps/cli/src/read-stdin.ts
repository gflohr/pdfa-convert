import { stdin } from 'node:process';

export async function readStdin(): Promise<Uint8Array> {
	const chunks: Uint8Array[] = [];

	for await (const chunk of stdin) {
		if (typeof chunk === 'string') {
			chunks.push(new TextEncoder().encode(chunk));
		} else {
			chunks.push(chunk);
		}
	}

	const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
	const result = new Uint8Array(totalLength);

	let offset = 0;
	for (const chunk of chunks) {
		result.set(chunk, offset);
		offset += chunk.length;
	}

	return result;
}
