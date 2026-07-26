import * as fs from 'node:fs';
import { fontkit } from '@pdf-lab/fontkit';

if (process.argv.length < 3) {
	console.error(`Usage: ${process.argv[1]} FONT_OR_COLLECTION`);
	process.exit(1);
}

const bytes = fs.readFileSync(process.argv[2]!);
const something = fontkit.create(bytes);
if (!something) {
	console.error(`The font or font collection has no variation with the name '${process.argv[3]}'!`);
} else if (something.type === 'TTC' || something.type === 'DFont') {
	console.log('File contains a font collection.');
} else if (process.argv[3]?.length) {
	console.log('Single font file.');
}
