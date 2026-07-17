import * as fs from 'node:fs';
import * as path from 'node:path';
import { DFont, TrueTypeCollection } from '@pdf-lab/fontkit';

const filenames = ['NotoSans/NotoSans.ttc', 'NotoSans/NotoSans.dfont'];

for (const filename of filenames) {
	const fullName = findFontkitTestFont(filename);
	const bytes = fs.readFileSync(fullName);

	const collection = filename.match(/\.dfont$/)
		? new DFont(bytes)
		: new TrueTypeCollection(bytes);

	console.log(`Font collection '${fullName}':`);
	for (const font of collection.fonts) {
		console.log(`\t- ${font.postscriptName} (${font.fullName})`);
	}
}

function findFontkitTestFont(relname) {
	return path.resolve(
		import.meta.dirname,
		'..',
		'..',
		'..',
		'fontkit',
		'test',
		'data',
		relname,
	);
}
