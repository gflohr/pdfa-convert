# Examples

Examples for `@pdfa-lab`.

## Prerequisites

Please run `pnpm run build` in the top-level directory of this repo before
you try one of the examples.

## Usage

In general, you run the scripts through `tsx`:

```shell
cd packages/examples
pnpm exec tsx ./src/fontkit/collection-list-fonts.ts
```

Alternatively, compile the TypeScript sources, and run the JavaScript versions
from the `dist` directory:

```shell
cd packages/examples
pnpm run build
node dist fontkit/collection-list-fonts.js
```

## Vanilla JavaScript

Almost all examples are written in TypeScript.

For modern JavaScript, see
[`collection-list-fonts.mjs`](./src/fontkit/collection-list-fonts.mjs) as an
example. Essentially, you have to delete all TypeScript-specific stuff.

For CommonJS, see
[`collection-list-fonts.cjs`](./src/fontkit/collection-list-fonts.cjs) as an
example. You also have to remove all TypeScript-specific stuff, and
additionally use the legacy JavaScript features.
