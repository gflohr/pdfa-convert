import * as r from 'restructure';

export namespace cvtTable {
	/**
	 * Control Value Table. Establishes pixel values used by instructions to
	 * control raster adjustments.
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
