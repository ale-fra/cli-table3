/**
 * Places the cells of the table on a grid: sets their position (`x`, `y`), adds the cells
 * missing from rows, and fills the positions covered by spanning cells with placeholders.
 */
import { Cell, ColSpanCell, type LayoutCell, RowSpanCell } from './cell';
import { debug, warn } from './debug';
import type { CellInput } from './options';
import type { TableRow } from './rows';

/** What placing a cell on the grid needs to know about it; the layout sets `x` and `y`. */
export interface GridCell {
  x: number;
  y: number;
  colSpan?: number;
  rowSpan?: number;
}

/** Sets the position of every cell, moving cells right of the cells spanning rows from above. */
export function layoutTable(table: GridCell[][]): void {
  // columns still covered by a cell from a row above: column → number of rows
  const covered = new Map<number, number>();
  const nextFreeColumn = (column: number): number => {
    let free = column;
    while ((covered.get(free) ?? 0) > 0) {
      free++;
    }
    return free;
  };

  table.forEach((row, rowIndex) => {
    let column = 0;
    for (const cell of row) {
      cell.y = rowIndex;
      // In the first row, `covered` only holds the spans of this row's own cells.
      cell.x = rowIndex ? nextFreeColumn(column) : column;
      // A cell cannot span past the last row (like HTML tables, the span is limited).
      const rowsLeft = table.length - rowIndex;
      if (cell.rowSpan !== undefined && cell.rowSpan > rowsLeft) {
        warn(
          `rowSpan of cell ${cell.y}-${cell.x} (${cell.rowSpan}) reaches past the last row; limited to ${rowsLeft}.`
        );
        cell.rowSpan = rowsLeft;
      }
      const rowSpan = cell.rowSpan || 1;
      const colSpan = cell.colSpan || 1;
      if (rowSpan > 1) {
        for (let offset = 0; offset < colSpan; offset++) {
          covered.set(cell.x + offset, rowSpan);
        }
      }
      column = cell.x + colSpan;
    }
    for (const [coveredColumn, rows] of covered) {
      if (rows - 1 < 1) {
        covered.delete(coveredColumn);
      } else {
        covered.set(coveredColumn, rows - 1);
      }
    }
  });
}

/** The number of columns of the grid. */
export function maxWidth(table: readonly GridCell[][]): number {
  let width = 0;
  for (const row of table) {
    for (const cell of row) {
      width = Math.max(width, cell.x + (cell.colSpan || 1));
    }
  }
  return width;
}

/** Whether two cells (including the positions they span) overlap. */
function cellsConflict(cell1: GridCell, cell2: GridCell): boolean {
  const yMin1 = cell1.y;
  const yMax1 = cell1.y - 1 + (cell1.rowSpan || 1);
  const yMin2 = cell2.y;
  const yMax2 = cell2.y - 1 + (cell2.rowSpan || 1);
  const yConflict = !(yMin1 > yMax2 || yMin2 > yMax1);

  const xMin1 = cell1.x;
  const xMax1 = cell1.x - 1 + (cell1.colSpan || 1);
  const xMin2 = cell2.x;
  const xMax2 = cell2.x - 1 + (cell2.colSpan || 1);
  const xConflict = !(xMin1 > xMax2 || xMin2 > xMax1);

  return yConflict && xConflict;
}

/** Whether the position (x, y) is covered by a cell of `rows`. */
function conflictExists(rows: readonly GridCell[][], x: number, y: number): boolean {
  const position = { x, y };
  return rows.slice(0, y + 1).some((row) => row.some((cell) => cellsConflict(position, cell)));
}

/** Whether the positions xMin to xMax - 1 of row `y` are free. */
function allBlank(rows: readonly GridCell[][], y: number, xMin: number, xMax: number): boolean {
  for (let x = xMin; x < xMax; x++) {
    if (conflictExists(rows, x, y)) {
      return false;
    }
  }
  return true;
}

/** Only a Cell spans rows (the placeholders never do). */
function spansRows(cell: GridCell): cell is Cell {
  return (cell.rowSpan ?? 1) > 1;
}

/** Adds a RowSpanCell below a cell spanning rows, for every row it covers. */
export function addRowSpanCells(table: GridCell[][]): void {
  table.forEach((row, rowIndex) => {
    for (const cell of row) {
      if (!spansRows(cell)) {
        continue;
      }
      table.slice(rowIndex + 1, rowIndex + cell.rowSpan).forEach((rowBelow, i) => {
        insertCell(new RowSpanCell(cell, cell.x, cell.y + i + 1), rowBelow);
      });
    }
  });
}

/** Adds a ColSpanCell right of a cell spanning columns, for every column it covers. */
function addColSpanCells(table: GridCell[][]): void {
  for (const row of table.toReversed()) {
    // (the iterator also visits the inserted placeholders, which do not span columns)
    for (const [index, cell] of row.entries()) {
      for (let k = 1; k < (cell.colSpan ?? 1); k++) {
        row.splice(index + 1, 0, new ColSpanCell(cell.x + k, cell.y));
      }
    }
  }
}

/** Inserts `cell` into `row`, keeping the row ordered by `x`. */
function insertCell(cell: GridCell, row: GridCell[]): void {
  const index = row.findIndex((other) => !(other.x < cell.x));
  row.splice(index === -1 ? row.length : index, 0, cell);
}

/** Adds an empty cell wherever the grid has no cell, spanning as far as the gap goes. */
export function fillInTable(table: GridCell[][]): void {
  const height = table.length;
  const width = maxWidth(table);
  debug(`Max rows: ${height}; Max cols: ${width}`);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!conflictExists(table, x, y)) {
        const start = x;
        let colSpan = 1;
        x++;
        while (x < width && !conflictExists(table, x, y)) {
          colSpan++;
          x++;
        }
        let rowSpan = 1;
        while (y + rowSpan < height && allBlank(table, y + rowSpan, start, start + colSpan)) {
          rowSpan++;
        }
        const cell = new Cell({ colSpan, rowSpan });
        cell.x = start;
        cell.y = y;
        warn(`Missing cell at ${cell.y}-${cell.x}.`);
        insertCell(cell, table[y] as GridCell[]); // y < height
      }
    }
  }
}

/** The cells of a row: a vertical or cross table row starts with its name. */
function rowInputs(row: TableRow): CellInput[] {
  if (Array.isArray(row)) {
    return row;
  }
  const [name] = Object.keys(row);
  const value = name === undefined ? undefined : row[name];
  return Array.isArray(value) ? [name, ...value] : [name, value];
}

/** Lays out the rows of a table. */
export function makeTableLayout(rows: readonly TableRow[]): LayoutCell[][] {
  const table: LayoutCell[][] = rows.map((row) => rowInputs(row).map((input) => new Cell(input)));
  layoutTable(table);
  fillInTable(table);
  addRowSpanCells(table);
  addColSpanCells(table);
  return table;
}
