import { Textdomain } from '@esgettext/runtime';
import type { Arguments, Argv, InferredOptionTypes } from 'yargs';

import type { Command } from '../command.js';
import { coerceOptions, type OptSpec } from '../optspec.js';
import { Package } from '../package.js';

const gtx = Textdomain.getInstance('pdf-lab');

const options: {
	input: OptSpec,
} = {
	input: {
		group: gtx._('Input file location'),
		alias: ['i'],
		type: 'string',
		nargs: 1,
		default: '-',
	},
};

export type ConfigOptions = InferredOptionTypes<typeof options>;

export class Text implements Command {
	description(): string {
		return gtx._('List and describe supported formats.');
	}

	aliases(): Array<string> {
		return [];
	}

	build(argv: Argv): Argv<object> {
		return argv.options(options);
	}

	private async doRun(configOptions: ConfigOptions) {
		console.log(configOptions);
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
