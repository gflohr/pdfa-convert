import { Textdomain } from '@esgettext/runtime';
import { PDFALab, rdfSerialisationFormat } from '@pdfa-lab/core';
import type { Arguments, InferredOptionTypes } from 'yargs';
import type { Command } from '../command.js';
import { defaultOptions } from '../default-options.js';
import { coerceOptions, type OptSpec } from '../util/optspec.js';

const gtx = Textdomain.getInstance('pdfa-lab');

const formatChoices: string[] = [];
for (const shortcut in rdfSerialisationFormat) {
	if (!formatChoices.includes(shortcut)) {
		formatChoices.push(shortcut);
	}
	formatChoices.push(rdfSerialisationFormat[shortcut]!);
}
console.dir(formatChoices);

const options: {
	format: OptSpec,
} = {
	format: {
		group: gtx._('Output format'),
		alias: ['f'],
		type: 'string',
		choices: formatChoices,
		default: 'xml',
		describe: gtx._('the output format'),
	}
};

const allOptions = { ...defaultOptions, ...options };
export type ConfigOptions = InferredOptionTypes<typeof allOptions>;

export class XMPCommand implements Command {
	description(): string {
		return gtx._('Show or manipulate XMP meta information of a PDF document.');
	}

	aliases(): Array<string> {
		return [];
	}

	options(): Record<string, OptSpec> {
		return options;
	}

	private async doRun(input: Buffer, configOptions: ConfigOptions): Promise<number> {
		const lab = await PDFALab.from(input);

		const xml = await lab.extractXMP();
		if (!xml) {
			console.error('Document does not contain XMP meta information.');
			return 1;
		}

		return 0;
	}

	public async run(input: Buffer, argv: Arguments): Promise<number> {
		const configOptions = argv as unknown as ConfigOptions;

		if (!coerceOptions(argv, options)) {
			return 1;
		}

		return await this.doRun(input, configOptions);
	}
}
