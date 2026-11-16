import { Cell, type LayoutCell, RowSpanCell } from '../dist/cell';
import * as layoutManager from '../dist/layout-manager';
import type { CellInput } from '../dist/options';
import { computeHeights, computeWidths, type SizedCell } from '../dist/sizes';

describe('tableLayout', () => {
  const { makeTableLayout, addRowSpanCells, fillInTable } = layoutManager;

  it('simple 2x2 layout', () => {
    const actual = makeTableLayout([
      ['hello', 'goodbye'],
      ['hola', 'adios'],
    ]);

    const expected: ExpectedCell[][] = [
      ['hello', 'goodbye'],
      ['hola', 'adios'],
    ];

    checkLayout(actual, expected);
  });

  it('cross table', () => {
    const actual = makeTableLayout([{ '1.0': ['yes', 'no'] }, { '2.0': ['hello', 'goodbye'] }]);

    const expected: ExpectedCell[][] = [
      ['1.0', 'yes', 'no'],
      ['2.0', 'hello', 'goodbye'],
    ];

    checkLayout(actual, expected);
  });

  it('vertical table', () => {
    const actual = makeTableLayout([{ '1.0': 'yes' }, { '2.0': 'hello' }]);

    const expected: ExpectedCell[][] = [
      ['1.0', 'yes'],
      ['2.0', 'hello'],
    ];

    checkLayout(actual, expected);
  });

  it('colSpan adds RowSpanCells to the right', () => {
    const actual = makeTableLayout([[{ content: 'hello', colSpan: 2 }], ['hola', 'adios']]);

    const expected: ExpectedCell[][] = [
      [{ content: 'hello', colSpan: 2 }, null],
      ['hola', 'adios'],
    ];

    checkLayout(actual, expected);
  });

  it('rowSpan adds RowSpanCell below', () => {
    const actual = makeTableLayout([[{ content: 'hello', rowSpan: 2 }, 'goodbye'], ['adios']]);

    const expected: ExpectedCell[][] = [
      ['hello', 'goodbye'],
      [{ spannerFor: [0, 0] }, 'adios'],
    ];

    checkLayout(actual, expected);
  });

  it('rowSpan and cellSpan together', () => {
    const actual = makeTableLayout([[{ content: 'hello', rowSpan: 2, colSpan: 2 }, 'goodbye'], ['adios']]);

    const expected: ExpectedCell[][] = [
      ['hello', null, 'goodbye'],
      [{ spannerFor: [0, 0] }, null, 'adios'],
    ];

    checkLayout(actual, expected);
  });

  it('complex layout', () => {
    const actual = makeTableLayout([
      [{ content: 'hello', rowSpan: 2, colSpan: 2 }, { content: 'yo', rowSpan: 2, colSpan: 2 }, 'goodbye'],
      ['adios'],
    ]);

    const expected: ExpectedCell[][] = [
      ['hello', null, 'yo', null, 'goodbye'],
      [{ spannerFor: [0, 0] }, null, { spannerFor: [0, 2] }, null, 'adios'],
    ];

    checkLayout(actual, expected);
  });

  it('complex layout2', () => {
    const actual = makeTableLayout([
      ['a', 'b', { content: 'c', rowSpan: 3, colSpan: 2 }, 'd'],
      [{ content: 'e', rowSpan: 2, colSpan: 2 }, 'f'],
      ['g'],
    ]);

    const expected: ExpectedCell[][] = [
      ['a', 'b', 'c', null, 'd'],
      ['e', null, { spannerFor: [0, 2] }, null, 'f'],
      [{ spannerFor: [1, 0] }, null, { spannerFor: [0, 2] }, null, 'g'],
    ];

    checkLayout(actual, expected);
  });

  it('stairstep spans', () => {
    const actual = makeTableLayout([[{ content: '', rowSpan: 2 }, ''], [{ content: '', rowSpan: 2 }], ['']]);

    const expected: ExpectedCell[][] = [
      [{ content: '', rowSpan: 2 }, ''],
      [{ spannerFor: [0, 0] }, { content: '', rowSpan: 2 }],
      ['', { spannerFor: [1, 1] }],
    ];

    checkLayout(actual, expected);
  });

  describe('fillInTable', () => {
    function mc(opts: CellInput, y: number, x: number): Cell {
      const cell = new Cell(opts);
      cell.x = x;
      cell.y = y;
      return cell;
    }

    it('will blank out individual cells', () => {
      const cells = [[mc('a', 0, 1)], [mc('b', 1, 0)]];
      fillInTable(cells);

      checkLayout(cells, [
        ['', 'a'],
        ['b', ''],
      ]);
    });

    it('will autospan to the right', () => {
      const cells = [[], [mc('a', 1, 1)]];
      fillInTable(cells);

      checkLayout(cells, [
        [{ content: '', colSpan: 2 }, null],
        ['', 'a'],
      ]);
    });

    it('will autospan down', () => {
      const cells = [[mc('a', 0, 1)], []];
      fillInTable(cells);
      addRowSpanCells(cells);

      checkLayout(cells, [
        [{ content: '', rowSpan: 2 }, 'a'],
        [{ spannerFor: [0, 0] }, ''],
      ]);
    });

    it('will autospan right and down', () => {
      const cells = [[mc('a', 0, 2)], [], [mc('b', 2, 1)]];
      fillInTable(cells);
      addRowSpanCells(cells);

      checkLayout(cells, [
        [{ content: '', colSpan: 2, rowSpan: 2 }, null, 'a'],
        [{ spannerFor: [0, 0] }, null, { content: '', colSpan: 1, rowSpan: 2 }],
        ['', 'b', { spannerFor: [1, 2] }],
      ]);
    });
  });

  describe('spanning cells that start where no other cell gives a size', () => {
    // Values as computed by the JavaScript implementation (pinned by the TypeScript port).
    it('computeHeights: a cell spanning rows alone in its first row', () => {
      const heights: Array<number | null> = [];
      computeHeights(heights, [[{ x: 0, y: 0, rowSpan: 2, desiredHeight: 3 }], [{ x: 1, y: 1, desiredHeight: 1 }]]);
      expect(heights).toEqual([1, 1]);
    });

    it('computeHeights: two cells spanning rows from the same row', () => {
      const heights: Array<number | null> = [];
      const cells = [
        [
          { x: 0, y: 0, rowSpan: 2, desiredHeight: 3 },
          { x: 1, y: 0, rowSpan: 2, desiredHeight: 1 },
        ],
        [{ x: 2, y: 1, desiredHeight: 1 }],
      ];
      computeHeights(heights, cells);
      expect(heights).toEqual([1, 1]);
    });

    it('computeWidths: the size of the last cell processed wins unless smaller', () => {
      const largerFirst: Array<number | null> = [];
      computeWidths(largerFirst, [
        [{ x: 0, y: 0, colSpan: 2, desiredWidth: 10 }],
        [{ x: 0, y: 1, colSpan: 2, desiredWidth: 4 }],
      ]);
      expect(largerFirst).toEqual([3]);

      const largerLast: Array<number | null> = [];
      computeWidths(largerLast, [
        [{ x: 0, y: 0, colSpan: 2, desiredWidth: 4 }],
        [{ x: 0, y: 1, colSpan: 2, desiredWidth: 10 }],
      ]);
      expect(largerLast).toEqual([9]);
    });
  });

  describe('computeWidths', () => {
    function mc(y: number, x: number, desiredWidth: number, colSpan?: number): SizedCell {
      return { x: x, y: y, desiredWidth: desiredWidth, colSpan: colSpan };
    }

    it('finds the maximum desired width of each column', () => {
      const widths: Array<number | null> = [];
      const cells = [
        [mc(0, 0, 7), mc(0, 1, 3), mc(0, 2, 5)],
        [mc(1, 0, 8), mc(1, 1, 5), mc(1, 2, 2)],
        [mc(2, 0, 6), mc(2, 1, 9), mc(2, 2, 1)],
      ];

      computeWidths(widths, cells);

      expect(widths).toEqual([8, 9, 5]);
    });

    it("won't touch hard coded values", () => {
      const widths = [null, 3];
      const cells = [
        [mc(0, 0, 7), mc(0, 1, 3), mc(0, 2, 5)],
        [mc(1, 0, 8), mc(1, 1, 5), mc(1, 2, 2)],
        [mc(2, 0, 6), mc(2, 1, 9), mc(2, 2, 1)],
      ];

      computeWidths(widths, cells);

      expect(widths).toEqual([8, 3, 5]);
    });

    it('assumes undefined desiredWidth is 1', () => {
      const widths: Array<number | null> = [];
      const cells = [[{ x: 0, y: 0 }], [{ x: 0, y: 1 }], [{ x: 0, y: 2 }]];
      computeWidths(widths, cells);
      expect(widths).toEqual([1]);
    });

    it('takes into account colSpan and wont over expand', () => {
      const widths: Array<number | null> = [];
      const cells = [
        [mc(0, 0, 10, 2), mc(0, 2, 5)],
        [mc(1, 0, 5), mc(1, 1, 5), mc(1, 2, 2)],
        [mc(2, 0, 4), mc(2, 1, 2), mc(2, 2, 1)],
      ];
      computeWidths(widths, cells);
      expect(widths).toEqual([5, 5, 5]);
    });

    it('will expand rows involved in colSpan in a balanced way', () => {
      const widths: Array<number | null> = [];
      const cells = [
        [mc(0, 0, 13, 2), mc(0, 2, 5)],
        [mc(1, 0, 5), mc(1, 1, 5), mc(1, 2, 2)],
        [mc(2, 0, 4), mc(2, 1, 2), mc(2, 2, 1)],
      ];
      computeWidths(widths, cells);
      expect(widths).toEqual([6, 6, 5]);
    });

    it('expands across 3 cols', () => {
      const widths: Array<number | null> = [];
      const cells = [
        [mc(0, 0, 25, 3)],
        [mc(1, 0, 5), mc(1, 1, 5), mc(1, 2, 2)],
        [mc(2, 0, 4), mc(2, 1, 2), mc(2, 2, 1)],
      ];
      computeWidths(widths, cells);
      expect(widths).toEqual([9, 9, 5]);
    });

    it('multiple spans in same table', () => {
      const widths: Array<number | null> = [];
      const cells = [[mc(0, 0, 25, 3)], [mc(1, 0, 30, 3)], [mc(2, 0, 4), mc(2, 1, 2), mc(2, 2, 1)]];
      computeWidths(widths, cells);
      expect(widths).toEqual([11, 9, 8]);
    });

    it('spans will only edit uneditable tables', () => {
      const widths = [null, 3];
      const cells = [[mc(0, 0, 20, 3)], [mc(1, 0, 4), mc(1, 1, 20), mc(1, 2, 5)]];
      computeWidths(widths, cells);
      expect(widths).toEqual([7, 3, 8]);
    });

    it('spans will only edit uneditable tables - first column uneditable', () => {
      const widths = [3];
      const cells = [[mc(0, 0, 20, 3)], [mc(1, 0, 4), mc(1, 1, 3), mc(1, 2, 5)]];
      computeWidths(widths, cells);
      expect(widths).toEqual([3, 7, 8]);
    });
    describe('with maximum widths', () => {
      it('limits columns that are wider than their maximum', () => {
        const widths: Array<number | null> = [];
        const cells = [
          [mc(0, 0, 7), mc(0, 1, 3), mc(0, 2, 5)],
          [mc(1, 0, 8), mc(1, 1, 5), mc(1, 2, 2)],
        ];
        computeWidths(widths, cells, [6, 6]);
        expect(widths).toEqual([6, 5, 5]);
      });

      it('does not limit fixed widths', () => {
        const widths = [10];
        const cells = [[mc(0, 0, 20), mc(0, 1, 20)]];
        computeWidths(widths, cells, [5, 5]);
        expect(widths).toEqual([10, 5]);
      });

      it('lets a spanning cell covering a limited column grow only the limited columns, up to their maximum', () => {
        const widths: Array<number | null> = [];
        const cells = [[mc(0, 0, 25, 3)], [mc(1, 0, 5), mc(1, 1, 5), mc(1, 2, 2)]];
        computeWidths(widths, cells, [6]);
        expect(widths).toEqual([6, 5, 2]); // the spanning cell wraps, the unlimited columns keep their width
      });

      it('grows unlimited columns as before for a spanning cell that covers no limited column', () => {
        const cells = [[mc(0, 1, 25, 2)], [mc(1, 0, 5), mc(1, 1, 5), mc(1, 2, 2)]];
        const withLimit: Array<number | null> = [];
        const withoutLimits: Array<number | null> = [];
        computeWidths(withLimit, cells, [6]);
        computeWidths(withoutLimits, cells);
        expect(withLimit).toEqual(withoutLimits);
        expect(Number(withLimit[1]) + 1 + Number(withLimit[2])).toEqual(25);
      });

      it('grows spanned columns that have no content of their own', () => {
        const widths: Array<number | null> = [];
        const cells = [[mc(0, 0, 20, 2), mc(0, 2, 3)], [{ x: 1, y: 0 }]];
        computeWidths(widths, cells, [3]);
        expect(widths).toEqual([3, 16, 3]);
      });

      it('does not count on the width above a maximum for a spanning cell', () => {
        const widths: Array<number | null> = [];
        // column 0: a cell wanting 10 (limited to 5); a cell wanting 20 spanning columns 0 and 1
        const cells = [[mc(0, 0, 20, 2)], [mc(1, 0, 10), mc(1, 1, 3)]];
        computeWidths(widths, cells, [5]);
        expect(widths).toEqual([5, 3]);
      });

      it('gives a spanning cell less than it wants if all columns are at their maximum', () => {
        const widths: Array<number | null> = [];
        const cells = [[mc(0, 0, 30, 2)], [mc(1, 0, 2), mc(1, 1, 2)]];
        computeWidths(widths, cells, [5, 5]);
        expect(widths).toEqual([5, 5]);
      });

      it('gives the same result as before without maximum widths', () => {
        const cells = [[mc(0, 0, 25, 3)], [mc(1, 0, 30, 3)], [mc(2, 0, 4), mc(2, 1, 2), mc(2, 2, 1)]];
        const a: Array<number | null> = [];
        const b: Array<number | null> = [];
        computeWidths(a, cells);
        computeWidths(b, cells, []);
        expect(b).toEqual(a);
      });
    });
  });

  describe('computeHeights', () => {
    function mc(y: number, x: number, desiredHeight: number, colSpan?: number): SizedCell {
      return { x: x, y: y, desiredHeight: desiredHeight, rowSpan: colSpan };
    }

    it('finds the maximum desired height of each row', () => {
      const heights: Array<number | null> = [];
      const cells = [
        [mc(0, 0, 7), mc(0, 1, 3), mc(0, 2, 5)],
        [mc(1, 0, 8), mc(1, 1, 5), mc(1, 2, 2)],
        [mc(2, 0, 6), mc(2, 1, 9), mc(2, 2, 1)],
      ];

      computeHeights(heights, cells);

      expect(heights).toEqual([7, 8, 9]);
    });

    it("won't touch hard coded values", () => {
      const heights = [null, 3];
      const cells = [
        [mc(0, 0, 7), mc(0, 1, 3), mc(0, 2, 5)],
        [mc(1, 0, 8), mc(1, 1, 5), mc(1, 2, 2)],
        [mc(2, 0, 6), mc(2, 1, 9), mc(2, 2, 1)],
      ];

      computeHeights(heights, cells);

      expect(heights).toEqual([7, 3, 9]);
    });

    it('assumes undefined desiredHeight is 1', () => {
      const heights: Array<number | null> = [];
      const cells = [
        [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: 0 },
        ],
      ];
      computeHeights(heights, cells);
      expect(heights).toEqual([1]);
    });

    it('takes into account rowSpan and wont over expand', () => {
      const heights: Array<number | null> = [];
      const cells = [
        [mc(0, 0, 10, 2), mc(0, 1, 5), mc(0, 2, 2)],
        [mc(1, 1, 5), mc(1, 2, 2)],
        [mc(2, 0, 4), mc(2, 1, 2), mc(2, 2, 1)],
      ];
      computeHeights(heights, cells);
      expect(heights).toEqual([5, 5, 4]);
    });

    it('will expand rows involved in rowSpan in a balanced way', () => {
      const heights: Array<number | null> = [];
      const cells = [
        [mc(0, 0, 13, 2), mc(0, 1, 5), mc(0, 2, 5)],
        [mc(1, 1, 5), mc(1, 2, 2)],
        [mc(2, 0, 4), mc(2, 1, 2), mc(2, 2, 1)],
      ];
      computeHeights(heights, cells);
      expect(heights).toEqual([6, 6, 4]);
    });

    it('expands across 3 rows', () => {
      const heights: Array<number | null> = [];
      const cells = [
        [mc(0, 0, 25, 3), mc(0, 1, 5), mc(0, 2, 4)],
        [mc(1, 1, 5), mc(1, 2, 2)],
        [mc(2, 1, 2), mc(2, 2, 1)],
      ];
      computeHeights(heights, cells);
      expect(heights).toEqual([9, 9, 5]);
    });

    it('multiple spans in same table', () => {
      const heights: Array<number | null> = [];
      const cells = [[mc(0, 0, 25, 3), mc(0, 1, 30, 3), mc(0, 2, 4)], [mc(1, 2, 2)], [mc(2, 2, 1)]];
      computeHeights(heights, cells);
      expect(heights).toEqual([11, 9, 8]);
    });
  });

  /**
   * Provides a shorthand for validating a table of cells.
   * To pass, both arrays must have the same dimensions, and each cell in `actualRows` must
   * satisfy the shorthand assertion of the corresponding location in `expectedRows`.
   *
   * Available Expectations Can Be:
   *
   *    * A `String` -  Must be a normal cell with contents equal to the String value.
   *    * `null` -  Must be a RowSpanCell
   *
   * Or an `Object` with any of the following properties (multiple properties allowed):
   *    * rowSpan:Number - Must be a normal cell with the given rowSpan.
   *    * colSpan:Number - Must be a normal cell with the given colSpan.
   *    * content:String - Must be a normal cell with the given content.
   *    * spannerFor:[row,col] - Must be a RowSpanCell delegating to the cell at the given coordinates.
   *
   * @param actualRows - the table of cells under test.
   * @param expectedRows - a table of shorthand assertions.
   */

  /** The expected cell at a position: its content, or some of its properties. */
  type ExpectedCell =
    | string
    | null
    | { content?: string; rowSpan?: number; colSpan?: number; spannerFor?: [number, number] };

  function checkLayout(actualTable: LayoutCell[][], expectedTable: ExpectedCell[][]): void {
    expectedTable.forEach((expectedRow, y) => {
      expectedRow.forEach((expectedCell, x) => {
        if (expectedCell !== null) {
          const actualCell = findCell(actualTable, x, y);
          checkExpectation(actualCell, expectedCell, actualTable);
        }
      });
    });
  }

  function findCell(table: LayoutCell[][], x: number, y: number): LayoutCell | undefined {
    return table.flat().find((cell) => cell.x === x && cell.y === y);
  }

  function checkExpectation(
    actualCell: LayoutCell | undefined,
    expected: ExpectedCell,
    actualTable: LayoutCell[][]
  ): void {
    const expectedCell = typeof expected === 'string' ? { content: expected } : (expected ?? {});
    if (Object.hasOwn(expectedCell, 'content')) {
      expect(actualCell).toBeInstanceOf(Cell);
      expect((actualCell as Cell).content).toEqual(expectedCell.content);
    }
    if (Object.hasOwn(expectedCell, 'rowSpan')) {
      expect(actualCell).toBeInstanceOf(Cell);
      expect((actualCell as Cell).rowSpan).toEqual(expectedCell.rowSpan);
    }
    if (Object.hasOwn(expectedCell, 'colSpan')) {
      expect(actualCell).toBeInstanceOf(Cell);
      expect((actualCell as Cell).colSpan).toEqual(expectedCell.colSpan);
    }
    if (expectedCell.spannerFor) {
      const [y, x] = expectedCell.spannerFor;
      expect(actualCell).toBeInstanceOf(RowSpanCell);
      const { originalCell } = actualCell as RowSpanCell;
      expect(originalCell).toBeInstanceOf(Cell);
      expect(originalCell).toEqual(findCell(actualTable, x, y));
      //TODO: retest here x,y coords
    }
  }
});
