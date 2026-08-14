import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { PDFALab } from '@pdfa-lab/core';
import { fontkit } from '@pdfa-lab/fontkit';

embedFonts(process.argv[2]!).catch(err => {
	console.error(`Extracting text failed: ${err}`);
	process.exit(1);
});

async function embedFonts(pdfFilename: string) {
	const pdfBytes = await fs.readFile(pdfFilename);
	const lab = await PDFALab.from(pdfBytes);

	// We only specify a font for 'Helvetica'.
	const notoFilename = path.resolve(
		import.meta.dirname,
		'..',
		'..',
		'..',
		'..',
		'assets',
		'fonts',
		'noto',
		'NotoSans-Regular.ttf',
	);

	const notoBytes = await fs.readFile(notoFilename);

	const fontMapping = {
		Helvetica: {
			// Unless the code runs in the browser, you can also just specify the
			// filename of a font file.  The library will load the font data
			// from that file.
			source: notoBytes,

			// If the font file is a TrueType collection (`.ttc`) or a Datafork
			// font (`.dfont`), you also have to specify the PostScript name of
			// the selected font.
			//postScriptName: 'Helvetica Regular',
		},

		// If the library fails to find appropriate replacements for other
		// fonts in the PDF on your system, add more font mappings here.
	};

	await lab.embedFonts({
		fontkit,
		fontMap: fontMapping,
	});

	const embeddedBytes = await lab.save();
	await fs.writeFile('output.pdf', embeddedBytes);
}

