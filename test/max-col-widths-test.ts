import colors from 'ansis';
import Table from 'cli-table3';
import { hyperlink } from '../dist/utils';

// Tables without colors (they are tested separately below), so the expected output is easy to read.
function render(options: Table.TableConstructorOptions, rows: Table.TableRow[]) {
  const table = new Table(Object.assign({ style: { head: [], border: [] } }, options));
  table.push(...rows);
  return table.toString();
}

describe('@api maxColWidths', () => {
  it('keeps the natural width of columns whose content fits', () => {
    const expected = ['┌────┬───────┐', '│ id │ name  │', '├────┼───────┤', '│ 1  │ alice │', '└────┴───────┘'];
    expect(render({ head: ['id', 'name'], maxColWidths: [10, 10] }, [['1', 'alice']])).toEqual(expected.join('\n'));
  });

  it('wraps content wider than the limit on word boundaries, instead of truncating it', () => {
    const expected = [
      '┌───┬────────────┐',
      '│ 1 │ This text  │',
      '│   │ is longer  │',
      '│   │ than the   │',
      '│   │ limit      │',
      '└───┴────────────┘',
    ];
    expect(render({ maxColWidths: [null, 12] }, [['1', 'This text is longer than the limit']])).toEqual(
      expected.join('\n')
    );
  });

  it('accepts a single number as the limit for all columns', () => {
    const expected = [
      '┌────────┬────────┐',
      '│ aaa    │ ccc    │',
      '│ bbb    │ ddd    │',
      '├────────┼────────┤',
      '│ short  │ ok     │',
      '└────────┴────────┘',
    ];
    expect(
      render({ maxColWidths: 8 }, [
        ['aaa bbb', 'ccc ddd'],
        ['short', 'ok'],
      ])
    ).toEqual(expected.join('\n'));
  });

  it('only limits the columns that have a limit', () => {
    const long = 'no limit on this column';
    const expected = ['┌─────┬─────────────────────────┐', `│ one │ ${long} │`, '│ two │                         │'];
    expect(
      render({ maxColWidths: [5] }, [['one two', long]])
        .split('\n')
        .slice(0, 3)
    ).toEqual(expected);
  });

  it('ignores invalid limits', () => {
    const rows = [['aaaaaaaa', 'bbbbbbbb', 'cccccccc', 'dddddddd']];
    const withoutLimits = render({}, rows);
    expect(render({ maxColWidths: [0, -1, NaN, '5' as unknown as number] }, rows)).toEqual(withoutLimits);
    expect(render({ maxColWidths: Infinity }, rows)).toEqual(withoutLimits);
  });

  it('breaks words that are longer than the limit', () => {
    const expected = ['┌────────┐', '│ Supe   │', '│ rcalif │', '│ ragili │', '│ stic   │', '└────────┘'];
    expect(render({ maxColWidths: 8 }, [['Supe rcalifragilistic']])).toEqual(expected.join('\n'));
  });

  it('can break anywhere with wrapOnWordBoundary: false', () => {
    const expected = ['┌────────┐', '│ Supe r │', '│ califr │', '│ agilis │', '│ tic    │', '└────────┘'];
    expect(render({ maxColWidths: 8, wrapOnWordBoundary: false }, [['Supe rcalifragilistic']])).toEqual(
      expected.join('\n')
    );
  });

  it('measures wide characters and emoji by their width on screen', () => {
    const expected = ['┌────────┐', '│ 漢字漢 │', '│ 字漢   │', '│ 👍👍👍 │', '│ 👍     │', '└────────┘'];
    expect(render({ maxColWidths: 8 }, [['漢字漢字漢\n👍👍👍👍']])).toEqual(expected.join('\n'));
  });

  it('keeps explicit line breaks and empty lines', () => {
    const expected = ['┌────────┐', '│ first  │', '│        │', '│ second │', '│ line   │', '└────────┘'];
    expect(render({ maxColWidths: 8 }, [['first\n\nsecond line']])).toEqual(expected.join('\n'));
  });

  it('keeps colors on every wrapped line', () => {
    const table = new Table({ maxColWidths: 9, style: { head: [], border: [] } });
    table.push([colors.red('red text here')]);
    const expected = [
      '┌─────────┐',
      `│ ${colors.red('red')}     │`,
      `│ ${colors.red('text')}    │`,
      `│ ${colors.red('here')}    │`,
      '└─────────┘',
    ];
    expect(table.toString()).toEqual(expected.join('\n'));
  });

  it('wraps the header and keeps its style', () => {
    const table = new Table({ head: ['Long header'], maxColWidths: 8, style: { head: ['cyan'], border: [] } });
    const expected = ['┌────────┐', `│${colors.cyan(' Long   ')}│`, `│${colors.cyan(' header ')}│`, '└────────┘'];
    expect(table.toString()).toEqual(expected.join('\n'));
  });

  it('makes each wrapped line of a hyperlink cell a link', () => {
    const href = 'http://example.com';
    const expected = [
      '┌────────┐',
      `│ ${hyperlink(href, 'click')}  │`,
      `│ ${hyperlink(href, 'here')}   │`,
      '└────────┘',
    ];
    expect(render({ maxColWidths: 8 }, [[{ content: 'click here', href }]])).toEqual(expected.join('\n'));
  });

  it('respects the cell padding', () => {
    const style = { head: [], border: [], 'padding-left': 3, 'padding-right': 0 };
    const expected = ['┌────────┐', '│   some │', '│   text │', '└────────┘'];
    expect(render({ maxColWidths: 8, style }, [['some text']])).toEqual(expected.join('\n'));
  });

  describe('spanning cells', () => {
    it('wraps a cell spanning limited columns to their combined width', () => {
      const expected = [
        '┌─────────────────┐',
        '│ this spanning   │',
        '│ cell has quite  │',
        '│ long text       │',
        '├────────┬────────┤',
        '│ left   │ right  │',
        '│ cell   │        │',
        '└────────┴────────┘',
      ];
      const rows = [[{ colSpan: 2, content: 'this spanning cell has quite long text' }], ['left cell', 'right']];
      expect(render({ maxColWidths: [8, 8] }, rows)).toEqual(expected.join('\n'));
    });

    it('keeps unlimited columns narrow: a spanning cell covering a limited column wraps instead', () => {
      const table = new Table({ head: ['ID', 'Task'], maxColWidths: [null, 12], style: { head: [], border: [] } });
      table.push(['101', 'Fix the login'], [{ colSpan: 2, content: 'A note spanning both columns that is long' }]);
      const expected = [
        '┌─────┬────────────┐',
        '│ ID  │ Task       │',
        '├─────┼────────────┤',
        '│ 101 │ Fix the    │',
        '│     │ login      │',
        '├─────┴────────────┤',
        '│ A note spanning  │',
        '│ both columns     │',
        '│ that is long     │',
        '└──────────────────┘',
      ];
      expect(table.toString()).toEqual(expected.join('\n'));
    });

    it('widens columns as before for a spanning cell that covers no limited column', () => {
      const rows = [
        ['a', 'b', 'c'],
        [{ colSpan: 2, content: 'a wide spanning cell' }, 'c'],
      ];
      const withoutLimit = render({}, rows);
      expect(render({ maxColWidths: [null, null, 5] }, rows)).toEqual(withoutLimit);
    });

    it('grows an unlimited spanned column that has no content of its own', () => {
      // the second column only contains the spanning cell (found by randomized testing)
      const table = new Table({ maxColWidths: [3], style: { head: [], border: [] } });
      table.push([{ colSpan: 2, content: 'spanning content' }, 'x']);
      const output = table.toString();
      expect(output).toEqual(
        ['┌──────────────────┬───┐', '│ spanning content │ x │', '└──────────────────┴───┘'].join('\n')
      );
      expect(table.options.colWidths).toEqual([]);
    });

    it('wraps a row spanning cell and the cells next to it', () => {
      const expected = [
        '┌──────────┬──────────┐',
        '│ tall     │ row one  │',
        '│ cell     │ is long  │',
        '│ spanning ├──────────┤',
        '│ rows     │ two      │',
        '└──────────┴──────────┘',
      ];
      const rows = [[{ rowSpan: 2, content: 'tall cell spanning rows' }, 'row one is long'], ['two']];
      expect(render({ maxColWidths: 10 }, rows)).toEqual(expected.join('\n'));
    });
  });

  describe('together with other options', () => {
    it('uses a fixed width from colWidths, and still wraps instead of truncating', () => {
      const expected = ['┌──────┐', '│ abcd │', '│ efgh │', '└──────┘'];
      expect(render({ colWidths: [6], maxColWidths: [20] }, [['abcd efgh']])).toEqual(expected.join('\n'));
    });

    it('truncates when wordWrap is explicitly false (table or cell)', () => {
      const expected = ['┌────────┐', '│ trunc… │', '└────────┘'];
      expect(render({ maxColWidths: 8, wordWrap: false }, [['truncate me']])).toEqual(expected.join('\n'));
      expect(render({ maxColWidths: 8 }, [[{ content: 'truncate me', wordWrap: false }]])).toEqual(expected.join('\n'));
    });

    it('keeps explicit rowHeights', () => {
      const expected = ['┌────────┐', '│ one    │', '│ two…   │', '└────────┘'];
      expect(render({ maxColWidths: 8, rowHeights: [2] }, [['one two three']])).toEqual(expected.join('\n'));
    });

    it('raises a limit too small for the padding and the widest character, so content stays visible', () => {
      const expected = ['┌───┬────┐', '│ a │ 漢 │', '│ b │ 字 │', '└───┴────┘'];
      expect(render({ maxColWidths: 1 }, [['ab', '漢字']])).toEqual(expected.join('\n'));
    });

    it('raises a limit for a spanning cell that would be too narrow, even if it spans an unlimited column', () => {
      // the unlimited column keeps its (narrow) content width, so the limited one has to make room
      const style = { head: [], border: [], 'padding-left': 0, 'padding-right': 0 };
      const rows = [['a', 'b'], [{ colSpan: 2, content: '漢字', style: { 'padding-left': 2, 'padding-right': 2 } }]];
      const expected = ['┌────┬─┐', '│a   │b│', '├────┴─┤', '│  漢  │', '│  字  │', '└──────┘'];
      expect(render({ maxColWidths: [1], style }, rows)).toEqual(expected.join('\n'));
    });

    it('renders the same output when toString() is called again', () => {
      const table = new Table({ maxColWidths: [8], style: { head: [], border: [] } });
      table.push([{ colSpan: 2, content: 'wrap this spanning text' }], ['a', 'b']);
      const first = table.toString();
      expect(table.toString()).toEqual(first);
    });
  });
});
