/**
 * Type test: code written against the public types of cli-table3 < 1.0 (the hand-written
 * index.d.ts) must still compile. Checked by `pnpm typecheck` (not run).
 */
import Table = require('cli-table3');

const options: Table.TableConstructorOptions = {
  head: ['a', { content: 'b', hAlign: 'center' }],
  colWidths: [10, null],
  rowHeights: [null, 2],
  colAligns: ['left', 'center', 'right'],
  rowAligns: ['top', 'center', 'bottom'],
  wordWrap: true,
  wrapOnWordBoundary: false,
  truncate: '…',
  chars: { 'top-mid': '+', left: '|' },
  style: { 'padding-left': 0, 'padding-right': 2, head: ['red'], border: [], compact: true },
};

const table: Table.Table = new Table(options);
const empty = new Table();
const prototype: Table.Table = Table.prototype;

const cell: Table.Cell = {
  content: 'x',
  colSpan: 2,
  rowSpan: 1,
  hAlign: 'right',
  vAlign: 'bottom',
  href: 'https://example.com',
  chars: { left: '|', 'bottom-right': '+' },
  truncate: '~',
  wordWrap: true,
  wrapOnWordBoundary: true,
  style: { 'padding-left': 1, 'padding-right': 2, head: [], border: ['grey'] },
};
const cellOptions: Table.CellOptions = { content: 1 };
const values: Table.CellValue[] = [1, 'a', true, null, undefined, 10n];

const horizontal: Table.HorizontalTableRow = ['a', 1, cell, cellOptions, ...values];
const vertical: Table.VerticalTableRow = { key: 'value' };
const cross: Table.CrossTableRow = { key: ['a', cell] };
table.push(horizontal, vertical, cross);
empty.push(['a', 'b'], { key: 'value' }, { key: ['a', 'b'] });

const rendered: string = table.toString();
const width: number = table.width;
const instanceOptions: Table.TableInstanceOptions = table.options;
const chars: Record<Table.CharName, string> = table.options.chars;
const padding: number = table.options.style['padding-left'];
const headStyle: string[] = table.options.style.head;
const compact: boolean = table.options.style.compact;
const colWidths: Array<number | null> = table.options.colWidths;
const alignment: Table.HorizontalAlignment = 'center';
const verticalAlignment: Table.VerticalAlignment = 'center';
const baseOptions: Table.TableOptions = {
  truncate: '…',
  colWidths: [],
  rowHeights: [],
  colAligns: [],
  rowAligns: [],
  head: [],
  wordWrap: false,
  wrapOnWordBoundary: true,
};
const generic: Table.GenericTable<Table.HorizontalTableRow | Table.VerticalTableRow | Table.CrossTableRow> = table;

export {
  alignment,
  baseOptions,
  chars,
  colWidths,
  compact,
  generic,
  headStyle,
  instanceOptions,
  padding,
  prototype,
  rendered,
  verticalAlignment,
  width,
};
