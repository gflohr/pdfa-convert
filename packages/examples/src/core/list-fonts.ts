import * as fs from 'node:fs/promises';
import { PDFALab } from '@pdfa-lab/core';

if (process.argv.length < 3) {
	console.error(`Usage: ${process.argv[1]} FILENAME`);
	process.exit(1);
}

listFonts(process.argv[2]!).catch(err => {
	console.error(`Listing fonts failed: ${err}`);
	process.exit(1);
});

async function listFonts(filename: string) {
	const bytes = await fs.readFile(filename);
	const lab = await PDFALab.from(bytes);
	const fonts = await lab.collectFonts();

	fonts.forEach((font, pdfRef) => {
		console.log(`# PDF Reference '${pdfRef}'\n`);
		console.log(`Subtype: ${font.subtype}`);
		console.log(`Font name: ${font.fontName}`);
		console.log(`Base font: ${font.baseFont}`);
		console.log(`Embedded: ${font.embedded}`);
		console.log(`Encoding: ${font.encodingMapper.name}`);

		console.log();
	});
}

