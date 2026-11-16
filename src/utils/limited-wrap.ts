import { HYPERLINK_END } from './hyperlink';
import { strlen, textUnits } from './text';
import { wordWrap } from './wrap';

function breakLine(maxWidth: number, line: string): string[] {
  const chunks: string[] = [];
  let chunk = '';
  let chunkWidth = 0;
  for (const token of textUnits(line)) {
    if (chunkWidth > 0 && chunkWidth + token.width > maxWidth) {
      chunks.push(chunk);
      chunk = '';
      chunkWidth = 0;
    }
    chunk += token.text;
    chunkWidth += token.width;
  }
  chunks.push(chunk);
  return chunks;
}

/**
 * Wrap text so that every line is at most `maxWidth` columns wide on screen, so nothing has to be truncated.
 * Unlike `wordWrap`, this measures the display width (wide CJK characters and emoji count as 2),
 * never splits escape sequences or characters, breaks words longer than `maxWidth`, and keeps empty lines.
 *
 * @param {number} maxWidth - at least 1
 * @param {string} input
 * @param {boolean} wrapOnWordBoundary - prefer breaking between words (default), otherwise break anywhere
 * @return {string[]}
 */
export function wrapToWidth(maxWidth: number, input: string, wrapOnWordBoundary = true): string[] {
  maxWidth = Math.max(1, maxWidth);
  const pieces = wrapOnWordBoundary ? wordWrap(maxWidth, input) : input.split('\n');
  const output = pieces.flatMap((piece) => (strlen(piece) <= maxWidth ? [piece] : breakLine(maxWidth, piece)));
  // A hyperlink must end before the cell padding/border and restart on the next line,
  // including breaks introduced by wordWrap (not just hard word breaks).
  let openLink = '';
  return output.map((line) => {
    const prefix = openLink;
    for (const match of line.matchAll(/\u001b\]8;[^;]*;([^\u0007\u001b]*)(?:\u0007|\u001b\\)/g)) {
      openLink = match[1] ? match[0] : '';
    }
    return prefix + line + (openLink ? HYPERLINK_END : '');
  });
}

/**
 * The display width of the widest single character in `str` (escape sequences ignored).
 * This is the narrowest width that `str` can be wrapped to without truncating anything.
 */
export function widestCharWidth(str: string): number {
  let widest = 0;
  for (const unit of textUnits(str)) widest = Math.max(widest, unit.width);
  return widest;
}
