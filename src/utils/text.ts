/**
 * Measuring and padding text by its display width.
 */
import stringWidth from 'string-width';
import type { HorizontalAlignment } from '../options';
import { sgrPattern } from './ansi';

/**
 * Display width of `str`: the width of its widest line, ignoring ANSI SGR sequences and
 * counting full-width characters (e.g. CJK) as 2.
 */
export function strlen(str: string): number {
  const lines = `${str}`.replace(sgrPattern(), '').split('\n');
  return lines.reduce((max, line) => Math.max(max, stringWidth(line)), 0);
}

/** A part of a text that must not be split, with its display width. */
export interface TextUnit {
  text: string;
  width: number;
}

/** SGR sequences and OSC 8 hyperlink sequences: zero width, never split. */
export function escapeSequencePattern(): RegExp {
  return new RegExp(`${sgrPattern().source}|${/\u001b\][^\u0007\u001b]*(?:\u0007|\u001b\\)/.source}`, 'g');
}

const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

function* characters(text: string): Generator<TextUnit> {
  for (const { segment } of graphemes.segment(text)) {
    yield { text: segment, width: stringWidth(segment) };
  }
}

/**
 * Splits `str` into the units that must not be split: escape sequences (width 0) and
 * user-perceived characters (grapheme clusters, e.g. an emoji with a skin tone modifier).
 */
export function* textUnits(str: string): Generator<TextUnit> {
  let index = 0;
  for (const match of str.matchAll(escapeSequencePattern())) {
    yield* characters(str.slice(index, match.index));
    yield { text: match[0], width: 0 };
    index = match.index + match[0].length;
  }
  yield* characters(str.slice(index));
}

/** `str` repeated `times` times; an empty string for `times` 0 and -1. */
export function repeat(str: string, times: number): string {
  // Not String#repeat: pad() may ask for -1 repetitions, which String#repeat rejects.
  return Array(times + 1).join(str);
}

/**
 * Pads `str` with `padChar` to the display width `len`, aligned as given by `dir`
 * (default: left). Text that is more than one column too wide is returned unchanged.
 */
export function pad(str: string, len: number, padChar: string, dir?: HorizontalAlignment): string {
  const length = strlen(str);
  if (len + 1 < length) {
    return str;
  }
  const padLength = len - length;
  switch (dir) {
    case 'right':
      return repeat(padChar, padLength) + str;
    case 'center': {
      const right = Math.ceil(padLength / 2);
      const left = padLength - right;
      return repeat(padChar, left) + str + repeat(padChar, right);
    }
    default:
      return str + repeat(padChar, padLength);
  }
}
