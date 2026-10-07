# Checks and error codes

Every check the validator performs, in the order it runs them. The key
of a check is the `code` of the error it raises, and the last line of
the error message links to the check's section on this page.

## How the project folder is found

The validator reads `plugin_module.paths[1]` and takes its parent
folder as the project folder. For a test file in `<project>/test/`,
Node.js sets `module.paths[1]` to `<project>/node_modules`, so the
project folder is `<project>`. A test file in `<project>/test/unit/`
would yield `<project>/test` instead, and
[pv001000](#pv001000) fails because that folder has no `package.json`.
Keep the test file that calls the validator directly in a child folder
of the project, usually `test/`.

## pv001000

**The test folder should be a child of the project folder.**

What is checked: `require('<project>/package.json')` succeeds, where
`<project>` is the parent folder of `plugin_module.paths[1]`.

Detail line: `No package.json could be loaded from <folder>: <first line
of the require error>`. The `require` error is available as
`err.cause`.

Why: the following check reads `package.json`, and a test file that is
not directly inside the project means the validator (and probably the
test) is looking at the wrong folder.

How to fix: move the test file into `<project>/test/` (or another
direct child folder of the project), make sure the project has a
`package.json`, and pass the test file's own `module` object as the
second argument.

## pv001010

**Use https://prettier.io for consistent code formatting. There should
be a `prettier` script in package.json.**

What is checked: `package.json` has a `scripts` object with a
`prettier` entry. Only the presence of the entry is checked, not its
command.

Detail line: `The package.json in <folder> has the scripts <names> but
no `prettier` script.`, or `The package.json in <folder> has no
scripts.`

Why: Seneca plugins are maintained by many people, and a `prettier`
script is the shared convention for formatting them; the release flow
of the Senecajs plugins runs `npm run prettier` before publishing.

How to fix: add prettier as a development dependency and a script that
formats the project's source files, for example:

```json
"scripts": {
  "prettier": "prettier --write *.js test/*.js"
}
```

## pv002000

**The node.js module implementing a Seneca plugin should be a
function.**

What is checked: `typeof Plugin === 'function'`.

Detail line: `The plugin is <type>.`, with `null`, `undefined`,
`object`, `string` and so on.

Why: `seneca.use(plugin)` expects the plugin module to export its
definition function (Seneca also accepts a description object with a
`define` function, but the convention for published plugins is to
export the function, with `defaults` and `errors` attached to it).
Exporting an object by mistake (`module.exports = { shop }`) is a
common cause of a plugin that does nothing.

How to fix: `module.exports = shop` where `shop` is the definition
function, and pass that export to the validator:
`MakePluginValidator(require('..'), module)`.

## pv002010

**The plugin definition function should accept a single options
argument, and use `this` as the Seneca instance.**

What is checked: `Plugin.length <= 1`, that is, the function declares
at most one parameter before any parameter with a default value or a
rest parameter. `function shop(options)`, `function shop()`,
`async function shop(options)`, `(options) => {}`,
`function shop(options = {})` and `function shop(...args)` all pass;
`function shop(options, callback)` fails.

Detail line: `The function <name> declares <n> parameters. Seneca
rejects the legacy (options, callback) signature with the error code
unsupported_legacy_plugin.`

Why: Seneca 3.38 and Seneca 4 both refuse to load a definition function
with more than one declared parameter (`plugin.define.length > 1`) and
raise the fatal error `unsupported_legacy_plugin`. The check uses the
same rule, so a plugin that passes here is not rejected for its
signature when an application loads it.

How to fix: take the options as the only parameter and use `this` as
the Seneca instance. Register asynchronous initialization with
`this.init(fn)` or, on Seneca 4, `this.prepare(asyncFn)`, instead of a
callback parameter:

```js
function shop(options) {
  const seneca = this
  seneca.add('role:shop,cmd:total', function (msg, reply) { ... })
}
```
