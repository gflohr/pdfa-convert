import { PDFALab } from '@pdfa-lab/core';
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type Mock,
	vi,
} from 'vitest';
import type { Arguments } from 'yargs';
import { coerceOptions } from '../util/optspec.js';
import { XMPCommand } from './xmp.js';

vi.mock('../util/optspec.js');
vi.mock('./load-input.js', () => ({
	loadInput: vi.fn().mockResolvedValue(new Uint8Array()),
}));
vi.mock('@pdfa-lab/core', async (importActual) => {
	const actual = await importActual<typeof import('@pdfa-lab/core')>();
	return {
		...actual,
		PDFALab: {
			from: vi.fn(),
		},
	};
});

describe('XMP Command', () => {
	let xmpCommand: XMPCommand;

	beforeEach(() => {
		xmpCommand = new XMPCommand();
		(coerceOptions as Mock).mockReturnValue(true);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('description() should return a valid description', () => {
		expect(xmpCommand.description()).toBe(
			'Show or manipulate XMP meta information of a PDF document.',
		);
	});

	it('aliases() should return an empty array', () => {
		expect(xmpCommand.aliases()).toEqual([]);
	});

	it('options() should return options', () => {
		const options = xmpCommand.options();

		expect(options).toBeDefined();
	});

	it('run() should return 1 if coerceOptions fails', async () => {
		(coerceOptions as Mock).mockReturnValue(false);
		const result = await xmpCommand.run(Buffer.from(''), {} as Arguments);

		expect(result).toBe(1);
	});

	it('run() should call extractXMP and return 0 on success', async () => {
		const extractXMPMock = vi.fn().mockReturnValue([]);
		(PDFALab.from as Mock).mockResolvedValue({
			extractXMP: extractXMPMock,
		});

		const result = await xmpCommand.run(Buffer.from(''), {} as Arguments);

		expect(extractXMPMock).toHaveBeenCalledTimes(1);
		expect(result).toBe(0);
	});
});
