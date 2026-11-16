import colors, { type AnsiColors, type AnsiStyles } from 'ansis';
import Table from 'cli-table3';

describe('@api Table 16 colors', () => {
  it('text and border in red', () => {
    const { expected, received } = color16Test('red');
    expect(received).toEqual(expected);
  });

  it('text and border in green', () => {
    const { expected, received } = color16Test('green');
    expect(received).toEqual(expected);
  });

  it('text and border in yellow', () => {
    const { expected, received } = color16Test('yellow');
    expect(received).toEqual(expected);
  });

  it('text and border in blue', () => {
    const { expected, received } = color16Test('blue');
    expect(received).toEqual(expected);
  });

  it('text and border in magenta', () => {
    const { expected, received } = color16Test('magenta');
    expect(received).toEqual(expected);
  });

  it('text and border in cyan', () => {
    const { expected, received } = color16Test('cyan');
    expect(received).toEqual(expected);
  });

  it('text and border in white', () => {
    const { expected, received } = color16Test('white');
    expect(received).toEqual(expected);
  });

  it('text and border in grey', () => {
    const { expected, received } = color16Test('grey');
    expect(received).toEqual(expected);
  });

  it('text and border in gray', () => {
    const { expected, received } = color16Test('gray');
    expect(received).toEqual(expected);
  });

  it('text and border in redBright', () => {
    const { expected, received } = color16Test('redBright');
    expect(received).toEqual(expected);
  });

  it('text and border in greenBright', () => {
    const { expected, received } = color16Test('greenBright');
    expect(received).toEqual(expected);
  });

  it('text and border in yellowBright', () => {
    const { expected, received } = color16Test('yellowBright');
    expect(received).toEqual(expected);
  });

  it('text and border in blueBright', () => {
    const { expected, received } = color16Test('blueBright');
    expect(received).toEqual(expected);
  });

  it('text and border in magentaBright', () => {
    const { expected, received } = color16Test('magentaBright');
    expect(received).toEqual(expected);
  });

  it('text and border in cyanBright', () => {
    const { expected, received } = color16Test('cyanBright');
    expect(received).toEqual(expected);
  });

  it('text and border in whiteBright', () => {
    const { expected, received } = color16Test('whiteBright');
    expect(received).toEqual(expected);
  });

  it('text and border in bgBlack', () => {
    const { expected, received } = color16Test('white', 'bgBlack');
    expect(received).toEqual(expected);
  });

  it('text and border in bgRed', () => {
    const { expected, received } = color16Test('white', 'bgRed');
    expect(received).toEqual(expected);
  });

  it('text and border in bgGreen', () => {
    const { expected, received } = color16Test('black', 'bgGreen');
    expect(received).toEqual(expected);
  });

  it('text and border in bgYellow', () => {
    const { expected, received } = color16Test('black', 'bgYellow');
    expect(received).toEqual(expected);
  });

  it('text and border in bgBlue', () => {
    const { expected, received } = color16Test('white', 'bgBlue');
    expect(received).toEqual(expected);
  });

  it('text and border in bgMagenta', () => {
    const { expected, received } = color16Test('white', 'bgMagenta');
    expect(received).toEqual(expected);
  });

  it('text and border in bgCyan', () => {
    const { expected, received } = color16Test('black', 'bgCyan');
    expect(received).toEqual(expected);
  });

  it('text and border in bgWhite', () => {
    const { expected, received } = color16Test('black', 'bgWhite');
    expect(received).toEqual(expected);
  });

  it('text and border in bgGrey', () => {
    const { expected, received } = color16Test('blue', 'bgGrey');
    expect(received).toEqual(expected);
  });

  it('text and border in bgGray', () => {
    const { expected, received } = color16Test('blue', 'bgGray');
    expect(received).toEqual(expected);
  });

  it('text and border in bgRedBright', () => {
    const { expected, received } = color16Test('black', 'bgRedBright');
    expect(received).toEqual(expected);
  });

  it('text and border in bgGreenBright', () => {
    const { expected, received } = color16Test('black', 'bgGreenBright');
    expect(received).toEqual(expected);
  });

  it('text and border in bgYellowBright', () => {
    const { expected, received } = color16Test('black', 'bgYellowBright');
    expect(received).toEqual(expected);
  });

  it('text and border in bgBlueBright', () => {
    const { expected, received } = color16Test('black', 'bgBlueBright');
    expect(received).toEqual(expected);
  });

  it('text and border in bgMagentaBright', () => {
    const { expected, received } = color16Test('black', 'bgMagentaBright');
    expect(received).toEqual(expected);
  });

  it('text and border in bgCyanBright', () => {
    const { expected, received } = color16Test('black', 'bgCyanBright');
    expect(received).toEqual(expected);
  });

  it('text and border in bgWhiteBright', () => {
    const { expected, received } = color16Test('red', 'bgWhiteBright');
    expect(received).toEqual(expected);
  });
});

describe('@api Table legacy style names', () => {
  // ansis 4 removed these names; cli-table3 keeps accepting them (default border style is 'grey').
  it.each([
    ['grey', 'gray'],
    ['bgGrey', 'bgGray'],
    ['strike', 'strikethrough'],
  ])('%s renders like %s', (legacyName, ansisStyle) => {
    const render = (style: string) =>
      new Table({ head: ['hello'], style: { border: [style], head: [style] } }).toString();
    const received = render(legacyName);

    expect(received).toEqual(render(ansisStyle));
    expect(received).toContain(colors[ansisName(ansisStyle)]('│')); // really styled, not silently dropped
  });
});

describe('@api Table invalid styles', () => {
  // invalid entries on purpose: the styles are not checked against the types
  const render = (style: unknown[]) =>
    new Table({ head: ['hello'], style: { border: style as string[], head: style as string[] } }).toString();
  const unstyled = render([]);

  it('an unknown style name leaves the text unstyled', () => {
    expect(render(['notAColor'])).toEqual(unstyled);
  });

  it('an unknown style name next to valid ones leaves the text unstyled', () => {
    expect(render(['red', 'notAColor', 'bold'])).toEqual(unstyled);
  });

  it('a style that is not a string leaves the text unstyled', () => {
    expect(render([42])).toEqual(unstyled);
    expect(render(['red', null])).toEqual(unstyled);
  });

  describe('are reported in the debug messages (level 3)', () => {
    const messagesOf = (table: Table.Table): string[] => {
      table.toString();
      return (table.messages ?? []).filter((message) => message.startsWith('Invalid style'));
    };

    it('table styles, once per render', () => {
      // @ts-expect-error - 42 is not a style name (on purpose)
      const table = new Table({ debug: 3, head: ['h1', 'h2'], style: { head: ['notAColor'], border: ['red', 42] } });
      table.push(['a', 'b\nc'], ['d', 'e']);

      expect(messagesOf(table)).toEqual([
        'Invalid style "notAColor" in style.head of the table; the text is not styled.',
        'Invalid style 42 in style.border of the table; the text is not styled.',
      ]);
    });

    it('cell styles, with the position of the cell', () => {
      const table = new Table({ debug: 3, style: { head: [], border: [] } });
      // @ts-expect-error - null is not a style name (on purpose)
      table.push(['a', { content: 'b', style: { border: ['nope'] } }], [{ content: 'c', style: { head: [null] } }]);

      expect(messagesOf(table)).toEqual([
        'Invalid style "nope" in style.border of cell 0-1; the text is not styled.',
        'Invalid style null in style.head of cell 1-0; the text is not styled.',
      ]);
    });

    it('valid styles, hex colours and legacy names are not reported', () => {
      const table = new Table({
        debug: 3,
        head: ['h'],
        style: { head: ['bold', 'hex(#ff8800)', 'bgHex(#123)'], border: ['grey', 'strike', 'bgGrey'] },
      });
      table.push([{ content: 'a', style: { border: ['red'], head: [] } }]);

      expect(messagesOf(table)).toEqual([]);
    });

    it('are not reported below debug level 3', () => {
      const table = new Table({ debug: 2, style: { border: ['notAColor'] } });
      table.push(['a']);

      expect(messagesOf(table)).toEqual([]);
    });
  });
});

type StyleName = AnsiColors | AnsiStyles;

// Style names accepted by cli-table3 that ansis (>= 4) only knows under their canonical name.
const LEGACY_NAMES: Record<string, StyleName> = { grey: 'gray', bgGrey: 'bgGray', strike: 'strikethrough' };

/** The ansis name of a style name used in the tests. */
function ansisName(style: string): StyleName {
  return LEGACY_NAMES[style] ?? (style as StyleName);
}

function color16Test(textColor: string, bgColor = 'visible') {
  const table = new Table({ head: ['hello'], style: { border: [textColor, bgColor], head: [textColor, bgColor] } });

  const s = colors[ansisName(bgColor)][ansisName(textColor)];
  const expected = [s('┌───────┐'), `${s`│`}${s` hello `}${s`│`}`, s('└───────┘')].join('\n');
  const received = table.toString();

  // display colored table to make the screenshot for README
  //console.log(received);

  return { expected, received };
}
