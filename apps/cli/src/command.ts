import type { Arguments } from 'yargs';
import type { OptSpec } from './optspec.js';

export interface Command {
	synopsis?(): string;
	description(): string;
	aliases(): Array<string>;
	options(): Record<string, OptSpec>;
	run(argv: Arguments): Promise<number>;
}
