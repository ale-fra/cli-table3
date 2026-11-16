import '../env/truecolor';
import colors from 'ansis';
import Table from 'cli-table3';

// Note: vitest.config.mjs sets FORCE_COLOR=1 which limits the use of only 16 colors.
// Force enable truecolor loading ENV variable FORCE_COLOR=3.

describe('Examples for README', () => {
  it('header text in green bold', () => {
    const table = new Table({ head: ['Name', 'Age'], style: { border: [], head: ['green', 'bold'] } });
    table.push(['Sample row A', '50']);

    const s = colors.bold.green;
    const expected = [
      '┌──────────────┬─────┐',
      `│${s(' Name         ')}│${s(' Age ')}│`,
      '├──────────────┼─────┤',
      '│ Sample row A │ 50  │',
      '└──────────────┴─────┘',
    ].join('\n');

    const received = table.toString();

    // display colored table to make the screenshot for README
    //console.log(received);

    expect(received).toEqual(expected);
  });

  it('header text in Orange italic', () => {
    const table = new Table({ head: ['Name', 'Age'], style: { border: [], head: ['hex(#FFA500)', 'italic'] } });
    table.push(['Sample row A', '50']);

    const s = colors.italic.hex('#FFA500');
    const expected = [
      '┌──────────────┬─────┐',
      `│${s(' Name         ')}│${s(' Age ')}│`,
      '├──────────────┼─────┤',
      '│ Sample row A │ 50  │',
      '└──────────────┴─────┘',
    ].join('\n');

    const received = table.toString();

    // display colored table to make the screenshot for README
    //console.log(received);

    expect(received).toEqual(expected);
  });

  it('border and head text in orange', () => {
    const table = new Table({
      head: ['Name', 'Age'],
      style: { border: ['hex(#FFD700)'], head: ['hex(#FFA500)', 'italic'] },
    });

    table.push(['Sample row A', '50']);

    const text = colors.italic.hex('#FFA500');
    const border = colors.hex('#FFD700');

    const expected = [
      border`┌──────────────` + border`┬─────┐`,
      border`│` + text` Name         ` + border`│` + text` Age ` + border`│`,
      border`├──────────────` + border`┼─────┤`,
      `${border`│`} Sample row A ${border`│`} 50  ${border`│`}`,
      border`└──────────────` + border`┴─────┘`,
    ].join('\n');

    const received = table.toString();

    // display colored table to make the screenshot for README
    //console.log(received);

    expect(received).toEqual(expected);
  });

  it('border and head text in orange, body in custom colors', () => {
    const table = new Table({
      head: ['Name', 'Age'],
      style: { border: ['hex(#FFD700)'], head: ['hex(#FFA500)', 'italic'] },
    });

    const c = colors;

    table.push([c.green('Sample row A'), c.red('50')], [c.hex('#FF69B4')('Sample row AB'), c.blueBright('24')]);

    const text = colors.italic.hex('#FFA500');
    const border = colors.hex('#FFD700');

    const expected = [
      border`┌───────────────` + border`┬─────┐`,
      border`│` + text` Name          ` + border`│` + text` Age ` + border`│`,
      border`├───────────────` + border`┼─────┤`,
      `${border`│`} ${c.green`Sample row A`}  ${border`│`} ${c.red`50`}  ${border`│`}`,
      border`├───────────────` + border`┼─────┤`,
      `${border`│`} ${c.hex('#FF69B4')`Sample row AB`} ${border`│`} ${c.blueBright`24`}  ${border`│`}`,
      border`└───────────────` + border`┴─────┘`,
    ].join('\n');

    const received = table.toString();

    // display colored table to make the screenshot for README
    //console.log(received);

    expect(received).toEqual(expected);
  });

  it('border and head text in orange, body text in green', () => {
    const table = new Table({
      head: ['Name', 'Age'],
      style: { border: ['hex(#FFD700)'], head: ['hex(#FFA500)', 'italic'] },
    });

    table.push(['Sample row A', '50'], ['Sample row AB', '24']);

    const text = colors.italic.hex('#FFA500');
    const border = colors.hex('#FFD700');

    let expected = [
      border`┌───────────────` + border`┬─────┐`,
      border`│` + text` Name          ` + border`│` + text` Age ` + border`│`,
      border`├───────────────` + border`┼─────┤`,
      `${border`│`} Sample row A  ${border`│`} 50  ${border`│`}`,
      border`├───────────────` + border`┼─────┤`,
      `${border`│`} Sample row AB ${border`│`} 24  ${border`│`}`,
      border`└───────────────` + border`┴─────┘`,
    ].join('\n');
    expected = colors.green(expected);

    const received = colors.green(table.toString());

    // display colored table to make the screenshot for README
    //console.log(colors.green(received));

    expect(received).toEqual(expected);
  });

  it('border and head text in orange, body text in green, background in truecolor', () => {
    const bgColor = '#3d239d';
    const table = new Table({
      head: ['Name', 'Age'],
      style: { border: ['hex(#FFD700)'], head: ['hex(#FFA500)', 'italic'] },
    });

    table.push(['Sample row A', '50'], ['Sample row AB', '24']);

    const text = colors.italic.hex('#FFA500');
    const border = colors.hex('#FFD700');

    let expected = [
      border`┌───────────────` + border`┬─────┐`,
      border`│` + text` Name          ` + border`│` + text` Age ` + border`│`,
      border`├───────────────` + border`┼─────┤`,
      `${border`│`} Sample row A  ${border`│`} 50  ${border`│`}`,
      border`├───────────────` + border`┼─────┤`,
      `${border`│`} Sample row AB ${border`│`} 24  ${border`│`}`,
      border`└───────────────` + border`┴─────┘`,
    ].join('\n');
    expected = colors.green.bgHex(bgColor)(expected);

    const received = colors.green.bgHex(bgColor)(table.toString());

    // display colored table to make the screenshot for README
    //console.log('\n' + received);

    expect(received).toEqual(expected);
  });
});
