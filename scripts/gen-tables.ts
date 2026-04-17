import { unicodeName } from 'unicode-name';

const aglUrl = 'https://raw.githubusercontent.com/adobe-type-tools/agl-aglfn/refs/heads/master/glyphlist.txt';
const zapfDingbatsUrl = 'https://raw.githubusercontent.com/adobe-type-tools/agl-aglfn/refs/heads/master/zapfdingbats.txt';

const header = `// This file is generated! Do NOT edit!
//
// Edit the file 'gen-tables.ts' in the directory 'scripts' in the project
// root instead!`;

export type AdobeGlyph = {
	n: string;
	u: number[];
	c: string[];
	f?: string[];
	z?: boolean;
};

const command = process.argv[2];
switch(command) {
	case 'agl':
		agl();
		break;
	default:
		console.error('no command or unknown command given');
		process.exit(1);
}

async function agl() {
	const glyphs: Record<string, AdobeGlyph> = {};

	await parseGlyphs(glyphs, new URL(zapfDingbatsUrl));
	Object.values(glyphs).forEach(def => {
		def.z = true;
	});

	await parseGlyphs(glyphs, new URL(aglUrl));
	manualFallback(glyphs);
	autoFallback(glyphs);

	const unicodeToAdobeGlyphNames: string[] = [];
	for (const name in glyphs) {
		const glyph = glyphs[name];
		if (glyph.u.length > 1) continue;
		unicodeToAdobeGlyphNames[glyph.u[0]] = name;
	}

	// Fill up possible gaps with fallbacks.
	for (const name in glyphs) {
		const glyph = glyphs[name];
		glyph.f?.forEach(f => {
			const codePoint = parseInt(f, 16);
			unicodeToAdobeGlyphNames[codePoint] ??= name;
		});
	}

	console.log(`
/* istanbul ignore file */
${header}

/**
 * Representation of a glyph from the Adoble Glyph List Specification.
 */
export type AdobeGlyph = {
	/**
	 * Adobe name.
	 */
	n: string;

	/**
	 * Unicode code point or array of codepoints for composite characters.
	 */
	u: number | number[];

	/**
	 * Fallback characters as Unicode code points.
	 */
	f?: number[];

	/**
	 * \`true\` if the glyph belongs to a Zapf Dingbats font.
	 */
	z?: boolean;
};

/**
 * Lookup-table for all glyphs from the Adoble Glyph List Specification.
 *
 * The comment above the definition is the official Unicode name.
 */
export const adobeGlyphs: Record<string, AdobeGlyph> = {`);

	Object.keys(glyphs).sort().forEach(name => {
		const glyph = glyphs[name];
		const uniName = computeUnicodeName(glyph.u);
		let optional = '';
		if (glyph.f) {
			// biome-ignore lint/style/useTemplate: avoid backslashes.
			optional += `\n\t\tf: [${glyph.f.map(x => '0x' + x)}],`
		}
		if (glyph.z) {
			optional += `\n\t\tz: true,`
		}

		const codes = glyphs[name].c.map(c => `0x${c}`);
		const u = codes.length > 1 ? `[${codes.join(', ')}]` : codes[0];
		console.log(`	// ${uniName}
	${name}: {
		n: '${name}',
		u: ${u},${optional}
	},`);
	});

	console.log('};\n');

	// We want the back mapping to be a sparse array.
	console.log(`/**
* Map Unicode code points to Adobe glyph names.
*/
export const unicodeToAdobeGlyph = Object.assign([] as string[], {`);

	unicodeToAdobeGlyphNames.forEach((v, i) => {
		console.log(`\t${i}: '${v}',`);
	});

	console.log('});');
}

function computeUnicodeName(codes: number | number[]) {
	if (typeof codes === 'number') codes = [codes];

	return codes.map(c => unicodeName(c) ?? '<unkown character>').join(' + ');
}

async function manualFallback(glyphs: Record<string, AdobeGlyph>) {
	const fallbacks = {
		apple: ['1f34f', '1f34e'],
	};

	for (const name in fallbacks) {
		if (glyphs[name]) {
			glyphs[name].f = (fallbacks as Record<string, string[]>)[name];
		}
	}
}

async function autoFallback(glyphs: Record<string, AdobeGlyph>) {
	Object.values(glyphs).forEach(def => {
		if (def.n.match(/small$/)) {
			const regularName = def.n.replace(/small$/, '');
			if (regularName in glyphs) {
				def.f ??= [];
				const replacement = glyphs[regularName];
				def.f.push(replacement.c[0]);
			}
		}
	});
}

async function parseGlyphs(glyphs: Record<string, AdobeGlyph>, url: URL): Promise<void> {
	const source = await download(new URL(url));
	const lines = source.split('\n');
	for (let i = 0; i < lines.length; ++i) {
		const line = stripComment(lines[i]);
		if (line === '') continue;

		const [adobeName, codePoint] = line.split(';');
		if (!(adobeName && codePoint)) {
			throw new Error(`${aglUrl}: ${i + 1}: parse error: ${line}`);
		}

		const c: string[] = codePoint.split(/\s/);
		const u = c.map(n => parseInt(n, 16));
		glyphs[adobeName] = {
			n: adobeName,
			u: u,
			c: c,
		};
	}
}

function stripComment(line: string): string {
	line = line.replace(/#.*/, '');
	return line.trim();
}

async function download(url: URL): Promise<string> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`${url}: ${response.status}`);
	}

	return await response.text();
}
