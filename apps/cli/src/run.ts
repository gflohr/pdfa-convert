#!/usr/bin/env node

import * as path from 'node:path';
import * as url from 'node:url';
import { Textdomain } from '@esgettext/runtime';
import yargs from 'yargs';

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
			.version(Package.version)
			.alias('V', 'version')
			.alias('h', 'help')
			.scriptName(Package.name);

		const epilogue = gtx._x('Report bugs in the bugtracker at\n{url}!', {
			url: Package.bugTrackerUrl,
		});

		await program.help().epilogue(epilogue).parse();

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
