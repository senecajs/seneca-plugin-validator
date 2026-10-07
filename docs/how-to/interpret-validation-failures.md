# Interpret validation failures

How to read a failing validation test and fix the cause.

## 1. Read the three lines of the message

A validation failure is an `Error` whose message has three lines:

```
<summary of the check>
	=> <detail for this project or plugin>
	=> See <link to the check in docs/reference/checks.md>
```

The first line says what the check expects, the second what was found,
and the third links to the section of
[Checks and error codes](../reference/checks.md) that explains the
check and the fix. The error's `code` property is the key of the
check (`pv001000`, `pv001010`, `pv002000` or `pv002010`).

Only the first failing check is reported. Fix it, run the tests again,
and repeat until the test passes.

## 2. Find the check in the table

| Code | Summary | Usual cause | Fix |
| ---- | ------- | ----------- | --- |
| [pv001000](../reference/checks.md#pv001000) | The test folder should be a child of the project folder. | The test file is not directly in `test/`, or the project has no `package.json`, or something other than the test file's `module` was passed. | Move the test file to `<project>/test/` and pass `module`. |
| [pv001010](../reference/checks.md#pv001010) | There should be a `prettier` script in package.json. | The project has no `prettier` script (the detail line lists the scripts it has). | Add `"prettier": "prettier --write *.js test/*.js"` to `scripts`, and prettier to the development dependencies. |
| [pv002000](../reference/checks.md#pv002000) | The plugin should be a function. | The module exports an object (`module.exports = { shop }`), or the test passed the wrong value. | Export the definition function: `module.exports = shop`. |
| [pv002010](../reference/checks.md#pv002010) | The definition function should accept a single options argument. | The plugin uses the Seneca 2 era `(options, callback)` signature. | Take `options` only, use `this` as the Seneca instance, and register initialization with `this.init(fn)`. |

## 3. Examples of each failure

The program [examples/show-failures.js](../examples/show-failures.js)
runs the validator against four broken inputs and prints the `code` and
message of each failure. Its output, run from the root of this
repository on Node.js 24:

```
code: pv001000
The test folder should be a child of the project folder.
	=> No package.json could be loaded from /home/user/seneca-plugin-validator/docs/examples/fixtures/no-package-json: Cannot find module '/home/user/seneca-plugin-validator/docs/examples/fixtures/no-package-json/package.json'
	=> See https://github.com/senecajs/seneca-plugin-validator/blob/master/docs/reference/checks.md#pv001000

code: pv001010
Use https://prettier.io for consistent code formatting. There should be a `prettier` script in package.json.
	=> The package.json in /home/user/seneca-plugin-validator/docs/examples/fixtures/no-prettier-script has the scripts test but no `prettier` script.
	=> See https://github.com/senecajs/seneca-plugin-validator/blob/master/docs/reference/checks.md#pv001010

code: pv002000
The node.js module implementing a Seneca plugin should be a function.
	=> The plugin is object.
	=> See https://github.com/senecajs/seneca-plugin-validator/blob/master/docs/reference/checks.md#pv002000

code: pv002010
The plugin definition function should accept a single options argument, and use `this` as the Seneca instance.
	=> The function legacy declares 2 parameters. Seneca rejects the legacy (options, callback) signature with the error code unsupported_legacy_plugin.
	=> See https://github.com/senecajs/seneca-plugin-validator/blob/master/docs/reference/checks.md#pv002010
```

The folder named in the pv001000 and pv001010 details is the project
folder the validator derived from `module.paths`; if it is not your
project folder, the test file is in the wrong place.

## 4. What the test runners print

Each runner prints the message of the rejection, so the three lines
appear in the test output under the failing test's name. `node:test`
and `mocha` also print the stack trace of the error, which points into
`plugin-validator.js`; the useful information is in the message.
`jest` prints the message followed by the test code that failed.

## 5. A TypeError instead of a code

```
TypeError: seneca-plugin-validator: the second argument must be the `module` object of the test file (an object with a `paths` array).
```

This is not a check failure: the second argument of
`MakePluginValidator` was missing or was not a module object. Pass the
test file's `module`, not `module.exports`, `__dirname` or `require`.
