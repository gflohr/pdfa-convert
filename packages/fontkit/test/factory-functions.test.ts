import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';
import { fontkit } from '../src/index.js';

describe('Factory Functions', () => {
	describe('Load Font', () => {
		it('should expose the loadFont() function', () => {
			expect(fontkit.loadFont).toBeDefined();
			expect(typeof fontkit.loadFont).toBe('function');
		});

		it('should load a single TrueType font', async () => {
			const bytes = await fs.readFile(
				path.resolve(
					import.meta.dirname,
					'./data/OpenSans/OpenSans-Regular.ttf',
				),
			);
			const font = fontkit.loadFont(bytes);
			expect(font).toBeDefined();
			expect(font.objType).toBe('TTF');
		});

		it('should load a single WOFF2 font', async () => {
			const bytes = await fs.readFile(
				path.resolve(
					import.meta.dirname,
					'./data/SourceSansPro/SourceSansPro-Regular.woff2',
				),
			);
			const font = fontkit.loadFont(bytes);
			expect(font).toBeDefined();
			expect(font.objType).toBe('WOFF2');
		});

		it('should load a single WOFF font', async () => {
			const bytes = await fs.readFile(
				path.resolve(
					import.meta.dirname,
					'./data/SourceSansPro/SourceSansPro-Regular.woff',
				),
			);
			const font = fontkit.loadFont(bytes);
			expect(font).toBeDefined();
			expect(font.objType).toBe('WOFF');
		});

		it('should throw an error if a TrueType font collection is loaded without a PostScript name', async () => {
			const bytes = await fs.readFile(
				path.resolve(import.meta.dirname, './data/NotoSans/NotoSans.ttc'),
			);

			const errorMessage = 'Not a font file!';
			expect(() => fontkit.loadFont(bytes)).toThrow(errorMessage);
		});

		it('should throw an error if corrupt data is passed as a font', async () => {
			const bytes = Buffer.from('SourceSansPro-Regular');

			const errorMessage = 'Not a font file!';
			expect(() => fontkit.loadFont(bytes)).toThrow(errorMessage);
		});

		it('should load a font from a TrueType font collection', async () => {
			const bytes = await fs.readFile(
				path.resolve(import.meta.dirname, './data/NotoSans/NotoSans.ttc'),
			);
			const postscriptName = 'NotoSans-Bold';
			const font = fontkit.loadFont(bytes, postscriptName);
			expect(font).toBeDefined();
			expect(font.objType).toBe('TTF');
			expect(font.postscriptName).toBe(postscriptName);
		});

		it('should load a font from a Datafork TrueType font collection', async () => {
			const bytes = await fs.readFile(
				path.resolve(import.meta.dirname, './data/NotoSans/NotoSans.dfont'),
			);
			const postscriptName = 'NotoSans-Italic';
			const font = fontkit.loadFont(bytes, postscriptName);
			expect(font).toBeDefined();
			expect(font.objType).toBe('TTF');
			expect(font.postscriptName).toBe(postscriptName);
		});

		it('should throw an error if PostScript name is passed for a font', async () => {
			const bytes = await fs.readFile(
				path.resolve(
					import.meta.dirname,
					'./data/SourceSansPro/SourceSansPro-Regular.otf',
				),
			);
			const postscriptName = 'SourceSansPro-Regular';

			const errorMessage = 'Not a font collection!';
			expect(() => fontkit.loadFont(bytes, postscriptName)).toThrow(
				errorMessage,
			);
		});

		it('should throw an error if font is missing in collection', async () => {
			const bytes = await fs.readFile(
				path.resolve(import.meta.dirname, './data/NotoSans/NotoSans.ttc'),
			);
			const postscriptName = 'NotoSans-Slanted';

			const errorMessage =
				"Font collection does not contain 'NotoSans-Slanted'!" +
				" Try one of 'NotoSans-Bold', 'NotoSans', 'NotoSans-Italic'," +
				" 'NotoSans-BoldItalic' instead!";
			expect(() => fontkit.loadFont(bytes, postscriptName)).toThrow(
				errorMessage,
			);
		});

		it('should throw an error if corrupt data is passed as a font collection', async () => {
			const bytes = Buffer.from('SourceSansPro-Regular');
			const postscriptName = 'SourceSansPro-Regular';

			const errorMessage = 'Not a font collection!';
			expect(() => fontkit.loadFont(bytes, postscriptName)).toThrow(
				errorMessage,
			);
		});
	});

	describe('Load Font Collection', () => {
		it('should expose the loadFontCollection() function', () => {
			expect(fontkit.loadFontCollection).toBeDefined();
			expect(typeof fontkit.loadFontCollection).toBe('function');
		});

		it('should load a single TrueType font collection', async () => {
			const bytes = await fs.readFile(
				path.resolve(import.meta.dirname, './data/NotoSans/NotoSans.ttc'),
			);
			const collection = fontkit.loadFontCollection(bytes);
			expect(collection).toBeDefined();
			expect(collection.objType).toBe('TTC');
		});

		it('should load a single Datafork TrueType font collection', async () => {
			const bytes = await fs.readFile(
				path.resolve(import.meta.dirname, './data/NotoSans/NotoSans.dfont'),
			);
			const collection = fontkit.loadFontCollection(bytes);
			expect(collection).toBeDefined();
			expect(collection.objType).toBe('DFont');
		});

		it('should throw an error if a font is passed', async () => {
			const bytes = await fs.readFile(
				path.resolve(
					import.meta.dirname,
					'./data/OpenSans/OpenSans-Regular.ttf',
				),
			);
			const err = 'Not a font collection!';
			expect(() => fontkit.loadFontCollection(bytes)).toThrow(err);
		});

		it('should throw an error if corrupt data is passed', () => {
			const bytes = Buffer.from('25 or 6 to 4');
			const err = 'Not a font collection!';
			expect(() => fontkit.loadFontCollection(bytes)).toThrow(err);
		});
	});
});
