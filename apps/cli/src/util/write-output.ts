import * as fs from 'node:fs/promises';
import type { PDFALab } from 'pdfa-lab-core';
import { safeStdoutBufferWrite } from './safe-stdout-write.js';

export async function writeOutput(filename: string, lab: PDFALab) {
	const bytes = await lab.save();

	if (filename === '-') {
		await safeStdoutBufferWrite(bytes);
	} else {
		await fs.writeFile(filename, bytes);
	}
}
