# Fonts

## List Fonts

```shell
pdfa-lab font --list FILENAME.pdf
pdfa-lab font --list -i FILENAME.pdf
pdfa-lab font --list --input FILENAME.pdf
```

List the names of all fonts present in a PDF document. Use `--format=yaml` or
`--format=json` in order to get more detailed information about the font
usage.

Example for YAML output:

```yaml
- ref: 12 0 R
  embedded: true
  encoding: Identity-H
  subtype: TrueType
  baseFont: BAAAAA+NotoSans-Regular
  fontName: NotoSans-Regular
- ref: 13 0 R
  embedded: true
  encoding: Identity-H
  subtype: TrueType
  baseFont: CAAAAA+NotoSerif-Regular
  fontName: NotoSerif-Regular
- ref: 14 0 R
  embedded: true
  encoding: Identity-H
  subtype: TrueType
  baseFont: DAAAAA+CourierNewPSMT
  fontName: CourierNewPSMT
```

The `ref` is the object identifier of the font within the PDF.

The `fontName` is the name of the font as displayed by most tools. The
`baseFont` is a particular subset. It usually uses six uppercase letters as
a prefix in order to make it unique across the document.

## Embed Missing Fonts

```shell
pdfa-lab font --embed FILENAME.pdf
pdfa-lab font --embed -i FILENAME.pdf
pdfa-lab font --embed --input FILENAME.pdf
```

Embed fonts that are currently missing in the document as a subset font. It
is currently not possible to embed the entire font.

Most of the times, the software will be able to find suitable fonts on the 
system. It does this by following this strategy:

1. It uses a font that was specified on the command-line, see `--font-map` under [Options](#options) below! 
2. If installed, it uses the [`fc-match`](https://linux.die.net/man/1/fc-match) utility to find a suitable replacement.
3. It falls back to a platform-dependent list of default fonts.

Most of the time, the font resolution will manage to find a font without
explicitly specifying a font. If not, you have to specify a font with
command-line option `--font-map`.

Example for a simple font:

```shell
pdfa-lab font --embed --font-map Helvetica,/usr/share/fonts/Arial.ttf
```

This will embed the font `/usr/share/fonts/Arial.ttf` for the font
`Helvetica`. The path to the font file has to be separated from the font name
by a comma. Use the option [`--list`](#list-fonts) for finding out the exact
names of the fonts used in a document.

Example for a TrueType collection:

```shell
pdfa-lab font --embed --font-map Times-Roman,/usr/share/fonts/Courier.ttc,Regular
```

This will replace the font Times-Romand with the font "Regular" from the
TrueType collection `/usr/share/fonts/Courier.ttc`.

## Options

| Option                         | Description |
|--------------------------------|-------------|
| `-i`, `--input` `FILENAME.pdf` | The input filename. |
| `-l`, `--list`                 | Choose font listing as the action. |
| `-e`, `--embed`                | Choose font embedding as the action. |
| `-o`, `--output` `OUTPUT.pdf`  | Write to `OUTPUT.pdf` (embedding only) |
| `-b`, `--base-font` `BASEFONT` | Embed only `BASEFONT` |
| `--font`, `--font-name` `FONT` | Embed only `FONT` |
| `-f`, `--format` `FORMAT`      | Choose one of `text` (default), `json`, or `yaml` as the output format for font listings. |
| `--fc-match` `PATH`            | Path to the `fc-match` command if not found automatically. |
| `--font-map` `PDF-FONT,FILENAME[,FONT]` | Replace `PDF-FONT` with external font `FILENAME` (choose `FONT` for collections) |
| `--compress` `true\|false`      | Compress fonts (defaults to `true`) |
| `-V`, `--version`              | Show version number and exit. |
| `-h`, `--help`                 | Show help and exit. |
