/* Runs the validator against four broken inputs and prints each failure.
   The output is shown in docs/how-to/interpret-validation-failures.md.
   In your own project, load the validator with
   require('seneca-plugin-validator'); here it is loaded from the root of
   this repository. */
'use strict'

const Path = require('node:path')

const MakePluginValidator = require('../..') // seneca-plugin-validator

// A well formed plugin definition function.
function shop(options) {}

// A plugin with the legacy (options, callback) signature.
function legacy(options, callback) {}

// The validator only reads module.paths[1], which Node.js sets to
// <project>/node_modules for a test file in <project>/test/. This builds
// the equivalent for a test file in the given project folder.
function module_in(project) {
  return {
    paths: [
      Path.join(project, 'test', 'node_modules'),
      Path.join(project, 'node_modules'),
      '/node_modules',
    ],
  }
}

const fixtures = Path.join(__dirname, 'fixtures')

const cases = [
  // The project folder has no package.json.
  [shop, module_in(Path.join(fixtures, 'no-package-json'))],

  // The package.json has scripts, but no prettier script.
  [shop, module_in(Path.join(fixtures, 'no-prettier-script'))],

  // The module exports an object instead of the definition function.
  [{ define: shop }, module_in(Path.join(fixtures, 'well-formed'))],

  // The definition function declares two parameters.
  [legacy, module_in(Path.join(fixtures, 'well-formed'))],
]

async function main() {
  for (const [plugin, plugin_module] of cases) {
    const validate = MakePluginValidator(plugin, plugin_module)

    try {
      await validate()
      console.log('valid')
    } catch (err) {
      console.log('code: ' + err.code)
      console.log(err.message)
    }
    console.log()
  }
}

main()
