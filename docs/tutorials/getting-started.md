# Validate your plugin in its test suite

In this tutorial you build a small Seneca plugin project whose tests
validate the plugin with seneca-plugin-validator and then load it into
Seneca 4. At the end you have a project layout you can reuse for your
own plugins. The finished files are in
[examples/shop-plugin](../examples/shop-plugin/).

You need Node.js 22 or later.

## 1. Create the project

Make a folder with this layout:

```
shop-plugin/
  package.json
  shop.js
  test/
    shop.test.js
```

The `package.json` declares a `test` script, a `prettier` script (one
of the checks looks for it) and the development dependencies:

```json
{
  "name": "shop-plugin",
  "version": "0.1.0",
  "private": true,
  "main": "shop.js",
  "scripts": {
    "test": "node --test",
    "prettier": "prettier --write *.js test/*.js"
  },
  "devDependencies": {
    "prettier": "^3.6.2",
    "seneca": "^4.0.0-rc5",
    "seneca-plugin-validator": "^0.7.0"
  }
}
```

Install them:

```sh
npm install
```

## 2. Write the plugin

`shop.js` is a plugin in the form Seneca 4 expects: a definition
function with one `options` parameter that uses `this` as the Seneca
instance, default options that double as the validation shape, an
errors map, and an export.

```js
'use strict'

module.exports = shop

function shop(options) {
  const seneca = this

  seneca.add('role:shop,cmd:total', function (msg, reply) {
    if ('number' !== typeof msg.net) {
      return reply(seneca.error('invalid_net', { net: msg.net }))
    }

    const total = Math.round(msg.net * (1 + options.tax) * 100) / 100

    reply({
      net: msg.net,
      tax: options.tax,
      total: total,
      currency: options.currency,
    })
  })

  return {
    exports: {
      currency: options.currency,
    },
  }
}

shop.defaults = {
  currency: 'EUR',
  tax: 0.2,
}

shop.errors = {
  invalid_net: 'The net amount must be a number, not <%=net%>.',
}
```

## 3. Write the tests

`test/shop.test.js` has two tests. The first is the validation: the
function returned by `MakePluginValidator` is passed directly as the
test body. The second loads the plugin into Seneca and calls its
action.

```js
'use strict'

const { test } = require('node:test')
const assert = require('node:assert/strict')

const Seneca = require('seneca')
const MakePluginValidator = require('seneca-plugin-validator')

const Shop = require('../shop')

// The validate function is the test body: the test passes when every
// check passes, and fails with the first validation error otherwise.
test('shop is a well formed plugin', MakePluginValidator(Shop, module))

test('total adds tax', (t, done) => {
  const seneca = Seneca().test(done).use(Shop, { tax: 0.1 })

  seneca.ready(function () {
    this.act('role:shop,cmd:total,net:100', function (err, out) {
      assert.equal(err, null)
      assert.deepEqual(out, { net: 100, tax: 0.1, total: 110, currency: 'EUR' })

      seneca.close(done)
    })
  })
})
```

The second argument to `MakePluginValidator` is the test file's own
`module` object. The validator uses `module.paths` to find the project
folder, which is why the test file lives directly in `test/`.

## 4. Run the tests

```sh
npm test
```

The output (from `node --test docs/examples/shop-plugin/test/shop.test.js`
in this repository, with `seneca@4.0.0-rc5` on Node.js 24):

```
✔ shop is a well formed plugin (1.057748ms)
✔ total adds tax (258.167324ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 404.074142
```

## 5. What happened

`MakePluginValidator(Shop, module)` returned an async function that
takes no arguments. `node:test` called it as the test body and waited
for the promise. The function ran four checks in order:

1. [pv001000](../reference/checks.md#pv001000): the parent of the test
   folder (the project folder) has a `package.json`.
2. [pv001010](../reference/checks.md#pv001010): that `package.json` has
   a `prettier` script.
3. [pv002000](../reference/checks.md#pv002000): `Shop` is a function.
4. [pv002010](../reference/checks.md#pv002010): `Shop` declares at most
   one parameter, so Seneca will not reject it with
   `unsupported_legacy_plugin`.

All passed, so the promise resolved and the test passed. Had one
failed, the test would have failed with a message naming the check, the
detail for this project and a link to the fix; see
[Interpret validation failures](../how-to/interpret-validation-failures.md).

The second test shows that the plugin really loads on Seneca 4:
`Seneca().test(done)` routes any error in the instance to `done`, the
`tax` option overrides the default and is validated against it, the
action replies, and `seneca.close(done)` ends the test so that the
process can exit.

## 6. See a failure

Change the last line of `shop.js` to export an object instead of the
function:

```js
module.exports = { shop }
```

Run `npm test` again. The validation test now fails with
[pv002000](../reference/checks.md#pv002000):

```
The node.js module implementing a Seneca plugin should be a function.
	=> The plugin is object.
	=> See https://github.com/senecajs/seneca-plugin-validator/blob/master/docs/reference/checks.md#pv002000
```

(The second test fails too, because `seneca.use({ shop })` is not a
plugin either.) Restore `module.exports = shop` and the tests pass
again.

## Where next

* [Use with node:test](../how-to/use-with-node-test.md) and
  [Use with lab, jest or mocha](../how-to/use-with-lab-or-jest.md) show
  the validator in each test runner.
* [Checks and error codes](../reference/checks.md) describes every
  check in detail.
* [Well formed plugins](../explanation/well-formed-plugins.md) explains
  the conventions behind the checks and the differences between Seneca
  3 and Seneca 4 plugins.
