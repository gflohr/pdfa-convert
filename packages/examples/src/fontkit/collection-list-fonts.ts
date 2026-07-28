import * as fs from 'node:fs';
import {
	DFont,
	type FontCollection,
	TrueTypeCollection,
} from '@pdf-lab/fontkit';
import { findFontkitTestFont } from '../util.js';

const filenames = ['NotoSans/NotoSans.ttc', 'NotoSans/NotoSans.dfont'];

for (const filename of filenames) {
	const fullName = findFontkitTestFont(filename);
	const bytes = fs.readFileSync(fullName);

	const collection: FontCollection = filename.match(/\.dfont$/)
		? new DFont(bytes)
		: new TrueTypeCollection(bytes);

	console.log(`Font collection '${fullName}':`);
	for (const font of collection.fonts) {
		console.log(`\t- ${font.postscriptName} (${font.fullName})`);
	}
}
