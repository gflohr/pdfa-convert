import type { PDFDocument } from '@cantoo/pdf-lib';
import { Textdomain } from '@esgettext/runtime';
import fontkit from '@pdf-lib/fontkit';
// biome-ignore lint/correctness/useImportExtensions: false positive.
import { TextExtractor } from 'pdf-lab-core';
import type { Arguments, InferredOptionTypes } from 'yargs';
import type { Command } from '../command.js';
import { defaultOptions } from '../default-options.js';
import { coerceOptions, type OptSpec } from '../optspec.js';
import { Package } from '../package.js';

const gtx = Textdomain.getInstance('pdf-lab');

const options = {};
const allOptions = { ...defaultOptions, ...options };
export type ConfigOptions = InferredOptionTypes<typeof allOptions>;

export class Text implements Command {
	description(): string {
		return gtx._('Extract text from a PDF document.');
	}

	aliases(): Array<string> {
		return [];
	}

	options(): Record<string, OptSpec> {
		return options;
	}

	private async doRun(pdfDoc: PDFDocument) {
		const extractor = new TextExtractor();

		const blocks = await extractor.extract(pdfDoc);
		console.dir(blocks, { depth: null });
	}

	public async run(pdfDoc: PDFDocument, argv: Arguments): Promise<number> {
		if (!coerceOptions(argv, options)) {
			return 1;
		}

		try {
			await this.doRun(pdfDoc);
			return 0;
		} catch (e) {
			console.error(
				gtx._x('{programName}: {error}', {
					programName: Package.name,
					error: e,
				}),
			);

			return 1;
		}
	}
}
