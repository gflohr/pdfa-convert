import * as v from 'valibot';

/**
 * A simple text value denoting a digital file format as defined in IETF RFC
 * 2046.
 */
export const XMPMIMEType = v.regex(
	/^[a-zA-Z0-9][a-zA-Z0-9!#$&^_.+-]{0,126}\/[a-zA-Z0-9][a-zA-Z0-9!#$&^_.+-]{0,126}$/,
);
