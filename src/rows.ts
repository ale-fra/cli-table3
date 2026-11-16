/**
 * The rows that can be pushed into a table.
 */
import type { CellInput } from './options';

/** `['a', 'b']`: cells from left to right. */
export type HorizontalTableRow = CellInput[];

/** `{ name: 'value' }`: a row with a header cell (`name`) and a value cell. */
export interface VerticalTableRow {
  [name: string]: CellInput;
}

/** `{ name: ['a', 'b'] }`: a row with a header cell (`name`) and value cells. */
export interface CrossTableRow {
  [name: string]: CellInput[];
}

export type TableRow = HorizontalTableRow | VerticalTableRow | CrossTableRow;
