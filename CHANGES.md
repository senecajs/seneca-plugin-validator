# Changes

## 0.7.0 2026-11-20

* Seneca 4: the peer dependency is `seneca` `^4.0.0`. Seneca 3 users
  stay on `seneca-plugin-validator@0.6`. The validator itself does not
  load Seneca. The test suite loads a sample plugin in the Seneca 4
  style (single `options` parameter, plain defaults, errors map,
  exports) into `seneca@^4.0.0`, and shows that what the validator
  accepts is what Seneca 4 loads.
* Node.js 24 or later (`engines.node` `>=24`).
* New check `pv002010`: the plugin definition function must declare at
  most one parameter. Seneca 3.38 and Seneca 4 reject the legacy
  `(options, callback)` signature with `unsupported_legacy_plugin`;
  the validator now reports it in the plugin's own tests.
* No runtime dependencies. `@hapi/code`, `@hapi/joi`, `@hapi/lab`,
  `coveralls` and `prettier` were listed as dependencies; only
  `@hapi/code` was used, for the assertions. The checks are now plain
  code, and `prettier` is a development dependency.
* The validation error is a plain `Error` with a `code` property (the
  check key), a detail line written by the validator, and a link to
  `docs/reference/checks.md` instead of `senecajs.org/validator`. For
  `pv001000` the `require` error is kept as `err.cause`. A missing or
  invalid `plugin_module` argument is reported as a `TypeError`
  instead of a mangled message.
* The exported API is unchanged: `make_validate(Plugin, module)`
  returns an async function with no arguments that resolves when all
  checks pass and rejects on the first failure, so it can still be
  passed directly as a test body in lab, jest, mocha or `node:test`.
* Tests: a real test suite with `node --test` (`npm test`). `npm test`
  previously only loaded the module.
* Removed `.travis.yml` and the unused `coveralls` script.
* Documentation reorganized in the Diátaxis structure: README landing
  page, `docs/` with a tutorial, how-to guides, reference pages and an
  explanation, plus runnable examples in `docs/examples/`. The
  explanation describes option validation on Seneca 4: shape instead of
  Gubu and Joi, `plugin_gubu_shape` for Gubu shapes, closed plain
  object defaults.
* `package.json`: version 0.7.0, repository URLs point at the
  `senecajs` organization, a `files` list (the package ships the
  module, `docs/`, the README, the change log and the license, not the
  tests), `publishConfig.access` public. No `package-lock.json` is
  committed. `.prettierrc` added (no semicolons, single quotes).

Earlier versions have no change log; see the git history.
