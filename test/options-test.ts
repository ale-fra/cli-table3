import { mergeOptions } from '../dist/options';

describe('options', () => {
  function defaultOptions() {
    return {
      chars: {
        top: '─',
        'top-mid': '┬',
        'top-left': '┌',
        'top-right': '┐',
        bottom: '─',
        'bottom-mid': '┴',
        'bottom-left': '└',
        'bottom-right': '┘',
        left: '│',
        'left-mid': '├',
        mid: '─',
        'mid-mid': '┼',
        right: '│',
        'right-mid': '┤',
        middle: '│',
      },
      truncate: '…',
      colWidths: [],
      rowHeights: [],
      colAligns: [],
      rowAligns: [],
      style: {
        'padding-left': 1,
        'padding-right': 1,
        head: ['red'],
        border: ['grey'],
        compact: false,
      },
      head: [],
    };
  }

  describe('mergeOptions', () => {
    it('allows you to override chars', () => {
      expect(mergeOptions()).toEqual(defaultOptions());
    });

    it('options set to undefined keep their default value', () => {
      expect(
        mergeOptions({
          colWidths: undefined,
          truncate: undefined,
          chars: { top: undefined, left: 'L' },
          style: { 'padding-left': undefined, head: undefined, compact: true },
        })
      ).toEqual({
        ...defaultOptions(),
        chars: { ...defaultOptions().chars, left: 'L' },
        style: { ...defaultOptions().style, compact: true },
      });
    });

    it('chars will be merged deeply', () => {
      const expected = defaultOptions();
      expected.chars.left = 'L';
      expect(mergeOptions({ chars: { left: 'L' } })).toEqual(expected);
    });

    it('style will be merged deeply', () => {
      const expected = defaultOptions();
      expected.style['padding-left'] = 2;
      expect(mergeOptions({ style: { 'padding-left': 2 } })).toEqual(expected);
    });

    it('head will be overwritten', () => {
      const expected = defaultOptions();
      expected.style.head = [];
      //we can't use lodash's `merge()` in implementation because it would deeply copy array.
      expect(mergeOptions({ style: { head: [] } })).toEqual(expected);
    });

    it('border will be overwritten', () => {
      const expected = defaultOptions();
      expected.style.border = [];
      //we can't use lodash's `merge()` in implementation because it would deeply copy array.
      expect(mergeOptions({ style: { border: [] } })).toEqual(expected);
    });
  });
});
