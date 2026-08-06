import {
	type Encoding,
	lcStandardEncodings,
	StandardEncodings,
} from '../types.js';

/**
 * @internal
 */
export function isStandardEncoding(
	value: string,
	caseInsensitive = false,
): value is Encoding {
	if (caseInsensitive) {
		return lcStandardEncodings.includes(value.toLowerCase());
	} else {
		return (StandardEncodings as readonly string[]).includes(value);
	}
}
