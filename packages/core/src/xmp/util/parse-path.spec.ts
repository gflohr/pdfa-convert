import { describe, expect, it } from 'vitest';
import { parsePath } from './parse-path.js';

describe('XMP Path Parser', () => {
	it('should parses a simple path', () => {
		const path = 'xy:person.name';
		expect(parsePath(path)).toStrictEqual([
			{
				tokenType: 'name',
				value: 'xy:person',
			},
			{
				tokenType: 'name',
				value: 'name',
			},
		]);
	});

	it('should discard the root', () => {
		const path = '$.xy:person.name';
		expect(parsePath(path)).toStrictEqual([
			{
				tokenType: 'name',
				value: 'xy:person',
			},
			{
				tokenType: 'name',
				value: 'name',
			},
		]);
	});

	it('should extract a numerical index', () => {
		const path = '$.xy:person[1].name';
		expect(parsePath(path)).toStrictEqual([
			{
				tokenType: 'name',
				value: 'xy:person',
			},
			{
				tokenType: '[]',
				value: 1,
			},
			{
				tokenType: 'name',
				value: 'name',
			},
		]);
	});

	it('should extract a language tag', () => {
		const path = '$.xy:person.name[bg-BG]';
		expect(parsePath(path)).toStrictEqual([
			{
				tokenType: 'name',
				value: 'xy:person',
			},
			{
				tokenType: 'name',
				value: 'name',
			},
			{
				tokenType: '[]',
				value: 'bg-BG',
			},
		]);
	});

	it("should treat an empty language tag as 'x-default'", () => {
		const path = '$.xy:person.name[]';
		expect(parsePath(path)).toStrictEqual([
			{
				tokenType: 'name',
				value: 'xy:person',
			},
			{
				tokenType: 'name',
				value: 'name',
			},
			{
				tokenType: '[]',
				value: 'x-default',
			},
		]);
	});

	it('should throw an exception for empty path elements', () => {
		expect(() => parsePath('foo..bar')).toThrow(
			'Empty element names are not allowed',
		);
	});

	it('should throw an exception for indexed empty path elements', () => {
		expect(() => parsePath('foo.[1].bar')).toThrow(
			'Empty element names are not allowed',
		);
	});

	it('should throw an exception for invalid language tags', () => {
		expect(() => parsePath('foo[de%de].bar')).toThrow(
			"Invalid language tag 'de%de'",
		);
	});
});
