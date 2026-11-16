/**
 * Terminal hyperlinks (OSC 8 escape sequences).
 * See https://github.com/cli-table/cli-table3/pull/292 for the original contribution.
 */

const OSC = '\u001B]';
const BEL = '\u0007';

/** The sequence that ends a hyperlink. */
export const HYPERLINK_END = `${OSC}8;;${BEL}`;

/** Makes `text` a link to `url` (or to `text` itself, if no url is given). */
export function hyperlink(url: string | undefined, text: string): string {
  return `${OSC}8;;${url || text}${BEL}${text}${HYPERLINK_END}`;
}
