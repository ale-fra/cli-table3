/**
 * A cell of the table, and how it draws itself line by line.
 *
 * Lifecycle, for every render of the table:
 *  1. `new Cell(input)`: the content and the spans;
 *  2. the layout sets `x` and `y`;
 *  3. `mergeTableOptions()`: the settings inherited from the table, the lines of text and the
 *     desired size;
 *  4. `init()`, once the column widths and row heights are known: the final size;
 *  5. `draw()` for every line of the row.
 */
import { debug, info } from '../debug';
import type { CellInput, CellOptions, HorizontalAlignment, TableInstanceOptions, VerticalAlignment } from '../options';
import {
  applyStyles,
  colorizeLines,
  hyperlink,
  invalidStyleMessage,
  pad,
  repeat,
  strlen,
  truncate,
  wordWrap,
  wrapToWidth,
} from '../utils';
import { type CellChars, type CharKey, resolveChars, resolvePadding } from './inherited-options';
import { ColSpanCell, RowSpanCell } from './span-cells';

/** Any element of the layout grid. */
export type LayoutCell = Cell | ColSpanCell | RowSpanCell;

/** A line of a cell: the top border, the bottom border or a line of text (from 0). */
export type LineNumber = number | 'top' | 'bottom';

/** The table options a cell uses while the table is laid out. */
export type LayoutOptions = Pick<
  TableInstanceOptions,
  'chars' | 'truncate' | 'style' | 'colWidths' | 'wordWrap' | 'textWrap' | 'wrapOnWordBoundary'
>;

/** The table options a cell uses once the column widths and row heights are known. */
export interface SizedOptions extends Pick<TableInstanceOptions, 'colAligns' | 'rowAligns'> {
  colWidths: number[];
  rowHeights: number[];
}

type Primitive = boolean | number | bigint | string;

function isPrimitive(value: unknown): value is Primitive {
  return ['boolean', 'number', 'bigint', 'string'].includes(typeof value);
}

export class Cell {
  /** The cell options as given by the user (never modified). */
  declare options: CellOptions;
  declare content: string;
  declare colSpan: number;
  declare rowSpan: number;

  /** The position in the grid, set by the layout. */
  x = 0;
  y = 0;

  // set by mergeTableOptions()
  /** The layout grid (`undefined` when the cell is used on its own). */
  declare cells: LayoutCell[][] | undefined;
  declare chars: CellChars;
  declare truncate: string;
  declare paddingLeft: number;
  declare paddingRight: number;
  declare head: string[];
  declare border: string[];
  declare lines: string[];
  declare desiredWidth: number;
  declare desiredHeight: number;

  // set by init()
  declare widths: number[];
  declare heights: number[];
  declare width: number;
  declare height: number;
  declare hAlign: HorizontalAlignment | undefined;
  declare vAlign: VerticalAlignment | undefined;
  declare drawRight: boolean;

  constructor(input?: CellInput) {
    this.setOptions(input);
  }

  /** The link of the cell, if any. */
  get href(): string | undefined {
    return this.options.href || undefined;
  }

  setOptions(input: CellInput): void {
    const options: CellOptions = isPrimitive(input) ? { content: `${input}` } : (input ?? {});
    this.options = options;
    const { content } = options;
    if (isPrimitive(content)) {
      this.content = String(content);
    } else if (!content) {
      this.content = options.href || '';
    } else {
      throw new Error(`Content needs to be a primitive, got: ${typeof content}`);
    }
    this.colSpan = options.colSpan || 1;
    this.rowSpan = options.rowSpan || 1;
  }

  mergeTableOptions(tableOptions: LayoutOptions, cells?: LayoutCell[][]): void {
    this.cells = cells;
    this.chars = resolveChars(this.options.chars, tableOptions.chars);
    this.truncate = this.options.truncate || tableOptions.truncate;

    const style = this.options.style || {};
    const tableStyle = tableOptions.style;
    const padding = resolvePadding(style, tableStyle);
    this.paddingLeft = padding.left;
    this.paddingRight = padding.right;
    this.head = style.head || tableStyle.head;
    this.border = style.border || tableStyle.border;
    for (const name of ['head', 'border'] as const) {
      const message = invalidStyleMessage(style[name], `style.${name} of cell ${this.y}-${this.x}`);
      if (message) {
        debug(message);
      }
    }

    this.lines = this.computeLines(tableOptions);
    this.desiredWidth = strlen(this.content) + this.paddingLeft + this.paddingRight;
    this.desiredHeight = this.lines.length;
  }

  private computeLines(tableOptions: LayoutOptions): string[] {
    const fixedWidth = tableOptions.colWidths[this.x];
    const { wordWrap: wrap = tableOptions.wordWrap || tableOptions.textWrap } = this.options;
    if (fixedWidth && wrap) {
      // The width available for the content. A spanning cell also gets the borders between
      // the columns it spans. If the padding leaves less than 1 column, wordWrap() uses 1,
      // which matches the padding reduced by init().
      let width = fixedWidth - (this.paddingLeft + this.paddingRight);
      for (let i = 1; i < this.colSpan; i++) {
        width += Number(tableOptions.colWidths[this.x + i]) + 1;
      }
      const { wrapOnWordBoundary: tableWrapOnWordBoundary = true } = tableOptions;
      const { wrapOnWordBoundary = tableWrapOnWordBoundary } = this.options;
      return this.wrapLines(wordWrap(width, this.content, wrapOnWordBoundary));
    }
    return this.wrapLines(this.content.split('\n'));
  }

  wrapToWidth(tableOptions: Pick<SizedOptions, 'colWidths'> & LayoutOptions): void {
    const { wordWrap = tableOptions.wordWrap } = this.options;
    if (wordWrap === false) {
      return;
    }
    const { wrapOnWordBoundary: tableWrapOnWordBoundary = true } = tableOptions;
    const { wrapOnWordBoundary = tableWrapOnWordBoundary } = this.options;

    const spannedWidths = tableOptions.colWidths.slice(this.x, this.x + this.colSpan);
    const width = spannedWidths.reduce(sumPlusOne, -1) - this.paddingLeft - this.paddingRight;
    const contentLines = this.content.split('\n');
    const fits = contentLines.every((line) => strlen(line) <= width);

    this.lines = this.wrapLines(fits ? contentLines : wrapToWidth(width, this.content, wrapOnWordBoundary));
    this.desiredHeight = this.lines.length;
  }

  private wrapLines(computedLines: string[]): string[] {
    const lines = colorizeLines(computedLines);
    const { href } = this;
    return href ? lines.map((line) => hyperlink(href, line)) : lines;
  }

  /**
   * Sets the final size of the cell. `tableOptions.colWidths` and `rowHeights` hold the size
   * of every column and row of the table.
   */
  init(tableOptions: SizedOptions): void {
    const { x, y } = this;
    this.widths = tableOptions.colWidths.slice(x, x + this.colSpan);
    this.heights = tableOptions.rowHeights.slice(y, y + this.rowSpan);
    this.width = this.widths.reduce(sumPlusOne, -1);
    this.height = this.heights.reduce(sumPlusOne, -1);

    const padding = fitPadding(this.width, this.paddingLeft, this.paddingRight);
    this.paddingLeft = padding.left;
    this.paddingRight = padding.right;

    this.hAlign = this.options.hAlign || tableOptions.colAligns[x];
    this.vAlign = this.options.vAlign || tableOptions.rowAligns[y];

    this.drawRight = x + this.colSpan === tableOptions.colWidths.length;
  }

  /**
   * Draws a line of the cell.
   * @param spanningCell - when drawn for a RowSpanCell: how many rows below the cell's first row.
   */
  draw(lineNum: LineNumber, spanningCell?: number): string {
    if (lineNum === 'top') {
      return this.drawTop(this.drawRight);
    }
    if (lineNum === 'bottom') {
      return this.drawBottom(this.drawRight);
    }
    if (!lineNum) {
      const content = truncate(this.content, 10, this.truncate);
      info(`${this.y}-${this.x}: ${this.rowSpan - lineNum}x${this.colSpan} Cell ${content}`);
    }
    const padLength = Math.max(this.height - this.lines.length, 0);
    let padTop: number;
    switch (this.vAlign) {
      case 'center':
        padTop = Math.ceil(padLength / 2);
        break;
      case 'bottom':
        padTop = padLength;
        break;
      default:
        padTop = 0;
    }
    if (lineNum < padTop || lineNum >= padTop + this.lines.length) {
      return this.drawEmpty(this.drawRight, spanningCell);
    }
    const forceTruncation = this.lines.length > this.height && lineNum + 1 >= this.height;
    return this.drawLine(lineNum - padTop, this.drawRight, forceTruncation, spanningCell);
  }

  /** Draws the top border of the cell (and its right corner if `drawRight`). */
  drawTop(drawRight: boolean): string {
    const horizontal = this.chars[this.y === 0 ? 'top' : 'mid'];
    const content: string[] = [];
    if (this.cells) {
      this.widths.forEach((width, index) => {
        content.push(this.topLeftChar(index), repeat(horizontal, width));
      });
    } else {
      content.push(this.topLeftChar(0), repeat(horizontal, this.width));
    }
    if (drawRight) {
      content.push(this.chars[this.y === 0 ? 'topRight' : 'rightMid']);
    }
    return applyStyles(this.border, content.join(''));
  }

  /** The border character at the top left of the column `offset` of the cell. */
  private topLeftChar(offset: number): string {
    const x = this.x + offset;
    let leftChar: CharKey;
    if (this.y === 0) {
      leftChar = x === 0 ? 'topLeft' : offset === 0 ? 'topMid' : 'top';
    } else if (x === 0) {
      leftChar = 'leftMid';
    } else {
      leftChar = offset === 0 ? 'midMid' : 'bottomMid';
      if (this.cells) {
        const spanAbove = this.cells[this.y - 1]?.[x] instanceof ColSpanCell;
        if (spanAbove) {
          leftChar = offset === 0 ? 'topMid' : 'mid';
        }
        if (offset === 0) {
          let i = 1;
          while (this.cells[this.y]?.[x - i] instanceof ColSpanCell) {
            i++;
          }
          if (this.cells[this.y]?.[x - i] instanceof RowSpanCell) {
            leftChar = 'leftMid';
          }
        }
      }
    }
    return this.chars[leftChar];
  }

  /** The left border of a line of text or an empty line. */
  private leftBorderChar(spanningCell: number | undefined): string {
    if (this.x && spanningCell && this.cells) {
      // Drawn for a RowSpanCell: next to a cell that is not itself spanning rows, the line
      // also closes the border above that cell.
      let cellLeft = this.cells[this.y + spanningCell]?.[this.x - 1];
      while (cellLeft instanceof ColSpanCell) {
        cellLeft = this.cells[cellLeft.y]?.[cellLeft.x - 1];
      }
      if (!(cellLeft instanceof RowSpanCell)) {
        return this.chars.rightMid;
      }
    }
    return this.chars[this.x === 0 ? 'left' : 'middle'];
  }

  /**
   * Draws a line of text.
   * @param lineNum - the line of text (not necessarily the line of the cell: see vAlign).
   * @param forceTruncationSymbol - end the line with the truncation symbol even if it fits
   *   (the cell is cut off vertically).
   * @param spanningCell - when drawn for a RowSpanCell: how many rows below the cell's first row.
   */
  drawLine(lineNum: number, drawRight: boolean, forceTruncationSymbol: boolean, spanningCell?: number): string {
    const left = this.leftBorderChar(spanningCell);
    const right = drawRight ? this.chars.right : '';
    let line = this.lines[lineNum] ?? '';
    const len = this.width - (this.paddingLeft + this.paddingRight);
    if (forceTruncationSymbol) {
      line += this.truncate || '…';
    }
    const content = pad(truncate(line, len, this.truncate), len, ' ', this.hAlign);
    return this.stylizeLine(left, repeat(' ', this.paddingLeft) + content + repeat(' ', this.paddingRight), right);
  }

  private stylizeLine(left: string, content: string, right: string): string {
    const styledContent = this.y === 0 ? applyStyles(this.head, content) : content;
    return applyStyles(this.border, left) + styledContent + applyStyles(this.border, right);
  }

  /** Draws the bottom border of the cell (and its right corner if `drawRight`). */
  drawBottom(drawRight: boolean): string {
    const left = this.chars[this.x === 0 ? 'bottomLeft' : 'bottomMid'];
    const content = repeat(this.chars.bottom, this.width);
    const right = drawRight ? this.chars.bottomRight : '';
    return applyStyles(this.border, left + content + right);
  }

  /**
   * Draws an empty line (above or below the text).
   * @param spanningCell - when drawn for a RowSpanCell: how many rows below the cell's first row.
   */
  drawEmpty(drawRight: boolean, spanningCell?: number): string {
    const left = this.leftBorderChar(spanningCell);
    const right = drawRight ? this.chars.right : '';
    return this.stylizeLine(left, repeat(' ', this.width), right);
  }
}

/**
 * Reduces the padding (right side first) so that at least one column of `width` is left
 * for the content; otherwise the line would be wider than the cell.
 */
function fitPadding(width: number, left: number, right: number): { left: number; right: number } {
  const missing = Math.max(0, 1 - (width - left - right));
  const fromRight = Math.min(right, missing);
  const fromLeft = Math.min(left, missing - fromRight);
  return { left: left - fromLeft, right: right - fromRight };
}

/** Sum of sizes, including the borders between them. */
function sumPlusOne(total: number, size: number): number {
  return total + size + 1;
}
