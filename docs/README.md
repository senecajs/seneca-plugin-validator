# seneca-plugin-validator documentation

The documentation follows the [Diátaxis](https://diataxis.fr/) structure:
four sections with four different jobs. Start with the tutorial if you
have not used the validator before; use the how-to guides for specific
tasks; look things up in the reference; read the explanation to
understand why the checks exist.

## Tutorials

Learning oriented lessons that take you through building something,
step by step.

| Tutorial | What you build |
| -------- | -------------- |
| [Validate your plugin in its test suite](tutorials/getting-started.md) | A small plugin project whose tests validate the plugin and load it into Seneca 4. |

The programs from the tutorial are in [examples](examples/).

## How-to guides

Task oriented recipes for people who already know the basics.

| Guide | Covers |
| ----- | ------ |
| [Use with node:test](how-to/use-with-node-test.md) | The validate function as a test body or awaited, the `npm test` script, placing the test file. |
| [Use with lab, jest or mocha](how-to/use-with-lab-or-jest.md) | The same for `@hapi/lab`, `jest` and `mocha`, and asserting on failures with each. |
| [Interpret validation failures](how-to/interpret-validation-failures.md) | Reading the error message, the `code` property, the fix for each check, what the runners print. |

## Reference

Information oriented descriptions of every part of the module.

| Reference | Describes |
| --------- | --------- |
| [API](reference/api.md) | `make_validate(Plugin, plugin_module)`, the returned `validate` function and the error it rejects with. |
| [Checks and error codes](reference/checks.md) | Every check: what it tests, its message, why it exists and how to satisfy it. |

## Explanation

Understanding oriented discussion of the design.

| Explanation | Topic |
| ----------- | ----- |
| [Well formed plugins](explanation/well-formed-plugins.md) | What a Seneca plugin looks like, why the validator checks what it checks, Seneca 3 versus 4, and what the validator leaves to your other tests. |

## Feature index

Every export, argument, error code and convention of the module, with
the page that documents it. The module has no options, defines no
Seneca action patterns and has no command line.

| Feature | Kind | Documented in |
| ------- | ---- | ------------- |
| `make_validate(Plugin, plugin_module)` | Export (the module's only export, the default `main`) | [API](reference/api.md#the-exported-function) |
| `Plugin` | Argument: the plugin definition function under test | [API](reference/api.md#first-argument-the-plugin) |
| `plugin_module` | Argument: the test file's `module`; only `paths[1]` is read | [API](reference/api.md#second-argument-the-test-module) |
| `validate()` | Return value: async function, no arguments, resolves with `undefined` | [API](reference/api.md#the-returned-validate-function) |
| `TypeError` for a bad `plugin_module` | Usage error raised by `validate()` | [API](reference/api.md#usage-errors) |
| `err.message` | Three line failure message: summary, detail, link | [API](reference/api.md#the-validation-error), [Interpret validation failures](how-to/interpret-validation-failures.md) |
| `err.code` | Key of the failing check | [API](reference/api.md#the-validation-error) |
| `err.cause` | The original `require` error (pv001000 only) | [API](reference/api.md#the-validation-error) |
| `pv001000` | Check and error code: project folder has a `package.json` | [Checks](reference/checks.md#pv001000) |
| `pv001010` | Check and error code: `package.json` has a `prettier` script | [Checks](reference/checks.md#pv001010) |
| `pv002000` | Check and error code: the plugin is a function | [Checks](reference/checks.md#pv002000) |
| `pv002010` | Check and error code: the definition function takes one parameter | [Checks](reference/checks.md#pv002010) |
| Test folder placement (`test/` directly under the project) | Convention the checks rely on | [Checks](reference/checks.md#how-the-project-folder-is-found) |
| Order of checks, first failure wins | Behaviour | [API](reference/api.md#behaviour) |

## Other documents

* [Change log](../CHANGES.md)
* [License](../LICENSE)
