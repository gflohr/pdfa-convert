import * as fs from 'node:fs/promises';
import { stdin } from 'node:process';

export async function loadInput(
	filename: string,
): Promise<Uint8Array<ArrayBufferLike>> {
	return filename === '-' ? readStdin() : fs.readFile(filename);
}

async function readStdin(): Promise<Uint8Array> {
	const chunks: Buffer[] = [];

	for await (const chunk of stdin) chunks.push(chunk);

	return Buffer.concat(chunks);
}
