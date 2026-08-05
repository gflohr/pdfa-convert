import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { type PDFDocument, PDFRef } from '@cantoo/pdf-lib';
import fontkit from '@pdfa-lab/fontkit';
import { beforeAll, describe, expect, it } from 'vitest';
import { type FontEmbedOptions, PDFALab } from '../pdfa-lab.js';
import type { GlyphBlock } from '../text/extract-glyphs.js';
import { FontEmbedder } from './embedder.js';
import type { FontInfo, FontMap } from './types.js';

class TestFontEmbedder extends FontEmbedder {}

const rootDir = path.resolve(import.meta.dirname, '..', '..', '..', '..');
const pdfDir = path.resolve(rootDir, 'assets', 'pdfs');
const fontDir = path.resolve(rootDir, 'assets', 'fonts');
const notoDir = path.resolve(fontDir, 'noto');
const libreOfficeDir = path.resolve(fontDir, 'libre-office');

describe('FontEmbedder', () => {
	describe('Constructor Guard', () => {
		const pdfDoc = {} as PDFDocument;

		const fontInfo: FontInfo = {
			baseFont: 'Helvetica',
			fontName: 'Helvetica',
			ref: PDFRef.of(7),
			embedded: false,
			subtype: 'TrueType',
		} as FontInfo;

		it('throws if fontkit is missing', () => {
			const options = {} as FontEmbedOptions;

			expect(() => {
				new TestFontEmbedder(
					pdfDoc,
					fontInfo,
					[] as GlyphBlock[],
					new Set<string>(),
					options,
				);
			}).toThrow('You have to pass a fontkit instance in the embed options!');
		});
	});

	describe('Type 1 Fonts', () => {
		const pdfFilename = path.resolve(pdfDir, 'standard-fonts.pdf');
		let lab: PDFALab;

		beforeAll(async () => {
			const pdfBytes = await fs.readFile(pdfFilename);
			lab = await PDFALab.from(pdfBytes);
		});

		it('should embed the 14 Type 1 fonts', async () => {
			const fontMap: FontMap = {
				Helvetica: {
					source: path.resolve(notoDir, 'NotoSansMono-Regular.ttf')
				},
				'Helvetica-Bold': {
					source: path.resolve(notoDir, 'NotoSansMono-Regular.ttf')
				},
				'Helvetica-Oblique': {
					source: path.resolve(notoDir, 'NotoSansMono-Regular.ttf')
				},
				'Helvetica-BoldOblique': {
					source: path.resolve(notoDir, 'NotoSansMono-Regular.ttf')
				},
				'Times-Roman': {
					source: path.resolve(notoDir, 'NotoSansMono-Regular.ttf')
				},
				'Times-Italic': {
					source: path.resolve(notoDir, 'NotoSansMono-Regular.ttf')
				},
				'Times-Bold': {
					source: path.resolve(notoDir, 'NotoSansMono-Regular.ttf')
				},
				'Times-BoldItalic': {
					source: path.resolve(notoDir, 'NotoSansMono-Regular.ttf')
				},
				Courier: {
					source: path.resolve(notoDir, 'NotoSansMono-Regular.ttf')
				},
				'Courier-Bold': {
					source: path.resolve(notoDir, 'NotoSansMono-Regular.ttf')
				},
				'Courier-Oblique': {
					source: path.resolve(notoDir, 'NotoSansMono-Regular.ttf')
				},
				'Courier-BoldOblique': {
					source: path.resolve(notoDir, 'NotoSansMono-Regular.ttf')
				},
				'Symbol': {
					source: path.resolve(libreOfficeDir, 'opens___.ttf')
				},
				'ZapfDingbats': {
					source: path.resolve(notoDir, 'NotoSansSymbols2-Regular.ttf')
				},
			};
			await lab.embedFonts({
				fontkit,
				fontMap,
			});

			const pdfBytes = await lab.save();
			await fs.writeFile('test.pdf', pdfBytes);
		});
	});
});
