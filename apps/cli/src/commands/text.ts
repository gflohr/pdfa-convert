import { Textdomain } from '@esgettext/runtime';
import type { Arguments, InferredOptionTypes } from 'yargs';

import type { Command } from '../command.js';
import { type ConvertOptions, convert } from '../convert.js';
import { defaultOptions } from '../default-options.js';
import { coerceOptions, type OptSpec } from '../optspec.js';
import { Package } from '../package.js';

const gtx = Textdomain.getInstance('pdf-lab');

const options = {};
const allOptions = { ...defaultOptions, ...options };
export type ConfigOptions = InferredOptionTypes<typeof allOptions>;

export class Text implements Command {
	description(): string {
		return gtx._('List and describe supported formats.');
	}

	aliases(): Array<string> {
		return [];
	}

	options(): Record<string, OptSpec> {
		return options;
	}

	private async doRun(configOptions: ConfigOptions) {
		const convertOptions: ConvertOptions = {
			input: configOptions.input as string,
		};

		await convert(convertOptions);
	}

	public async run(argv: Arguments): Promise<number> {
		const configOptions = argv as unknown as ConfigOptions;

		if (!coerceOptions(argv, options)) {
			return 1;
		}

		try {
			await this.doRun(configOptions);
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
