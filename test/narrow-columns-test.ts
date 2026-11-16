import { execFileSync } from 'node:child_process';
import path from 'node:path';
import Table from 'cli-table3';

/**
 * Runs `code` in a child process and returns what it prints (JSON). Rendering used to loop
 * forever for some narrow columns: in a child process that fails the test after the timeout
 * instead of freezing the whole test run.
 */
function runIsolated<T>(code: string): T {
  const output = execFileSync(process.execPath, ['-e', code], {
    cwd: path.join(__dirname, '..'),
    timeout: 10_000,
    encoding: 'utf8',
    env: { ...process.env, FORCE_COLOR: '1' },
  });
  return JSON.parse(output) as T;
}

type TableSpec = [options: Table.TableConstructorOptions, rows: Table.TableRow[]];

/** Renders tables in a child process: `tables` is a list of [options, rows]. */
function renderIsolated(tables: TableSpec[]): string[][] {
  return runIsolated(`
    const Table = require('.');
    const tables = ${JSON.stringify(tables)};
    const rendered = tables.map(([options, rows]) => {
      const table = new Table({ style: { head: [], border: [] }, ...options });
      table.push(...rows);
      return table.toString().split('\\n');
    });
    process.stdout.write(JSON.stringify(rendered));
  `);
}

/** Renders in this process: only for cases without wrapping (wrapping is what used to hang). */
function render(options: Table.TableConstructorOptions, rows: Table.TableRow[]): string[] {
  const table = new Table({ style: { head: [], border: [] }, ...options });
  table.push(...rows);
  return table.toString().split('\n');
}

describe('columns narrower than their padding', () => {
  it('the padding shrinks (right side first) to leave one column for the content', () => {
    expect(render({ colWidths: [1] }, [['abc']])).toEqual(['┌─┐', '│…│', '└─┘']);
    expect(render({ colWidths: [2] }, [['abc']])).toEqual(['┌──┐', '│ …│', '└──┘']);
    expect(render({ colWidths: [3] }, [['abc']])).toEqual(['┌───┐', '│ … │', '└───┘']); // enough room: unchanged
  });

  it('a truncation symbol wider than the column is shortened', () => {
    expect(render({ colWidths: [3], truncate: '...' }, [['abc']])).toEqual(['┌───┐', '│ . │', '└───┘']);
  });

  it('wrapping anywhere (wrapOnWordBoundary: false) does not hang', () => {
    const options = { wordWrap: true, wrapOnWordBoundary: false };
    const [width1, width2] = renderIsolated([
      [{ ...options, colWidths: [1] }, [['abc']]],
      [{ ...options, colWidths: [2] }, [['abc']]],
    ]);

    expect(width1).toEqual(['┌─┐', '│a│', '│b│', '│c│', '└─┘']);
    expect(width2).toEqual(['┌──┐', '│ a│', '│ b│', '│ c│', '└──┘']);
  });

  it('every line is as wide as the border, for any width, padding and wrapping', () => {
    const contents = ['abc', 'hello world', '古古古', '\u001b[31mred text\u001b[39m', 'a\nbb\n\nccc', ''];
    const tables = [];
    for (const width of [1, 2, 3, 4, 6]) {
      for (const padding of [0, 1, 2]) {
        for (const wrap of [{}, { wordWrap: true }, { wordWrap: true, wrapOnWordBoundary: false }]) {
          for (const truncate of ['…', '...']) {
            const style = { head: [], border: [], 'padding-left': padding, 'padding-right': padding };
            const options = { ...wrap, truncate, style, colWidths: [width, width] };
            tables.push([
              options,
              [...contents.map((content) => [content, 'x']), [{ colSpan: 2, content: 'span me' }]],
            ]);
          }
        }
      }
    }

    const misaligned = runIsolated(`
      const Table = require('.');
      const stringWidth = require('string-width');
      const misaligned = ${JSON.stringify(tables)}.flatMap(([options, rows]) => {
        const table = new Table(options);
        table.push(...rows);
        const lines = table.toString().split('\\n');
        const widths = new Set(lines.map((line) => stringWidth(line)));
        return widths.size === 1 ? [] : [{ options, lines }];
      });
      process.stdout.write(JSON.stringify(misaligned));
    `);

    expect(misaligned).toEqual([]);
  });
});

describe('wrapping', () => {
  it('wordWrap() treats a width below 1 as 1', () => {
    const lines = runIsolated(`
      const { wordWrap } = require('./dist/utils');
      process.stdout.write(JSON.stringify([0, -3].flatMap((width) => [wordWrap(width, 'ab c', true), wordWrap(width, 'ab c', false)])));
    `);

    // the same as wrapping at width 1 (wrapping anywhere keeps the space between the words)
    expect(lines).toEqual([
      ['ab', 'c'],
      ['a', 'b', ' ', 'c'],
      ['ab', 'c'],
      ['a', 'b', ' ', 'c'],
    ]);
  });

  it('keeps empty lines, like unwrapped content', () => {
    const content = 'a\n\nb';
    const [unwrapped, onWords, anywhere] = renderIsolated([
      [{ colWidths: [5] }, [[content]]],
      [{ colWidths: [5], wordWrap: true }, [[content]]],
      [{ colWidths: [5], wordWrap: true, wrapOnWordBoundary: false }, [[content]]],
    ]);

    expect(unwrapped).toEqual(['┌─────┐', '│ a   │', '│     │', '│ b   │', '└─────┘']);
    expect(onWords).toEqual(unwrapped);
    expect(anywhere).toEqual(unwrapped);
  });

  it('a cell spanning columns wraps at its full width (including the borders between the columns)', () => {
    const [table] = renderIsolated([
      [{ colWidths: [6, 6], wordWrap: true }, [[{ colSpan: 2, content: 'aaaa bbbb c' }], ['x', 'y']]],
    ]);

    expect(table).toEqual([
      '┌─────────────┐',
      '│ aaaa bbbb c │',
      '├──────┬──────┤',
      '│ x    │ y    │',
      '└──────┴──────┘',
    ]);
  });
});
