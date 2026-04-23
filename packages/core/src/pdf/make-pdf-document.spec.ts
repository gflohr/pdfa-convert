import { PDFDocument } from '@cantoo/pdf-lib';
import { describe, expect, it, vi } from 'vitest';
import { makePDFDocument } from './make-pdf-document.js';

describe('makePDFDocument', () => {
	it('returns the same instance if given a real PDFDocument', async () => {
		const doc = await PDFDocument.create();

		const result = await makePDFDocument(doc);

		expect(result).toBe(doc);
	});

	it('loads a PDFDocument from Uint8Array', async () => {
		const doc = await PDFDocument.create();
		const bytes = await doc.save();

		const result = await makePDFDocument(bytes);

		expect(result).toBeInstanceOf(PDFDocument);
	});

	it('loads a PDFDocument from base64 string', async () => {
		const doc = await PDFDocument.create();
		const bytes = await doc.save();
		const base64 = Buffer.from(bytes).toString('base64');

		const result = await makePDFDocument(base64);

		expect(result).toBeInstanceOf(PDFDocument);
	});

	it('recreates a "foreign" PDFDocument (same shape, different prototype)', async () => {
		const doc = await PDFDocument.create();

		// Simulate foreign instance:
		// clone into plain object but keep shape
		const foreignDoc = {
			// biome-ignore lint/suspicious/noExplicitAny: todo.
			context: (doc as any).context,
			save: doc.save.bind(doc),
		};

		const result = await makePDFDocument(foreignDoc as unknown as PDFDocument);

		expect(result).toBeInstanceOf(PDFDocument);
		expect(result).not.toBe(foreignDoc);
	});

	it('throws for invalid input', async () => {
		await expect(makePDFDocument(123 as unknown as any)).rejects.toThrow(
			/pdfDoc must be/,
		);
	});

	it('falls back to PDFDocument.load for non-PDFDocument objects', async () => {
		const spy = vi.spyOn(PDFDocument, 'load');

		const bytes = new Uint8Array([37, 80, 68, 70]); // "%PDF" minimal header

		try {
			await makePDFDocument(bytes);
		} catch {
			// ignore parse error, we only care that load was called
		}

		expect(spy).toHaveBeenCalled();
	});
});
