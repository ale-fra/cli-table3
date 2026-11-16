import colors from 'ansis';
import * as utils from '../dist/utils';

describe('utils', () => {
  const { strlen, repeat, pad, truncate, wordWrap } = utils;

  describe('strlen', () => {
    it('length of "hello" is 5', () => {
      expect(strlen('hello')).toEqual(5);
    });

    it('length of "hi" is 2', () => {
      expect(strlen('hi')).toEqual(2);
    });

    it('length of "hello" in red is 5', () => {
      expect(strlen(colors.red('hello'))).toEqual(5);
    });

    it('length of "hello" in bold is 5', () => {
      expect(strlen(colors.bold('hello'))).toEqual(5);
    });

    it('length of "hello\\nhi\\nheynow" is 6', () => {
      expect(strlen('hello\nhi\nheynow')).toEqual(6);
    });

    it('length of "中文字符" is 8', () => {
      expect(strlen('中文字符')).toEqual(8);
    });

    it('length of "日本語の文字" is 12', () => {
      expect(strlen('日本語の文字')).toEqual(12);
    });

    it('length of "한글" is 4', () => {
      expect(strlen('한글')).toEqual(4);
    });
  });

  describe('repeat', () => {
    it('"-" x 3', () => {
      expect(repeat('-', 3)).toEqual('---');
    });

    it('"-" x 4', () => {
      expect(repeat('-', 4)).toEqual('----');
    });

    it('"=" x 4', () => {
      expect(repeat('=', 4)).toEqual('====');
    });
  });

  describe('pad', () => {
    it("pad('hello',6,' ', right) == ' hello'", () => {
      expect(pad('hello', 6, ' ', 'right')).toEqual(' hello');
    });

    it("pad('hello',7,' ', left) == 'hello  '", () => {
      expect(pad('hello', 7, ' ', 'left')).toEqual('hello  ');
    });

    it("pad('hello',8,' ', center) == ' hello  '", () => {
      expect(pad('hello', 8, ' ', 'center')).toEqual(' hello  ');
    });

    it("pad('hello',9,' ', center) == '  hello  '", () => {
      expect(pad('hello', 9, ' ', 'center')).toEqual('  hello  ');
    });

    it("pad('yo',4,' ', center) == ' yo '", () => {
      expect(pad('yo', 4, ' ', 'center')).toEqual(' yo ');
    });

    it('pad red(hello)', () => {
      expect(pad(colors.red('hello'), 7, ' ', 'right')).toEqual(`  ${colors.red('hello')}`);
    });

    it("pad('hello', 2, ' ', right) == 'hello'", () => {
      expect(pad('hello', 2, ' ', 'right')).toEqual('hello');
    });
  });

  describe('truncate', () => {
    it('never returns more than the desired width: a too wide truncation symbol is shortened', () => {
      expect(truncate('abcdef', 2, '...')).toEqual('..');
      expect(truncate('abcdef', 0, '...')).toEqual('');
      expect(truncate('abcdef', -1)).toEqual('');
      expect(truncate('abcdef', 3, '...')).toEqual('...'); // exactly fits: unchanged behaviour
    });

    it('truncate("hello", 5) === "hello"', () => {
      expect(truncate('hello', 5)).toEqual('hello');
    });

    it('truncate("hello sir", 7, "…") == "hello …"', () => {
      expect(truncate('hello sir', 7, '…')).toEqual('hello …');
    });

    it('truncate("hello sir", 6, "…") == "hello…"', () => {
      expect(truncate('hello sir', 6, '…')).toEqual('hello…');
    });

    it('truncate("goodnight moon", 8, "…") == "goodnig…"', () => {
      expect(truncate('goodnight moon', 8, '…')).toEqual('goodnig…');
    });

    it('truncate(colors.bold("goodnight moon"), 15, "…") == colors.bold("goodnight moon")', () => {
      const original = colors.bold('goodnight moon');
      expect(truncate(original, 15, '…')).toEqual(original);
    });

    it('truncate(colors.bold("goodnight moon"), 8, "…") == colors.bold("goodnig") + "…"', () => {
      const original = colors.bold('goodnight moon');
      const expected = `${colors.bold('goodnig')}…`;
      expect(truncate(original, 8, '…')).toEqual(expected);
    });

    it('truncate(colors.bold("goodnight moon"), 9, "…") == colors.bold("goodnig") + "…"', () => {
      const original = colors.bold('goodnight moon');
      const expected = `${colors.bold('goodnigh')}…`;
      expect(truncate(original, 9, '…')).toEqual(expected);
    });

    it('red(hello) + green(world) truncated to 9 chars', () => {
      const original = colors.red('hello') + colors.green(' world');
      const expected = `${colors.red('hello') + colors.green(' wo')}…`;
      expect(truncate(original, 9)).toEqual(expected);
    });

    it('red-on-green(hello) + green-on-red(world) truncated to 9 chars', () => {
      const original = colors.red.bgGreen('hello') + colors.green.bgRed(' world');
      const expected = `${colors.red.bgGreen('hello') + colors.green.bgRed(' wo')}…`;
      expect(truncate(original, 9)).toEqual(expected);
    });

    it('red-on-green(hello) + green-on-red(world) truncated to 10 chars - using inverse', () => {
      const original = colors.red.bgGreen(`hello${colors.inverse(' world')}`);
      const expected = `${colors.red.bgGreen(`hello${colors.inverse(' wor')}`)}…`;
      expect(truncate(original, 10)).toEqual(expected);
    });

    it('red-on-green( bold (hello world) ) truncated to 11 chars', () => {
      const original = colors.red.bgGreen(colors.bold('hello world'));
      const expected = colors.red.bgGreen(colors.bold('hello world'));
      expect(truncate(original, 11)).toEqual(expected);
    });

    it('red-on-green( bold (hello world) ) truncated to 10 chars', () => {
      const original = colors.red.bgGreen(colors.bold('hello world'));
      const expected = `${colors.red.bgGreen(colors.bold('hello wor'))}…`;
      expect(truncate(original, 10)).toEqual(expected);
    });

    it('handles reset code', () => {
      const original = '\x1b[31mhello\x1b[0m world';
      const expected = '\x1b[31mhello\x1b[0m wor…';
      expect(truncate(original, 10)).toEqual(expected);
    });

    it('handles reset code (EMPTY VERSION)', () => {
      const original = '\x1b[31mhello\x1b[0m world';
      const expected = '\x1b[31mhello\x1b[0m wor…';
      expect(truncate(original, 10)).toEqual(expected);
    });

    it('truncateWidth("漢字テスト", 15) === "漢字テスト"', () => {
      expect(truncate('漢字テスト', 15)).toEqual('漢字テスト');
    });

    it('truncateWidth("漢字テスト", 6) === "漢字…"', () => {
      expect(truncate('漢字テスト', 6)).toEqual('漢字…');
    });

    it('truncateWidth("漢字テスト", 5) === "漢字…"', () => {
      expect(truncate('漢字テスト', 5)).toEqual('漢字…');
    });

    it('truncateWidth("漢字testてすと", 12) === "漢字testて…"', () => {
      expect(truncate('漢字testてすと', 12)).toEqual('漢字testて…');
    });

    it('handles color code with CJK chars', () => {
      const original = '漢字\x1b[31m漢字\x1b[0m漢字';
      const expected = '漢字\x1b[31m漢字\x1b[0m漢…';
      expect(truncate(original, 11)).toEqual(expected);
    });
  });

  describe('wordWrap', () => {
    it('length', () => {
      const input = 'Hello, how are you today? I am fine, thank you!';

      const expected = 'Hello, how\nare you\ntoday? I\nam fine,\nthank you!';

      expect(wordWrap(10, input).join('\n')).toEqual(expected);
    });

    // wordWrap only breaks the lines; colorizeLines then closes and re-opens the colours on every
    // line (as Cell does). The expected value is built by ansis, which styles each line separately.
    it('length with colors', () => {
      const input = colors.red('Hello, how are') + colors.blue(' you today? I') + colors.green(' am fine, thank you!');

      const expected =
        colors.red('Hello, how\nare') + colors.blue(' you\ntoday? I') + colors.green('\nam fine,\nthank you!');

      expect(utils.colorizeLines(wordWrap(10, input)).join('\n')).toEqual(expected);
    });

    it('will not create an empty last line', () => {
      const input = 'Hello Hello ';

      const expected = 'Hello\nHello';

      expect(wordWrap(5, input).join('\n')).toEqual(expected);
    });

    it('will handle color reset code', () => {
      const input = '\x1b[31mHello\x1b[0m Hello ';

      const expected = '\x1b[31mHello\x1b[0m\nHello';

      expect(wordWrap(5, input).join('\n')).toEqual(expected);
    });

    it('will handle color reset code (EMPTY version)', () => {
      const input = '\x1b[31mHello\x1b[m Hello ';

      const expected = '\x1b[31mHello\x1b[m\nHello';

      expect(wordWrap(5, input).join('\n')).toEqual(expected);
    });

    it('words longer than limit will not create extra newlines', () => {
      const input = 'disestablishment is a multiplicity someotherlongword';

      const expected = 'disestablishment\nis a\nmultiplicity\nsomeotherlongword';

      expect(wordWrap(7, input).join('\n')).toEqual(expected);
    });

    it('multiple line input', () => {
      const input = 'a\nb\nc d e d b duck\nm\nn\nr';
      const expected = ['a', 'b', 'c d', 'e d', 'b', 'duck', 'm', 'n', 'r'];

      expect(wordWrap(4, input)).toEqual(expected);
    });

    it('will not start a line with whitespace', () => {
      const input = 'ab cd  ef gh  ij kl';
      const expected = ['ab cd', 'ef gh', 'ij kl'];
      expect(wordWrap(7, input)).toEqual(expected);
    });

    it('wraps CJK chars', () => {
      const input = '漢字 漢\n字 漢字';
      const expected = ['漢字 漢', '字 漢字'];
      expect(wordWrap(7, input)).toEqual(expected);
    });

    it('wraps CJK chars with colors', () => {
      const input = '\x1b[31m漢字\x1b[0m\n 漢字';
      const expected = ['\x1b[31m漢字\x1b[0m', ' 漢字'];
      expect(wordWrap(5, input)).toEqual(expected);
    });

    it('counts leading whitespace (indentation that does not fit is dropped, the text is kept)', () => {
      expect(wordWrap(4, '  ab cd')).toEqual(['  ab', 'cd']);
      expect(wordWrap(6, '   abcdef')).toEqual(['abcdef']);
    });

    describe('textWrap', () => {
      it('wraps by display width: full-width characters count as 2 columns', () => {
        expect(wordWrap(4, '古古古古古古', false)).toEqual(['古古', '古古', '古古']);
        expect(wordWrap(3, 'a古b古', false)).toEqual(['a古', 'b古']);
      });

      it('puts a character wider than the line on a line of its own', () => {
        expect(wordWrap(1, '古a', false)).toEqual(['古', 'a']);
      });

      it('does not split escape sequences or emoji', () => {
        const red = (text: string) => `\u001b[31m${text}\u001b[39m`;
        expect(wordWrap(3, red('abcdef'), false)).toEqual(['\u001b[31mabc', 'def\u001b[39m']);
        expect(wordWrap(2, '👍🏽👍🏽', false)).toEqual(['👍🏽', '👍🏽']);
      });

      it('wraps long words', () => {
        expect(wordWrap(10, 'abcdefghijklmnopqrstuvwxyz', false)).toEqual(['abcdefghij', 'klmnopqrst', 'uvwxyz']);
        expect(wordWrap(10, 'abcdefghijk lmnopqrstuv wxyz', false)).toEqual(['abcdefghij', 'k lmnopqrs', 'tuv wxyz']);
        expect(wordWrap(10, 'ab cdefghijk lmnopqrstuv wx yz', false)).toEqual([
          'ab cdefghi',
          'jk lmnopqr',
          'stuv wx yz',
        ]);
      });
    });

    it('keeps empty lines (on word boundaries and when wrapping anywhere)', () => {
      expect(wordWrap(5, '', true)).toEqual(['']);
      expect(wordWrap(5, '', false)).toEqual(['']);
      expect(wordWrap(5, 'a\n\nb', true)).toEqual(['a', '', 'b']);
      expect(wordWrap(5, 'a\n\nb', false)).toEqual(['a', '', 'b']);
    });
  });

  describe('colorizeLines', () => {
    // Built from raw escape sequences: ansis already closes and re-opens styles at line breaks,
    // so colorizeLines has nothing to do for strings made by ansis.
    const ESC = '\u001b[';

    it('re-opens a text style on the next line', () => {
      expect(utils.colorizeLines([`${ESC}1mHello`, `Hi${ESC}22m`])).toEqual([
        `${ESC}1mHello${ESC}22m`,
        `${ESC}1mHi${ESC}22m`,
      ]);
    });

    it('re-opens foreground and background colours on the next line', () => {
      expect(utils.colorizeLines([`${ESC}31m${ESC}42mA`, `B${ESC}49m${ESC}39m`])).toEqual([
        `${ESC}31m${ESC}42mA${ESC}49m${ESC}39m`,
        `${ESC}31m${ESC}42mB${ESC}49m${ESC}39m`,
      ]);
    });

    it('ignores SGR sequences that are not tracked (e.g. dim)', () => {
      expect(utils.colorizeLines([`${ESC}2mA`, `B${ESC}22m`])).toEqual([`${ESC}2mA`, `B${ESC}22m`]);
    });

    it('closes and re-opens text styles in the order they first appeared', () => {
      expect(utils.colorizeLines([`${ESC}1m${ESC}4mA`, 'B'])).toEqual([
        `${ESC}1m${ESC}4mA${ESC}22m${ESC}24m`,
        `${ESC}4m${ESC}1mB${ESC}24m${ESC}22m`,
      ]);
      // bold switched off and on again keeps its original position
      expect(utils.colorizeLines([`${ESC}1mA${ESC}22m${ESC}4m${ESC}1m`, 'B'])).toEqual([
        `${ESC}1mA${ESC}22m${ESC}4m${ESC}1m${ESC}22m${ESC}24m`,
        `${ESC}4m${ESC}1mB${ESC}24m${ESC}22m`,
      ]);
    });

    it('foreground colors continue on each line', () => {
      const input = colors.red('Hello\nHi').split('\n');

      expect(utils.colorizeLines(input)).toEqual([colors.red('Hello'), colors.red('Hi')]);
    });

    it('background colors continue on each line', () => {
      const input = colors.bgRed('Hello\nHi').split('\n');

      expect(utils.colorizeLines(input)).toEqual([colors.bgRed('Hello'), colors.bgRed('Hi')]);
    });

    it('styles will continue on each line', () => {
      const input = colors.underline('Hello\nHi').split('\n');

      expect(utils.colorizeLines(input)).toEqual([colors.underline('Hello'), colors.underline('Hi')]);
    });

    it('styles that end before the break will not be applied to the next line', () => {
      const input = `${colors.underline('Hello')}\nHi`.split('\n');

      expect(utils.colorizeLines(input)).toEqual([colors.underline('Hello'), 'Hi']);
    });

    it('the reset code can be used to drop styles', () => {
      const input = '\x1b[31mHello\x1b[0m\nHi'.split('\n');
      expect(utils.colorizeLines(input)).toEqual(['\x1b[31mHello\x1b[0m', 'Hi']);
    });

    it('handles aixterm 16-color foreground', () => {
      const input = '\x1b[90mHello\nHi\x1b[0m'.split('\n');
      expect(utils.colorizeLines(input)).toEqual(['\x1b[90mHello\x1b[39m', '\x1b[90mHi\x1b[0m']);
    });

    it('handles aixterm 16-color background', () => {
      const input = '\x1b[100mHello\nHi\x1b[m\nHowdy'.split('\n');
      expect(utils.colorizeLines(input)).toEqual(['\x1b[100mHello\x1b[49m', '\x1b[100mHi\x1b[m', 'Howdy']);
    });

    it('handles aixterm 256-color foreground', () => {
      const input = '\x1b[48;5;8mHello\nHi\x1b[0m\nHowdy'.split('\n');
      expect(utils.colorizeLines(input)).toEqual(['\x1b[48;5;8mHello\x1b[49m', '\x1b[48;5;8mHi\x1b[0m', 'Howdy']);
    });

    it('handles CJK chars', () => {
      const input = colors.red('漢字\nテスト').split('\n');

      expect(utils.colorizeLines(input)).toEqual([colors.red('漢字'), colors.red('テスト')]);
    });
  });

  describe('hyperlink', () => {
    const url = 'http://example.com';
    const text = 'hello link';
    const expected = (u: string, t: string) => `\x1B]8;;${u}\x07${t}\x1B]8;;\x07`;
    it('wraps text with link', () => {
      expect(utils.hyperlink(url, text)).toEqual(expected(url, text));
    });
    it('defaults text to link', () => {
      expect(utils.hyperlink(url, url)).toEqual(expected(url, url));
    });
    it('links to the text itself when no url is given', () => {
      expect(utils.hyperlink(undefined, text)).toEqual(expected(text, text));
      expect(utils.hyperlink('', text)).toEqual(expected(text, text));
    });
  });

  describe('parseHexValue', () => {
    it('hex(#ff00aa)', () => {
      const received = utils.parseHexValue('hex(#ff00aa)');
      const expected = '#ff00aa';

      expect(received).toEqual(expected);
    });

    it('bgHex(#ff00aa)', () => {
      const received = utils.parseHexValue('bgHex(#ff00aa)');
      const expected = '#ff00aa';

      expect(received).toEqual(expected);
    });

    it('hex(#f0a)', () => {
      const received = utils.parseHexValue('hex(#f0a)');
      const expected = '#f0a';

      expect(received).toEqual(expected);
    });

    it('bgHex(#f0a)', () => {
      const received = utils.parseHexValue('bgHex(#f0a)');
      const expected = '#f0a';

      expect(received).toEqual(expected);
    });

    it('invalid hex value', () => {
      // hex code must have 3 or 6 chars
      const received = utils.parseHexValue('bgHex(purple)');
      const expected = '#000';

      expect(received).toEqual(expected);
    });
  });
});
