import colors from 'ansis';
import Table from 'cli-table3';

const noColors = () => ({ style: { head: [], border: [] } });

describe('rendering has no side effects', () => {
  describe('column widths and row heights', () => {
    it('rendering twice gives the same output', () => {
      const table = new Table(noColors());
      table.push(['a', { content: 'b\nc', rowSpan: 2 }], ['longer cell']);

      const first = table.toString();
      expect(table.toString()).toEqual(first);
    });

    it('rows pushed after a render get their own column widths (not the widths of the first render)', () => {
      const table = new Table(noColors());
      table.push(['a', 'b']);
      table.toString();

      table.push(['a much longer cell', 'b']);

      const fresh = new Table(noColors());
      fresh.push(['a', 'b'], ['a much longer cell', 'b']);
      expect(table.toString()).toEqual(fresh.toString());
      expect(table.toString()).toContain('a much longer cell');
    });

    it('rows pushed after a render get their own row heights', () => {
      const table = new Table(noColors());
      table.push(['one line']);
      table.toString();

      table[0] = ['two\nlines'];

      const fresh = new Table(noColors());
      fresh.push(['two\nlines']);
      expect(table.toString()).toEqual(fresh.toString());
    });

    it('does not modify table.options.colWidths / rowHeights', () => {
      const table = new Table({ ...noColors(), colWidths: [null, 8] });
      table.push(['a', 'b'], ['c', 'd']);
      table.toString();

      expect(table.options.colWidths).toEqual([null, 8]);
      expect(table.options.rowHeights).toEqual([]);
    });

    it('does not modify the colWidths / rowHeights arrays passed by the caller', () => {
      const colWidths = [null, 8];
      const rowHeights: Array<number | null> = [];
      const table = new Table({ ...noColors(), colWidths, rowHeights });
      table.push(['a', 'b'], ['c', 'd']);
      table.toString();

      expect(colWidths).toEqual([null, 8]);
      expect(rowHeights).toEqual([]);
    });

    it('fixed column widths are still applied on every render', () => {
      const table = new Table({ ...noColors(), colWidths: [5] });
      table.push(['abcdefgh']);
      const first = table.toString();

      expect(first).toEqual(['┌─────┐', '│ ab… │', '└─────┘'].join('\n'));
      expect(table.toString()).toEqual(first);
    });
  });

  describe('cell objects', () => {
    it('does not modify cell objects passed by the caller', () => {
      const plain = { content: 'a' };
      const styled = { content: 'b', style: { 'padding-left': 0 } };
      const spanning = { content: 'c', colSpan: 2 };
      const header: Table.CellOptions = { content: 'h', hAlign: 'center' };
      const snapshot = structuredClone([plain, styled, spanning, header]);

      const table = new Table({ head: [header, 'h2'], style: { head: [], border: [] } });
      table.push([plain, styled], [spanning]);
      table.toString();

      expect([plain, styled, spanning, header]).toEqual(snapshot);
    });

    it('the same cell object can be used in several tables', () => {
      const cell = { content: 'x', style: { 'padding-left': 3 } };
      const wide = new Table({ style: { 'padding-right': 4, head: [], border: [] } });
      const narrow = new Table({ style: { 'padding-right': 0, head: [], border: [] } });
      wide.push([cell]);
      narrow.push([cell]);

      expect(wide.toString()).toEqual(['┌────────┐', '│   x    │', '└────────┘'].join('\n'));
      expect(narrow.toString()).toEqual(['┌────┐', '│   x│', '└────┘'].join('\n'));
    });
  });

  describe('head style', () => {
    it('rendering a table without a header row does not clear table.options.style.head', () => {
      const table = new Table({ style: { head: ['red'], border: [] } });
      table.push(['a']);
      table.toString();

      expect(table.options.style.head).toEqual(['red']);
    });

    it('a header row added after a render still uses the head style', () => {
      const table = new Table({ style: { head: ['red'], border: [] } });
      table.push(['a']);
      table.toString();

      table.options.head = ['h'];

      const fresh = new Table({ head: ['h'], style: { head: ['red'], border: [] } });
      fresh.push(['a']);
      expect(table.toString()).toEqual(fresh.toString());
      expect(table.toString()).toContain(colors.red(' h '));
    });

    it('data rows are never styled with the head style when there is no header row', () => {
      const table = new Table({ style: { head: ['red'], border: [] } });
      table.push(['a'], ['b']);

      expect(table.toString()).toEqual(['┌───┐', '│ a │', '├───┤', '│ b │', '└───┘'].join('\n'));
    });
  });

  it('options set to undefined render like options that are not set', () => {
    const plain = new Table({ style: { head: [], border: [] } });
    const withUndefined = new Table({
      colWidths: undefined,
      rowHeights: undefined,
      chars: { top: undefined },
      style: { head: [], border: [], 'padding-left': undefined, 'padding-right': undefined },
    });
    plain.push(['a', 'b']);
    withUndefined.push(['a', 'b']);

    expect(withUndefined.toString()).toEqual(plain.toString());
  });
});
