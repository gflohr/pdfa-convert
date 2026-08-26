import { Textdomain } from '@esgettext/runtime';
import {
	DEFAULT_BASE_IRI,
	PDFALab,
	type RdfSerialisationFormat,
	type RdfSerialisationFormatKey,
	rdfSerialisationFormat,
} from '@pdfa-lab/core';
import type { Arguments, InferredOptionTypes } from 'yargs';
import type { Command } from '../command.js';
import { defaultOptions } from '../default-options.js';
import { coerceOptions, type OptSpec } from '../util/optspec.js';

const gtx = Textdomain.getInstance('pdfa-lab');

const formatChoices: RdfSerialisationFormat[] = [];
for (const s in rdfSerialisationFormat) {
	const shortcut = s as RdfSerialisationFormatKey;
	if (!formatChoices.includes(shortcut)) {
		formatChoices.push(shortcut);
	}
	formatChoices.push(rdfSerialisationFormat[shortcut]!);
}

const options: {
	'base-iri': OptSpec,
	format: OptSpec;
} = {
	'base-iri': {
		group: gtx._('Mode of Operation'),
		alias: ['b'],
		type: 'string',
		default: DEFAULT_BASE_IRI,
		describe: gtx._('the base IRI'),
	},
	format: {
		group: gtx._('Output format'),
		alias: ['f'],
		type: 'string',
		choices: formatChoices,
		default: 'xml',
		describe: gtx._('the output format'),
	},
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

	private async doRun(
		input: Buffer,
		configOptions: ConfigOptions,
	): Promise<number> {
		const lab = await PDFALab.from(input);

		const serialised = await lab.extractXMP(
			configOptions.format as RdfSerialisationFormat,
		);
		if (!serialised) {
			console.error('Document does not contain XMP meta information.');
			return 1;
		}

		console.log(serialised);

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
