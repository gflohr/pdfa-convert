#! /usr/bin/env node

import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Textdomain } from '@esgettext/runtime';
import * as v from 'valibot';
import '@valibot/i18n/de';
import type { Arguments, Argv } from 'yargs';
import yargs from 'yargs';

import type { Command } from './command.js';
import { Text } from './commands/text.js';
import { Package } from './package.js';

const commandNames = ['text'];

const gtx = Textdomain.getInstance('pdf-lab');
v.setGlobalConfig({ lang: Textdomain.locale });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localePath = path.join(__dirname, 'locale');
gtx.bindtextdomain(localePath);
gtx.resolve()
	.then(async () => {
		let exitCode = 0;
		const ulocale = Textdomain.locale.replace('-', '_');

		const commands: { [key: string]: Command } = {
			text: new Text(),
		};

		const program = yargs(process.argv.slice(2))
			.locale(ulocale)
			.strict()
			.showHelpOnFail(
				false,
				gtx._x(
					"Try '{programName} --help' or '{programName} COMMAND --help' for more information!",
					{
						programName: Package.name,
					},
				),
			)
			.alias('V', 'version')
			.alias('h', 'help')
			.demandCommand(1, gtx._('Error: No command given.'))
			.scriptName(Package.name);

		for (const name of commandNames) {
			const command = commands[name];

			const commandName = command.synopsis
				? `${name} ${command.synopsis()}`
				: `${name} [input]`;

			program.command({
				command: commandName,
				aliases: command.aliases(),
				describe: command.description(),
				builder: (argv: Argv) => {
					return command.build(argv)
						.positional('input', {
							describe: gtx._('Input file'),
							type: 'string',
							nargs: 1,
						});
				},
				handler: async (argv: Arguments) => {
					argv._.shift();
					exitCode = await command.run(argv);
				},
			});
		}
		const epilogue = gtx._x('Report bugs in the bugtracker at\n{url}!', {
			url: Package.bugTrackerUrl,
		});

		await program.help().epilogue(epilogue).parse();

		process.exit(exitCode);
	})
	.catch((exception: Error) => {
		console.error(
			gtx._x('{programName}: unhandled exception: {exception}', {
				programName: Package.name,
				exception,
			}),
		);

		process.exit(2);
	});
