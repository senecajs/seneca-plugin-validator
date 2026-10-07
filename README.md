# seneca-plugin-validator

[![npm version](https://img.shields.io/npm/v/seneca-plugin-validator.svg)](https://www.npmjs.com/package/seneca-plugin-validator)
[![build](https://github.com/senecajs/seneca-plugin-validator/actions/workflows/build.yml/badge.svg)](https://github.com/senecajs/seneca-plugin-validator/actions/workflows/build.yml)

Checks, from inside a plugin's own test suite, that a
[Seneca](https://senecajs.org) plugin project has the shape Seneca
expects: the test folder sits inside the project, the project formats
its code with prettier, and the plugin module exports a definition
function with the signature that Seneca 3.38 and Seneca 4 accept. The
validator has no dependencies and does not load Seneca, so it works in
the test suites of plugins written for Seneca 3 and for the Seneca 4
prerelease (`seneca@4.0.0-rc5` and later), with any test runner.

| ![Voxgig](https://www.voxgig.com/res/img/vgt01r.png) | This open source module is sponsored and supported by [Voxgig](https://www.voxgig.com). |
|---|---|

## Install

```sh
npm install --save-dev seneca-plugin-validator
```

The validator is a development dependency of the plugin project it
checks. One of its checks requires a `prettier` script in the project's
`package.json`:

```json
"scripts": {
  "test": "node --test",
  "prettier": "prettier --write *.js test/*.js"
}
```

## Quick Example

In `test/shop.test.js` of your plugin project:

```js
const { test } = require('node:test')
const MakePluginValidator = require('seneca-plugin-validator')
const Shop = require('..')

// The returned async function is the test body.
test('shop is a well formed plugin', MakePluginValidator(Shop, module))
```

`MakePluginValidator(Plugin, module)` returns an async function that
resolves when every check passes and rejects with the first failure.
Pass the test file's own `module` object: the validator uses it to find
the project folder.

## More Examples

* [Validate your plugin in its test suite](docs/tutorials/getting-started.md)
  builds a small plugin project with a validation test, and runs it.
* [Use with node:test](docs/how-to/use-with-node-test.md),
  [Use with lab, jest or mocha](docs/how-to/use-with-lab-or-jest.md) and
  [Interpret validation failures](docs/how-to/interpret-validation-failures.md)
  are task oriented guides.
* [docs/examples](docs/examples/) holds the runnable programs from the
  documentation.

## Motivation

A Seneca plugin is a plain function with a few conventions attached, and
Seneca only reports a structural mistake, such as the legacy
`(options, callback)` signature, when an application loads the plugin.
Project conventions, such as consistent formatting, it does not check at
all. Running the validator in the plugin's own tests reports these
problems on every test run, with an error message that names the check
and links to how to fix it. See
[Well formed plugins](docs/explanation/well-formed-plugins.md) for the
reasoning behind each check.

## Support

* Questions and bug reports: [GitHub issues](https://github.com/senecajs/seneca-plugin-validator/issues).
* Seneca itself: [senecajs.org](https://senecajs.org) and the
  [Seneca repository](https://github.com/senecajs/seneca), whose `docs`
  folder documents Seneca 4.
* This module is sponsored and supported by [Voxgig](https://www.voxgig.com).

## API

The module exports one function. The full description is in the
[API reference](docs/reference/api.md); every check is described in the
[checks reference](docs/reference/checks.md).

| Export | Description |
| ------ | ----------- |
| `make_validate(Plugin, plugin_module)` | Returns `validate`, an async function with no arguments that runs the checks below in order. It resolves with `undefined` when all pass, and rejects with an `Error` whose `code` is the key of the first failing check. |

| Check | Fails when |
| ----- | ---------- |
| [pv001000](docs/reference/checks.md#pv001000) | No `package.json` can be loaded from the parent of the test folder. |
| [pv001010](docs/reference/checks.md#pv001010) | The `package.json` has no `prettier` script. |
| [pv002000](docs/reference/checks.md#pv002000) | The plugin is not a function. |
| [pv002010](docs/reference/checks.md#pv002010) | The plugin definition function declares more than one parameter. |

## Contributing

The [Senecajs org](https://github.com/senecajs/) encourages open
participation. If you feel you can help in any way, be it with
documentation, examples, extra testing, or new features, please get in
touch.

To run the tests:

```sh
npm install
npm test
```

The tests use the Node.js test runner (`node --test`) and load the
sample plugin in `test/` into the Seneca 4 prerelease
(`seneca@^4.0.0-rc5`, a development dependency). Node.js 24 is the
default target and Node.js 22 is also supported. Format changes with
`npm run prettier` before committing.

The CI workflow for GitHub Actions is provided as a patch in
[.patches](.patches/), because adding files under `.github/workflows/`
needs a GitHub token with the `workflow` scope. See the README in that
folder for how to apply it.

## Background

The validator was written in 2017 as a shared check for the plugins in
the Senecajs organization, and version 0.6 (2020) used `@hapi/code`
assertions inside a `@hapi/lab` test suite. Version 0.7 removed every
runtime dependency, moved the tests to `node --test`, added the
definition signature check and this documentation. Plugins such as
`seneca-mem-store` and `seneca-promisify` run it in their test suites.

| | Supported |
| --- | --- |
| Seneca | Any version in the plugin's own tests: the validator does not load Seneca. The checks describe what Seneca 3.38 and Seneca 4 (from `4.0.0-rc5`) accept. The tests in this repository run against the Seneca 4 prerelease. |
| Node.js | 16 or later; tested on 24 and 22. |
| Test runners | Any runner that accepts an async function as a test body: `node:test`, `@hapi/lab`, `jest`, `mocha`. |

Licensed under [MIT](LICENSE). See [CHANGES.md](CHANGES.md) for the
change log.
