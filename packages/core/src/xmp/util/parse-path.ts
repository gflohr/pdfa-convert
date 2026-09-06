import { langTagRegex } from './lang-tag-regex.js';

export interface PathToken {
	value: string;
	index?: string | number;
}

/** @internal */
export function parsePath(path: string): PathToken[] {
	const parts = path.split('.');
	if (parts[0] === '$') parts.shift();

	const tokens: PathToken[] = [];

	parts.forEach((part) => {
		let index: string | number | undefined;
		const indexMatch = part.match(/\[(.*)\]/);
		if (indexMatch) {
			part = part.substring(0, indexMatch.index);
			if (!indexMatch[1]) {
				index = '';
			} else if (indexMatch[1].match(/^[0-9]+$/)) {
				index = parseInt(indexMatch[1], 10);
			} else if (indexMatch[1].match(langTagRegex)) {
				index = indexMatch[1];
			} else {
				throw new Error(`Invalid language tag '${indexMatch[1]}'`);
			}
		}

		if (!part.length) {
			throw new Error('Empty element names are not allowed');
		}

		const token: PathToken = { value: part };
		if (typeof index !== 'undefined') {
			token.index = index;
		}

		tokens.push(token);
	});

	return tokens;
}
