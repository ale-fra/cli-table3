import colors from 'ansis';
import Table from 'cli-table3';

describe('@api Table ', () => {
  it('wordWrap with colored text', () => {
    const table = new Table({ style: { border: [], head: [] }, wordWrap: true, colWidths: [7, 9] });

    table.push([colors.red('Hello how are you?'), colors.blue('I am fine thanks!')]);

    const expected = [
      '┌───────┬─────────┐',
      `│ ${colors.red('Hello')} │ ${colors.blue('I am')}    │`,
      `│ ${colors.red('how')}   │ ${colors.blue('fine')}    │`,
      `│ ${colors.red('are')}   │ ${colors.blue('thanks!')} │`,
      `│ ${colors.red('you?')}  │         │`,
      '└───────┴─────────┘',
    ];

    expect(table.toString()).toEqual(expected.join('\n'));
  });

  it('allows numbers as `content` property of cells defined using object notation', () => {
    const table = new Table({ style: { border: [], head: [] } });

    table.push([{ content: 12 }]);

    const expected = ['┌────┐', '│ 12 │', '└────┘'];

    expect(table.toString()).toEqual(expected.join('\n'));
  });

  it('throws if content is not a string or number', () => {
    const table = new Table({ style: { border: [], head: [] } });

    expect(() => {
      // @ts-expect-error - the content of a cell must be a primitive value (on purpose)
      table.push([{ content: { a: 'b' } }]);
      table.toString();
    }).toThrow();
  });

  it('works with CJK values', () => {
    const table = new Table({ style: { border: [], head: [] }, colWidths: [5, 10, 5] });

    table.push(
      ['foobar', 'English test', 'baz'],
      ['foobar', '中文测试', 'baz'],
      ['foobar', '日本語テスト', 'baz'],
      ['foobar', '한국어테스트', 'baz']
    );

    const expected = [
      '┌─────┬──────────┬─────┐',
      '│ fo… │ English… │ baz │',
      '├─────┼──────────┼─────┤',
      '│ fo… │ 中文测试 │ baz │',
      '├─────┼──────────┼─────┤',
      '│ fo… │ 日本語…  │ baz │',
      '├─────┼──────────┼─────┤',
      '│ fo… │ 한국어…  │ baz │',
      '└─────┴──────────┴─────┘',
    ];

    expect(table.toString()).toEqual(expected.join('\n'));
  });

  it('supports complex layouts', () => {
    const table = new Table({ style: { border: [], head: [] } });
    table.push(
      [{ content: 'TOP', colSpan: 9, hAlign: 'center' }],
      [
        { content: 'TL', rowSpan: 4, vAlign: 'center' },
        { content: 'A1', rowSpan: 3 },
        'B1',
        'C1',
        { content: 'D1', rowSpan: 3, vAlign: 'center' },
        'E1',
        'F1',
        { content: 'G1', rowSpan: 3 },
        { content: 'TR', rowSpan: 4, vAlign: 'center' },
      ],
      [{ rowSpan: 2, content: 'B2' }, 'C2', { rowSpan: 2, colSpan: 2, content: 'E2' }],
      ['C3'],
      [{ content: 'A2', colSpan: 7, hAlign: 'center' }],
      [{ content: 'CLEAR', colSpan: 9, hAlign: 'center' }],
      [
        { content: 'BL', rowSpan: 4, vAlign: 'center' },
        { content: 'A3', colSpan: 7, hAlign: 'center' },
        { content: 'BR', rowSpan: 4, vAlign: 'center' },
      ],
      [
        { content: 'A4', colSpan: 3, hAlign: 'center' },
        { content: 'D2', rowSpan: 2, vAlign: 'center' },
        { content: 'E3', colSpan: 2, hAlign: 'center' },
        { content: 'G2', rowSpan: 3, vAlign: 'center' },
      ],
      [
        { content: 'A5', rowSpan: 2, vAlign: 'center' },
        { content: 'B3', colSpan: 2, hAlign: 'center' },
        { content: 'E4', rowSpan: 2, vAlign: 'center' },
        { content: 'F3', rowSpan: 2, vAlign: 'center' },
      ],
      ['B4', { content: 'C4', colSpan: 2, hAlign: 'center' }],
      [{ content: 'BOTTOM', colSpan: 9, hAlign: 'center' }]
    );
    const expected = [
      '┌────────────────────────────────────────────┐',
      '│                    TOP                     │',
      '├────┬────┬────┬────┬────┬────┬────┬────┬────┤',
      '│    │ A1 │ B1 │ C1 │    │ E1 │ F1 │ G1 │    │',
      '│    │    ├────┼────┤    ├────┴────┤    │    │',
      '│    │    │ B2 │ C2 │ D1 │ E2      │    │    │',
      '│ TL │    │    ├────┤    │         │    │ TR │',
      '│    │    │    │ C3 │    │         │    │    │',
      '│    ├────┴────┴────┴────┴─────────┴────┤    │',
      '│    │                A2                │    │',
      '├────┴──────────────────────────────────┴────┤',
      '│                   CLEAR                    │',
      '├────┬──────────────────────────────────┬────┤',
      '│    │                A3                │    │',
      '│    ├──────────────┬────┬─────────┬────┤    │',
      '│    │      A4      │    │   E3    │    │    │',
      '│ BL ├────┬─────────┤ D2 ├────┬────┤    │ BR │',
      '│    │    │   B3    │    │    │    │ G2 │    │',
      '│    │ A5 ├────┬────┴────┤ E4 │ F3 │    │    │',
      '│    │    │ B4 │   C4    │    │    │    │    │',
      '├────┴────┴────┴─────────┴────┴────┴────┴────┤',
      '│                   BOTTOM                   │',
      '└────────────────────────────────────────────┘',
    ];
    expect(table.toString()).toEqual(expected.join('\n'));
  });
  describe('array methods', () => {
    const makeTable = () => {
      const table = new Table({ head: ['h'], style: { head: [], border: [] } });
      table.push(['a'], ['b'], ['c']);
      return table;
    };

    it.each<[string, (table: Table.Table) => unknown[]]>([
      ['map', (t) => t.map((row) => row)],
      ['filter', (t) => t.filter(() => true)],
      ['slice', (t) => t.slice(1)],
      ['concat', (t) => t.concat([['d']])],
      ['splice', (t) => t.splice(0, 1)],
      ['flatMap', (t) => t.flatMap((row) => [row])],
    ])('%s returns a plain array', (_name, call) => {
      const result = call(makeTable());
      expect(Array.isArray(result)).toBe(true);
      expect(result).not.toBeInstanceOf(Table);
      expect(Object.getPrototypeOf(result)).toBe(Array.prototype);
    });

    it('keep working on the table itself', () => {
      const table = makeTable();
      expect(table.filter((row) => Array.isArray(row) && row[0] !== 'b')).toEqual([['a'], ['c']]);
      table.splice(1, 1);
      expect(table.toString()).toEqual(['┌───┐', '│ h │', '├───┤', '│ a │', '├───┤', '│ c │', '└───┘'].join('\n'));
    });
  });

  describe('debugging', () => {
    afterEach(() => Table.reset());
    it('is not accessible when disabled', () => {
      const table = new Table();
      expect(table.messages).toBeUndefined();
    });
    it('warns of missing cells', () => {
      const table = new Table({ debug: true });
      table.push([{ rowSpan: 2 }], [{}]);
      table.toString();
      expect(table.messages).toEqual(['Missing cell at 0-1.']);
    });
    it('provides cell info', () => {
      const table = new Table({ debug: 2 });
      table.push(['a', 'b', { content: 'c', rowSpan: 2 }], [{ content: 'd', colSpan: 2 }]);
      table.toString();
      expect(table.messages).toContain('0-0: 1x1 Cell a');
      expect(table.messages).toContain('0-1: 1x1 Cell b');
      expect(table.messages).toContain('0-2: 2x1 Cell c');
      expect(table.messages).toContain('1-0: 1x2 Cell d');
    });
    it('provides rowSpan and colSpan cell debug info', () => {
      const table = new Table({ debug: 3 });
      table.push(['a', 'b', { content: 'c', rowSpan: 2 }], [{ content: 'd', colSpan: 2 }]);
      table.toString();
      expect(table.messages).toContain('1-1: 1x1 ColSpanCell');
      expect(table.messages).toContain('1-2: 1x1 RowSpanCell for c');
    });
    it('provides debug info', () => {
      const table = new Table({ debug: 3 });
      table.push([{}, {}], [{}, {}]);
      table.toString();
      expect(table.messages).toContain('Max rows: 2; Max cols: 2');
    });
    it('accepts the level as a string', () => {
      const table = new Table({ debug: '2' });
      table.push(['a'], [{ rowSpan: 2 }]);
      table.toString();
      expect(table.messages).toEqual([
        'rowSpan of cell 1-0 (2) reaches past the last row; limited to 1.',
        '0-0: 1x1 Cell a',
        '1-0: 1x1 Cell ',
      ]);
    });
    it('messages of a table only describe that table', () => {
      const a = new Table({ debug: 3 });
      a.push(['a']);
      a.toString();

      const b = new Table(); // debugging disabled
      b.push([{ content: 'b', colSpan: 2 }]);
      b.toString();

      const c = new Table({ debug: 3 });
      c.push(['c']);
      c.toString();

      expect(a.messages).toEqual(['Max rows: 1; Max cols: 1', '0-0: 1x1 Cell a']);
      expect(b.messages).toBeUndefined();
      expect(c.messages).toEqual(['Max rows: 1; Max cols: 1', '0-0: 1x1 Cell c']);
    });
    it('each table uses its own debug level', () => {
      const verbose = new Table({ debug: 3 });
      const warnOnly = new Table({ debug: true });
      verbose.push(['v', 'v2'], ['v3']); // cell 1-1 is missing -> warning
      warnOnly.push(['w', 'w2'], ['w3']);
      warnOnly.toString();
      verbose.toString();

      expect(warnOnly.messages).toEqual(['Missing cell at 1-1.']);
      expect(verbose.messages).toContain('Missing cell at 1-1.');
      expect(verbose.messages).toContain('0-0: 1x1 Cell v');
    });
    it('messages accumulate over repeated renders of the same table', () => {
      const table = new Table({ debug: true });
      table.push([{ rowSpan: 2 }], [{}]);
      table.toString();
      table.toString();
      expect(table.messages).toEqual(['Missing cell at 0-1.', 'Missing cell at 0-1.']);
    });
    it('warns about an invalid debug option on that table', () => {
      // @ts-expect-error - not a valid debug option (on purpose)
      const table = new Table({ debug: {} });
      expect(table.messages).toEqual(['Debug option is expected to be boolean, number, or string. Received a object']);
      expect(new Table({ debug: true }).messages).toEqual([]);
    });
    it('reports blocking issues at level 1 and non-blocking issues at level 3', () => {
      // blocking: the table cannot be rendered as given (a cell is missing, a span is impossible)
      // non-blocking: the table is rendered as given, an option is ignored (an invalid style)
      const issues = (level: number): string[] => {
        const table = new Table({ debug: level, style: { head: [], border: [] } });
        table.push([{ content: 'a', style: { border: ['notAColor'] } }, 'b'], [{ rowSpan: 2, content: 'c' }]);
        table.toString();
        return (table.messages ?? []).filter((message) => !/^\d+-\d+: |^Max rows/.test(message)); // not the traces
      };
      const blocking = ['rowSpan of cell 1-0 (2) reaches past the last row; limited to 1.', 'Missing cell at 1-1.'];
      const nonBlocking = ['Invalid style "notAColor" in style.border of cell 0-0; the text is not styled.'];

      expect(issues(1)).toEqual(blocking);
      expect(issues(2)).toEqual(blocking);
      expect(issues(3)).toEqual([...blocking, ...nonBlocking]);
    });
    it('Table.reset() is still available (deprecated, no longer needed)', () => {
      const table = new Table({ debug: true });
      table.push([{ rowSpan: 2 }], [{}]);
      table.toString();
      expect(() => Table.reset()).not.toThrow();
    });
  });
});

/*

 let expected = [
   '┌──┬───┬──┬──┐'
 , '│  │   │  │  │'
 , '├──┼───┼──┼──┤'
 , '│  │ … │  │  │'
 , '├──┼───┼──┼──┤'
 , '│  │ … │  │  │'
 , '└──┴───┴──┴──┘'
 ];

 */
