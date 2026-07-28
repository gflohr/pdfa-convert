import * as r from 'restructure';

export namespace VORGTable {
	export interface VerticalOrigin {
		glyphIndex: number;
		vertOriginY: number;
	}

	/**
	 * Vertical Origin Table. Specifies vertical coordinate origins for dynamic
	 * metrics scaling.
	 */
	export interface VORG {
		majorVersion: number;
		minorVersion: number;
		defaultVertOriginY: number;
		numVertOriginYMetrics: number;
		metrics: VerticalOrigin[];
	}
}

const verticalOriginFields = {
	glyphIndex: r.uint16,
	vertOriginY: r.int16,
};
const VerticalOriginStruct = new r.Struct<VORGTable.VerticalOrigin>(
	verticalOriginFields,
);

const VORGFields = {
	majorVersion: r.uint16,
	minorVersion: r.uint16,
	defaultVertOriginY: r.int16,
	numVertOriginYMetrics: r.uint16,
	metrics: new r.Array(VerticalOriginStruct, 'numVertOriginYMetrics'),
};

/** @internal */
export const VORG = new r.Struct<VORGTable.VORG>(VORGFields);
