import { Cell, type LayoutCell } from './cell';
import type { TableInstanceOptions } from './options';
import { strlen, widestCharWidth } from './utils';

export function resolveMaxColWidths(
  option: TableInstanceOptions['maxColWidths'],
  cells: readonly LayoutCell[][]
): (number | undefined)[] {
  if (option === undefined) return [];

  const isLimit = (value: unknown): value is number => typeof value === 'number' && value > 0 && Number.isFinite(value);
  let columnCount = 0;
  for (const row of cells) {
    for (const cell of row) {
      columnCount = Math.max(columnCount, cell.x + ('colSpan' in cell ? cell.colSpan : 1));
    }
  }

  // a dense array (no holes), so that array methods also see the unlimited (undefined) columns
  const limits = Array.from({ length: columnCount }, (_, x) => {
    const limit = Array.isArray(option) ? option[x] : option;
    return isLimit(limit) ? Math.floor(limit) : undefined;
  });
  if (limits.every((limit) => limit === undefined)) {
    return [];
  }

  for (const row of cells) {
    row.forEach((cell) => {
      if (!(cell instanceof Cell)) {
        return; // placeholder cells of row or column spans
      }
      const span = cell.colSpan || 1;
      const spanned = limits.slice(cell.x, cell.x + span);
      if (spanned.every((limit) => limit === undefined)) {
        return;
      }
      // The width the cell is sure to get: limited columns can grow up to their limit, but unlimited ones
      // may stay at 1 (a cell covering a limited column doesn't widen them, it wraps).
      const available = spanned.reduce<number>((sum, limit) => sum + (limit === undefined ? 1 : limit), span - 1);
      const padding = cell.paddingLeft + cell.paddingRight;
      if (available >= padding + strlen(cell.content)) {
        return; // everything fits without wrapping
      }
      const minimum = padding + Math.max(1, widestCharWidth(cell.content));
      if (available < minimum) {
        let lastLimited = cell.x + span - 1;
        while (limits[lastLimited] === undefined) {
          lastLimited--;
        }
        limits[lastLimited] = Number(limits[lastLimited]) + minimum - available;
      }
    });
  }
  return limits;
}
