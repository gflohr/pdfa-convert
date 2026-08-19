# Installation

## Global Installation

The package is available on npmjs.com.

:::tabs key:pkgmanager variant:code

== npm
```shell
npm install -g pdfa-lab
```

== pnpm
```shell
pnpm add -g pdfa-lab
```

== yarn
```shell
yarn global add pdfa-lab
```

== bun
```shell
bun add -g pdfa-lab
```

:::

## Ad-hoc Usage

You can also use the `pdfa-lab` command-line interface directly, without
installation:

:::tabs key:pkgmanager variant:code

== npm
```shell
npx pdfa-lab --help
```

== pnpm
```shell
pnpm dlx pdfa-lab --help
```

== yarn
```shell
yarn dlx pdfa-lab --help
```

== bun
```shell
bunx pdfa-lab --help
```

:::

The option `--help` is just an example. You will normally replace it with
a command like [`pdfa`](./convert-to-pdfa), [`text`](./extract-text),
or [`font`](./list-or-embed-fonts).
