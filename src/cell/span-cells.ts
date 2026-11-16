/**
 * Placeholders that fill the grid positions covered by a cell spanning several columns or rows.
 */
import { debug } from '../debug';
import type { Cell, LineNumber, SizedOptions } from './cell';

/** Covers a column of a cell spanning several columns: the spanning cell draws it. */
export class ColSpanCell {
  /** Set by the layout. */
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  draw(lineNum: LineNumber): string {
    if (typeof lineNum === 'number') {
      debug(`${this.y}-${this.x}: 1x1 ColSpanCell`);
    }
    return '';
  }

  init(): void {}

  mergeTableOptions(): void {}
}

/**
 * Covers a row of a cell spanning several rows: it draws its part of the original cell
 * (the lines below the original cell's first row).
 */
export class RowSpanCell {
  readonly originalCell: Cell;
  /** Set by the layout. */
  x: number;
  y: number;
  colSpan: number;
  /** Set by `init`: how many rows below the original cell, and how many lines. */
  declare cellOffset: number;
  declare offset: number;

  constructor(originalCell: Cell, x = 0, y = 0) {
    this.originalCell = originalCell;
    this.x = x;
    this.y = y;
    this.colSpan = originalCell.colSpan;
  }

  init(tableOptions: Pick<SizedOptions, 'rowHeights'>): void {
    const originalY = this.originalCell.y;
    this.cellOffset = this.y - originalY;
    this.offset = sumOfSizes(tableOptions.rowHeights, originalY, this.cellOffset);
  }

  draw(lineNum: LineNumber): string {
    if (lineNum === 'top') {
      return this.originalCell.draw(this.offset, this.cellOffset);
    }
    if (lineNum === 'bottom') {
      return this.originalCell.draw('bottom');
    }
    debug(`${this.y}-${this.x}: 1x${this.colSpan} RowSpanCell for ${this.originalCell.content}`);
    return this.originalCell.draw(this.offset + 1 + lineNum);
  }

  mergeTableOptions(): void {}
}

/** The total size of `count` consecutive rows from `start`, including the borders between them. */
function sumOfSizes(sizes: readonly number[], start: number, count: number): number {
  let total = Number(sizes[start]);
  for (let i = 1; i < count; i++) {
    total += 1 + Number(sizes[start + i]);
  }
  return total;
}
