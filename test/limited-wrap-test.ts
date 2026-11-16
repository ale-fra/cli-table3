import colors from 'ansis';
import Table from 'cli-table3';
import stringWidth from 'string-width';
import { computeWidths } from '../dist/sizes';
import * as utils from '../dist/utils';

describe('wrapToWidth', () => {
  const { wrapToWidth } = utils;

  it('wraps on word boundaries', () => {
    expect(wrapToWidth(10, 'Hello, how are you today?')).toEqual(['Hello, how', 'are you', 'today?']);
  });

  it('breaks words longer than the width', () => {
    expect(wrapToWidth(5, 'a Looooooong b')).toEqual(['a', 'Loooo', 'ooong', 'b']);
  });

  it('breaks anywhere when not wrapping on word boundaries', () => {
    expect(wrapToWidth(4, 'abc defgh', false)).toEqual(['abc ', 'defg', 'h']);
  });

  it('measures the width on screen of wide characters', () => {
    expect(wrapToWidth(4, '漢字漢字漢字', false)).toEqual(['漢字', '漢字', '漢字']);
    expect(wrapToWidth(3, '漢字漢', false)).toEqual(['漢', '字', '漢']);
  });

  it('never splits emoji or combining characters', () => {
    expect(wrapToWidth(3, '👍👍👍', false)).toEqual(['👍', '👍', '👍']);
    expect(wrapToWidth(2, '👨‍👩‍👧x', false)).toEqual(['👨‍👩‍👧', 'x']);
    expect(wrapToWidth(2, 'e\u0301e\u0301e\u0301', false)).toEqual(['e\u0301e\u0301', 'e\u0301']);
  });

  it('never splits escape sequences', () => {
    const lines = wrapToWidth(4, colors.red('abcdefgh'), false);
    expect(lines).toEqual(['\u001b[31mabcd', 'efgh\u001b[39m']);
  });

  it('closes and re-opens hyperlinks at line breaks', () => {
    const link = utils.hyperlink('http://x.io', 'abcdef');
    const open = '\u001b]8;;http://x.io\u0007';
    const close = '\u001b]8;;\u0007';
    expect(wrapToWidth(3, link, false)).toEqual([`${open}abc${close}`, `${open}def${close}`]);
  });

  it('keeps empty lines', () => {
    expect(wrapToWidth(10, 'a\n\nb')).toEqual(['a', '', 'b']);
    expect(wrapToWidth(10, '')).toEqual(['']);
  });

  it('uses a width of at least 1', () => {
    expect(wrapToWidth(0, 'abc', false)).toEqual(['a', 'b', 'c']);
  });
});

describe('widestCharWidth', () => {
  it('is the width on screen of the widest character', () => {
    expect(utils.widestCharWidth('abc')).toEqual(1);
    expect(utils.widestCharWidth('ab漢')).toEqual(2);
    expect(utils.widestCharWidth(colors.red('👍'))).toEqual(2);
    expect(utils.widestCharWidth('')).toEqual(0);
  });
});

describe('links and limited sizing regressions', () => {
  it.each(['\u0007', '\u001b\\'])('keeps OSC 8 links balanced across word and hard breaks (%j)', (end) => {
    const open = `\u001b]8;;https://example.com${end}`;
    const close = `\u001b]8;;${end}`;
    const belClose = '\u001b]8;;\u0007';
    expect(utils.wrapToWidth(3, `${open}abc def${close}`)).toEqual([`${open}abc${belClose}`, `${open}def${close}`]);
    expect(utils.wrapToWidth(3, `${open}abcdef${close}`, false)).toEqual([
      `${open}abc${belClose}`,
      `${open}def${close}`,
    ]);
  });

  it('keeps a standalone grapheme and its color together when the limit is raised', () => {
    const table = new Table({ maxColWidths: 1, style: { head: [], border: [] } });
    table.push([colors.red('👨‍👩‍👧e\u0301漢')]);
    const lines = table.toString().split('\n');
    expect(lines.every((line) => stringWidth(line) === stringWidth(lines[0] ?? ''))).toBe(true);
    expect(table.toString()).toContain('👨‍👩‍👧');
    expect(table.toString()).toContain('e\u0301');
    expect(table.toString()).not.toContain('…');
  });

  it('respects a fixed column following a spanner with no standalone starting cell', () => {
    expect(computeWidths([null, 4], [[{ x: 0, y: 0, colSpan: 2, desiredWidth: 30 }]], [3])).toEqual([3, 4]);
  });

  it('does not freeze automatic maximum widths between renders', () => {
    const limits = [8];
    const table = new Table({ maxColWidths: limits, style: { head: [], border: [] } });
    table.push(['a']);
    table.toString();
    table.push(['a longer sentence']);
    expect(table.toString()).toContain('longer');
    expect(table.toString()).not.toContain('…');
    expect(table.options.colWidths).toEqual([]);
    expect(limits).toEqual([8]);
  });
});
