import type { FontInfo } from 'pdf-lab-core';

export type FontInfoDto = {
	ref: string;
	embedded: boolean;
	baseFont: string;
	fontName: string;
	subtype: string;
	encoding?: string;
};

export function toFontInfoDto(fontInfo: FontInfo): FontInfoDto {
	const dto: FontInfoDto = {
		ref: fontInfo.ref.tag,
		baseFont: fontInfo.baseFont,
		fontName: fontInfo.fontName,
		embedded: fontInfo.embedded,
		subtype: fontInfo.subtype,
	};
	if (Object.hasOwn(fontInfo, 'encoding')) dto.encoding = fontInfo.encoding;

	return dto;
}
