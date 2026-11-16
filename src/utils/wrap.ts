/**
 * Wrapping text into lines of a maximum width.
 */
import { escapeSequencePattern, strlen, textUnits } from './text';

/** Splits `input` into its words and the whitespace between them (`separators[k]` follows `words[k]`). */
function splitWords(input: string): { words: string[]; separators: string[] } {
  const words: string[] = [];
  const separators: string[] = [];
  const pattern = new RegExp(`${escapeSequencePattern().source}|(\\s+)`, 'g');
  let start = 0;
  for (const match of input.matchAll(pattern)) {
    const whitespace = match[1];
    if (whitespace) {
      words.push(input.slice(start, match.index));
      separators.push(whitespace);
      start = match.index + whitespace.length;
    }
  }
  words.push(input.slice(start));
  return { words, separators };
}

/**
 * Wraps on whitespace. A word longer than `maxLength` is put on a line of its own
 * (it is not split). Whitespace at a line break is dropped.
 */
function wrapOnWords(maxLength: number, input: string): string[] {
  const lines: string[] = [];
  const { words, separators } = splitWords(input);
  let line: string[] = [];
  let lineLength = 0;
  words.forEach((word, k) => {
    const whitespace = separators[k - 1] ?? '';
    const wordLength = strlen(word);
    const newLength = lineLength + whitespace.length + wordLength;
    if (newLength > maxLength) {
      if (word && wordLength === 0) {
        line.push(word); // Keep a trailing escape sequence on the same line.
        return;
      }
      if (lineLength !== 0) {
        lines.push(line.join(''));
        line = [];
      }
      line.push(word); // Preserve any zero-width prefix when discarding leading whitespace.
      lineLength = wordLength;
    } else {
      line.push(whitespace, word);
      lineLength = newLength;
    }
  });
  const remaining = line.join('');
  if (remaining) {
    lines.push(remaining);
  }
  return lines;
}

/**
 * Wraps at exactly `maxLength` columns, ignoring word boundaries. Characters are measured by
 * their display width; escape sequences and characters are never split. A character wider
 * than `maxLength` is put on a line of its own. Leading whitespace is dropped.
 */
function wrapOnCharacters(maxLength: number, input: string): string[] {
  const lines: string[] = [];
  let line = '';
  let lineWidth = 0;
  const { words, separators } = splitWords(input);
  words.forEach((word, k) => {
    const whitespace = separators[k - 1]; // the whitespace before this word (none before the first)
    const text = line.length > 0 && whitespace ? whitespace + word : word;
    for (const unit of textUnits(text)) {
      if (lineWidth > 0 && lineWidth + unit.width > maxLength) {
        lines.push(line);
        line = '';
        lineWidth = 0;
      }
      line += unit.text;
      lineWidth += unit.width;
    }
  });
  if (line.length) {
    lines.push(line);
  }
  return lines;
}

/**
 * Wraps each line of `input` to `maxLength` columns (at least 1), on word boundaries (default)
 * or at exactly `maxLength` characters. Empty lines are kept.
 */
export function wordWrap(maxLength: number, input: string, wrapOnWordBoundary = true): string[] {
  const wrap = wrapOnWordBoundary ? wrapOnWords : wrapOnCharacters;
  // Below 1, wrapping could never make progress (wrapOnCharacters would loop forever).
  const width = Math.max(1, maxLength);
  return input.split('\n').flatMap((line) => {
    const lines = wrap(width, line);
    return lines.length > 0 ? lines : [''];
  });
}
