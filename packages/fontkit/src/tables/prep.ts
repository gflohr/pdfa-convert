import * as r from 'restructure';

/**
 * The set of instructions executed whenever the point size or font
 * transformation change.\
 */
export namespace prepTable {
	/**
	 * Control Value Program Table. Provides global instructions establishing
	 * variable outline alignment.
	 */
	export interface prep {
		controlValueProgram: number[];
	}
}

const prepStructFields = {
	controlValueProgram: new r.Array(r.uint8),
};
/** @internal */
export const prep = new r.Struct<prepTable.prep>(prepStructFields);
