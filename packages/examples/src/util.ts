import * as path from 'node:path';

/**
 *
 * @param relname the font filename relative to the fontkit test/data directory.
 * @returns the full path name of the file.
 */
export function findFontkitTestFont(relname: string) {
	return path.resolve(
		import.meta.dirname,
		'..',
		'..',
		'fontkit',
		'test',
		'data',
		relname,
	);
}
