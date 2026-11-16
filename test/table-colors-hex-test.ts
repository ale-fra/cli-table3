import '../env/truecolor';
import colors from 'ansis';
import Table from 'cli-table3';

// Note: vitest.config.mjs sets FORCE_COLOR=1 which limits the use of only 16 colors.
// Force enable truecolor loading ENV variable FORCE_COLOR=3.

describe('@api Table truecolor', () => {
  it('colorize header text using a hex truecolor value', () => {
    const table = new Table({ head: ['hello', 'goodbye'], style: { border: [], head: ['hex(#c74384)'] } });

    const style = colors.hex('#c74384');
    const expected = ['┌───────┬─────────┐', `│${style(' hello ')}│${style(' goodbye ')}│`, '└───────┴─────────┘'];

    expect(table.toString()).toEqual(expected.join('\n'));
  });

  it('colorize header text and background using a hex truecolor value', () => {
    const table = new Table({
      head: ['hello', 'goodbye'],
      style: { border: [], head: ['bgHex(#3d239d)', 'hex(#f5862b)', 'underline'] },
    });

    const style = colors.underline.hex('#f5862b').bgHex('#3d239d');
    const expected = ['┌───────┬─────────┐', `│${style(' hello ')}│${style(' goodbye ')}│`, '└───────┴─────────┘'];

    expect(table.toString()).toEqual(expected.join('\n'));
  });

  it('colorize border and text using a hex truecolor value', () => {
    const table = new Table({
      head: ['hello', 'goodbye'],
      style: { border: ['hex(#3d239d)'], head: ['hex(#f5862b)', 'bold'] },
    });

    // styles for border and text
    const border = colors.hex('#3d239d');
    const text = colors.bold.hex('#f5862b');

    const expected = [
      border`┌───────` + border`┬─────────┐`,
      border`│` + text(' hello ') + border`│` + text(' goodbye ') + border`│`,
      border`└───────` + border`┴─────────┘`,
    ];

    expect(table.toString()).toEqual(expected.join('\n'));
  });

  it('text and border in truecolor with background, v1', () => {
    const { expected, received } = truecolorTest('#f5862b', '#3d239d');
    expect(received).toEqual(expected);
  });

  it('text and border in truecolor with background, v2', () => {
    const { expected, received } = truecolorTest('#f3d722', '#28936b');
    expect(received).toEqual(expected);
  });

  it('text and border in truecolor with background, v3', () => {
    const { expected, received } = truecolorTest('#1624d7', '#d7467d');
    expect(received).toEqual(expected);
  });
});

function truecolorTest(textColor: string, bgColor = '#000') {
  const textColorHex = `hex(${textColor})`;
  const bgColorHex = `bgHex(${bgColor})`;
  const table = new Table({
    head: ['hello'],
    style: { border: [textColorHex, bgColorHex], head: [textColorHex, bgColorHex, 'bold'] },
  });

  const border = colors.bgHex(bgColor).hex(textColor);
  const text = colors.bold.bgHex(bgColor).hex(textColor);
  const expected = [border('┌───────┐'), `${border`│`}${text` hello `}${border`│`}`, border('└───────┘')].join('\n');
  const received = table.toString();

  // display colored table to make the screenshot for README
  //console.log(received);

  return { expected, received };
}
