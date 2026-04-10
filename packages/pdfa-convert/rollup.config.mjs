import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

function tsPlugin(tsconfig) {
	return typescript({
		tsconfig,
		exclude: ['**/*.spec.ts'],
	});
}

const external = [
	// Node built-ins
	'fs',
	'path',
	'stream',
	'util',
];

export default [
	{
		input: 'src/index.ts',
		output: {
			file: 'dist/index.esm.js',
			format: 'esm',
			sourcemap: true,
		},
		external,
		plugins: [
			json(),
			tsPlugin('./tsconfig.build.json'),
			nodeResolve(),
			commonjs(),
		],
	},
	{
		input: 'src/index.ts',
		output: {
			file: 'dist/index.cjs.js',
			format: 'cjs',
			sourcemap: true,
			exports: 'named',
		},
		external,
		plugins: [
			json(),
			tsPlugin('./tsconfig.build.json'),
			nodeResolve(),
			commonjs(),
		],
	},
	{
		input: 'src/index.ts',
		output: {
			file: 'dist/index.browser.js',
			format: 'esm',
			sourcemap: true,
		},
		plugins: [
			json(),
			tsPlugin('./tsconfig.build.json'),
			nodeResolve({
				browser: true,
			}),
			commonjs(),
		],
	},
];
