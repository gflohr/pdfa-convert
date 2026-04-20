import type { PDFDocument } from '@cantoo/pdf-lib';
import type { Arguments } from 'yargs';
import type { OptSpec } from './optspec.js';
export interface Command {
	synopsis?(): string;
	description(): string;
	aliases(): string[];
	options(): Record<string, OptSpec>;
	run(pdfDoc: PDFDocument, argv: Arguments): Promise<number>;
}
