import * as r from 'restructure';

export namespace locaTable {
	export interface locaV0 {
		version: 0;
		offsets: number[];
	}

	export interface locaV1 {
		version: 1;
		offsets: number[];
	}

	/**
	 * Index to Location Table. Maps local offsets for binary data streams
	 * resolving glyph outlines.
	 */
	export type loca = locaV0 | locaV1;
}

const locaFields = {
	0: {
		offsets: new r.Array(r.uint16),
	},
	1: {
		offsets: new r.Array(r.uint32),
	},
};
/** @internal */
export const loca = new r.VersionedStruct<locaTable.loca>(
	'head.indexToLocFormat',
	locaFields,
);

loca.process = function () {
	if (this.version === 0 && !this._processed) {
		for (let i = 0; i < this.offsets.length; i++) {
			this.offsets[i] <<= 1;
		}
		this._processed = true;
	}
};

loca.preEncode = function () {
	if (this.version === 0 && this._processed !== false) {
		for (let i = 0; i < this.offsets.length; i++) {
			this.offsets[i] >>>= 1;
		}
		this._processed = false;
	}
};
