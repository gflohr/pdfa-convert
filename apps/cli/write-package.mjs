#! /usr/bin/env node

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const filename = fileURLToPath(import.meta.url);
const directory = dirname(filename);
const packageJsonPath = join(directory, 'package.json');

const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

console.log(`export namespace Package {
	export const name = 'pdf-lab';
	export const bugTrackerUrl = '${pkg.bugs.url}';
	export const version = '${pkg.version}';
	export const authorName = '${pkg.author.name}';
	export const authorUrl = '${pkg.author.url}';
}`);
