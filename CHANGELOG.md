# Changelog

## v1.0.0 (unreleased)

#### :boom: Breaking Change
* Requires Node.js >= 22.12.
* `table.options.colWidths` / `rowHeights` no longer contain the computed sizes after rendering (they used to be
  written back, which froze the sizes for later renders).
* `table.options.style.head` is no longer cleared when rendering a table without a header row.
* `table.messages` only contains the debug messages of that table; `Table.reset()` is deprecated and does nothing.
* Array methods that create a new array (`map`, `filter`, `slice`, `concat`, `splice`, ...) return plain arrays
  instead of a `Table` with default options.
* `ansis` upgraded to v4. The style names it removed (`grey`, `bgGrey`, `strike`) are still accepted by cli-table3.
* The package declares its entry points (`exports`): only `cli-table3` and `cli-table3/package.json` can be imported.
  Deep imports such as `require('cli-table3/src/table')` no longer work (use `require('cli-table3')`).
* The type definitions are generated from the TypeScript sources. They match the previous ones, except where those
  were inaccurate: `table.options.wordWrap` / `wrapOnWordBoundary` are optional (`boolean | undefined`), the
  `content` of `CellOptions` is optional, and the `debug`, `messages`, `Table.reset` and `TableStyle` APIs are typed.

#### :rocket: Enhancement
* Written in TypeScript, with generated type definitions. Works from CommonJS and ES modules
  (`import Table from 'cli-table3'`).
* Invalid style names in `style.head` / `style.border` (table or cell) are reported in `table.messages` (debug level 3).
* Debug levels have a defined meaning: 1 = blocking issues (the table had to be changed), 2 = cell information,
  3 = non-blocking issues (an option is ignored) and layout details.

#### :bug: Bug Fix
* Rows pushed after a render are laid out with their own column widths and row heights instead of being truncated.
* Rendering no longer modifies the cell objects or `colWidths` / `rowHeights` arrays passed by the caller.
* The debug level of one table no longer affects other tables.
* A `rowSpan` reaching past the last row no longer crashes; it is limited to the last row (with a debug warning).
* Columns narrower than their padding: rendering no longer hangs with `wordWrap` + `wrapOnWordBoundary: false`, and
  rows are no longer drawn wider than the border (the padding shrinks; a too wide truncation symbol is shortened).
* Options set to `undefined` keep their default value (e.g. `colWidths: undefined` or `style: { 'padding-left': undefined }`
  crashed; `chars: { top: undefined }` drew a broken border).
* `wordWrap` keeps empty lines, like unwrapped content.
* Wrapping anywhere (`wrapOnWordBoundary: false`) measures by display width: full-width (e.g. CJK) text is no
  longer cut off, and escape sequences and emoji are not split.
* Wrapping on word boundaries counts leading whitespace (indented text was cut off).
* Cells spanning several columns wrap at their full width (the borders between the columns were not counted).

#### :memo: Documentation
* Three examples used a `header` style option, which does not exist (`head`); found by type-checking the examples.
* TypeScript and ES module usage in the README.

#### :house: Internal
* pnpm instead of yarn; Vitest 5 instead of Jest 25; Biome 2 instead of ESLint + Prettier; TypeScript 6.0.3 type check.
* CI on Node.js 22 and 24; `pnpm docs:check` verifies that the generated docs are up to date.
* The sources are TypeScript (strict), built incrementally with `tsc` into `dist/`. Every module is fully covered
  by the tests (enforced per module). Type tests check the published types against the API of cli-table3 < 1.0.
  `pnpm check:package` runs publint and Are The Types Wrong.
* The tests, examples and scripts are TypeScript too (type-checked with the sources); the scripts and examples are
  run by Node.js directly. `pnpm smoke` installs the packed package into CommonJS, ES module and TypeScript projects.

## v0.6.3 (2022-09-15)

#### :rocket: Enhancement

* [#303](https://github.com/cli-table/cli-table3/pull/303) Add ability to set/override wordWrap and wrapOnWordBoundary options per cell

## v0.6.2 (2022-04-11)

#### :rocket: Enhancement
* [#292](https://github.com/cli-table/cli-table3/pull/292) Hyperlink support for cells
* [#288](https://github.com/cli-table/cli-table3/pull/288) Add debugging capabilities
* [#217](https://github.com/cli-table/cli-table3/pull/217) Add wrapOnWordBoundary option for consistently readable word wrapping

#### :bug: Bug Fix
* [#290](https://github.com/cli-table/cli-table3/pull/290) Fix to erroneous column truncation when using colSpan
* [#287](https://github.com/cli-table/cli-table3/pull/287) Correctly set cell padding for zero values
* [#278](https://github.com/cli-table/cli-table3/pull/278) Refactored table layouts + Layout fix for #269

#### :memo: Documentation
* [#286](https://github.com/cli-table/cli-table3/pull/286) Regenerate docs

#### :house: Internal
* [#276](https://github.com/cli-table/cli-table3/pull/276) Move CI to Github Actions
* [#283](https://github.com/cli-table/cli-table3/pull/283) #196 - Fix to failing unit tests

## v0.6.1 (2022-01-09)

* [#251](https://github.com/cli-table/cli-table3/pull/251) Pin `colors` to 1.4.0

## v0.6.0 (2020-03-30)

#### :boom: Breaking Change
* [#156](https://github.com/cli-table/cli-table3/pull/156) Drop support for Node 6 and 8

#### :bug: Bug Fix
* [#92](https://github.com/cli-table/cli-table3/pull/92) Emoji Length Calculation Fix
* [#53](https://github.com/cli-table/cli-table3/pull/53) "Table" union type definition fix

#### :memo: Documentation
* [#135](https://github.com/cli-table/cli-table3/pull/135) docs: use https

#### :house: Internal
* [#132](https://github.com/cli-table/cli-table3/pull/132) Update lockfile
* [#134](https://github.com/cli-table/cli-table3/pull/134) Fix ESLint errors
* [#103](https://github.com/cli-table/cli-table3/pull/103) Fix Jest configuration

## v0.5.1 (2018-07-19)

#### :rocket: Enhancement
* [#21](https://github.com/cli-table/cli-table3/pull/21) Import type definition from `@types/cli-table2`

## v0.5.0 (2018-06-11)

#### :boom: Breaking Change
* [#2](https://github.com/cli-table/cli-table3/pull/2) Update Node version requirements.

#### :memo: Documentation
* [#11](https://github.com/cli-table/cli-table3/pull/11) Update Documentation.

#### :house: Internal
* [#16](https://github.com/cli-table/cli-table3/pull/16) Replace `kind-of` dependency with `typeof` and `Array.isArray()`.
* [#15](https://github.com/cli-table/cli-table3/pull/15) Remove Gulp.
* [#13](https://github.com/cli-table/cli-table3/pull/13) Use ES6 class syntax and `let/const`.
* [#12](https://github.com/cli-table/cli-table3/pull/12) Add ESLint and Prettier.
* [#10](https://github.com/cli-table/cli-table3/pull/10) chore: use yarn cache.
* [#9](https://github.com/cli-table/cli-table3/pull/9) Use Jest for testing.
* [#3](https://github.com/cli-table/cli-table3/pull/3) Add `yarn.lock` file.
* [#1](https://github.com/cli-table/cli-table3/pull/1) Skip broken test.

## v0.4.0 (2018-06-10)

First official release as `cli-table3`. Changes compares to `cli-table2` v0.2.0:

#### :rocket: Enhancement
* cli-table2 #27 Remove "lodash" dependency.

#### :bug: Bug Fix
* cli-table2 #29 Fix wordWrap with colSpan.
* cli-table2 #24 Fixing the runtime error when content is truncated.

#### :memo: Documentation
* cli-table2 #41 Create LICENSE.

#### :house: Internal
* cli-table2 #26 package.json: Whitelist JS files
