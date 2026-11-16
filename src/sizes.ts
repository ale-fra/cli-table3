/**
 * Column widths and row heights: as large as the largest cell needs, unless fixed by the
 * options. Cells spanning several columns (rows) share the extra size they need between them.
 */

import type { GridCell } from './layout-manager';

/** What computing the sizes needs to know about a cell of the grid. */
export interface SizedCell extends GridCell {
  desiredWidth?: number;
  desiredHeight?: number;
}

/** A direction of the grid: the columns (widths) or the rows (heights). */
interface Axis {
  position: 'x' | 'y';
  span: 'colSpan' | 'rowSpan';
  desired: 'desiredWidth' | 'desiredHeight';
  /** The size assumed for a spanning cell that starts where no other cell gives a size. */
  spannerSize(cell: SizedCell): number;
}

const COLUMNS: Axis = {
  position: 'x',
  span: 'colSpan',
  desired: 'desiredWidth',
  spannerSize: (cell) => Number(cell.desiredWidth) - 1,
};

const ROWS: Axis = {
  position: 'y',
  span: 'rowSpan',
  desired: 'desiredHeight',
  spannerSize: () => 1,
};

const MIN_SIZE = 1;

/**
 * Fills `sizes` (fixed sizes: numbers; others: anything else) with the size of every column
 * (row) of `table`, in place. Returns `sizes`.
 */
function computeSizes(axis: Axis, sizes: Array<number | null | undefined>, table: readonly SizedCell[][]): number[] {
  const isFixed = (index: number): boolean => typeof sizes[index] === 'number';
  // sparse: indexes without a non-spanning cell have no entry
  const result: number[] = [];
  const spanners: SizedCell[] = [];
  const auto: Record<number, number> = {};

  for (const row of table) {
    for (const cell of row) {
      if ((cell[axis.span] || 1) > 1) {
        spanners.push(cell);
      } else {
        const index = cell[axis.position];
        result[index] = Math.max(result[index] || 0, cell[axis.desired] || 0, MIN_SIZE);
      }
    }
  }

  sizes.forEach((size, index) => {
    if (typeof size === 'number') {
      result[index] = size;
    }
  });

  for (const cell of spanners.toReversed()) {
    const span = cell[axis.span] ?? 1;
    const start = cell[axis.position];
    let existingSize = result[start];
    let editable = isFixed(start) ? 0 : 1;
    if (existingSize !== undefined) {
      for (let i = 1; i < span; i++) {
        existingSize += 1 + Number(result[start + i]);
        if (!isFixed(start + i)) {
          editable++;
        }
      }
    } else {
      existingSize = axis.spannerSize(cell);
      if (!auto[start] || auto[start] < existingSize) {
        auto[start] = existingSize;
      }
    }

    // Share the missing size between the sizes that are not fixed.
    const desired = cell[axis.desired];
    if (desired !== undefined && desired > existingSize) {
      let i = 0;
      while (editable > 0 && desired > existingSize) {
        if (!isFixed(start + i)) {
          const extra = Math.round((desired - existingSize) / editable);
          existingSize += extra;
          result[start + i] = Number(result[start + i]) + extra;
          editable--;
        }
        i++;
      }
    }
  }

  Object.assign(sizes, result, auto);
  for (let j = 0; j < sizes.length; j++) {
    sizes[j] = Math.max(MIN_SIZE, sizes[j] || 0);
  }
  return sizes as number[];
}

/** Fills `widths` with the width of every column; see `computeSizes`. */
export function computeWidths(widths: Array<number | null | undefined>, table: readonly SizedCell[][]): number[] {
  return computeSizes(COLUMNS, widths, table);
}

/** Fills `heights` with the height of every row; see `computeSizes`. */
export function computeHeights(heights: Array<number | null | undefined>, table: readonly SizedCell[][]): number[] {
  return computeSizes(ROWS, heights, table);
}
