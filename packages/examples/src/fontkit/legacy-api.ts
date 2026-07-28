import * as fs from 'node:fs';
import { fontkit } from '@pdfa-lab/fontkit';

if (process.argv.length < 3) {
	console.error(`Usage: ${process.argv[1]} FONT_OR_COLLECTION`);
	process.exit(1);
}

const bytes = fs.readFileSync(process.argv[2]!);

try {
	const something = fontkit.create(bytes, process.argv[3]);
	if (!something) {
		console.error(`The font or font collection has no variation with the name '${process.argv[3]}'!`);
	} else if (something.objType === 'TTC' || something.objType === 'DFont') {
		console.log('File contains a font collection.');
	} else if (process.argv[3]?.length) {
		console.log('Font variation or font from collection.');
	} else {
		console.log('Single font file.');
	}
} catch(e) {
	console.error(`Not a font file or font collection (${e})!`);
}
