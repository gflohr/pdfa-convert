import * as os from 'node:os';
import { PDFAConvert } from 'pdfa-convert';

export async function convert() {
	const converter = new PDFAConvert(os.platform(), {});
	await converter.convert();
}
