import { stdin } from 'node:process';

export async function readStdin(): Promise<Uint8Array> {
	const chunks: Buffer[] = [];

	for await (const chunk of stdin) chunks.push(chunk);

	return Buffer.concat(chunks);
}
