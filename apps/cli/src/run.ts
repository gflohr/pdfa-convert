#!/usr/bin/env node

import * as path from 'node:path';
import * as url from 'node:url';
import { Textdomain } from '@esgettext/runtime';
import yargs from 'yargs';
import { convert } from './convert.js';
import { Package } from './package.js';

const gtx = Textdomain.getInstance('pdfa-convert-cli');

export async function run(argv = process.argv.slice(2)) {
	const __filename = url.fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	const localePath = path.join(__dirname, 'locale');
	gtx.bindtextdomain(localePath);

	try {
		// Initialize localization
		await gtx.resolve();

		const ulocale = Textdomain.locale.replace('-', '_');

		const program = yargs(argv)
			.locale(ulocale)
			.strict()
			.showHelpOnFail(
				false,
				gtx._x("Try '{programName} --help' for more information!", {
					programName: Package.name,
				}),
			)
			.option('level', {
				alias: 'l',
				type: 'string',
				describe: gtx._('PDF/A conformance level'),
				array: false,
				default: 'PDF/A-3b',
				choices: ['PDF/A-1b', 'PDF/A-2b', 'PDF/A-3b'],
			})
			.option('font', {
				alias: 'f',
				type: 'string',
				describe: gtx._('Font mapping (NAME:PATH)'),
				array: true,
				nargs: 1,
				coerce: (values: string[]) =>
					values.map((value) => {
						const [name, path] = value.split(':', 2);

						if (!name || !path) {
							throw new Error(
								`Invalid --font value: "${value}". Expected NAME:PATH`,
							);
						}

						return { name, path };
					}),
			})
			.version(Package.version)
			.command('$0 <files...>', gtx._('Process PDF files'), (y) =>
				y.positional('files', {
					describe: gtx._('PDF documents to process'),
					type: 'string',
					array: true,
					demandOption: true, // required
				}),
			)
			.usage('$0 [OPTIONS] PDFs...')
			.alias('V', 'version')
			.alias('h', 'help')
			.scriptName(Package.name);

		const epilogue = gtx._x('Report bugs in the bugtracker at\n{url}!', {
			url: Package.bugTrackerUrl,
		});

		const args = await program.help().epilogue(epilogue).parse();

		try {
			await convert(args.files as string[]);
		} catch (exception) {
			console.error(
				gtx._x('{programName}: conversion failed: {exception}', {
					programName: Package.name,
					exception,
				}),
			);
			return 1;
		}

		return 0;
	} catch (exception) {
		console.error(
			gtx._x('{programName}: unhandled exception: {exception}', {
				programName: Package.name,
				exception,
			}),
		);
		return 2;
	}
}
