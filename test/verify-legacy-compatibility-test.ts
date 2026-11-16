import colors from 'ansis';
import Table from 'cli-table3';

/** The original cli-table (no types) and cli-table3: the same API for these tests. */
type TableConstructor = new (options?: Table.TableConstructorOptions) => Table.Table;

(() => {
  describe('verify original cli-table behavior', () => {
    commonTests(require('cli-table') as TableConstructor);
  });

  describe('@api cli-table2 matches verified behavior', () => {
    commonTests(Table);
  });

  function commonTests(Table: TableConstructor) {
    it('empty table has a width of 0', () => {
      const table = new Table();
      expect(table.width).toEqual(0);
      expect(table.toString()).toEqual('');
    });

    it('header text will be colored according to style', () => {
      const table = new Table({ head: ['hello', 'goodbye'], style: { border: [], head: ['red', 'bgWhite'] } });

      const expected = [
        '┌───────┬─────────┐',
        `│${colors.bgWhite.red(' hello ')}│${colors.bgWhite.red(' goodbye ')}│`,
        '└───────┴─────────┘',
      ];

      expect(table.toString()).toEqual(expected.join('\n'));
    });

    it('tables with one row of data will not be treated as headers', () => {
      const table = new Table({ style: { border: [], head: ['red'] } });

      table.push(['hello', 'goodbye']);

      const expected = ['┌───────┬─────────┐', '│ hello │ goodbye │', '└───────┴─────────┘'];

      expect(table.toString()).toEqual(expected.join('\n'));
    });

    it('table with headers and data headers', () => {
      const table = new Table({ head: ['hello', 'goodbye'], style: { border: [], head: ['red'] } });

      table.push(['hola', 'adios']);

      const expected = [
        '┌───────┬─────────┐',
        `│${colors.red(' hello ')}│${colors.red(' goodbye ')}│`,
        '├───────┼─────────┤',
        '│ hola  │ adios   │',
        '└───────┴─────────┘',
      ];

      expect(table.toString()).toEqual(expected.join('\n'));
    });

    it('compact shorthand', () => {
      const table = new Table({ style: { compact: true, border: [], head: ['red'] } });

      table.push(['hello', 'goodbye'], ['hola', 'adios']);

      const expected = ['┌───────┬─────────┐', '│ hello │ goodbye │', '│ hola  │ adios   │', '└───────┴─────────┘'];

      expect(table.toString()).toEqual(expected.join('\n'));
    });

    it('compact shorthand - headers are still rendered with separator', () => {
      const table = new Table({ head: ['hello', 'goodbye'], style: { compact: true, border: [], head: [] } });

      table.push(['hola', 'adios'], ['hi', 'bye']);

      const expected = [
        '┌───────┬─────────┐',
        '│ hello │ goodbye │',
        '├───────┼─────────┤',
        '│ hola  │ adios   │',
        '│ hi    │ bye     │',
        '└───────┴─────────┘',
      ];

      expect(table.toString()).toEqual(expected.join('\n'));
    });

    it('compact longhand - headers are not rendered with separator', () => {
      const table = new Table({
        chars: {
          mid: '',
          'left-mid': '',
          'mid-mid': '',
          'right-mid': '',
        },
        head: ['hello', 'goodbye'],
        style: { border: [], head: [] },
      });

      table.push(['hola', 'adios'], ['hi', 'bye']);

      const expected = [
        '┌───────┬─────────┐',
        '│ hello │ goodbye │',
        '│ hola  │ adios   │',
        '│ hi    │ bye     │',
        '└───────┴─────────┘',
      ];

      expect(table.toString()).toEqual(expected.join('\n'));
    });

    it('compact longhand', () => {
      const table = new Table({
        chars: {
          mid: '',
          'left-mid': '',
          'mid-mid': '',
          'right-mid': '',
        },
        style: { border: [], head: ['red'] },
      });

      table.push(['hello', 'goodbye'], ['hola', 'adios']);

      const expected = ['┌───────┬─────────┐', '│ hello │ goodbye │', '│ hola  │ adios   │', '└───────┴─────────┘'];

      expect(table.toString()).toEqual(expected.join('\n'));
    });

    it('objects with multiple properties in a cross-table', () => {
      const table = new Table({ style: { border: [], head: [] } });

      table.push(
        { a: ['b'], c: ['d'] } // value of property 'c' will be discarded
      );

      const expected = ['┌───┬───┐', '│ a │ b │', '└───┴───┘'];
      expect(table.toString()).toEqual(expected.join('\n'));
    });
  }
})();
