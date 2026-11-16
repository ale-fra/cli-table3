/**
 * Truncating text to a display width, keeping ANSI styling and hyperlinks well-formed.
 */
import { closeStyles, emptyState, sgrPattern, updateState } from './ansi';
import { HYPERLINK_END } from './hyperlink';
import { strlen } from './text';

/** Truncates plain text (no escape sequences) to at most `width` columns. */
function truncateWidth(str: string, width: number): string {
  if (str.length === strlen(str)) {
    return str.substring(0, width);
  }
  // Contains full-width characters: remove characters until it fits.
  let result = str;
  while (strlen(result) > width) {
    result = result.slice(0, -1);
  }
  return result;
}

/**
 * Truncates text that may contain SGR sequences to at most `width` columns. The sequences
 * before the cut are kept; styling still active at the cut is closed.
 */
function truncateWidthWithAnsi(str: string, width: number): string {
  // The text between the SGR sequences: parts[k] is followed by sequences[k]
  // (there is no sequence after the last part).
  const parts = str.split(sgrPattern());
  const sequences = str.match(sgrPattern()) ?? [];
  const state = emptyState();
  let resultWidth = 0;
  let result = '';

  for (const [k, text] of parts.entries()) {
    if (resultWidth >= width) {
      break;
    }
    const part = resultWidth + strlen(text) > width ? truncateWidth(text, width - resultWidth) : text;
    result += part;
    resultWidth += strlen(part);

    const sequence = sequences[k];
    if (resultWidth < width) {
      if (sequence === undefined) {
        break; // full-width characters may leave a column that cannot be filled
      }
      result += sequence;
      updateState(state, sequence);
    }
  }

  return closeStyles(state, result);
}

/**
 * Truncates `str` to the display width `desiredLength`, ending it with `truncateChar`
 * (default `…`). Text that fits is returned unchanged. The result is never wider than
 * `desiredLength`: if not even `truncateChar` fits, it is shortened itself.
 */
export function truncate(str: string, desiredLength: number, truncateChar?: string): string {
  const ellipsis = truncateChar || '…';
  if (strlen(str) <= desiredLength) {
    return str;
  }

  const ellipsisWidth = strlen(ellipsis);
  let result =
    ellipsisWidth > desiredLength
      ? truncateWidthWithAnsi(ellipsis, desiredLength)
      : truncateWidthWithAnsi(str, desiredLength - ellipsisWidth) + ellipsis;
  // A hyperlink that was cut off must still be ended.
  if (str.includes(HYPERLINK_END) && !result.includes(HYPERLINK_END)) {
    result += HYPERLINK_END;
  }
  return result;
}
