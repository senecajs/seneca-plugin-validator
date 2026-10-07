/* Copyright (c) 2017-2026 Richard Rodger and other contributors, MIT License */
'use strict'

const Path = require('node:path')

// Every check is documented, by key, on this page.
const CHECKS_URL =
  'https://github.com/senecajs/seneca-plugin-validator/blob/master/docs/reference/checks.md'

// Build a validate function for a Seneca plugin.
//
//   Plugin: the plugin definition function (what the plugin module exports).
//   plugin_module: the `module` object of the test file that calls this.
//     The test file must be in a direct child folder of the project folder
//     (usually test/); only `plugin_module.paths[1]` is read.
//
// The returned async function takes no arguments, so it can be used
// directly as a test body. It resolves when every check passes, and
// rejects with an Error whose `code` is the key of the first failing check.
module.exports = function make_validate(Plugin, plugin_module) {
  return async function validate() {
    if (
      null == plugin_module ||
      !Array.isArray(plugin_module.paths) ||
      'string' !== typeof plugin_module.paths[1]
    ) {
      throw new TypeError(
        'seneca-plugin-validator: the second argument must be the `module` ' +
          'object of the test file (an object with a `paths` array).',
      )
    }

    // For a file in <project>/test/, module.paths[1] is <project>/node_modules.
    const folder = Path.dirname(plugin_module.paths[1])

    let pkg
    try {
      pkg = require(Path.join(folder, 'package.json'))
    } catch (e) {
      throw fail(
        'pv001000',
        'The test folder should be a child of the project folder.',
        'No package.json could be loaded from ' +
          folder +
          ': ' +
          first_line(e.message),
        e,
      )
    }

    const scripts = pkg.scripts
    if (null == scripts || null == scripts.prettier) {
      throw fail(
        'pv001010',
        'Use https://prettier.io for consistent code formatting. ' +
          'There should be a `prettier` script in package.json.',
        null == scripts
          ? 'The package.json in ' + folder + ' has no scripts.'
          : 'The package.json in ' +
              folder +
              ' has the scripts ' +
              Object.keys(scripts).join(', ') +
              ' but no `prettier` script.',
      )
    }

    if ('function' !== typeof Plugin) {
      throw fail(
        'pv002000',
        'The node.js module implementing a Seneca plugin should be a function.',
        'The plugin is ' + (null === Plugin ? 'null' : typeof Plugin) + '.',
      )
    }

    if (1 < Plugin.length) {
      throw fail(
        'pv002010',
        'The plugin definition function should accept a single options ' +
          'argument, and use `this` as the Seneca instance.',
        'The function ' +
          (Plugin.name || '(anonymous)') +
          ' declares ' +
          Plugin.length +
          ' parameters. Seneca rejects the legacy (options, callback) ' +
          'signature with the error code unsupported_legacy_plugin.',
      )
    }
  }
}

function fail(key, summary, detail, cause) {
  const err = new Error(
    summary + '\n\t=> ' + detail + '\n\t=> See ' + CHECKS_URL + '#' + key,
    cause ? { cause } : undefined,
  )
  err.code = key
  return err
}

function first_line(text) {
  return String(text).split('\n')[0]
}
