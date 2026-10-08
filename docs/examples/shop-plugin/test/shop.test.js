/* The test file from the tutorial. In your own project, load the
   validator with require('seneca-plugin-validator'); here it is loaded
   from the root of this repository. */
'use strict'

const { test } = require('node:test')
const assert = require('node:assert/strict')

const Seneca = require('seneca')
const MakePluginValidator = require('../../../..') // seneca-plugin-validator

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
