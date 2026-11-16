import Table from 'cli-table3';

const noColors = () => ({ style: { head: [], border: [] } });

function render(rows: Table.TableRow[], options: Table.TableConstructorOptions = {}): Table.Table {
  const table = new Table({ ...noColors(), ...options });
  table.push(...rows);
  return table;
}

describe('rowSpan reaching past the last row', () => {
  it('is limited to the last row (single row)', () => {
    const table = render([[{ rowSpan: 2, content: 'a' }, 'b']]);

    expect(table.toString()).toEqual(['┌───┬───┐', '│ a │ b │', '└───┴───┘'].join('\n'));
  });

  it('is limited to the last row (cell in the last row)', () => {
    const overflowing = render([['a'], [{ rowSpan: 2, content: 'b' }]]);
    const exact = render([['a'], ['b']]);

    expect(overflowing.toString()).toEqual(exact.toString());
  });

  it('is limited to the remaining rows (span starting above the last row)', () => {
    const overflowing = render([[{ rowSpan: 5, content: 'a' }, 'b'], ['c'], ['d']]);
    const exact = render([[{ rowSpan: 3, content: 'a' }, 'b'], ['c'], ['d']]);

    expect(overflowing.toString()).toEqual(exact.toString());
  });

  it('is limited for cells spanning rows and columns', () => {
    const overflowing = render([
      ['a', 'b', 'c'],
      [{ rowSpan: 3, colSpan: 2, content: 'd' }, 'e'],
    ]);
    const exact = render([
      ['a', 'b', 'c'],
      [{ colSpan: 2, content: 'd' }, 'e'],
    ]);

    expect(overflowing.toString()).toEqual(exact.toString());
  });

  it('is limited when the span starts in the header row', () => {
    const overflowing = render([], { head: [{ rowSpan: 3, content: 'h' }, 'h2'] });
    const exact = render([], { head: ['h', 'h2'] });

    expect(overflowing.toString()).toEqual(exact.toString());
  });

  it('reports a warning in the debug messages', () => {
    const table = render([['a'], [{ rowSpan: 3, content: 'b' }]], { debug: true });
    table.toString();

    expect(table.messages).toEqual(['rowSpan of cell 1-0 (3) reaches past the last row; limited to 1.']);
  });

  it('does not modify the cell object passed by the caller', () => {
    const cell = { rowSpan: 2, content: 'b' };
    render([['a'], [cell]]).toString();

    expect(cell).toEqual({ rowSpan: 2, content: 'b' });
  });
});
