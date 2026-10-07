# Changes

## 0.7.0 2026-10-07

* Seneca 4 prerelease support: the test suite loads a sample plugin in
  the Seneca 4 style (single `options` parameter, Gubu defaults, errors
  map, exports) into `seneca@^4.0.0-rc5` and into the unreleased
  4.0.0, and shows that what the validator accepts is what Seneca 4
  loads. The validator itself does not depend on Seneca.
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
* Tests: a real test suite with `node --test` (`npm test`), run on
  Node.js 24 (default target) and 22. `npm test` previously only loaded
  the module.
* Removed `.travis.yml` and the unused `coveralls` script. The GitHub
  Actions workflow (`build` on Node.js 24 and 22) is provided as a
  patch in `.patches/`.
* Documentation reorganized in the Diátaxis structure: README landing
  page, `docs/` with a tutorial, how-to guides, reference pages and an
  explanation, plus runnable examples in `docs/examples/`.
* `package.json`: version 0.7.0, repository URLs point at the
  `senecajs` organization, `package-lock.json` regenerated (lockfile
  version 3), `.prettierrc` added (no semicolons, single quotes).

Earlier versions have no change log; see the git history.
