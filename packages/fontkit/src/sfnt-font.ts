import type { TrueTypeFont } from './true-type-font';
import type { WOFFFont } from './woff-font';
import type { WOFF2Font } from './woff2-font';

export type SFNTFont = TrueTypeFont | WOFFFont | WOFF2Font;
