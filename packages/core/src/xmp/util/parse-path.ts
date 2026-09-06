import { langTagRegex } from './lang-tag-regex';

export interface PathToken {
	tokenType: '[]' | 'name';
	value: string | number;
}

/** @internal */
export function parsePath(path: string): PathToken[] {
	const parts = path.split('.');
	if (parts[0] === '$') parts.shift();

	const tokens: PathToken[] = [];

	parts.forEach(part => {
		let index: string | number | undefined;
		const indexMatch = part.match(/\[(.*)\]/);
		if (indexMatch) {
			part = part.substr(0, indexMatch.index);
			if (!indexMatch[1]) {
				index = 'x-default';
			} else if (indexMatch[1].match(/^[0-9]+$/)) {
				index = parseInt(indexMatch[1], 10);
			} else if (indexMatch[1].match(langTagRegex)) {
				index = indexMatch[1];
			} else {
				throw new Error(`Invalid language tag '${indexMatch[1]}'`);
			}
		}

		if (!part.length) {
			throw new Error('Empty element names are not allowed')
		}

		tokens.push({
			tokenType: 'name',
			value: part,
		});

		if (typeof index !== 'undefined') {
			tokens.push({
				tokenType: '[]',
				value: index,
			});
		}
	});

	return tokens;
}
