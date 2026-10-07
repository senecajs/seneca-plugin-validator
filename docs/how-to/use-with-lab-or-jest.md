# Use with lab, jest or mocha

How to run the validator with `@hapi/lab`, `jest` or `mocha`. The
validate function takes no arguments and returns a promise, which all
three runners accept as a test body. The snippets below were run with
`@hapi/lab@26.0.1`, `jest@29.7.0` and `mocha@11.8.0` on Node.js 24, in
a project with a `prettier` script and the test file in `test/`.

## lab

```js
const Lab = require('@hapi/lab')
const lab = (exports.lab = Lab.script())
const MakePluginValidator = require('seneca-plugin-validator')
const Plugin = require('..')

lab.test('validate', MakePluginValidator(Plugin, module))
```

lab passes its `flags` object to the test function; the validate
function ignores it. This is how `seneca-mem-store` and
`seneca-promisify` run the validator. The explicit form works too:

```js
lab.test('validate', async () => {
  await MakePluginValidator(Plugin, module)()
})
```

To check a failure, catch the rejection and look at `code`:

```js
lab.test('an object export is not a plugin', async () => {
  try {
    await MakePluginValidator({}, module)()
  } catch (err) {
    return expect(err.code).to.equal('pv002000')
  }
  throw new Error('expected a validation failure')
})
```

Run with `lab test` (or `lab -v test` for one line per test).

## jest

```js
const MakePluginValidator = require('seneca-plugin-validator')
const Plugin = require('..')

test('validate', MakePluginValidator(Plugin, module))

test('an object export is not a plugin', async () => {
  await expect(MakePluginValidator({}, module)()).rejects.toMatchObject({
    code: 'pv002000',
  })
})
```

jest's module system provides a `module` object with the `paths` array
the validator reads, so `module` can be passed as in plain Node.js. Run
with `jest`.

## mocha

```js
const assert = require('node:assert/strict')
const MakePluginValidator = require('seneca-plugin-validator')
const Plugin = require('..')

it('validate', MakePluginValidator(Plugin, module))

it('an object export is not a plugin', async () => {
  await assert.rejects(MakePluginValidator({}, module)(), { code: 'pv002000' })
})
```

mocha treats a test function that declares no parameters and returns a
promise as asynchronous. Run with `mocha`, which finds `test/*.js` by
default.

## In every runner

* The test file that calls the validator must be directly in `test/`
  (or another direct child folder of the project); see
  [How the project folder is found](../reference/checks.md#how-the-project-folder-is-found).
* The validator does not load Seneca, so the Seneca version your tests
  install does not matter to it. Load the plugin in a separate test to
  check that it works on that version.
