#!/usr/bin/env node

import * as path from 'node:path';
import * as url from 'node:url';
import { Textdomain } from '@esgettext/runtime';
import type { PDFAStandard } from 'pdf-lab-core';
import yargs from 'yargs';
import { type ConvertOptions, convert } from './convert.js';
import { Package } from './package.js';

const gtx = Textdomain.getInstance('pdfa-convert');

export async function run(argv = process.argv.slice(2)) {
	const __filename = url.fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	const localePath = path.join(__dirname, 'locale');
	gtx.bindtextdomain(localePath);

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
		.option('input', {
			alias: 'i',
			type: 'string',
			describe: gtx._("PDF file to read ('-' for standard input)"),
			nargs: 1,
		})
		.option('output', {
			alias: 'o',
			type: 'string',
			describe: gtx._("PDF file to write ('-' for standard output)"),
			default: '-',
			nargs: 1,
		})
		.option('standard', {
			alias: 's',
			type: 'string',
			describe: gtx._('PDF/A conformance level and version'),
			array: false,
			default: 'PDF/A-3b',
			choices: ['PDF/A-1b', 'PDF/A-2b', 'PDF/A-3b'],
		})
		.option('font', {
			alias: 'f',
			type: 'string',
			describe: gtx._('Font mapping (NAME=PATH)'),
			array: true,
			nargs: 1,
		})
		.version(Package.version)
		.command('$0 [file]', gtx._('Process PDF files'), (y) =>
			y.positional('file', {
				describe: gtx._('PDF documents to process'),
				type: 'string',
				nargs: 1,
			}),
		)
		.conflicts('file', 'input')
		.usage('$0 [OPTIONS] PDFs...')
		.alias('V', 'version')
		.alias('h', 'help')
		.scriptName(Package.name);

	const epilogue = gtx._x('Report bugs in the bugtracker at\n{url}!', {
		url: Package.bugTrackerUrl,
	});

	const args = await program.help().epilogue(epilogue).parse();

	let inputFile: string;
	if (typeof args.file !== 'undefined' && (args.file as string).length) {
		inputFile = args.file as string;
	} else if (
		typeof args.input !== 'undefined' &&
		(args.input as string).length
	) {
		inputFile = args.input as string;
	} else {
		inputFile = '-';
	}

	const convertOptions: ConvertOptions = {
		input: inputFile,
		output: args.output,
		standard: args.standard as PDFAStandard,
		fonts: {},
	};

	for (let i = 0; args.font && i < args.font.length; ++i) {
		const [name, path] = args.font[i].split('=', 2);
		if (typeof path === 'string' && name.length && path.length) {
			convertOptions.fonts[name] = path;
		} else {
			console.error(
				gtx._x(
					"{programName}: invalid font map specification '{spec}': expected NAME=PATH.",
					{
						programName: Package.name,
						spec: args.font[i],
					},
				),
			);
			return 1;
		}
		convertOptions.fonts;
	}

	try {
		await convert(convertOptions);
	} catch (exception) {
		console.error(
			gtx._x('{programName}: conversion failed', {
				programName: Package.name,
			}),
		);

		throw exception;
	}

	return 0;
}
