import type { Arguments } from 'yargs';
import type { OptSpec } from './optspec.js';
export interface Command {
	synopsis?(): string;
	description(): string;
	aliases(): string[];
	options(): Record<string, OptSpec>;
	run(pdfyBytes: Buffer, argv: Arguments): Promise<number>;
}
