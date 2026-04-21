#! /usr/bin/env node

import * as fs from 'node:fs';
import { globSync } from 'glob';
import yaml from 'js-yaml';
import * as path from 'node:path';

import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const workspaceYaml = fs.readFileSync(
	`${rootDir}/pnpm-workspace.yaml`,
	'utf-8',
);
const workspaceConfig = yaml.load(workspaceYaml);
if (
	!workspaceConfig ||
	typeof workspaceConfig !== 'object' ||
	!Array.isArray(workspaceConfig.packages)
) {
	throw new Error(
		'Invalid pnpm-workspace.yaml: expected a top-level "packages" array.',
	);
}
const workspaceGlobs = workspaceConfig.packages;

const roots = [];
for (let pattern of workspaceGlobs) {
	pattern = [rootDir, pattern, 'coverage'].join('/');
	roots.push(...globSync(pattern));
}

const total = {
	lines: { covered: 0, total: 0 },
};

for (const root of roots) {
	const file = [root, 'coverage-summary.json'].join('/');

	const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
	const lines = data.total.lines;

	total.lines.covered += lines.covered;
	total.lines.total += lines.total;
}

const pct =
	total.lines.total > 0 ? (total.lines.covered / total.lines.total) * 100 : 0;

fs.writeFileSync(
	'coverage-summary.json',
	JSON.stringify({ total: { lines: { pct } } }, null, 2) + '\n',
);
