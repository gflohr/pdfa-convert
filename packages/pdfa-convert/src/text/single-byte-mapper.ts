import { MacExpertEncoding } from '../encodings/mac-expert.js';
import { MacRomanEncoding } from '../encodings/mac-roman.js';

export class SingleByteMapper {
	private readonly encoding: string[];

	constructor(encodingName: string) {
		switch(encodingName.toLowerCase()) {
			case 'macexpert':
				this.encoding = MacExpertEncoding;
				break;
			case 'macroman':
				this.encoding = MacRomanEncoding;
				break;
			default:
				throw new Error(`unsupported encoding '${encodingName}`);
		}
	}
}
