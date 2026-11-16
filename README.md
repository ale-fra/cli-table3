cli-table3 
===============================================================================

[![npm version](https://img.shields.io/npm/v/cli-table3.svg)](https://www.npmjs.com/package/cli-table3)
[![Build Status](https://github.com/cli-table/cli-table3/actions/workflows/test.yml/badge.svg?branch=master)](https://github.com/cli-table/cli-table3/actions/workflows/test.yml)

This utility allows you to render unicode-aided tables on the command line from
your node.js scripts.

`cli-table3` is based on (and api compatible with) the original [cli-table](https://github.com/Automattic/cli-table),
and [cli-table2](https://www.npmjs.com/package/cli-table2), which are both
unmaintained. `cli-table3` includes all the additional features from
`cli-table2`.

![Example table](./examples/screenshots/basic-usage-with-colors.png)

## Features not in the original cli-table

- Ability to make cells span columns and/or rows.
- Ability to set custom styles per cell (border characters/colors, padding, etc).
- Vertical alignment (top, bottom, center).
- [Word wrapping options](./basic-usage.md#set-wordwrap-to-true-to-wrap-text-on-word-boundaries).
- More robust truncation of cell text that contains ansi color characters.
- Better handling of text color that spans multiple lines.
- API compatible with the original cli-table.
- Exhaustive test suite including the entire original cli-table test suite.
- Lots of examples auto-generated from the tests ([basic](https://github.com/cli-table/cli-table3/blob/master/basic-usage.md), [advanced](https://github.com/cli-table/cli-table3/blob/master/advanced-usage.md)).

## Features

- Customizable characters that constitute the table.
- [Color/background](#colors) styling the table through
  [<s>colors.js</s>](https://www.npmjs.com/package/colors)
  [ansis](https://www.npmjs.com/package/ansis).
- Column width customization
- Text truncation based on predefined widths
- Text alignment (left, right, center)
- Padding (left, right)
- Easy-to-use API

## Installation

```bash
npm install cli-table3
```

Requires Node.js >= 22.12.

### TypeScript and ES modules

cli-table3 is written in TypeScript and ships its type definitions. It is a CommonJS package
that exports the `Table` class, and can be used from CommonJS and ES modules:

```typescript
import Table from 'cli-table3'; // ES module, or TypeScript with esModuleInterop
// const Table = require('cli-table3'); // CommonJS
// import Table = require('cli-table3'); // TypeScript, CommonJS output

const options: Table.TableConstructorOptions = { head: ['Name', 'Value'], colWidths: [10, 20] };
const table: Table.Table = new Table(options);
table.push(['a', 1], [{ content: 'spans both columns', colSpan: 2 }]);
console.log(table.toString());
```

The types are available as `Table.<name>`: `TableConstructorOptions`, `TableInstanceOptions`,
`Cell`, `CellOptions`, `CellValue`, `HorizontalTableRow`, `VerticalTableRow`, `CrossTableRow`,
`HorizontalAlignment`, `VerticalAlignment`, `CharName`, ...

## How to use

A portion of the unit test suite is used to generate examples:
- [basic-usage](https://github.com/cli-table/cli-table3/blob/master/basic-usage.md) - covers basic uses.
- [advanced](https://github.com/cli-table/cli-table3/blob/master/advanced-usage.md) - covers using the new column and row span features.

This package is api compatible with the original [cli-table](https://github.com/Automattic/cli-table).
So all the original documentation still applies (copied below).

### Horizontal Tables
```javascript
var Table = require('cli-table3');

// instantiate
var table = new Table({
    head: ['TH 1 label', 'TH 2 label']
  , colWidths: [100, 200]
});

// table is an Array, so you can `push`, `unshift`, `splice` and friends
table.push(
    ['First value', 'Second value']
  , ['First value', 'Second value']
);

console.log(table.toString());
```

### Maximum column widths

`maxColWidths` accepts one number for all columns, or an array such as `[null, 20, 8]`.
Columns keep their natural width up to that limit (including padding). Longer content wraps;
long words are broken without splitting Unicode grapheme clusters or ANSI sequences.
`null`, missing entries and invalid limits mean no limit; positive limits are rounded down.
A limit smaller than the padding plus the widest character is raised to keep content visible.
Fixed `colWidths` take precedence. `wordWrap: false` on the table or a cell opts into truncation.
Spanning cells use the combined width; crossing a limited column does not widen unlimited columns
that have their own content. Computed widths stay private to each render.

```javascript
const table = new Table({ head: ['ID', 'Description'], maxColWidths: [null, 20] });
table.push(['1', 'A long description wraps instead of being truncated']);
console.log(table.toString());
```

### Vertical Tables
```javascript
var Table = require('cli-table3');
var table = new Table();

table.push(
    { 'Some key': 'Some value' }
  , { 'Another key': 'Another value' }
);

console.log(table.toString());
```
### Cross Tables
Cross tables are very similar to vertical tables, with two key differences:

1. They require a `head` setting when instantiated that has an empty string as the first header
2. The individual rows take the general form of { "Header": ["Row", "Values"] }

```javascript
var Table = require('cli-table3');
var table = new Table({ head: ["", "Top Header 1", "Top Header 2"] });

table.push(
    { 'Left Header 1': ['Value Row 1 Col 1', 'Value Row 1 Col 2'] }
  , { 'Left Header 2': ['Value Row 2 Col 1', 'Value Row 2 Col 2'] }
);

console.log(table.toString());
```

### Custom styles
The ```chars``` property controls how the table is drawn:
```javascript
var table = new Table({
  chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
         , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
         , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
         , 'right': '║' , 'right-mid': '╢' , 'middle': '│' }
});

table.push(
    ['foo', 'bar', 'baz']
  , ['frob', 'bar', 'quuz']
);

console.log(table.toString());
// Outputs:
//
//╔══════╤═════╤══════╗
//║ foo  │ bar │ baz  ║
//╟──────┼─────┼──────╢
//║ frob │ bar │ quuz ║
//╚══════╧═════╧══════╝
```

Empty decoration lines will be skipped, to avoid vertical separator rows just
set the 'mid', 'left-mid', 'mid-mid', 'right-mid' to the empty string:
```javascript
var table = new Table({ chars: {'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': ''} });
table.push(
    ['foo', 'bar', 'baz']
  , ['frobnicate', 'bar', 'quuz']
);

console.log(table.toString());
// Outputs: (note the lack of the horizontal line between rows)
//┌────────────┬─────┬──────┐
//│ foo        │ bar │ baz  │
//│ frobnicate │ bar │ quuz │
//└────────────┴─────┴──────┘
```

By setting all chars to empty with the exception of 'middle' being set to a
single space and by setting padding to zero, it's possible to get the most
compact layout with no decorations:
```javascript
var table = new Table({
  chars: { 'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': ''
         , 'bottom': '' , 'bottom-mid': '' , 'bottom-left': '' , 'bottom-right': ''
         , 'left': '' , 'left-mid': '' , 'mid': '' , 'mid-mid': ''
         , 'right': '' , 'right-mid': '' , 'middle': ' ' },
  style: { 'padding-left': 0, 'padding-right': 0 }
});

table.push(
    ['foo', 'bar', 'baz']
  , ['frobnicate', 'bar', 'quuz']
);

console.log(table.toString());
// Outputs:
//foo        bar baz
//frobnicate bar quuz
```

<a id="colors" name="colors"></a>

## Colors

You can colorize the text in the table head and the table border with 16 named colors or with truecolor using a hex code.
The color and styles can be combined. Legacy colors.js names such as `brightRed`, `bgBrightBlue`
and `redBG` are accepted alongside the Ansis names. Only style chains are accepted; Ansis helper
methods are rejected. As in the TypeScript snapshot, an invalid entry leaves the whole list
unstyled and is reported at debug level 3.

### Base 16 colors and styles

See the full list of [base named colors and styles](https://www.npmjs.com/package/ansis#base-ansi-16-colors-and-styles).

The legacy names `grey`, `bgGrey` and `strike` are still accepted as aliases of `gray`, `bgGray` and `strikethrough`.

### Truecolor

To apply a custom `truecolor`, use the format `hex(CODE)` for foreground and `bgHex(CODE)` for background, 
where `CODE` is a 3- or 6-digit hexadecimal code, e.g., `hex(#FFA500)`, `hex(#A7E)`, `bgHex(#FF69B4)`, `bgHex(#49B)`.

### Colorizing table head

Use the `style.head[]` option to style text in the table header.

For example, the header text in base color `green` and styled as `bold` :
```js
var table = new Table({ 
  head: ['Name', 'Age'], 
  style: { 
    head: ['green', 'bold'],
  } 
});

table.push(['Sample row A', '50']);

console.log(table.toString());
```
For example, the header text in truecolor `orange` and styled as `italic`:
```js
style: {
  head: ['hex(#FFA500)', 'italic'],
}
```

### Colorizing table border

Use the `style.border[]` option to specify a border color.

For example, the header text in truecolor `orange` and the border in truecolor `gold`:
```js
style: {
  border: ['hex(#FFD700)'],
  head: ['hex(#FFA500)', 'italic'],
}
```

### Colorizing table cells

To colorize cells can be used [ansis](https://www.npmjs.com/package/ansis), which is already included in this package as a dependency.

For example, apply an individual color to the single cell in the table body:
```js
var ansi = require('ansis');
var Table = require('cli-table3');

var table = new Table({ 
  head: ['Name', 'Age'], 
  style: {
    border: ['hex(#FFD700)'],
    head: ['hex(#FFA500)', 'italic'],
  } 
});

table.push(
  // apply a color to cells
  [ansi.green('Sample row A'), ansi.red('50')],
  [ansi.hex('#FF69B4')('Sample row AB'), ansi.blueBright('24')],
);

console.log(table.toString());
```
For example, colorize the table body with one color:
```js
var { green } = require('ansis'); // use a named import when using a few colors
var Table = require('cli-table3');

var table = new Table({ 
  head: ['Name', 'Age'], 
  style: {
    border: ['hex(#FFD700)'],
    head: ['hex(#FFA500)', 'italic'],
  } 
});

table.push(
  ['Sample row A', '50'],
  ['Sample row AB', '24'],
);

var output = green(table.toString()); // colorize the whole table

console.log(output);
```

### Colorizing table background

To specify the background color you can use a color name with the `bg` prefix, e.g., `bgGreen`, `bgGreenBright` or `gbHex()` for truecolor.

For example, add a background color to the example above:
```js
var { green } = require('ansis');
var Table = require('cli-table3');

var table = new Table({ 
  head: ['Name', 'Age'], 
  style: {
    border: ['hex(#FFD700)'],
    head: ['hex(#FFA500)', 'italic'],
  } 
});

table.push(
  ['Sample row A', '50'],
  ['Sample row AB', '24'],
);

var output = green.bgHex('#3d239d')(table.toString()); // <- add a background to the table

console.log(output);
```

## Debugging

Later versions of cli-table3 supporting debugging your table data.

Enable and use debugging:

```javascript
var table = new Table({ debug: 1 });
table.push([{}, {}]); // etc.

console.log(table.toString());
table.messages.forEach((message) => console.log(message));
```

The `debug` option sets the level of detail; a level includes the levels below it:

| Level | Messages |
|---|---|
| `1` (or `true`) | Blocking issues: the table cannot be rendered as given and had to be changed (e.g. a missing cell was added, a row span was limited). |
| `2` | Information about each rendered cell. |
| `3` | Non-blocking issues: the table is rendered as given, but an option is ignored (e.g. an invalid style name). Details about the layout. |

Messages are collected per table and accumulate each time the table is rendered.
`Table.reset()` is deprecated and no longer needed: it does nothing.

## Build Targets

Development requires Node.js >= 22.18 (scripts are TypeScript, run by Node.js directly) and [pnpm](https://pnpm.io) (the exact version is pinned in the
`packageManager` field of `package.json`).

Clone the repository and run `pnpm install` to install all its dependencies, then run one of the following commands:

###### Run all checks (tests with coverage thresholds, type check, lint), as CI does.
```bash
$ pnpm test
```

###### Run the tests every time a file changes.
```bash
$ pnpm test:watch
```

###### Build `src/` into `dist/` (incremental).
```bash
$ pnpm build
```

###### Update the documentation.
```bash
$ pnpm docs:generate
```

###### Check the package (publint, Are The Types Wrong).
```bash
$ pnpm check:package
```

###### Smoke test: install the packed package into new CommonJS, ES module and TypeScript projects and run them.
```bash
$ pnpm smoke
```

###### Print the examples to the console.
```bash
$ pnpm examples
```

Everything is TypeScript. The sources in `src/` are compiled into `dist/` by `tsc` (incremental;
also run automatically before the tests). The tests (`test/`) run against `dist/`, i.e. the
published code, and every module must be fully covered. `test/types/` checks the published type
definitions. The scripts and examples (`.mts`) are run by Node.js directly.

## License

[MIT](./LICENSE)
