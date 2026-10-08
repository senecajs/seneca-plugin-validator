/* Copyright (c) 2017-2026 Richard Rodger and other contributors, MIT License */
'use strict'

const { test, describe } = require('node:test')
const assert = require('node:assert/strict')
const Path = require('node:path')

const Seneca = require('seneca')

const MakePluginValidator = require('..')
const SamplePlugin = require('./sample-plugin')

describe('make_validate', () => {
  test('exports a function that builds an async validate function', () => {
    assert.equal(typeof MakePluginValidator, 'function')

    const validate = MakePluginValidator(SamplePlugin, module)
    assert.equal(typeof validate, 'function')
    assert.equal(validate.constructor.name, 'AsyncFunction')
    assert.equal(validate.length, 0)
  })

  // The returned function can be passed directly as a test body.
  test('sample plugin is valid', MakePluginValidator(SamplePlugin, module))

  test('validate resolves with undefined for a valid plugin', async () => {
    const validate = MakePluginValidator(SamplePlugin, module)
    assert.equal(await validate(), undefined)

    // Calling it again gives the same result.
    assert.equal(await validate(), undefined)
  })

  test('rejects a plugin_module without paths', async () => {
    for (const bad of [undefined, null, {}, { paths: [] }, { paths: ['/x'] }]) {
      await assert.rejects(MakePluginValidator(SamplePlugin, bad)(), {
        name: 'TypeError',
        message: /second argument must be the `module` object/,
      })
    }
  })
})

describe('checks', () => {
  test('pv001000: no package.json in the parent of the test folder', async () => {
    const validate = MakePluginValidator(
      SamplePlugin,
      fake_module(Path.join(__dirname, 'fixtures', 'no-such-project')),
    )

    await assert.rejects(validate(), (err) => {
      assert.equal(err.code, 'pv001000')
      assert.match(
        err.message,
        /^The test folder should be a child of the project folder\./,
      )
      assert.match(err.message, /no-such-project: Cannot find module/)
      assert.match(
        err.message,
        /=> See .*docs\/reference\/checks\.md#pv001000$/,
      )
      assert.equal(err.cause.code, 'MODULE_NOT_FOUND')
      return true
    })
  })

  test('pv001000: the test file itself is not in a child folder', async () => {
    // A test file in test/unit/ sees <project>/test as the project folder.
    const validate = MakePluginValidator(
      SamplePlugin,
      fake_module(Path.join(__dirname, 'unit')),
    )

    await assert.rejects(validate(), { code: 'pv001000' })
  })

  test('pv001010: package.json without a prettier script', async () => {
    const validate = MakePluginValidator(
      SamplePlugin,
      fake_module(Path.join(__dirname, 'fixtures', 'no-prettier-script')),
    )

    await assert.rejects(validate(), (err) => {
      assert.equal(err.code, 'pv001010')
      assert.match(
        err.message,
        /^Use https:\/\/prettier\.io for consistent code formatting\./,
      )
      assert.match(
        err.message,
        /has the scripts test but no `prettier` script\./,
      )
      assert.match(err.message, /checks\.md#pv001010$/)
      assert.equal(err.cause, undefined)
      return true
    })
  })

  test('pv001010: package.json without any scripts', async () => {
    const validate = MakePluginValidator(
      SamplePlugin,
      fake_module(Path.join(__dirname, 'fixtures', 'no-scripts')),
    )

    await assert.rejects(validate(), (err) => {
      assert.equal(err.code, 'pv001010')
      assert.match(err.message, /has no scripts\./)
      return true
    })
  })

  test('pv002000: the plugin is not a function', async () => {
    for (const bad of [
      undefined,
      null,
      {},
      'sample',
      { define: SamplePlugin },
    ]) {
      await assert.rejects(MakePluginValidator(bad, module)(), (err) => {
        assert.equal(err.code, 'pv002000')
        assert.match(
          err.message,
          /^The node\.js module implementing a Seneca plugin should be a function\./,
        )
        assert.match(
          err.message,
          new RegExp('The plugin is ' + type_of(bad) + '\\.'),
        )
        return true
      })
    }
  })

  test('pv002010: legacy (options, callback) definition signature', async () => {
    function legacy(options, callback) {
      callback()
    }

    await assert.rejects(MakePluginValidator(legacy, module)(), (err) => {
      assert.equal(err.code, 'pv002010')
      assert.match(
        err.message,
        /^The plugin definition function should accept a single options argument/,
      )
      assert.match(err.message, /The function legacy declares 2 parameters\./)
      assert.match(err.message, /unsupported_legacy_plugin/)
      return true
    })

    // Anonymous functions are named in the message too.
    await assert.rejects(
      MakePluginValidator((a, b, c) => {}, module)(),
      (err) => {
        assert.equal(err.code, 'pv002010')
        assert.match(
          err.message,
          /The function \(anonymous\) declares 3 parameters\./,
        )
        return true
      },
    )
  })

  test('accepted definition signatures', async () => {
    const ok = [
      function zero() {},
      function one(options) {},
      async function async_one(options) {},
      (options) => {},
      function defaulted(options = {}) {},
      function rest(...args) {},
    ]
    for (const Plugin of ok) {
      assert.equal(await MakePluginValidator(Plugin, module)(), undefined)
    }
  })

  test('checks run in order and the first failure is reported', async () => {
    // Both the project (no package.json) and the plugin (not a function)
    // are wrong; the project check comes first.
    await assert.rejects(
      MakePluginValidator({}, fake_module('/no/such/project'))(),
      {
        code: 'pv001000',
      },
    )

    // The project is fine, so the plugin check fails.
    await assert.rejects(MakePluginValidator({}, module)(), {
      code: 'pv002000',
    })
  })
})

describe('sample plugin on Seneca', () => {
  test('loads with validated defaults and exports', (t, done) => {
    const seneca = Seneca().test(done).use(SamplePlugin, { name: 'Seneca' })

    seneca.ready(function () {
      t.diagnostic('Seneca version ' + this.version)

      const options = this.options().plugin.sample
      assert.equal(options.greeting, 'Hello')
      assert.equal(options.name, 'Seneca')
      assert.equal(options.punctuation, '!')

      assert.equal(this.export('sample/greeting'), 'Hello')

      this.act('role:sample,cmd:greet', function (err, out) {
        assert.equal(err, null)
        assert.equal(out.greeting, 'Hello, Seneca!')

        this.act('role:sample,cmd:greet,name:Alice', function (err, out) {
          assert.equal(err, null)
          assert.equal(out.greeting, 'Hello, Alice!')

          seneca.close(done)
        })
      })
    })
  })

  test('replies with errors from the errors map', async () => {
    // No error handler here: the error reply is expected. quiet() keeps
    // the expected error out of the test output.
    const seneca = Seneca().test().quiet().use(SamplePlugin)
    await new Promise((resolve) => seneca.ready(resolve))

    await assert.rejects(
      seneca.post('role:sample,cmd:greet', { name: '' }),
      (err) => {
        assert.equal(err.code, 'empty_name')
        assert.match(
          err.message,
          /The name for role:sample,cmd:greet must not be empty\./,
        )
        return true
      },
    )

    await new Promise((resolve) => seneca.close(resolve))
  })

  test('rejects options that do not match the defaults', async () => {
    // undead keeps the instance alive after the fatal plugin error; the
    // short timeout lets the failed plugin load expire quickly.
    const seneca = Seneca({
      log: 'silent',
      debug: { undead: true },
      timeout: 555,
    })
    const failed = new Promise((resolve) => seneca.error(resolve))

    seneca.use(SamplePlugin, { greeting: 123 })

    const err = await failed
    assert.equal(err.code, 'invalid_plugin_option')
    assert.match(err.message, /greeting/)
  })

  test('rejects the legacy signature that pv002010 reports', async () => {
    function legacy(options, callback) {
      callback()
    }

    // undead keeps the instance alive after the fatal plugin error; the
    // short timeout lets the failed plugin load expire quickly.
    const seneca = Seneca({
      log: 'silent',
      debug: { undead: true },
      timeout: 555,
    })
    const failed = new Promise((resolve) => seneca.error(resolve))

    seneca.use(legacy)

    const err = await failed
    assert.equal(err.code, 'unsupported_legacy_plugin')
  })
})

// Build the part of a test file's `module` that the validator reads:
// for a file in <project>/test/, module.paths[1] is <project>/node_modules.
function fake_module(project_folder) {
  return {
    paths: [
      Path.join(project_folder, 'test', 'node_modules'),
      Path.join(project_folder, 'node_modules'),
      Path.join(Path.parse(project_folder).root, 'node_modules'),
    ],
  }
}

function type_of(value) {
  return null === value ? 'null' : typeof value
}
