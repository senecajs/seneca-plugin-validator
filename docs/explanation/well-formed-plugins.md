# Well formed plugins

What a Seneca plugin looks like, why the validator checks what it
checks, how Seneca 3 and Seneca 4 differ for plugin authors, and what
the validator deliberately leaves to your other tests.

## What a Seneca plugin is

A plugin is a function. Seneca calls it once, when an application loads
the plugin with `seneca.use`, with the resolved options as its only
argument and a delegate of the Seneca instance as `this`. Inside, the
function adds actions and returns, optionally, a meta data object with
`exports`:

```js
module.exports = shop

function shop(options) {
  const seneca = this

  seneca.add('role:shop,cmd:total', function (msg, reply) { ... })

  return { exports: { currency: options.currency } }
}

shop.defaults = { currency: 'EUR', tax: 0.2 }
shop.errors = { invalid_net: 'The net amount must be a number, not <%=net%>.' }
```

Conventions have grown around this function, and published plugins
follow them so that applications can rely on them:

* `defaults`, a static property, holds the default options. Seneca
  validates the options passed by the application against it when the
  plugin loads, and the plugin function receives the merged result. In
  Seneca 4 the defaults are a [Gubu](https://github.com/rjrodger/gubu)
  shape: plain values fix the type of each option (`tax: 0.2` means a
  number that defaults to `0.2`), and Gubu builders express anything
  more. An option of the wrong type is a fatal `invalid_plugin_option`
  error.
* `errors`, a static property, maps error codes to message templates.
  `this.error(code, details)` and `this.fail(code, details)` inside
  the plugin build errors from it, so that callers can switch on
  `err.code`.
* The returned `exports` are available to other code through
  `seneca.export('<plugin name>/<key>')`.
* The module's main export is the plugin function itself, with
  `defaults` and `errors` attached, so that `seneca.use('shop')` and
  `seneca.use(require('seneca-shop'))` both work.
* The package is named `seneca-<name>` (or `@seneca/<name>`), its
  patterns carry a `role:<name>` (or `sys:<name>`) property, its tests
  live in `test/`, and its code is formatted with prettier through an
  `npm run prettier` script.

The validator checks the parts of this shape that can be checked
without loading the plugin.

## Why each check exists

**pv001000, the project folder has a `package.json`.** The validator
finds the project folder from the `module` of the test file: for a file
in `<project>/test/`, `module.paths[1]` is `<project>/node_modules`,
and its parent is the project. Requiring the `package.json` there
confirms both that the project exists and that the test file is where
the conventions say it should be. It runs first because the next check
reads that file.

**pv001010, a `prettier` script.** Plugins in the Senecajs
organization are maintained by many people over many years, and a
shared formatter removes formatting from code review. The convention is
a `prettier` script, which the maintainers' release flow runs before
publishing. The check only asks for the script to exist: how a project
formats is its own business, that it formats is the shared agreement.

**pv002000, the plugin is a function.** Everything else about a plugin
follows from the definition function. A module that exports an object
by accident (`module.exports = { shop }`) is accepted by `require`
and only fails when an application calls `seneca.use` on it. Checking
the type in the plugin's own tests reports the mistake where it was
made.

**pv002010, one parameter.** Early Seneca plugins took a callback as a
second parameter, `function plugin(options, callback)`, to signal the
end of asynchronous initialization. Seneca 3.38 and Seneca 4 refuse to
load a definition function with more than one declared parameter and
raise the fatal error `unsupported_legacy_plugin` (the rule in Seneca
is `plugin.define.length > 1`; the validator applies the same rule).
Asynchronous initialization is registered inside the function instead,
with `this.init(fn)` or, on Seneca 4, `this.prepare(asyncFn)`. A plugin
that passes this check cannot be rejected for its signature when it is
loaded.

The checks run in order and stop at the first failure, so that one
problem is reported with its own detail and link rather than a list of
consequences of the same mistake.

## Seneca 3 and Seneca 4

The validator does not load Seneca and does not depend on it, so a
plugin's test suite can run it against any Seneca version. The checks
describe what both Seneca 3.38 and Seneca 4 accept. For plugin authors
moving to Seneca 4, the differences that touch the plugin shape are:

* **Definition signature.** Unchanged: both versions reject two
  parameters with `unsupported_legacy_plugin`.
* **`defaults`.** Seneca 3.38 validates `defaults` written as a Joi
  schema with Joi, and plain or Gubu defaults with Gubu. Seneca 4 does
  not understand Joi: a Joi schema (an object with `$_root`) is deep
  merged with the options without any validation, while plain values
  and Gubu shapes are validated. Convert Joi defaults to plain values
  or Gubu shapes to keep option validation.
* **Initialization and shutdown.** `this.init(fn)` works on both.
  Seneca 4 adds `this.prepare(asyncFn)` for asynchronous
  initialization and `this.destroy(asyncFn)` for cleanup on close, and
  closes through the action `sys:seneca,cmd:close` rather than
  `role:seneca,cmd:close`.
* **Promises.** Seneca 4 has `post`, `message`, `prepare` and
  `destroy` built in, so `seneca-promisify` is a no-op there and is
  only needed by plugins that must also run on Seneca 3.
* **Options.** Seneca 4 takes plugin options only from `seneca.use`
  and `options.plugin.<name>`, not from a top level `options.<name>`.

None of these can be checked statically by the validator; load the
plugin in a test against the Seneca version you support, as the second
test in the [tutorial](../tutorials/getting-started.md) does.

## What the validator does not check

The validator is a shape check, not a conformance suite. It does not:

* load the plugin, so it cannot know whether the actions, `defaults`,
  `errors` or `exports` are correct, or whether the plugin works on
  a given Seneca version;
* inspect `defaults` (Joi or Gubu), the `errors` map or the pattern
  names;
* run or check the `prettier` script, only its presence;
* report more than one failure per run.

A plugin's own tests cover the rest: load the plugin with
`Seneca().test(done).use(plugin)`, call its actions, and assert that
wrong options are rejected with `invalid_plugin_option`. The tests of
this repository (`test/plugin-validator.test.js`) do exactly that for
the sample plugin in `test/sample-plugin.js`.
