const fs = require('node:fs/promises');
const { PDFALab } = require('@pdfa-lab/core');

if (process.argv.length < 3) {
	console.error(`Usage: ${process.argv[1]} FILENAME`);
	process.exit(1);
}

extract(process.argv[2]).catch((err) => {
	console.error(`Extracting text failed: ${err}`);
	process.exit(1);
});

async function extract(filename) {
	const bytes = await fs.readFile(filename);
	const lab = await PDFALab.from(bytes);
	const blocks = await lab.extractText();

	for (let i = 0; i < blocks.length; ++i) {
		const block = blocks[i];

		console.log(`# Block ${i + 1}\n`);
		console.log(`Page ${block.pageNumber + 1}`);
		console.log(`Font name: ${block.font.fontName}`);
		console.log(`Base font name: ${block.font.baseFont}`);
		console.log(`Text: ${block.text}`);
		console.log('\n');
	}
}
