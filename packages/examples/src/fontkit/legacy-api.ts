import * as fs from 'node:fs';
import { fontkit, SFNTFontCollection } from '@pdf-lab/fontkit';

if (process.argv.length < 3) {
	console.error(`Usage: ${process.argv[1]} FONT_OR_COLLECTION`);
}

const bytes = fs.readFileSync(process.argv[2]!);
const something = fontkit.create(bytes);
if (!something) {
	console.log(
		`PostScript name '${process.argv[3]}' not included in '${process.argv[2]}`,
	);
} else if (something.type === 'TTC') {
	console.dir(something.cmap);
}
