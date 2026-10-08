# API reference

The module exports a single function. It has no options, requires
nothing but `node:path`, and does not load Seneca.

```js
const MakePluginValidator = require('seneca-plugin-validator')
const validate = MakePluginValidator(Plugin, module)
```

## The exported function

```js
make_validate(Plugin, plugin_module)
```

Builds a validate function for one plugin. Nothing is checked until the
returned function is called.

### First argument: the plugin

The plugin definition function under test, normally the main export of
the plugin module (`require('..')` from the test folder). The checks
[pv002000](checks.md#pv002000) and [pv002010](checks.md#pv002010) look
at this value; any value is accepted here and reported there.

### Second argument: the test module

The `module` object of the test file that calls `make_validate`. The
validator reads exactly one thing from it: `plugin_module.paths[1]`.
For a file in `<project>/test/`, Node.js sets `module.paths` to

```
[ '<project>/test/node_modules', '<project>/node_modules', ..., '/node_modules' ]
```

so the parent folder of `paths[1]` is the project folder, where the
project's `package.json` is read. Any object with such a `paths` array
works; `jest` and `@hapi/lab` provide a compatible `module`. See
[How the project folder is found](checks.md#how-the-project-folder-is-found)
for the consequence of placing the test file elsewhere.

## The returned `validate` function

```js
async function validate()
```

* Takes no arguments (`validate.length` is `0`) and ignores any that
  are passed, so it can be used directly as the body of a test in
  `node:test`, `@hapi/lab`, `jest` or `mocha`, which pass their own
  context or flags argument.
* Resolves with `undefined` when every check passes.
* Rejects with a [validation error](#the-validation-error) on the
  first check that fails.
* Can be called more than once; each call runs the checks again
  (`package.json` is loaded with `require`, so it is read once per
  process).

## Behaviour

The checks run in this order and stop at the first failure:

| Order | Check | Subject |
| ----- | ----- | ------- |
| 1 | [pv001000](checks.md#pv001000) | `package.json` in the project folder |
| 2 | [pv001010](checks.md#pv001010) | `prettier` script in `package.json` |
| 3 | [pv002000](checks.md#pv002000) | `Plugin` is a function |
| 4 | [pv002010](checks.md#pv002010) | `Plugin` declares at most one parameter |

A project with several problems therefore reports one at a time; fix it
and run the tests again.

## The validation error

The rejection value is an `Error` with these properties:

| Property | Value |
| -------- | ----- |
| `message` | Three lines: the summary of the check, then `\t=> ` and the detail for this project or plugin, then `\t=> See ` and the link to the check's section in [checks.md](checks.md). |
| `code` | The key of the failing check: `'pv001000'`, `'pv001010'`, `'pv002000'` or `'pv002010'`. |
| `cause` | For `pv001000` only: the error thrown by `require` for the missing `package.json` (its `code` is `MODULE_NOT_FOUND`). Absent otherwise. |

For example:

```
The node.js module implementing a Seneca plugin should be a function.
	=> The plugin is object.
	=> See https://github.com/senecajs/seneca-plugin-validator/blob/master/docs/reference/checks.md#pv002000
```

Test runners print `message`, so a failing validation test shows the
check, the detail and the link. Assert on `code` in tests of your own
tooling:

```js
await assert.rejects(validate(), { code: 'pv002000' })
```

## Usage errors

`validate()` rejects with a `TypeError` (no `code`) when `plugin_module`
is not usable: it is `null` or `undefined`, has no `paths` array, or
`paths[1]` is not a string. The message is:

```
seneca-plugin-validator: the second argument must be the `module` object of the test file (an object with a `paths` array).
```

## Requirements

Node.js 16 or later (the module uses `node:` prefixed requires and the
`cause` option of `Error`). The repository's tests run on Node.js 24
and 22.

## Compatibility with version 0.6

The call signature, the returned async function and the three original
checks with their keys are unchanged, so test suites written for 0.6.1
keep working. What changed: the error is always a plain `Error` with a
`code` property (0.6 rethrew the `@hapi/code` assertion error with a
rewritten message), the link in the message points at this
documentation, the detail line is written by the validator rather than
by `@hapi/code`, the check pv002010 is new, and the module has no
dependencies.
