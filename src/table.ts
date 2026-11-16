/**
 * The table: an array of rows that renders itself with `toString()`.
 */

import { Cell, type LayoutCell, type LineNumber } from './cell';
import * as debug from './debug';
import { makeTableLayout } from './layout-manager';
import { resolveMaxColWidths } from './max-col-widths';
import {
  type CellInput,
  type CellOptions,
  type CellValue,
  type CharName,
  type HorizontalAlignment,
  mergeOptions,
  type TableConstructorOptions,
  type TableInstanceOptions,
  type TableOptions,
  type TableStyle,
  type VerticalAlignment,
} from './options';
import type { CrossTableRow, HorizontalTableRow, TableRow, VerticalTableRow } from './rows';
import { computeHeights, computeWidths } from './sizes';
import { invalidStyleMessage } from './utils';

export class Table extends Array<TableRow> {
  /**
   * Array methods that create a new array (map, filter, slice, concat, splice, ...) return
   * plain arrays: a derived Table would not have the options of this table.
   */
  static override get [Symbol.species](): ArrayConstructor {
    return Array;
  }

  /**
   * @deprecated Debug messages are kept per table (`table.messages`), so there is nothing
   * to reset any more. Kept for backwards compatibility; it does nothing.
   */
  static reset(): void {}

  /** The options of the table: the constructor options merged with the defaults. */
  declare readonly options: TableInstanceOptions;

  /** The debug messages of this table; only defined if the `debug` option is set. */
  declare readonly messages?: string[];

  /** Debug level and messages of this table (level 0: debugging disabled). */
  readonly #debug: debug.DebugCollector = { level: 0, messages: [] };

  constructor(options?: TableConstructorOptions) {
    super();

    const merged = mergeOptions(options);
    // not enumerable (unless debugging): a table looks like the array of its rows
    Object.defineProperty(this, 'options', { value: merged, enumerable: Boolean(merged.debug) });

    if (merged.debug) {
      const collector = this.#debug;
      switch (typeof merged.debug) {
        case 'boolean':
          collector.level = debug.WARN;
          break;
        case 'number':
          collector.level = merged.debug;
          break;
        case 'string':
          collector.level = Number.parseInt(merged.debug, 10);
          break;
        default:
          // Reported at level 1: the level falls back to 1, so the message is always recorded.
          collector.level = debug.WARN;
          debug.collect(collector, () =>
            debug.warn(`Debug option is expected to be boolean, number, or string. Received a ${typeof merged.debug}`)
          );
      }
      Object.defineProperty(this, 'messages', { get: () => collector.messages });
    }
  }

  /** Renders the table. */
  override toString(): string {
    return debug.collect(this.#debug, () => this.#render());
  }

  /** The width of the rendered table. */
  get width(): number {
    const [firstLine = ''] = this.toString().split('\n');
    return firstLine.length;
  }

  #render(): string {
    for (const name of ['head', 'border'] as const) {
      const message = invalidStyleMessage(this.options.style[name], `style.${name} of the table`);
      if (message) {
        debug.debug(message);
      }
    }

    // Render with a private copy of the options: computeWidths/computeHeights fill the sizing
    // arrays in place, and writing the computed sizes back into this.options (or into the
    // caller's arrays) would freeze them for all later renders. `style` is copied because
    // the head style is disabled for tables without a header row (see below).
    const options = {
      ...this.options,
      colWidths: this.options.colWidths.slice(),
      rowHeights: this.options.rowHeights.slice(),
      style: { ...this.options.style },
    };

    const headersPresent = Boolean(options.head?.length);
    if (!headersPresent) {
      // No header row: row 0 is a data row and must not get the head style.
      options.style.head = [];
    }
    const rows: readonly TableRow[] = headersPresent ? [options.head, ...this] : this;

    const cells = makeTableLayout(rows);
    for (const row of cells) {
      for (const cell of row) {
        cell.mergeTableOptions(options, cells);
      }
    }

    const limits = resolveMaxColWidths(options.maxColWidths, cells);
    const columnOptions = { ...options, colWidths: computeWidths(options.colWidths, cells, limits) };
    if (limits.length > 0) {
      for (const row of cells) {
        for (const cell of row) {
          if (
            cell instanceof Cell &&
            limits.slice(cell.x, cell.x + cell.colSpan).some((limit) => limit !== undefined)
          ) {
            cell.wrapToWidth(columnOptions);
          }
        }
      }
    }
    const sized = {
      ...columnOptions,
      rowHeights: computeHeights(options.rowHeights, cells),
    };
    for (const row of cells) {
      for (const cell of row) {
        cell.init(sized);
      }
    }

    const lines: string[] = [];
    cells.forEach((row, rowIndex) => {
      if (rowIndex === 0 || !options.style.compact || (rowIndex === 1 && headersPresent)) {
        drawLine(row, 'top', lines);
      }
      for (let lineNum = 0; lineNum < Number(sized.rowHeights[rowIndex]); lineNum++) {
        drawLine(row, lineNum, lines);
      }
      if (rowIndex + 1 === cells.length) {
        drawLine(row, 'bottom', lines);
      }
    });
    return lines.join('\n');
  }
}

/** Appends line `lineNum` of the cells of a row to `lines` (unless it is empty). */
function drawLine(row: readonly LayoutCell[], lineNum: LineNumber, lines: string[]): void {
  const line = row.map((cell) => cell.draw(lineNum)).join('');
  if (line.length) {
    lines.push(line);
  }
}

/** The instance type of Table (inside the namespace below, `Table` is the namespace's own type). */
type TableInstance = Table;

/** The public types, e.g. `Table.TableConstructorOptions` (the same names as in cli-table3 < 1.0). */

export declare namespace Table {
  export type {
    CellOptions,
    CellValue,
    CharName,
    CrossTableRow,
    HorizontalAlignment,
    HorizontalTableRow,
    TableConstructorOptions,
    TableInstanceOptions,
    TableOptions,
    TableRow,
    TableStyle,
    VerticalAlignment,
    VerticalTableRow,
  };
  /** A cell: a primitive value or a cell options object. */
  export type Cell = CellInput;
  /** The type of a table (`new Table()`). */
  export type Table = TableInstance;
  /** A table typed by its rows (compatibility with cli-table3 < 1.0). */
  export interface GenericTable<T> extends Array<T> {
    options: TableInstanceOptions;
    readonly width: number;
  }
}
