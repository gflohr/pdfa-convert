import * as r from 'restructure';
import inflate from 'tiny-inflate';
import { SFNTBaseFont } from './sfnt-base-font.js';
import type { WOFFDirectory } from './tables/woff-directory.js';
import { woffDirectoryStruct } from './tables/woff-directory.js';
import { asciiDecoder } from './utils.js';

/** @internal */
export interface WOFFFont {
	readonly type: 'WOFF';
}

/**
 * Parses and processes Web Open Font Format (WOFF 1.0) files.
 *
 * When instantiated, a `WOFFFont` is uncompressed and decoded on the fly and
 * after that functionally identical to a {@link TrueTypeFont}.
 *
 * Note that the `WOFFFont` class does not extend the class
 * {@link TrueTypeFont} but the common abstract base class
 * {@link SFNTBaseClass}.
 */
// biome-ignore lint/suspicious/noUnsafeDeclarationMerging: Needed for discriminated union.
export class WOFFFont extends SFNTBaseFont<WOFFDirectory> {
	/**
	 * Discriminating property.
	 *
	 * @see {@link SFNTFont}
	 */
	public readonly type: 'WOFF' = 'WOFF';

	static probe(buffer: Uint8Array) {
		return asciiDecoder.decode(buffer.slice(0, 4)) === 'wOFF';
	}

	protected decodeDirectory(): WOFFDirectory {
		return woffDirectoryStruct.decode(this.stream, {
			_startOffset: 0,
		} as r.FieldT<unknown>);
	}

	protected getTableStream(tag: string): r.DecodeStream | null {
		const table = this.directory.tables[tag];
		if (table) {
			this.stream.pos = table.offset;

			if (table.compLength < table.length) {
				this.stream.pos += 2; // skip deflate header
				const outBuffer = new Uint8Array(table.length);
				const buf = inflate(
					this.stream.readBuffer(table.compLength - 2),
					outBuffer,
				);
				return new r.DecodeStream(buf);
			} else {
				return this.stream;
			}
		}

		return null;
	}
}
