# Use with node:test

How to run the validator in a test suite that uses the Node.js test
runner (`node --test`, Node.js 20 or later; the examples here were run
on Node.js 24 and 22).

## 1. Install and add the prettier script

```sh
npm install --save-dev seneca-plugin-validator prettier
```

In `package.json`:

```json
"scripts": {
  "test": "node --test",
  "prettier": "prettier --write *.js test/*.js"
}
```

## 2. Add the validation test

Create `test/<plugin>.test.js` (directly in `test/`, see step 4) and
pass the validate function as the test body:

```js
const { test } = require('node:test')
const MakePluginValidator = require('seneca-plugin-validator')
const Plugin = require('..')

test('is a well formed plugin', MakePluginValidator(Plugin, module))
```

`node:test` calls the function with its context object, which the
validate function ignores, and waits for the returned promise.

To run the checks inside a larger test, call the function yourself:

```js
test('plugin shape and behaviour', async () => {
  await MakePluginValidator(Plugin, module)()
  // ... load the plugin into Seneca and test it
})
```

## 3. Run

```sh
npm test
```

`node --test` finds `test/*.test.js` by default. To run one file, name
it: `node --test test/shop.test.js`.

## 4. Keep the test file directly in `test/`

The validator finds the project folder from the test file's `module`:
for `<project>/test/shop.test.js` the project is `<project>`. A test
file in a nested folder such as `test/unit/` fails with
[pv001000](../reference/checks.md#pv001000). Put the file that calls
the validator directly in `test/`, or in another direct child folder of
the project.

## 5. Assert on a failure

When writing tests of your own tooling, assert on the error's `code`:

```js
const assert = require('node:assert/strict')

test('an object export is not a plugin', async () => {
  await assert.rejects(MakePluginValidator({}, module)(), { code: 'pv002000' })
})
```

The codes are listed in [Checks and error codes](../reference/checks.md).
