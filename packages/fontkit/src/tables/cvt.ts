import * as r from 'restructure';

export namespace cvtTable {
	/**
	 * Control Value Table. Stores indexed control values used by TrueType
	 * instructions to maintain consistency when hinting glyphs.
	 */
	export interface cvt {
		controlValues: number[];
	}
}

const cvtStructFields = {
	controlValues: new r.Array(r.int16),
};
/** @internal */
export const cvt = new r.Struct<cvtTable.cvt>(cvtStructFields);
