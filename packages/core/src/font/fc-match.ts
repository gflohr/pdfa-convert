import type { FontDescription } from './resolve-font.js';
import type { FontData } from './types.js';

export async function fcMatch(
	desc: FontDescription,
	fcMatchPath: string,
): Promise<FontData | undefined> {
	const isNode =
		Object.prototype.toString.call(
			typeof process !== 'undefined' ? process : 0,
		) === '[object process]';
	if (!isNode) return;

	const cpModuleName = 'node:child_process';
	const { execFile } = await import(cpModuleName);
	const utilModuleName = 'node:util';
	const { promisify } = await import(utilModuleName);
	const fsModuleName = 'node:fs/promises';
	const { readFile } = await import(fsModuleName);

	const execFileAsync = promisify(execFile);

	try {
		// Strip off vendor suffixes.
		const fontName = desc.fontName.replace(/PSMT$/i, '').replace(/MT$/i, '');
		const query = `${fontName}:slant=${desc.style}:weight=${desc.weight}:width=${desc.width}`;
		const { stdout } = await execFileAsync(fcMatchPath, [
			'--format',
			'%{file} : %{postscriptname}',
			query,
		]);

		const [filename, postScriptName] = stdout.split(' : ', 2);
		if (typeof filename === 'undefined') return;
		if (typeof postScriptName === 'undefined') return;

		const source = await readFile(filename!);

		return { source, postScriptName, filename };
	} catch {
		return;
	}
}
