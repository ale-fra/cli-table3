import colors from 'ansis';
import Table from 'cli-table3';

describe('@api Table colors with colors.js style names', () => {
  // Style names from `colors` / `@colors/colors` (used by earlier cli-table3 versions)
  // must render the same as their ansis equivalents.
  (
    [
      ['brightRed', 'redBright'],
      ['brightWhite', 'whiteBright'],
      ['bgBrightRed', 'bgRedBright'],
      ['bgBrightBlue', 'bgBlueBright'],
      ['redBG', 'bgRed'],
      ['whiteBG', 'bgWhite'],
    ] as const
  ).forEach(([legacyName, ansisName]) => {
    it(`${legacyName} renders like ${ansisName}`, () => {
      const style = { border: [legacyName], head: [legacyName, 'bold'] };
      const received = new Table({ head: ['hello'], style }).toString();

      const border = colors[ansisName as keyof typeof colors] as typeof colors.red;
      const head = colors.bold[ansisName as keyof typeof colors] as typeof colors.red;
      const expected = [border('┌───────┐'), `${border`│`}${head` hello `}${border`│`}`, border('└───────┘')].join(
        '\n'
      );

      expect(received).toContain('\u001b['); // colors were actually applied
      expect(received).toEqual(expected);
    });
  });
});

it.each(['extend', 'strip', 'isSupported', 'rgb', 'fg', 'ansi256', 'toString', 'constructor', '__proto__'])(
  'rejects the Ansis helper %s without modifying Ansis',
  (name) => {
    const render = (head: string[]) => new Table({ head: ['hello'], style: { head, border: [] } }).toString();
    expect(render([name])).toEqual(render([]));
    expect(colors.red('x')).toEqual('\u001b[31mx\u001b[39m');
  }
);
