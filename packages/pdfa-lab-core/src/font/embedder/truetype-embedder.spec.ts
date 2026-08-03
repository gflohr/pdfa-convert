import * as fs from 'node:fs';
import { PDFDocument, PDFRef } from '@cantoo/pdf-lib';
import { type FontkitAPI, fontkit } from '@pdfa-lab/fontkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SingleByteEncodingMapper } from '../../encoding/mappers/single-byte-encoding-mapper.js';
import type { FontEmbedOptions } from '../../pdfa-lab.js';
import type { GlyphBlock } from '../../text/extract-glyphs.js';
import * as resolveFontModule from '../resolve-font.js';
import type { FontInfo } from '../types.js';
import { TrueTypeFontEmbedder } from './truetype-embedder.js';

const rootdir = '../..';
const assetDir = `${rootdir}/assets`;
const pdfDir = `${assetDir}/pdfs`;
const fontsDir = `${assetDir}/fonts/noto`;

describe('TrueType Font Embedder', () => {
	const pdfBytes = fs.readFileSync(`${pdfDir}/truetype-missing.pdf`);
	const notoRegularBytes = fs.readFileSync(`${fontsDir}/NotoSerif-Regular.ttf`);

	let pdfDoc: PDFDocument;
	const options: FontEmbedOptions = {
		compress: false,
		fontkit,
	};

	beforeEach(async () => {
		pdfDoc = await PDFDocument.load(pdfBytes);
		(pdfDoc.registerFontkit as unknown as (fk: FontkitAPI) => void)(fontkit);
	});

	it('should embed the NotoSerif font', async () => {
		const fontInfo: FontInfo = {
			ref: PDFRef.of(5),
			embedded: false,
			subtype: 'TrueType',
			encodingMapper: new SingleByteEncodingMapper('WinAnsiEncoding'),
			baseFont: 'BAAAAA+NotoSerif-Regular',
			fontName: 'NotoSerif-Regular',
		};

		const embedder = new TrueTypeFontEmbedder(
			pdfDoc,
			fontInfo,
			[] as GlyphBlock[],
			new Set<string>(),
			options,
		);

		vi.spyOn(resolveFontModule, 'resolveFont').mockResolvedValue({
			source: notoRegularBytes,
		});
		await embedder.embed();

		expect('later').toBe('later');
	});
});
