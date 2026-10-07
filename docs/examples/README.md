# Examples

Runnable programs that accompany the documentation. Each file loads the
validator from this repository (`require('../../../..')` or
`require('../..')`); in your own project use
`require('seneca-plugin-validator')` instead. The programs need the
development dependencies of this repository (`npm install` in the
repository root provides `seneca`).

| Path | Used by | Run from the repository root with |
| ---- | ------- | --------------------------------- |
| `shop-plugin/` | [Validate your plugin in its test suite](../tutorials/getting-started.md) | `node --test docs/examples/shop-plugin/test/shop.test.js` |
| `show-failures.js` | [Interpret validation failures](../how-to/interpret-validation-failures.md) | `node docs/examples/show-failures.js` |
| `fixtures/` | `show-failures.js`: `package.json` files of two stand in projects | not run directly |

`shop-plugin/` is a complete plugin project: `package.json`, the plugin
`shop.js` and the test `test/shop.test.js`. Its `package.json` lists the
development dependencies such a project would install; here they are
resolved from the repository root instead.
