import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { decodePDFRawStream, PDFArray, PDFDict, PDFDocument, PDFName, PDFObject, PDFRawStream, PDFRef, PDFStream } from '@cantoo/pdf-lib';
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

function getStreamContents(stream: PDFObject | undefined): Uint8Array | null {
	if (!stream) {
		return null;
	} else if (stream instanceof PDFRawStream) {
		return decodePDFRawStream(stream).decode();
	} else if (stream instanceof PDFStream) {
		return stream.getContents();
	} else {
		return null;
	}
}

function getStreamStringContents(stream: PDFObject | undefined): string | null {
	const contents = getStreamContents(stream);
	if (!contents) {
		return null;
	} else {
		return Buffer.from(contents).toString();
	}
}

async function extractText(lab: PDFALab) {
	const textBlocks = await lab.extractText();

	return textBlocks.map(block => block.text).join(' ');
}

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
			const type1Lab = await PDFALab.from(pdfBytes);

			const fontMap: FontMap = {
				Helvetica: {
					source: path.resolve(notoDir, 'NotoSans-Regular.ttf')
				},
				'Helvetica-Bold': {
					source: path.resolve(notoDir, 'NotoSans-Regular.ttf')
				},
				'Helvetica-Oblique': {
					source: path.resolve(notoDir, 'NotoSans-Regular.ttf')
				},
				'Helvetica-BoldOblique': {
					source: path.resolve(notoDir, 'NotoSans-Regular.ttf')
				},
				'Times-Roman': {
					source: path.resolve(notoDir, 'NotoSerif-Regular.ttf')
				},
				'Times-Italic': {
					source: path.resolve(notoDir, 'NotoSerif-Regular.ttf')
				},
				'Times-Bold': {
					source: path.resolve(notoDir, 'NotoSerif-Regular.ttf')
				},
				'Times-BoldItalic': {
					source: path.resolve(notoDir, 'NotoSerif-Regular.ttf')
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
			await type1Lab.embedFonts({
				fontkit,
				fontMap,
				compress: false,
			});

			const embeddedBytes = await type1Lab.save();
			lab = await PDFALab.from(embeddedBytes);
		});

		it('should embed the 14 Type 1 fonts', async () => {
			const fonts = [...lab.collectFonts().values()];

			expect(fonts.length).toBe(14);
			expect(fonts.filter(font => font.embedded).length).toBe(14);
			expect(fonts.filter(font => font.subtype === 'Type0').length).toBe(14);

			const uniqueFontNames = [...new Set(fonts.map(f => f.fontName))].sort();
			expect(uniqueFontNames).toStrictEqual([
				'NotoSans-Regular',
				'NotoSansMono-Regular',
				'NotoSansSymbols2-Regular',
				'NotoSerif-Regular',
				'OpenSymbol',
			]);
		});

		it('should attach a valid /ToUnicode CMap stream to every embedded Type0 font', async () => {
			const fonts = [...lab.collectFonts().values()];

			for (const font of fonts) {
				const doc = lab.pdfDocument;
				const fontDict = doc.context.lookup(font.ref, PDFDict);

				// Ensure /ToUnicode reference exists.
				const toUnicodeRef = fontDict.get(PDFName.of('ToUnicode'));
				expect(toUnicodeRef).toBeDefined();

				// Ensure the CMap stream parses as non-empty text containing CMap markers
				const toUnicode = doc.context.lookup(toUnicodeRef);
				const cmapText = getStreamStringContents(toUnicode);
				expect(cmapText).toMatch(/\/CIDInit \/ProcSet findresource begin\n/);
				expect(cmapText).toContain(' beginbfchar\n');
			}
		});

		it('should subset embedded font streams to only include used characters', async () => {
			const fonts = [...lab.collectFonts().values()];
			const ctx = lab.pdfDocument.context;

			for (const font of fonts) {
				// Navigate Type0 -> DescendantFonts [0] -> FontDescriptor -> FontFile2/3.
				const fontDict = ctx.lookup(font.ref, PDFDict);

				const descendants = fontDict.lookup(PDFName.of('DescendantFonts'), PDFArray);
				const cidFontDict = ctx.lookup(descendants.get(0), PDFDict);
				const descriptor = cidFontDict.lookup(PDFName.of('FontDescriptor'), PDFDict);

				// FontFile2 is TTF/TrueType, FontFile3 is CFF/OpenType.
				const fontStreamRef = descriptor.get(PDFName.of('FontFile2')) ?? descriptor.get(PDFName.of('FontFile3'));
				expect(fontStreamRef).toBeDefined();

				const fontStream = ctx.lookup(fontStreamRef);
				const contents = getStreamContents(fontStream);
				expect(contents).not.toBeNull();

				// Subsubsetted fonts for a simple test PDF should be small
				// (usually signficantly smaller than 10 KB).
				expect(contents!.length).toBeGreaterThan(500);
				expect(contents!.length).toBeLessThan(10_000);
			}
		});

		it('should preserve the contained text', async () => {
			const bytes = await fs.readFile(pdfFilename);
			const originalLab = await PDFALab.from(bytes);
			const originalText = await extractText(originalLab);

			expect(await extractText(lab)).toBe(originalText);
		});
	});
});
